import base64
import io
import json
from contextlib import asynccontextmanager
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input as eff_preprocess
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
from tensorflow.keras.models import Model, load_model

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT_DIR / "potato_disease_final_model.keras"
CONFIG_PATH = ROOT_DIR / "deployment_config.json"
SAMPLES_DIR = ROOT_DIR / "External_Test_Data"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}

PREPROCESS_FUNCS = {
    "efficientnet": eff_preprocess,
    "mobilenet_v2": mobilenet_preprocess,
    "rescale": lambda x: x / 255.0,
}

state = {}


def find_last_conv_layer(model):
    for layer in reversed(model.layers):
        try:
            shape = layer.output.shape
        except AttributeError:
            continue
        if shape is not None and len(shape) == 4:
            return layer.name
    raise RuntimeError("No 4D convolutional layer found in the model")


def make_gradcam_heatmap(img_array_batch, grad_model, pred_index):
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array_batch, training=False)
        class_channel = predictions[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-8)
    return heatmap.numpy()


def to_base64_png(image_uint8):
    buffer = io.BytesIO()
    Image.fromarray(image_uint8).save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def load_assets():
    with open(CONFIG_PATH) as f:
        config = json.load(f)

    model = load_model(MODEL_PATH)
    last_conv_layer = find_last_conv_layer(model)
    grad_model = Model(
        model.inputs,
        [model.get_layer(last_conv_layer).output, model.output],
    )
    return model, grad_model, config, last_conv_layer


@asynccontextmanager
async def lifespan(_app):
    model, grad_model, config, last_conv_layer = load_assets()
    state["model"] = model
    state["grad_model"] = grad_model
    state["config"] = config
    state["last_conv_layer"] = last_conv_layer
    yield
    state.clear()


app = FastAPI(
    title="Potato Leaf Disease Detection API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def run_inference(image):
    config = state["config"]
    target_size = tuple(config["target_size"])
    preprocess_fn = PREPROCESS_FUNCS[config["preprocess"]]
    class_names = config["class_names"]

    img_resized = image.resize(target_size)
    img_array = np.array(img_resized).astype("float32")
    img_batch = np.expand_dims(preprocess_fn(img_array.copy()), axis=0)

    probs = state["model"].predict(img_batch, verbose=0)[0]
    pred_idx = int(np.argmax(probs))

    heatmap = make_gradcam_heatmap(img_batch, state["grad_model"], pred_idx)
    heatmap_resized = cv2.resize(heatmap, target_size)
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    overlay = np.uint8(np.clip(img_array * 0.6 + heatmap_colored * 0.4, 0, 255))

    return {
        "predicted_class": class_names[pred_idx],
        "predicted_index": pred_idx,
        "confidence": float(probs[pred_idx]),
        "probabilities": [
            {"label": name, "probability": float(probs[i])}
            for i, name in enumerate(class_names)
        ],
        "model_name": config["model_name"],
        "image": to_base64_png(img_array.astype("uint8")),
        "gradcam": {
            "heatmap": to_base64_png(heatmap_uint8),
            "overlay": to_base64_png(overlay),
        },
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": "model" in state}


@app.get("/api/config")
def get_config():
    config = state["config"]
    return {
        "model_name": config["model_name"],
        "class_names": config["class_names"],
        "target_size": config["target_size"],
    }


@app.get("/api/samples")
def list_samples():
    samples = []
    for path in sorted(SAMPLES_DIR.iterdir()):
        if path.suffix.lower() in ALLOWED_EXTENSIONS:
            samples.append({"name": path.name, "url": f"/api/samples/{path.name}"})
    return {"samples": samples}


@app.get("/api/samples/{name}")
def get_sample(name: str):
    if not name or Path(name).name != name:
        raise HTTPException(status_code=400, detail="Invalid sample name")
    path = SAMPLES_DIR / name
    if not path.is_file() or path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=404, detail="Sample not found")
    return FileResponse(path)


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    suffix = Path(file.filename or "").suffix.lower()
    if file.content_type not in ALLOWED_CONTENT_TYPES and suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Please upload a JPG or PNG image.")

    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded image.")

    try:
        return run_inference(image)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}")
