import streamlit as st
from PIL import Image
import cv2
import numpy as np
from skimage.transform import resize
import joblib
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import MinMaxScaler
import skfuzzy as fuzz


class FuzzyCMeansFeaturizer(BaseEstimator, TransformerMixin):
    def __init__(self, n_clusters=2, m=2.0, maxiter=100, error=0.005):
        self.n_clusters = n_clusters
        self.m = m
        self.maxiter = maxiter
        self.error = error

    def fit(self, X, y=None):
        self.scaler_ = MinMaxScaler()
        X_scaled = self.scaler_.fit_transform(X)
        self.cntr_, _, _, _, _, _, _ = fuzz.cluster.cmeans(
            X_scaled.T, self.n_clusters, self.m,
            maxiter=self.maxiter, error=self.error
        )
        return self

    def transform(self, X):
        X_scaled = self.scaler_.transform(X)
        u, _, _, _, _, _ = fuzz.cluster.cmeans_predict(
            X_scaled.T, self.cntr_, self.m,
            maxiter=self.maxiter, error=self.error
        )
        return u.T

class PassthroughTransformer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return X

# config
CATEGORIES = ['Diseased', 'Healthy']

st.set_page_config(page_title="Papaya Disease Detector", page_icon="🍈")

# Load model 
@st.cache_resource
def load_model():
    return joblib.load('model.pkl')

pipeline = load_model()

# Preprocessing
def preprocess_image(img_bgr):
    
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    fruit_crop = gray  


    if contours:
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)

        # Guard: only use the crop if its a sensible size
        min_size = 20 
        if w >= min_size and h >= min_size:
            candidate_crop = gray[y:y+h, x:x+w]
            if candidate_crop.size > 0:
                fruit_crop = candidate_crop

    blurred = cv2.GaussianBlur(fruit_crop, (7, 7), 0)
    resized = resize(blurred, (64, 64))

    # Guard: catch any NaN/inf before it reaches the model
    if np.isnan(resized).any() or np.isinf(resized).any():
        st.error("Preprocessing produced invalid values (NaN/Inf) — check the uploaded image or fruit detection.")
        st.stop()

    feat_raw = resized.flatten().reshape(1, -1)

    return feat_raw, fruit_crop, resized

# UI
st.title(" Papaya Fruit Disease Detector")
st.write("Upload a photo of a papaya fruit and this app will predict whether it's **Healthy** or **Diseased** using Fuzzy C-Means segmentation + Random Forest.")

uploaded_file = st.file_uploader("Choose an image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_container_width=True)

    with st.spinner("Analyzing..."):
        img_bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        feat_raw, fruit_crop, resized = preprocess_image(img_bgr)

        pred_idx = pipeline.predict(feat_raw)[0]
        probs = pipeline.predict_proba(feat_raw)[0]
        predicted_class = CATEGORIES[pred_idx]
        confidence = probs[pred_idx] * 100

    st.subheader(f"Prediction: {predicted_class}")
    st.write(f"Confidence: **{confidence:.2f}%**")

    st.write("Class probabilities:")
    for idx, cat in enumerate(CATEGORIES):
        st.write(f"- {cat}: {probs[idx]*100:.2f}%")

st.markdown("---")
st.caption("Papaya Disease Detection — Fuzzy C-Means segmentation + Random Forest classifier")

