import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import pandas as pd
import timm
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix


# ==============================
# SETTINGS
# ==============================

DEVICE = torch.device("cpu")

MODEL_PATH = "eye_vit_tiny.pth"

VAL_CSV = "Dataset/eye_val.csv"
TEST_CSV = "Dataset/eye_test.csv"

IMAGE_SIZE = 224
BATCH_SIZE = 2


# ==============================
# TRANSFORM
# ==============================

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ==============================
# DATASET
# ==============================

class EyeDataset(Dataset):

    def __init__(self, csv_file):

        self.data = pd.read_csv(csv_file)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):

        row = self.data.iloc[idx]

        left_path = row["left_eye"]
        right_path = row["right_eye"]
        label = int(row["label"])

        left_image = Image.open(left_path).convert("RGB")
        right_image = Image.open(right_path).convert("RGB")

        left_image = transform(left_image)
        right_image = transform(right_image)

        return left_image, right_image, label


# ==============================
# LOAD MODEL
# ==============================

print("\nLoading ViT model...")

model = timm.create_model(
    "vit_tiny_patch16_224",
    pretrained=False,
    num_classes=2
)

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )
)

model = model.to(DEVICE)
model.eval()

print("Model loaded successfully.")


# ==============================
# GET PROBABILITIES
# ==============================

def get_predictions(csv_file):

    dataset = EyeDataset(csv_file)

    loader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0
    )

    probabilities = []
    labels = []

    with torch.no_grad():

        for left, right, y in loader:

            left = left.to(DEVICE)
            right = right.to(DEVICE)

            left_output = model(left)
            right_output = model(right)

            # Average the two eye predictions
            output = (left_output + right_output) / 2

            prob = torch.softmax(output, dim=1)

            # Probability of Anemia
            anemia_prob = prob[:, 1]

            probabilities.extend(
                anemia_prob.cpu().numpy()
            )

            labels.extend(
                y.numpy()
            )

    return np.array(probabilities), np.array(labels)


# ==============================
# VALIDATION SET
# ==============================

print("\n================================")
print("VALIDATION THRESHOLD SEARCH")
print("================================")

val_probs, val_labels = get_predictions(VAL_CSV)


thresholds = np.arange(
    0.20,
    0.71,
    0.05
)


results = []

print("\nThreshold | Accuracy | Precision | Recall | F1")
print("-----------------------------------------------")


for threshold in thresholds:

    predictions = (
        val_probs >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        val_labels,
        predictions
    )

    precision = precision_score(
        val_labels,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        val_labels,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        val_labels,
        predictions,
        zero_division=0
    )

    results.append(
        (
            threshold,
            accuracy,
            precision,
            recall,
            f1
        )
    )

    print(
        f"{threshold:.2f}      | "
        f"{accuracy:.4f}   | "
        f"{precision:.4f}    | "
        f"{recall:.4f} | "
        f"{f1:.4f}"
    )


# ==============================
# SELECT BEST VALIDATION F1
# ==============================

best_result = max(
    results,
    key=lambda x: x[4]
)

best_threshold = best_result[0]

print("\n================================")
print("SELECTED THRESHOLD")
print("================================")

print(
    f"Best validation threshold: "
    f"{best_threshold:.2f}"
)

print(
    f"Validation F1: "
    f"{best_result[4]:.4f}"
)


# ==============================
# TEST SET
# ==============================

print("\n================================")
print("FINAL TEST EVALUATION")
print("================================")

test_probs, test_labels = get_predictions(TEST_CSV)


test_predictions = (
    test_probs >= best_threshold
).astype(int)


test_accuracy = accuracy_score(
    test_labels,
    test_predictions
)

test_precision = precision_score(
    test_labels,
    test_predictions,
    zero_division=0
)

test_recall = recall_score(
    test_labels,
    test_predictions,
    zero_division=0
)

test_f1 = f1_score(
    test_labels,
    test_predictions,
    zero_division=0
)


print(
    f"\nFixed threshold used: "
    f"{best_threshold:.2f}"
)

print(
    f"Accuracy : {test_accuracy:.4f}"
)

print(
    f"Precision: {test_precision:.4f}"
)

print(
    f"Recall   : {test_recall:.4f}"
)

print(
    f"F1 Score : {test_f1:.4f}"
)


# ==============================
# CONFUSION MATRIX
# ==============================

cm = confusion_matrix(
    test_labels,
    test_predictions
)

print("\n================================")
print("CONFUSION MATRIX")
print("================================")

print(cm)

print("\nRows    = Actual")
print("Columns = Predicted")

print("\n[[TN  FP]")
print(" [FN  TP]]")


print("\n================================")
print("THRESHOLD EVALUATION COMPLETED")
print("================================")