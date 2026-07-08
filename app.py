import streamlit as st
from PIL import Image
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Config
CATEGORIES = ['Diseased', 'Healthy']
IMG_SIZE = (224, 224)

st.set_page_config(page_title="Papaya Disease Detector", page_icon="🍈")

# Load DL model
@st.cache_resource
def load_dl_model():
    return load_model('papaya_mobilenet_finetuned.keras')

model = load_dl_model()

# Preprocessing for MobileNet
def preprocess_image(img_bgr):
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # Resize to 224x224 as required by MobileNetV2
    img_resized = cv2.resize(img_rgb, IMG_SIZE)

    # Apply MobileNetV2 preprocessing (scales pixels to [-1, 1])
    img_array = np.array(img_resized, dtype=np.float32)
    img_preprocessed = preprocess_input(img_array)

    # Add batch dimension
    img_batch = np.expand_dims(img_preprocessed, axis=0)

    return img_batch

# UI
st.title("🍈 Papaya Fruit Disease Detector")
st.write("Upload a photo of a papaya fruit and this app will predict whether it's **Healthy** or **Diseased** using a fine-tuned **MobileNetV2** deep learning model.")

uploaded_file = st.file_uploader("Choose an image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_container_width=True)

    with st.spinner("Analyzing with MobileNetV2..."):
        img_bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        img_batch = preprocess_image(img_bgr)

        # Model outputs a single sigmoid probability (0 = Diseased, 1 = Healthy)
        pred_prob = model.predict(img_batch, verbose=0)[0][0]

        # pred_prob is P(Healthy); P(Diseased) = 1 - pred_prob
        probs = [1 - pred_prob, pred_prob]  # [Diseased, Healthy]
        pred_idx = int(pred_prob > 0.5)     # 0 = Diseased, 1 = Healthy
        predicted_class = CATEGORIES[pred_idx]
        confidence = probs[pred_idx] * 100

    # Result display
    if predicted_class == "Diseased":
        st.error(f" Prediction: **{predicted_class}**")
    else:
        st.success(f"Prediction: **{predicted_class}**")

    st.write(f"Confidence: **{confidence:.2f}%**")

    st.write("Class probabilities:")
    for idx, cat in enumerate(CATEGORIES):
        st.write(f"- {cat}: {probs[idx]*100:.2f}%")

st.markdown("---")
st.caption("Papaya Disease Detection - Fine-tuned MobileNet Deep Learning Model")
