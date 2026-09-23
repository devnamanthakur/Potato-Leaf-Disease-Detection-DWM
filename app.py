import streamlit as st
import numpy as np
import json
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input as eff_preprocess
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess

st.set_page_config(page_title="Potato Disease Detector", page_icon="🥔", layout="wide")


@st.cache_resource
def load_assets():
    model = load_model('potato_disease_final_model.keras')
    with open('deployment_config.json') as f:
        config = json.load(f)
    return model, config


model, config = load_assets()

PREPROCESS_FUNCS = {
    'efficientnet': eff_preprocess,
    'mobilenet_v2': mobilenet_preprocess,
    'rescale': lambda x: x / 255.0
}

preprocess_fn = PREPROCESS_FUNCS[config['preprocess']]
target_size = tuple(config['target_size'])
class_names = config['class_names']

st.title("🥔 Potato Leaf Disease Detector")
st.caption(f"Model in use: **{config['model_name']}**")
st.write(
    "Upload a photo of a potato leaf to classify it as **Healthy**, **Early Blight**, or **Late Blight**."
)

uploaded_file = st.file_uploader("Choose an image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")

    with st.spinner("Analyzing..."):
        img_resized = image.resize(target_size)
        img_array = np.array(img_resized).astype("float32")
        img_array_pre = preprocess_fn(img_array.copy())
        img_batch = np.expand_dims(img_array_pre, axis=0)

        probs = model.predict(img_batch)[0]
        pred_idx = int(np.argmax(probs))

    col1, col2 = st.columns([1, 1])

    with col1:
        st.image(image, caption="Uploaded Leaf", use_container_width=True)

    with col2:
        st.subheader(f"Prediction: {class_names[pred_idx]}")
        st.write(f"Confidence: **{probs[pred_idx] * 100:.2f}%**")

        st.write("Class probabilities:")
        for idx, cls in enumerate(class_names):
            st.progress(float(probs[idx]), text=f"{cls}: {probs[idx] * 100:.2f}%")

st.markdown("---")
st.caption(
    "Potato Leaf Disease Detection"
)
