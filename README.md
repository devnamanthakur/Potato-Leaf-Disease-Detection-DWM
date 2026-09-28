# Potato Leaf Disease Detection

A deep learning project that classifies potato leaf images into **Healthy**, **Early Blight**, or **Late Blight** using convolutional neural networks. Four architectures (transfer learning and from-scratch) are trained and evaluated under an identical, leak-free protocol, and the best-performing model is deployed as an interactive Streamlit web application.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dataset](#dataset)
- [Methodology](#methodology)
- [Results](#results)
- [Grad-CAM Interpretability](#grad-cam-interpretability)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Reproducing the Pipeline](#reproducing-the-pipeline)
- [Tech Stack](#tech-stack)
- [Limitations and Future Work](#limitations-and-future-work)
- [License](#license)
- [Credits](#credits)

## Overview

Potato diseases such as **Early Blight** (*Alternaria solani*) and **Late Blight** (*Phytophthora infestans*) can cause severe crop losses if not identified early. This project automates disease detection from leaf photographs: a user uploads an image, and the model returns the predicted class along with confidence scores for all three classes.

Key points:

- **Three-class classification**: `Early_blight`, `Healthy`, `Late_blight`
- **Four models compared** under the same data split, preprocessing, and evaluation protocol
- **Leak-free dataset design**: train/val/test split happens *before* any augmentation, and only the train split is augmented
- **Grad-CAM** visual explanations to verify the model attends to actual leaf lesions
- **Streamlit app** for interactive inference with per-class probability bars

## How It Works

```
Leaf image (JPG/PNG)
        |
        v
Resize to 300 x 300, RGB
        |
        v
EfficientNet preprocessing (scale to [-1, 1] range)
        |
        v
EfficientNetB3 (fine-tuned) + classification head
        |
        v
Softmax over 3 classes
        |
        v
Prediction + confidence (shown in the app)
```

The deployed model is a fine-tuned **EfficientNetB3** with a custom head:

```
GlobalAveragePooling2D
Dropout(0.5)
Dense(512, ReLU)
Dropout(0.3)
Dense(3, Softmax)
```

## Dataset

Images originate from the **PlantVillage** dataset (Hughes & Salathé, 2015), a widely used plant disease image repository. Three potato classes are used:

| Raw class folder | Clean label | Raw images |
|---|---|---|
| `Potato___Early_blight` | `Early_blight` | 1000 |
| `Potato___Late_blight` | `Late_blight` | 1000 |
| `Potato___healthy` | `Healthy` | 152 |

### Leak-Free Split and Augmentation

`01_data_augmentation.ipynb` prepares the data with the following design principles:

1. **Split before augmentation.** Each class is split 70% / 15% / 15% (train/val/test) using `sklearn.train_test_split` with `random_state=42` *before* any augmentation. Augmented copies of the same source image can therefore never leak across splits.
2. **Only the train split is augmented.** Validation and test sets keep their natural class imbalance (150 / 23 / 150), so reported accuracy and F1 reflect the real distribution.
3. **Original images are always kept.** Augmented variants are added on top of every original train image until the per-class target is reached.
4. **Moderate oversampling of `Healthy`.** The small `Healthy` class (152 originals) is oversampled to 1000 rather than fully equalized with the 1400-image blight classes; heavy duplication of a handful of photos adds little new information. Balanced `class_weight` during training is used as a second layer of protection.

Augmentation variants applied to the train split:

| Variant | Operation |
|---|---|
| `flipH` / `flipV` | Horizontal / vertical flip |
| `rot15` / `rotm15` | Rotation by +15° / -15° |
| `rot25` / `rotm25` | Rotation by +25° / -25° |
| `bright` / `dark` | Brightness ×1.3 / ×0.75 in HSV space |
| `zoom` | Center crop to 85% then resize back |

Rotations use **reflected borders** (`cv2.BORDER_REFLECT_101`) instead of black fill, so the model cannot learn black corners as an artificial shortcut.

### Final Dataset Counts

| Split | Early Blight | Healthy | Late Blight | Total |
|---|---|---|---|---|
| Train (augmented) | 1400 | 1000 | 1400 | **3800** |
| Val (untouched) | 150 | 23 | 150 | **323** |
| Test (held-out) | 150 | 23 | 150 | **323** |

## Methodology

Both stages are implemented as Jupyter notebooks:

- `01_data_augmentation.ipynb` — splitting, augmentation, dataset generation
- `02_potato_disease_detection.ipynb` — model building, training, evaluation, Grad-CAM, and export

### Training Recipe

All four models share the same protocol:

- **Batch size**: 16
- **Loss**: categorical cross-entropy
- **Class weights**: balanced (`sklearn.compute_class_weight`)
- **Callbacks**: `EarlyStopping` (monitor `val_loss`, restore best weights), `ModelCheckpoint` (`save_best_only`), `ReduceLROnPlateau` (factor 0.2, `min_lr=1e-7`)
- **No on-the-fly augmentation** in the generators — train data is already augmented on disk, val/test are used as-is
- **Evaluation**: once per model on the untouched test set (323 images), reporting accuracy, macro F1, and a per-class classification report

### Model Configurations

| Model | Input size | Strategy | Learning rate | Max epochs | Patience | Actual epochs |
|---|---|---|---|---|---|---|
| EfficientNetB3 (frozen) | 300×300 | Feature extraction, backbone frozen | 1e-4 | 50 | 7 | 20 |
| EfficientNetB3 (fine-tuned) | 300×300 | Last 30 backbone layers unfrozen | 1e-5 | 50 | 7 | 47 |
| MobileNetV2 (frozen) | 224×224 | Feature extraction, backbone frozen | 1e-4 | 50 | 7 | 27 |
| Custom CNN (scratch) | 128×128 | 4 conv blocks + dense head, no pretraining | 1e-3 | 60 | 10 | 24 |

Fine-tuning uses a 10× smaller learning rate to avoid destroying the pretrained weights. The frozen backbone models use ImageNet weights and the pretrained model's own `preprocess_input`. The custom CNN uses simple `x / 255.0` rescaling.

## Results

All numbers are on the **held-out test set** (323 images) that was never trained on or augmented.

### Model Comparison

| Model | Test Accuracy | Macro F1 | Parameters |
|---|---|---|---|
| **EfficientNetB3 (fine-tuned)** | **99.69%** | **0.992** | ~11.6M |
| EfficientNetB3 (frozen) | 98.76% | 0.973 | ~11.6M |
| Custom CNN (scratch) | 98.45% | 0.983 | 1.42M |
| MobileNetV2 (frozen) | 97.21% | 0.947 | 2.92M |

The fine-tuned EfficientNetB3 wins on both accuracy and macro F1 and is exported as the final deployed model.

### Best Model — Per-Class Results

| Class | Precision | Recall | F1-score | Support |
|---|---|---|---|---|
| Early Blight | 1.00 | 1.00 | 1.00 | 150 |
| Healthy | 0.96 | 1.00 | 0.98 | 23 |
| Late Blight | 1.00 | 0.99 | 1.00 | 150 |
| **Overall accuracy** | | | **1.00** | 323 |
| **Macro average** | 0.99 | 1.00 | 0.99 | 323 |

### Observations

- Early and Late Blight are classified essentially perfectly by the leading models; the remaining errors concentrate in the **Healthy** class, which has only 23 test images and the smallest training pool.
- The **custom CNN from scratch is surprisingly competitive** (98.45% accuracy, F1 above the frozen EfficientNetB3) on this dataset. PlantVillage images are captured under consistent lab conditions with uniform backgrounds, which makes the task easier than field detection would be.
- **MobileNetV2** is the weakest on macro F1 (0.947), driven by Healthy precision of 0.81, but it is by far the smallest model (2.92M params) and is the natural candidate for edge deployment after quantization.
- Training was done on an NVIDIA GeForce RTX 3050 Laptop GPU (4 GB VRAM). MobileNetV2 trained in ~219s and the Custom CNN in ~118s; EfficientNetB3 fine-tuning is the most expensive configuration (47 epochs, and VRAM allocation warnings were observed during training).

## Grad-CAM Interpretability

`02_potato_disease_detection.ipynb` implements **Grad-CAM** to visually explain predictions:

1. The last convolutional layer is located automatically in the model graph.
2. Gradients of the predicted class score with respect to that layer's feature maps are computed with `tf.GradientTape`.
3. Gradients are global-average-pooled, used to weight the feature maps, ReLU'd, and normalized into a heatmap.
4. The heatmap is upsampled, colorized with a JET colormap, and overlaid on the original image (60% original / 40% heatmap).

This is used both on test-set samples and on `External_Test_Data/` images to confirm the model focuses on lesions and discoloration rather than background or acquisition artifacts.

## Deployment

The final model is served with **Streamlit** (`app.py`). On startup the app loads the model and configuration once via `st.cache_resource`.

### `deployment_config.json`

| Field | Value | Purpose |
|---|---|---|
| `target_size` | `[300, 300]` | Input resolution the model expects |
| `preprocess` | `"efficientnet"` | Key into the app's preprocessing map |
| `model_name` | `"EfficientNetB3_FineTuned"` | Displayed in the UI |
| `class_names` | `["Early_blight", "Healthy", "Late_blight"]` | Output index → label mapping |

The app supports `efficientnet`, `mobilenet_v2`, and `rescale` preprocessing, so switching the deployed model only requires changing this config (plus the `.keras` file) — no app code changes.

### Running the App Locally

1. Clone the repository and enter the project directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Launch the app:
   ```bash
   streamlit run app.py
   ```
4. Open the local URL printed in the terminal (typically `http://localhost:8501`) and upload a JPG/JPEG/PNG image of a potato leaf.

The app shows the uploaded image, the predicted class, the confidence percentage, and a probability bar for each class.

> Note: the current Streamlit UI is the initial frontend. A redesigned frontend is in development.

## Project Structure

```text
.
├── 01_data_augmentation.ipynb          # Leak-free split + augmentation (run first)
├── 02_potato_disease_detection.ipynb   # Training, evaluation, Grad-CAM, export
├── app.py                              # Streamlit inference app
├── deployment_config.json              # Model/image/preprocessing config for the app
├── requirements.txt                    # Python dependencies
├── potato_disease_final_model.keras    # Deployed model (copy of fine-tuned EfficientNetB3, ~82 MB)
├── best_EfficientNetB3_FineTuned.keras # Checkpoint of the best model (~82 MB)
├── best_EfficientNetB3_Frozen.keras    # Frozen-backbone checkpoint (~54 MB)
├── best_MobileNetV2.keras              # MobileNetV2 checkpoint (~18 MB)
├── best_CustomCNN_Scratch.keras        # Custom CNN checkpoint (~17 MB)
├── PlantVillage_Raw_Dataset/           # Original images (Early_blight, Late_blight, Healthy)
├── PlantVillage_Augmented_Dataset/     # Generated train/val/test splits
│   ├── train/                          #   3800 images (augmented)
│   ├── val/                            #    323 images (untouched)
│   └── test/                           #    323 images (untouched, held out)
└── External_Test_Data/                 # Additional real-world images for manual smoke tests
```

Note: the dataset and model files are committed directly to this repository (the `.git` directory is ~320 MB). Cloning takes a while; consider Git LFS if you plan to extend the dataset.

## Reproducing the Pipeline

Run the notebooks **in order**:

1. `01_data_augmentation.ipynb` — reads `PlantVillage_Raw_Dataset/` and (re)generates `PlantVillage_Augmented_Dataset/`. Safe to re-run; it overwrites the processed folder.
2. `02_potato_disease_detection.ipynb` — trains all four models, prints test-set classification reports and confusion matrices, runs Grad-CAM, and saves the best checkpoint plus `deployment_config.json`.

Important gotchas:

- **Save path**: the final cell of `02_potato_disease_detection.ipynb` writes to `../deployment_config.json` and `../potato_disease_final_model.keras`. If you run the notebook from the project root, change those paths to `./` (or run the notebook from a `notebooks/` subfolder) so the app picks up the regenerated files.
- **External test cell**: some sample paths referenced in the Grad-CAM external-testing cell (screenshots) are not shipped in the repository; edit the path list to point at files in `External_Test_Data/`.
- **Hardware**: training was performed on an NVIDIA RTX 3050 Laptop GPU (4 GB VRAM) with CUDA. Fine-tuning EfficientNetB3 produced GPU memory warnings but completed. CPU-only training or fine-tuning will be substantially slower — reduce epochs/patience or use a GPU runtime.
- **Jupyter** is not pinned in `requirements.txt`; install `jupyterlab` (or `notebook`) separately to run the notebooks.

## Tech Stack

| Area | Tools |
|---|---|
| Deep learning | TensorFlow / Keras 2.21 |
| Transfer learning | EfficientNetB3, MobileNetV2 (ImageNet weights) |
| Web app | Streamlit 1.58 |
| Image processing | OpenCV, Pillow |
| Data & metrics | NumPy, Pandas (3.0), scikit-learn (1.9) |
| Visualization | Matplotlib (3.11), Seaborn |

`requirements.txt` pins exact versions. Note that NumPy is not listed explicitly — it is installed transitively by TensorFlow.

## Limitations and Future Work

- **Small Healthy class**: only 152 raw Healthy images. Although oversampled to 1000, the diversity of augmented copies is limited, and remaining test errors concentrate there.
- **Lab-condition data**: PlantVillage images have uniform backgrounds and controlled lighting. Real field photos (soil, shadows, multiple leaves, blur) may degrade accuracy. `External_Test_Data/` provides a small qualitative check, but rigorous field evaluation is still needed.
- **Single split evaluation**: metrics come from one fixed 70/15/15 split rather than k-fold cross-validation.
- **No specialized deployment artifact yet**: the app runs the full Keras model. Exporting to TensorFlow Lite (with quantization) would enable offline mobile/edge use; MobileNetV2 is the best candidate for this.
- **Potential extensions**: Grad-CAM overlay in the web app, confidence thresholding with an "unknown / not a potato leaf" class, more disease classes, and field-image fine-tuning.

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for the full text.

## Credits

- **Dhruv Sinha** — dataset preparation, model training, evaluation, notebooks, and deployment.
- **Naman** — frontend / UI.
- Dataset: [PlantVillage](https://github.com/spMohanty/PlantVillage-Dataset), Hughes, D. P., & Salathé, M. (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics.* arXiv:1511.08060.
