import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import timm
import numpy as np

# ==============================
# SETTINGS
# ==============================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMG_SIZE = 224
BATCH_SIZE = 4

MODEL_NAME = "vit_tiny_patch16_224"

# ==============================
# DATASET
# ==============================

class PalmDataset(Dataset):

    def __init__(self, csv_file, transform=None):

        self.df = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):

        row = self.df.iloc[idx]

        image = Image.open(
            row["image_path"]
        ).convert("RGB")

        if self.transform:
            image = self.transform(image)

        label = int(row["label"])

        return image, label


# ==============================
# TRANSFORM
# ==============================

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ==============================
# VALIDATION DATA
# ==============================

val_dataset = PalmDataset(
    "Dataset/palm_val.csv",
    transform
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

# ==============================
# MODEL
# ==============================

model = timm.create_model(
    MODEL_NAME,
    pretrained=False,
    num_classes=2
)

model.load_state_dict(
    torch.load(
        "palm_vit_tiny.pth",
        map_location=DEVICE
    )
)

model = model.to(DEVICE)
model.eval()

# ==============================
# GET VALIDATION PROBABILITIES
# ==============================

all_probs = []
all_labels = []

with torch.no_grad():

    for images, labels in val_loader:

        images = images.to(DEVICE)

        outputs = model(images)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        # Probability of Anemia
        anemia_probs = probabilities[:, 1]

        all_probs.extend(
            anemia_probs.cpu().numpy()
        )

        all_labels.extend(
            labels.numpy()
        )

all_probs = np.array(all_probs)
all_labels = np.array(all_labels)

# ==============================
# THRESHOLD TESTING
# ==============================

print("\n================================")
print("PALM VALIDATION THRESHOLD TUNING")
print("================================")

print(
    f"{'Threshold':<12}"
    f"{'Accuracy':<12}"
    f"{'Precision':<12}"
    f"{'Recall':<12}"
    f"{'F1':<12}"
)

best_threshold = 0.50
best_f1 = 0.0

for threshold in np.arange(
    0.20,
    0.71,
    0.05
):

    predictions = (
        all_probs >= threshold
    ).astype(int)

    accuracy = accuracy_score(
        all_labels,
        predictions
    )

    precision = precision_score(
        all_labels,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        all_labels,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        all_labels,
        predictions,
        zero_division=0
    )

    print(
        f"{threshold:<12.2f}"
        f"{accuracy:<12.4f}"
        f"{precision:<12.4f}"
        f"{recall:<12.4f}"
        f"{f1:<12.4f}"
    )

    if f1 > best_f1:

        best_f1 = f1
        best_threshold = threshold

print("\n================================")
print("BEST VALIDATION THRESHOLD")
print("================================")

print(
    f"Threshold: {best_threshold:.2f}"
)

print(
    f"Best Validation F1: {best_f1:.4f}"
)

print(
    "\nThis threshold should be selected "
    "using validation data only."
)