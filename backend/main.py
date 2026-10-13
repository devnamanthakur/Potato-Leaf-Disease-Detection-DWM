import base64
import io
import json
import logging
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

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}

PREPROCESS_FUNCS = {
    "efficientnet": eff_preprocess,
    "mobilenet_v2": mobilenet_preprocess,
    "rescale": lambda x: x / 255.0,
}

# Each deployed model is described here. `output: "sigmoid"` marks a binary
# classifier whose single output is P(positive class).
PROJECTS = {
    "potato": {
        "model_path": ROOT_DIR / "potato_disease_final_model.keras",
        "config_path": ROOT_DIR / "deployment_config.json",
        "samples_dir": ROOT_DIR / "External_Test_Data",
    },
    "papaya": {
        "model_path": ROOT_DIR / "papaya_mobilenet_finetuned.keras",
        "config_path": ROOT_DIR / "papaya_deployment_config.json",
        "samples_dir": None,
    },
}

# project -> {model, grad_model, config, last_conv_layer, binary, samples_dir}
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


def make_gradcam_heatmap(img_array_batch, grad_model, pred_index, binary=False):
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array_batch, training=False)
        if binary:
            # Single sigmoid output: explain the positive class by sign-flipping
            # the gradient when the negative class is predicted.
            class_channel = predictions[:, 0] if pred_index == 1 else -predictions[:, 0]
        else:
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


def load_project(spec):
    with open(spec["config_path"]) as f:
        config = json.load(f)

    model = load_model(spec["model_path"])
    last_conv_layer = find_last_conv_layer(model)
    grad_model = Model(
        model.inputs,
        [model.get_layer(last_conv_layer).output, model.output],
    )
    return {
        "model": model,
        "grad_model": grad_model,
        "config": config,
        "last_conv_layer": last_conv_layer,
        "binary": config.get("output") == "sigmoid",
        "samples_dir": spec["samples_dir"],
    }


@asynccontextmanager
async def lifespan(_app):
    for name, spec in PROJECTS.items():
        try:
            state[name] = load_project(spec)
            logging.info("Loaded %s model (%s)", name, spec["model_path"].name)
        except Exception as exc:  # keep the other model usable if one fails
            logging.warning("Failed to load %s model: %s", name, exc)
    yield
    state.clear()


app = FastAPI(
    title="Plant & Fruit Disease Detection API",
    version="1.1.0",
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


def run_inference(project, image):
    entry = state.get(project)
    if entry is None:
        raise HTTPException(
            status_code=503,
            detail=f"The {project} model is not loaded on the server.",
        )

    config = entry["config"]
    target_size = tuple(config["target_size"])
    binary = entry["binary"]
    preprocess_fn = PREPROCESS_FUNCS[config["preprocess"]]
    class_names = config["class_names"]

    img_resized = image.resize(target_size)
    img_array = np.array(img_resized).astype("float32")
    img_batch = np.expand_dims(preprocess_fn(img_array.copy()), axis=0)

    raw = entry["model"].predict(img_batch, verbose=0)[0]
    if binary:
        positive = float(raw[0])
        probs = np.array([1.0 - positive, positive], dtype="float32")
    else:
        probs = np.asarray(raw, dtype="float32")
    pred_idx = int(np.argmax(probs))

    heatmap = make_gradcam_heatmap(
        img_batch, entry["grad_model"], pred_idx, binary=binary
    )
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


def read_config(project):
    entry = state.get(project)
    if entry is None:
        raise HTTPException(status_code=503, detail=f"The {project} model is not loaded.")
    config = entry["config"]
    return {
        "model_name": config["model_name"],
        "class_names": config["class_names"],
        "target_size": config["target_size"],
    }


def list_samples(project):
    entry = state.get(project)
    samples_dir = entry["samples_dir"] if entry else None
    if not samples_dir or not samples_dir.is_dir():
        return {"samples": []}
    samples = []
    prefix = "/api/papaya/samples" if project == "papaya" else "/api/samples"
    for path in sorted(samples_dir.iterdir()):
        if path.suffix.lower() in ALLOWED_EXTENSIONS:
            samples.append({"name": path.name, "url": f"{prefix}/{path.name}"})
    return {"samples": samples}


def read_sample(project, name):
    entry = state.get(project)
    samples_dir = entry["samples_dir"] if entry else None
    if not samples_dir:
        raise HTTPException(status_code=404, detail="Sample not found")
    if not name or Path(name).name != name:
        raise HTTPException(status_code=400, detail="Invalid sample name")
    path = samples_dir / name
    if not path.is_file() or path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=404, detail="Sample not found")
    return FileResponse(path)


async def read_and_predict(project, file):
    suffix = Path(file.filename or "").suffix.lower()
    if file.content_type not in ALLOWED_CONTENT_TYPES and suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Please upload a JPG or PNG image.")

    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the uploaded image.")

    try:
        return run_inference(project, image)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}")


# ---- Potato (default) routes -------------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model_loaded": "potato" in state,
        "models": {name: name in state for name in PROJECTS},
    }


@app.get("/api/config")
def get_config():
    return read_config("potato")


@app.get("/api/samples")
def potato_samples():
    return list_samples("potato")


@app.get("/api/samples/{name}")
def potato_sample(name: str):
    return read_sample("potato", name)


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    return await read_and_predict("potato", file)


# ---- Papaya routes -----------------------------------------------------------

@app.get("/api/papaya/health")
def papaya_health():
    return {"status": "ok", "model_loaded": "papaya" in state}


@app.get("/api/papaya/config")
def papaya_config():
    return read_config("papaya")


@app.get("/api/papaya/samples")
def papaya_samples():
    return list_samples("papaya")


@app.get("/api/papaya/samples/{name}")
def papaya_sample(name: str):
    return read_sample("papaya", name)


@app.post("/api/papaya/predict")
async def papaya_predict(file: UploadFile = File(...)):
    return await read_and_predict("papaya", file)
