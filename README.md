# Potato Leaf Disease Detection 🥔

A deep learning project that classifies potato leaf images into three categories: **Healthy**, **Early Blight**, or **Late Blight**. The project explores multiple Convolutional Neural Network (CNN) architectures and deploys the best-performing model as an interactive web application.

## Overview

Potato diseases like Early Blight and Late Blight can severely impact crop yield. This project automates the detection of these diseases using computer vision and deep learning. By uploading an image of a potato leaf, the deployed Streamlit application predicts the disease status and provides confidence scores.

## Dataset

The model is trained on images originating from the **PlantVillage** dataset:
- `PlantVillage_Raw_Dataset/`: Contains the original images.
- `PlantVillage_Augmented_Dataset/`: Contains augmented versions of the raw images to improve model generalization and robustness.
- `External_Test_Data/`: A held-out set of external images for final performance evaluation.

## Methodology

The project systematically explores and compares multiple deep learning models, developed in the Jupyter Notebooks (`01_data_augmentation.ipynb` and `02_potato_disease_detection.ipynb`):

1. **Custom CNN from Scratch** (`best_CustomCNN_Scratch.keras`)
2. **MobileNetV2** (Transfer Learning) (`best_MobileNetV2.keras`)
3. **EfficientNetB3** (Frozen base model) (`best_EfficientNetB3_Frozen.keras`)
4. **EfficientNetB3** (Fine-tuned) (`best_EfficientNetB3_FineTuned.keras`)

### Best-Performing Model
The fine-tuned **EfficientNetB3** was selected as the final deployed model (`potato_disease_final_model.keras`) due to its superior accuracy and F1 score. 

## Deployment

The final model is deployed using **Streamlit**. The app relies on a `deployment_config.json` file which defines:
- **Target image size**: 300x300 pixels
- **Preprocessing function**: EfficientNet specific preprocessing
- **Class labels**: Early Blight, Healthy, Late Blight

### Running the Web App Locally

1. **Clone the repository** and navigate to the project directory.
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the Streamlit application**:
   ```bash
   streamlit run app.py
   ```
4. **Access the app**: Open the local URL provided in the terminal (typically `http://localhost:8501`) and upload an image of a potato leaf.

## Project Structure

```text
├── 01_data_augmentation.ipynb          # Data augmentation and preprocessing
├── 02_potato_disease_detection.ipynb   # Model training and evaluation
├── app.py                              # Streamlit application
├── deployment_config.json              # Configuration for model deployment
├── requirements.txt                    # Python dependencies
├── potato_disease_final_model.keras    # The final deployed model
├── best_*.keras                        # Other evaluated model checkpoints
├── PlantVillage_Raw_Dataset/           # Original dataset
├── PlantVillage_Augmented_Dataset/     # Augmented dataset
└── External_Test_Data/                 # Unseen test images
```

## Technologies Used

- **Deep Learning Framework**: TensorFlow / Keras
- **Web Framework**: Streamlit
- **Image Processing**: OpenCV, Pillow
- **Data Manipulation & Visualization**: Pandas, Scikit-Learn, Matplotlib, Seaborn
