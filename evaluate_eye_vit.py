import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import pandas as pd
import timm
from torchvision import transforms
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay
)
import matplotlib.pyplot as plt

DEVICE = torch.device("cpu")
IMAGE_SIZE = 224
BATCH_SIZE = 2

# =========================
# Dataset
# =========================

class EyeDataset(Dataset):

    def __init__(self, csv_file, transform=None):
        self.data = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):

        row = self.data.iloc[index]

        left_image = Image.open(
            row["left_eye"]
        ).convert("RGB")

        right_image = Image.open(
            row["right_eye"]
        ).convert("RGB")

        if self.transform:
            left_image = self.transform(left_image)
            right_image = self.transform(right_image)

        label = torch.tensor(
            row["label"],
            dtype=torch.long
        )

        return left_image, right_image, label


# =========================
# Transform
# =========================

test_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================
# Test Dataset
# =========================

test_dataset = EyeDataset(
    "Dataset/eye_test.csv",
    transform=test_transform
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# =========================
# Load Model
# =========================

print("Loading ViT-Tiny...")

model = timm.create_model(
    "vit_tiny_patch16_224",
    pretrained=False,
    num_classes=2
)

model.load_state_dict(
    torch.load(
        "eye_vit_tiny.pth",
        map_location=DEVICE
    )
)

model = model.to(DEVICE)
model.eval()


# =========================
# Predictions
# =========================

all_predictions = []
all_labels = []

print("Evaluating test dataset...")

with torch.no_grad():

    for (
        left_images,
        right_images,
        labels
    ) in test_loader:

        left_images = left_images.to(DEVICE)
        right_images = right_images.to(DEVICE)

        left_output = model(left_images)
        right_output = model(right_images)

        outputs = (
            left_output + right_output
        ) / 2

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        all_predictions.extend(
            predictions.cpu().numpy()
        )

        all_labels.extend(
            labels.numpy()
        )


# =========================
# Classification Report
# =========================

print("\n")
print("=" * 60)
print("CLASSIFICATION REPORT")
print("=" * 60)

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=[
            "Non-Anemia",
            "Anemia"
        ],
        digits=4,
        zero_division=0
    )
)


# =========================
# Confusion Matrix
# =========================

cm = confusion_matrix(
    all_labels,
    all_predictions
)

print("\n")
print("=" * 60)
print("CONFUSION MATRIX")
print("=" * 60)

print(cm)

print("\n")
print("Rows    = Actual")
print("Columns = Predicted")

print("\n              Predicted")
print("             Non-Anemia  Anemia")
print(
    f"Actual Non   {cm[0][0]:10d}  {cm[0][1]:6d}"
)
print(
    f"Actual Anemia {cm[1][0]:9d}  {cm[1][1]:6d}"
)


# =========================
# Display Confusion Matrix
# =========================

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=[
        "Non-Anemia",
        "Anemia"
    ]
)

disp.plot()

plt.title(
    "ViT-Tiny Eye Anemia Confusion Matrix"
)

plt.tight_layout()

plt.savefig(
    "eye_vit_confusion_matrix.png",
    dpi=300
)

plt.show()

print(
    "\nConfusion matrix saved as:"
    " eye_vit_confusion_matrix.png"
)