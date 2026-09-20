import pandas as pd
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

import timm

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# CONFIGURATION
# ============================================================

TRAIN_CSV = "Dataset/nail_train.csv"
VAL_CSV = "Dataset/nail_val.csv"
TEST_CSV = "Dataset/nail_test.csv"

MODEL_SAVE_PATH = "nail_vit_tiny.pth"

IMAGE_SIZE = 224

# CPU-friendly settings
BATCH_SIZE = 4
GRAD_ACCUMULATION = 4

EPOCHS = 5
LEARNING_RATE = 0.0001

DEVICE = torch.device("cpu")


print("================================")
print("NAIL ANEMIA - ViT-TINY")
print("================================")
print("Device:", DEVICE)


# ============================================================
# DATASET
# ============================================================

class NailDataset(Dataset):

    def __init__(self, csv_file, transform=None):

        self.data = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):

        image_path = self.data.iloc[idx]["image_path"]
        label = int(self.data.iloc[idx]["label"])

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label


# ============================================================
# TRANSFORMS
# ============================================================

train_transform = transforms.Compose([

    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.RandomHorizontalFlip(p=0.5),

    transforms.RandomRotation(10),

    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15,
        saturation=0.10
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_test_transform = transforms.Compose([

    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# LOAD DATASETS
# ============================================================

train_dataset = NailDataset(
    TRAIN_CSV,
    train_transform
)

val_dataset = NailDataset(
    VAL_CSV,
    val_test_transform
)

test_dataset = NailDataset(
    TEST_CSV,
    val_test_transform
)


print("\nDataset sizes:")
print("Train:", len(train_dataset))
print("Validation:", len(val_dataset))
print("Test:", len(test_dataset))


# ============================================================
# DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# ============================================================
# CLASS WEIGHTS
# ============================================================

train_labels = train_dataset.data["label"].values

class_counts = np.bincount(train_labels)

print("\nTraining class counts:")
print("Non-Anemia:", class_counts[0])
print("Anemia:", class_counts[1])


class_weights = len(train_labels) / (
    2 * class_counts
)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(DEVICE)

print("\nClass weights:")
print(class_weights)


# ============================================================
# LOAD PRETRAINED ViT
# ============================================================

print("\nLoading pretrained ViT-Tiny...")

model = timm.create_model(
    "vit_tiny_patch16_224",
    pretrained=True,
    num_classes=2
)

model = model.to(DEVICE)


# ============================================================
# FREEZE MOST LAYERS
# ============================================================

# Freeze everything first
for param in model.parameters():
    param.requires_grad = False


# Unfreeze the last 2 transformer blocks
for block in model.blocks[-2:]:
    for param in block.parameters():
        param.requires_grad = True


# Unfreeze final normalization layer
for param in model.norm.parameters():
    param.requires_grad = True


# Unfreeze classification head
for param in model.head.parameters():
    param.requires_grad = True


trainable_params = sum(
    p.numel()
    for p in model.parameters()
    if p.requires_grad
)

total_params = sum(
    p.numel()
    for p in model.parameters()
)

print("\nModel parameters:")
print("Total:", total_params)
print("Trainable:", trainable_params)


# ============================================================
# LOSS
# ============================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    filter(
        lambda p: p.requires_grad,
        model.parameters()
    ),
    lr=LEARNING_RATE,
    weight_decay=0.01
)


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_one_epoch():

    model.train()

    running_loss = 0.0

    all_predictions = []
    all_labels = []

    optimizer.zero_grad()

    for batch_index, (images, labels) in enumerate(train_loader):

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        loss = criterion(outputs, labels)

        # Gradient accumulation
        loss = loss / GRAD_ACCUMULATION

        loss.backward()

        if (
            (batch_index + 1) % GRAD_ACCUMULATION == 0
            or
            (batch_index + 1) == len(train_loader)
        ):

            optimizer.step()
            optimizer.zero_grad()

        running_loss += loss.item() * GRAD_ACCUMULATION

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        all_predictions.extend(
            predictions.cpu().numpy()
        )

        all_labels.extend(
            labels.cpu().numpy()
        )

    epoch_loss = running_loss / len(train_loader)

    epoch_accuracy = accuracy_score(
        all_labels,
        all_predictions
    )

    return epoch_loss, epoch_accuracy


# ============================================================
# VALIDATION
# ============================================================

def validate():

    model.eval()

    all_predictions = []
    all_labels = []

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            all_predictions.extend(
                predictions.cpu().numpy()
            )

            all_labels.extend(
                labels.cpu().numpy()
            )

    accuracy = accuracy_score(
        all_labels,
        all_predictions
    )

    precision = precision_score(
        all_labels,
        all_predictions,
        zero_division=0
    )

    recall = recall_score(
        all_labels,
        all_predictions,
        zero_division=0
    )

    f1 = f1_score(
        all_labels,
        all_predictions,
        zero_division=0
    )

    return accuracy, precision, recall, f1


# ============================================================
# TRAINING
# ============================================================

print("\nStarting training...\n")

best_f1 = -1.0

for epoch in range(EPOCHS):

    train_loss, train_accuracy = train_one_epoch()

    val_accuracy, val_precision, val_recall, val_f1 = validate()

    print(
        f"Epoch {epoch + 1}/{EPOCHS} | "
        f"Loss: {train_loss:.4f} | "
        f"Train Acc: {train_accuracy:.4f} | "
        f"Val Acc: {val_accuracy:.4f} | "
        f"Val Precision: {val_precision:.4f} | "
        f"Val Recall: {val_recall:.4f} | "
        f"Val F1: {val_f1:.4f}"
    )

    if val_f1 > best_f1:

        best_f1 = val_f1

        torch.save(
            model.state_dict(),
            MODEL_SAVE_PATH
        )

        print("  ✓ Best model saved")


# ============================================================
# LOAD BEST MODEL
# ============================================================

print("\nLoading best model...")

model.load_state_dict(
    torch.load(
        MODEL_SAVE_PATH,
        map_location=DEVICE
    )
)

model.eval()


# ============================================================
# TEST
# ============================================================

all_predictions = []
all_labels = []

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        all_predictions.extend(
            predictions.cpu().numpy()
        )

        all_labels.extend(
            labels.cpu().numpy()
        )


# ============================================================
# FINAL TEST RESULTS
# ============================================================

test_accuracy = accuracy_score(
    all_labels,
    all_predictions
)

test_precision = precision_score(
    all_labels,
    all_predictions,
    zero_division=0
)

test_recall = recall_score(
    all_labels,
    all_predictions,
    zero_division=0
)

test_f1 = f1_score(
    all_labels,
    all_predictions,
    zero_division=0
)


print("\n================================")
print("FINAL TEST RESULTS")
print("================================")

print(f"Accuracy : {test_accuracy:.4f}")
print(f"Precision: {test_precision:.4f}")
print(f"Recall   : {test_recall:.4f}")
print(f"F1 Score : {test_f1:.4f}")


print("\nClassification Report:")

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=[
            "Non-Anemia",
            "Anemia"
        ],
        zero_division=0
    )
)


print("Confusion Matrix:")

print(
    confusion_matrix(
        all_labels,
        all_predictions
    )
)


print("\nModel saved as:", MODEL_SAVE_PATH)

print("\n================================")
print("TRAINING COMPLETED")
print("================================")