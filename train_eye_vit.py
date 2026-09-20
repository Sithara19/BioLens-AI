
from pathlib import Path

import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import timm
from torchvision import transforms
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    recall_score,
    precision_score
)


# ============================================================
# SETTINGS
# ============================================================

BATCH_SIZE = 2
GRADIENT_ACCUMULATION_STEPS = 4

EPOCHS = 3
IMAGE_SIZE = 224
LEARNING_RATE = 0.0001

DEVICE = torch.device("cpu")

print("Device:", DEVICE)


# ============================================================
# DATASET
# ============================================================

class EyeDataset(Dataset):

    def __init__(self, csv_file, transform=None):
        self.data = pd.read_csv(csv_file)
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):

        row = self.data.iloc[index]

        left_path = row["left_eye"]
        right_path = row["right_eye"]

        left_image = Image.open(left_path).convert("RGB")
        right_image = Image.open(right_path).convert("RGB")

        if self.transform:
            left_image = self.transform(left_image)
            right_image = self.transform(right_image)

        label = torch.tensor(
            row["label"],
            dtype=torch.long
        )

        return left_image, right_image, label


# ============================================================
# IMAGE TRANSFORMS
# ============================================================

train_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.RandomHorizontalFlip(),

    transforms.RandomRotation(5),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# LOAD DATA
# ============================================================

train_dataset = EyeDataset(
    "Dataset/eye_train.csv",
    transform=train_transform
)

val_dataset = EyeDataset(
    "Dataset/eye_val.csv",
    transform=val_transform
)

test_dataset = EyeDataset(
    "Dataset/eye_test.csv",
    transform=val_transform
)


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


print("\nDataset sizes:")
print("Train:", len(train_dataset))
print("Validation:", len(val_dataset))
print("Test:", len(test_dataset))


# ============================================================
# MODEL
# ============================================================

print("\nLoading pretrained ViT-Tiny...")

model = timm.create_model(
    "vit_tiny_patch16_224",
    pretrained=True,
    num_classes=2
)


# ============================================================
# FREEZE MOST OF THE MODEL
# ============================================================

print("\nFreezing most ViT layers...")

# Freeze everything first
for param in model.parameters():
    param.requires_grad = False


# ------------------------------------------------------------
# Unfreeze final transformer blocks
# ------------------------------------------------------------

for block in model.blocks[-2:]:

    for param in block.parameters():
        param.requires_grad = True


# ------------------------------------------------------------
# Unfreeze final normalization layer
# ------------------------------------------------------------

for param in model.norm.parameters():
    param.requires_grad = True


# ------------------------------------------------------------
# Unfreeze classification head
# ------------------------------------------------------------

for param in model.head.parameters():
    param.requires_grad = True


model = model.to(DEVICE)


# ============================================================
# SHOW TRAINABLE PARAMETERS
# ============================================================

total_params = sum(
    p.numel()
    for p in model.parameters()
)

trainable_params = sum(
    p.numel()
    for p in model.parameters()
    if p.requires_grad
)

print("\nModel parameters:")
print(
    f"Total parameters:     {total_params:,}"
)

print(
    f"Trainable parameters: {trainable_params:,}"
)


# ============================================================
# LOSS FUNCTION
# ============================================================

# ------------------------------------------------------------
# Class distribution in cleaned training dataset:
#
# Non-Anemia = 840
# Anemia     = 152
#
# Class weight for Anemia:
# 840 / 152 = approximately 5.53
# ------------------------------------------------------------

class_weights = torch.tensor(
    [1.0, 840 / 152],
    dtype=torch.float32
).to(DEVICE)

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)


print("\nClass weights:")
print("Non-Anemia:", 1.0)
print("Anemia:", round(840 / 152, 4))


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    filter(
        lambda p: p.requires_grad,
        model.parameters()
    ),
    lr=LEARNING_RATE
)


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_one_epoch():

    model.train()

    total_loss = 0

    all_predictions = []
    all_labels = []

    optimizer.zero_grad()

    for batch_index, (
        left_images,
        right_images,
        labels
    ) in enumerate(train_loader):

        left_images = left_images.to(DEVICE)

        right_images = right_images.to(DEVICE)

        labels = labels.to(DEVICE)


        # ----------------------------------------------------
        # Process left eye
        # ----------------------------------------------------

        left_output = model(left_images)


        # ----------------------------------------------------
        # Process right eye
        # ----------------------------------------------------

        right_output = model(right_images)


        # ----------------------------------------------------
        # Combine both eye predictions
        # ----------------------------------------------------

        outputs = (
            left_output + right_output
        ) / 2


        # ----------------------------------------------------
        # Calculate loss
        # ----------------------------------------------------

        loss = criterion(
            outputs,
            labels
        )


        # ----------------------------------------------------
        # Gradient accumulation
        # ----------------------------------------------------

        loss = (
            loss /
            GRADIENT_ACCUMULATION_STEPS
        )

        loss.backward()


        # ----------------------------------------------------
        # Update model
        # ----------------------------------------------------

        if (
            (batch_index + 1)
            % GRADIENT_ACCUMULATION_STEPS == 0

            or

            (batch_index + 1)
            == len(train_loader)
        ):

            optimizer.step()

            optimizer.zero_grad()


        # ----------------------------------------------------
        # Store loss
        # ----------------------------------------------------

        total_loss += (
            loss.item()
            * GRADIENT_ACCUMULATION_STEPS
        )


        # ----------------------------------------------------
        # Predictions
        # ----------------------------------------------------

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


    # ========================================================
    # Training metrics
    # ========================================================

    accuracy = accuracy_score(
        all_labels,
        all_predictions
    )

    return (
        total_loss / len(train_loader),
        accuracy
    )


# ============================================================
# VALIDATION / TEST FUNCTION
# ============================================================

def evaluate(loader):

    model.eval()

    all_predictions = []
    all_labels = []

    with torch.no_grad():

        for (
            left_images,
            right_images,
            labels
        ) in loader:

            left_images = left_images.to(DEVICE)

            right_images = right_images.to(DEVICE)


            # ------------------------------------------------
            # Left eye
            # ------------------------------------------------

            left_output = model(
                left_images
            )


            # ------------------------------------------------
            # Right eye
            # ------------------------------------------------

            right_output = model(
                right_images
            )


            # ------------------------------------------------
            # Average both eye predictions
            # ------------------------------------------------

            outputs = (
                left_output +
                right_output
            ) / 2


            # ------------------------------------------------
            # Predictions
            # ------------------------------------------------

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


    # ========================================================
    # Metrics
    # ========================================================

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


    return (
        accuracy,
        precision,
        recall,
        f1
    )


# ============================================================
# TRAIN
# ============================================================

print("\nStarting ViT-Tiny training...\n")


for epoch in range(EPOCHS):

    train_loss, train_accuracy = (
        train_one_epoch()
    )


    val_accuracy, val_precision, val_recall, val_f1 = (
        evaluate(val_loader)
    )


    print(
        f"Epoch {epoch + 1}/{EPOCHS} | "
        f"Loss: {train_loss:.4f} | "
        f"Train Acc: {train_accuracy:.4f} | "
        f"Val Acc: {val_accuracy:.4f} | "
        f"Val Precision: {val_precision:.4f} | "
        f"Val Recall: {val_recall:.4f} | "
        f"Val F1: {val_f1:.4f}"
    )


# ============================================================
# TEST
# ============================================================

print("\nEvaluating on test set...")


test_accuracy, test_precision, test_recall, test_f1 = (
    evaluate(test_loader)
)


print("\nFINAL TEST RESULTS")
print("-------------------")

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


# ============================================================
# SAVE MODEL
# ============================================================

torch.save(
    model.state_dict(),
    "eye_vit_tiny.pth"
)


print(
    "\nModel saved as: eye_vit_tiny.pth"
)


