import os
import ast
from pathlib import Path

import torch
import torch.nn as nn
import pandas as pd
import timm

from PIL import Image
from torchvision import transforms


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent

FUSION_DIR = PROJECT_ROOT / "Dataset" / "Fusion"

EYE_MODEL_PATH = PROJECT_ROOT / "eye_vit_tiny.pth"
NAIL_MODEL_PATH = PROJECT_ROOT / "nail_vit_tiny.pth"
PALM_MODEL_PATH = PROJECT_ROOT / "palm_vit_tiny.pth"

IMAGE_SIZE = 224
BATCH_SIZE = 4

DEVICE = torch.device("cpu")

FEATURE_DIM = 192


# ============================================================
# IMAGE TRANSFORM
# Must match validation/test preprocessing used during training
# ============================================================

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# LOAD VI-TINY MODEL
# ============================================================

def load_vit_model(model_path):
    print()
    print("Loading model:")
    print(model_path)

    model = timm.create_model(
        "vit_tiny_patch16_224",
        pretrained=False,
        num_classes=2
    )

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE
    )

    # Handle both normal state_dict and checkpoint dictionaries
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)

    # Remove classification head.
    # The model will now output the 192-dimensional feature vector.
    model.reset_classifier(0)

    model.to(DEVICE)
    model.eval()

    print("Model loaded successfully.")
    print("Feature dimension:", FEATURE_DIM)

    return model


# ============================================================
# LOAD ONE IMAGE
# ============================================================

def load_image(image_path):
    image_path = Path(image_path)

    if not image_path.is_absolute():
        image_path = PROJECT_ROOT / image_path

    if not image_path.exists():
        print("WARNING: Image not found:")
        print(image_path)
        return None

    try:
        image = Image.open(image_path).convert("RGB")
        image = transform(image)
        return image

    except Exception as e:
        print("WARNING: Could not load image:")
        print(image_path)
        print("Error:", e)
        return None


# ============================================================
# EXTRACT FEATURES FROM MULTIPLE IMAGES
# ============================================================

def extract_features_from_images(image_paths, model):
    """
    Extract features from all valid images and average them.

    Input:
        image_paths = list of image paths

    Output:
        192-dimensional tensor
    """

    if not image_paths:
        return torch.zeros(FEATURE_DIM)

    images = []

    for image_path in image_paths:
        image = load_image(image_path)

        if image is not None:
            images.append(image)

    if len(images) == 0:
        return torch.zeros(FEATURE_DIM)

    features = []

    with torch.no_grad():

        for start in range(0, len(images), BATCH_SIZE):

            batch_images = images[
                start:start + BATCH_SIZE
            ]

            batch = torch.stack(batch_images).to(DEVICE)

            batch_features = model(batch)

            features.append(
                batch_features.cpu()
            )

    features = torch.cat(features, dim=0)

    # Average all images belonging to the same person
    person_feature = features.mean(dim=0)

    return person_feature


# ============================================================
# PARSE LIST STORED IN CSV
# ============================================================

def parse_path_list(value):

    if pd.isna(value):
        return []

    value = str(value).strip()

    if value == "" or value == "[]":
        return []

    try:
        result = ast.literal_eval(value)

        if isinstance(result, list):
            return result

    except Exception:
        pass

    # If it is a single path rather than a list
    return [value]


# ============================================================
# PROCESS ONE FUSION CSV
# ============================================================

def process_split(
    split_name,
    eye_model,
    nail_model,
    palm_model
):

    csv_path = FUSION_DIR / f"fusion_{split_name}.csv"

    print()
    print("=" * 70)
    print(f"PROCESSING {split_name.upper()} SET")
    print("=" * 70)

    print("CSV:", csv_path)

    if not csv_path.exists():
        raise FileNotFoundError(
            f"Fusion CSV not found: {csv_path}"
        )

    df = pd.read_csv(csv_path)

    print("Number of people:", len(df))

    eye_features = []
    nail_features = []
    palm_features = []

    masks = []
    labels = []
    person_ids = []

    # --------------------------------------------------------
    # PROCESS EACH PERSON
    # --------------------------------------------------------

    for index, row in df.iterrows():

        person_id = str(row["person_id"])

        print(
            f"\rProcessing {index + 1}/{len(df)} "
            f"Person: {person_id}",
            end=""
        )

        # ====================================================
        # EYE
        # ====================================================

        eye_available = int(row["eye_available"])

        if eye_available == 1:

            eye_paths = []

            left_eye = row["left_eye"]
            right_eye = row["right_eye"]

            if not pd.isna(left_eye):
                eye_paths.append(str(left_eye))

            if not pd.isna(right_eye):
                eye_paths.append(str(right_eye))

            eye_feature = extract_features_from_images(
                eye_paths,
                eye_model
            )

        else:

            eye_feature = torch.zeros(FEATURE_DIM)

        # ====================================================
        # NAIL
        # ====================================================

        nail_available = int(row["nail_available"])

        if nail_available == 1:

            nail_paths = parse_path_list(
                row["nail_paths"]
            )

            nail_feature = extract_features_from_images(
                nail_paths,
                nail_model
            )

        else:

            nail_feature = torch.zeros(FEATURE_DIM)

        # ====================================================
        # PALM
        # ====================================================

        palm_available = int(row["palm_available"])

        if palm_available == 1:

            palm_paths = parse_path_list(
                row["palm_paths"]
            )

            palm_feature = extract_features_from_images(
                palm_paths,
                palm_model
            )

        else:

            palm_feature = torch.zeros(FEATURE_DIM)

        # ====================================================
        # STORE FEATURES
        # ====================================================

        eye_features.append(eye_feature)
        nail_features.append(nail_feature)
        palm_features.append(palm_feature)

        # Mask:
        # [eye, nail, palm]
        masks.append([
            eye_available,
            nail_available,
            palm_available
        ])

        labels.append(
            int(row["label"])
        )

        person_ids.append(
            person_id
        )

    print()
    print()

    # ========================================================
    # CONVERT TO TENSORS
    # ========================================================

    eye_features = torch.stack(eye_features)

    nail_features = torch.stack(nail_features)

    palm_features = torch.stack(palm_features)

    masks = torch.tensor(
        masks,
        dtype=torch.float32
    )

    labels = torch.tensor(
        labels,
        dtype=torch.long
    )

    # ========================================================
    # COMBINED FEATURE VECTOR
    # ========================================================

    combined_features = torch.cat(
        [
            eye_features,
            nail_features,
            palm_features,
            masks
        ],
        dim=1
    )

    # Expected:
    #
    # Eye   = 192
    # Nail  = 192
    # Palm  = 192
    # Mask  = 3
    #
    # Total = 579

    print("Eye feature shape   :", eye_features.shape)
    print("Nail feature shape  :", nail_features.shape)
    print("Palm feature shape  :", palm_features.shape)
    print("Mask shape          :", masks.shape)
    print("Combined shape      :", combined_features.shape)
    print("Labels shape        :", labels.shape)

    # ========================================================
    # SAVE
    # ========================================================

    output_path = (
        FUSION_DIR /
        f"fusion_{split_name}_features.pt"
    )

    data = {
        "person_ids": person_ids,

        "eye_features": eye_features,

        "nail_features": nail_features,

        "palm_features": palm_features,

        "mask": masks,

        "labels": labels,

        "features": combined_features
    }

    torch.save(
        data,
        output_path
    )

    print()
    print("Saved:")
    print(output_path)

    return data


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 70)
    print("BIOLENS AI - FUSION FEATURE EXTRACTION")
    print("=" * 70)

    print()
    print("Project root:")
    print(PROJECT_ROOT)

    print()
    print("Device:")
    print(DEVICE)

    # --------------------------------------------------------
    # CHECK MODEL FILES
    # --------------------------------------------------------

    required_models = [
        EYE_MODEL_PATH,
        NAIL_MODEL_PATH,
        PALM_MODEL_PATH
    ]

    for model_path in required_models:

        if not model_path.exists():

            raise FileNotFoundError(
                f"\nModel file not found:\n{model_path}"
            )

    # --------------------------------------------------------
    # LOAD MODELS
    # --------------------------------------------------------

    eye_model = load_vit_model(
        EYE_MODEL_PATH
    )

    nail_model = load_vit_model(
        NAIL_MODEL_PATH
    )

    palm_model = load_vit_model(
        PALM_MODEL_PATH
    )

    # --------------------------------------------------------
    # PROCESS TRAIN
    # --------------------------------------------------------

    process_split(
        "train",
        eye_model,
        nail_model,
        palm_model
    )

    # --------------------------------------------------------
    # PROCESS VALIDATION
    # --------------------------------------------------------

    process_split(
        "val",
        eye_model,
        nail_model,
        palm_model
    )

    # --------------------------------------------------------
    # PROCESS TEST
    # --------------------------------------------------------

    process_split(
        "test",
        eye_model,
        nail_model,
        palm_model
    )

    # --------------------------------------------------------
    # FINISHED
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("FEATURE EXTRACTION COMPLETED")
    print("=" * 70)

    print()
    print("Generated files:")

    print(
        FUSION_DIR /
        "fusion_train_features.pt"
    )

    print(
        FUSION_DIR /
        "fusion_val_features.pt"
    )

    print(
        FUSION_DIR /
        "fusion_test_features.pt"
    )

    print()
    print("Feature dimension: 579")
    print("  Eye   : 192")
    print("  Nail  : 192")
    print("  Palm  : 192")
    print("  Mask  : 3")

    print()
    print("Next step: train the mask-aware fusion classifier.")