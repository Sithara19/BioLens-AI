
# BioLens AI

## AI-Based Anemia Risk Screening from Eye, Nail and Skin Images

BioLens AI is an AI-based healthcare screening research prototype designed to perform preliminary anemia risk assessment using images from multiple body-image modalities.

The current system uses **Eye, Nail, and Skin images** with Vision Transformer (ViT-Tiny) models for modality-specific feature extraction. The extracted features are combined using a multimodal fusion model to generate an anemia risk prediction.

> **Note:** BioLens AI is a preliminary screening system and is not intended to provide a medical diagnosis.

---

## Project Overview

Anemia can be associated with visible changes in certain body regions, including the eye, nails, and skin. BioLens AI investigates whether computer vision and deep learning can identify visual patterns that may be associated with anemia risk.

The current system performs:

1. Eye image input
2. Nail image input
3. Skin image input
4. Image preprocessing
5. ViT-Tiny feature extraction for each modality
6. Multimodal feature fusion
7. Binary anemia risk classification
8. Confidence/risk estimation
9. Modality contribution analysis

---

## System Pipeline

```text
        Eye Image
            ↓
        ViT-Tiny
            ↓
     192-D Features
            │
            │
        Nail Image
            ↓
        ViT-Tiny
            ↓
     192-D Features
            │
            │
        Skin Image
            ↓
        ViT-Tiny
            ↓
     192-D Features
            │
            └──────────────┐
                           ↓
                    Feature Fusion
                           ↓
                 579-D Fusion Input
                           ↓
                  Fusion Classification
                           ↓
              ┌────────────────────────┐
              │                        │
        Non-Anemia                  Anemia
              │                        │
              └───────────┬────────────┘
                          ↓
                  Risk + Confidence
                          ↓
               Modality Contribution
````

---

## Image Modalities

The current implementation uses three image modalities:

| Modality | Model    | Feature Size |
| -------- | -------- | -----------: |
| Eye      | ViT-Tiny |          192 |
| Nail     | ViT-Tiny |          192 |
| Skin     | ViT-Tiny |          192 |

The **Skin** modality uses the internally trained `palm_vit_tiny.pth` model.

The website may display the modality as **Skin**, while the trained model and internal project files retain the name **Palm**.

---

## Dataset

The project uses image datasets prepared separately for the individual modalities.

The datasets are used to train:

* Eye anemia model
* Nail anemia model
* Skin/Palm anemia model

The original datasets are not included in this repository.

Users should obtain the required datasets separately and place them in the appropriate local dataset directories.

---

## Data Preprocessing

The image preprocessing pipeline includes:

* Image loading
* RGB conversion
* Resizing to 224 × 224 pixels
* Conversion to PyTorch tensors
* ImageNet normalization

The same preprocessing configuration is used when extracting features from images for the fusion model.

---

## Model Architecture

The project uses:

**Vision Transformer Tiny (ViT-Tiny)**

Model:

```text
vit_tiny_patch16_224
```

Configuration:

* Input size: 224 × 224
* Feature dimension: 192
* Binary classification during modality-specific training
* ImageNet normalization
* PyTorch implementation
* CPU-compatible inference

After training, the classification head is removed from each ViT-Tiny model so that the model produces a **192-dimensional feature representation**.

---

## Multimodal Feature Fusion

Each modality produces a 192-dimensional feature vector.

```text
Eye  → 192 features
Nail → 192 features
Skin → 192 features
             +
      Modality Mask
             ↓
      3 additional values
             ↓
     192 + 192 + 192 + 3
             ↓
     579-dimensional input
             ↓
       Fusion Model
             ↓
      Anemia Prediction
```

The modality mask indicates whether each modality is available.

```text
Eye   → 1 / 0
Nail  → 1 / 0
Skin  → 1 / 0
```

This allows the fusion model to handle different combinations of available modalities.

---

## Fusion Model

The fusion model contains separate projection layers for the three modalities.

```text
Eye Features
    ↓
128-D Projection
    │
    ├──────────────┐
    │              │
Nail Features     Skin Features
    ↓              ↓
128-D Projection  128-D Projection
    │              │
    └──────┬───────┘
           ↓
     Concatenation
           +
      Modality Mask
           ↓
      Fusion Classifier
           ↓
      2-Class Output
```

The final classifier produces two classes:

```text
Class 0 → Non-Anemia
Class 1 → Anemia
```

---

## Trained Models

The repository contains the trained models:

| Model               | Purpose                            |
| ------------------- | ---------------------------------- |
| `eye_vit_tiny.pth`  | Eye image feature extraction       |
| `nail_vit_tiny.pth` | Nail image feature extraction      |
| `palm_vit_tiny.pth` | Skin/Palm image feature extraction |
| `fusion_model.pth`  | Multimodal anemia screening        |

---

## Model Evaluation

The fusion model was evaluated using a held-out test set.

Current evaluation results:

| Metric    |     Result |
| --------- | ---------: |
| Accuracy  | **85.14%** |
| Precision | **44.44%** |
| Recall    | **71.43%** |
| F1-score  | **54.79%** |

The anemia probability threshold used for the final test evaluation was:

```text
0.55
```

The threshold was selected using validation data and was not tuned using the test set.

---

## Per-Modality Combination Analysis

The fusion model was also evaluated using different combinations of available modalities.

| Modality Combination   | Samples | Accuracy |
| ---------------------- | ------: | -------: |
| Eye only               |       3 |   33.33% |
| Nail only              |       — |        — |
| Skin/Palm only         |       4 |  100.00% |
| Eye + Nail             |      10 |  100.00% |
| Eye + Skin/Palm        |       6 |   66.67% |
| Nail + Skin/Palm       |       1 |  100.00% |
| Eye + Nail + Skin/Palm |     198 |   85.35% |

> **Note:** Some modality-combination groups contain very few samples and should not be overinterpreted.

For the complete three-modality group:

```text
Samples  : 198
Accuracy : 85.35%
Precision: 37.14%
Recall   : 65.00%
F1-score : 47.27%
```

---

## Prediction

The system produces a preliminary screening result based on the predicted anemia probability.

Example:

```text
BIOLENS AI SCREENING RESULT

Result     : Anemia Risk Detected
Confidence : 84.25%
Anemia Risk: 84.25%

MODALITY CONTRIBUTION

Eye  : 32.40%
Nail : 41.15%
Skin : 26.45%
```

The values are calculated dynamically from the uploaded images and model predictions.

Different input images can therefore produce different risk, confidence, and modality contribution values.

---

## Modality Contribution

The system estimates the contribution of each modality using an **ablation-based approach**.

The complete prediction is first calculated using all available modalities.

Then each modality is removed one at a time and the change in anemia probability is observed.

Conceptually:

```text
All Modalities
      ↓
Anemia Probability
      │
      ├── Remove Eye
      │       ↓
      │   Probability Change
      │
      ├── Remove Nail
      │       ↓
      │   Probability Change
      │
      └── Remove Skin
              ↓
          Probability Change
```

The resulting probability changes are normalized to obtain the displayed contribution percentages.

> **Important:** These percentages represent model-attribution estimates. They do not mean that a particular percentage of anemia originates from the eye, nail, or skin.

---

## Website Integration

A web-based interface is planned for the BioLens AI system.

The intended workflow is:

1. Upload an eye image
2. Upload a nail image
3. Upload a skin image
4. Send the images to the prediction backend
5. Extract modality-specific features
6. Generate the fused representation
7. Run the fusion model
8. Display the screening result
9. Display risk/confidence
10. Display modality contribution percentages

The website can also allow a modality to be skipped. A skipped modality is not analyzed and is represented as unavailable in the fusion input.

---

## Project Structure

```text
Anemia_prediction/
│
├── eye_vit_tiny.pth
├── nail_vit_tiny.pth
├── palm_vit_tiny.pth
├── fusion_model.pth
│
├── predict_biolens.py
├── extract_fusion_features.py
│
├── train_eye_vit.py
├── train_nail_vit.py
├── train_palm_vit.py
├── train_fusion_model.py
│
├── analyze_fusion_modalities.py
├── fusion_modality_analysis.csv
│
├── evaluate_eye_vit.py
├── tune_eye_threshold.py
├── tune_eye_threshold_validation.py
├── tune_palm_threshold.py
│
├── check_images.py
├── check_missing_images.py
├── check_nail_images.py
├── verify_fusion_features.py
├── verify_nail_split.py
├── verify_palm_dataset.py
│
├── prepare_eye_dataset.py
├── split_eye_dataset.py
├── split_nail_dataset.py
├── split_palm_dataset.py
│
├── create_fusion_csv.py
├── create_fusion_split.py
├── check_fusion_labels.py
├── check_fusion_combinations.py
│
├── eye_vit_confusion_matrix.png
├── .gitignore
└── README.md
```

---

## Installation

Create a Python virtual environment and install the required packages:

```bash
pip install torch torchvision timm pillow pandas numpy
```

The project was developed using PyTorch and the `timm` library for Vision Transformer models.

---

## Running the Prediction System

The prediction backend can be used to process uploaded images using the trained models.

The main prediction file is:

```bash
python predict_biolens.py
```

The trained models required for prediction are:

```text
eye_vit_tiny.pth
nail_vit_tiny.pth
palm_vit_tiny.pth
fusion_model.pth
```

---

## Training

The individual modality models can be retrained using:

```bash
python train_eye_vit.py
python train_nail_vit.py
python train_palm_vit.py
```

The multimodal fusion model can be retrained using:

```bash
python train_fusion_model.py
```

Feature extraction for the fusion model is performed using:

```bash
python extract_fusion_features.py
```

---


## Future Work

Future development may include:

* Larger and more diverse datasets
* Additional body-image modalities
* Additional disease-risk categories
* Improved multimodal fusion techniques
* External validation using independent datasets
* Improved robustness to lighting and image-quality variations
* Explainable AI techniques
* Real-time image capture
* Improved web deployment
* Clinical validation with appropriate medical datasets

---

