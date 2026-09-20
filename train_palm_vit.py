import os
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import timm

# ==============================
# SETTINGS
# ==============================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMG_SIZE = 224
BATCH_SIZE = 4
ACCUMULATION_STEPS = 4

EPOCHS = 5
LEARNING_RATE = 0.0001

MODEL_NAME = "vit_tiny_patch16_224"

print("Using device:", DEVICE)

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

        image = Image.open(row["image_path"]).convert("RGB")

        if self.transform:
            image = self.transform(image)

        label = torch.tensor(
            int(row["label"]),
            dtype=torch.long
        )

        return image, label


# ==============================
# TRANSFORMS
# ==============================

train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ==============================
# LOAD DATA
# ==============================

train_dataset = PalmDataset(
    "Dataset/palm_train.csv",
    train_transform
)

val_dataset = PalmDataset(
    "Dataset/palm_val.csv",
    val_transform
)

test_dataset = PalmDataset(
    "Dataset/palm_test.csv",
    val_transform
)

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

# ==============================
# CLASS WEIGHTS
# ==============================

class_counts = train_dataset.df["label"].value_counts().sort_index()

num_classes = 2
total = len(train_dataset)

class_weights = []

for i in range(num_classes):
    weight = total / (num_classes * class_counts[i])
    class_weights.append(weight)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(DEVICE)

print("\nClass weights:")
print(class_weights)

# ==============================
# MODEL
# ==============================

model = timm.create_model(
    MODEL_NAME,
    pretrained=True,
    num_classes=2
)

# Freeze everything
for param in model.parameters():
    param.requires_grad = False

# Unfreeze last two transformer blocks
for block in model.blocks[-2:]:
    for param in block.parameters():
        param.requires_grad = True

# Unfreeze final normalization
for param in model.norm.parameters():
    param.requires_grad = True

# Unfreeze classification head
for param in model.head.parameters():
    param.requires_grad = True

model = model.to(DEVICE)

total_params = sum(
    p.numel()
    for p in model.parameters()
)

trainable_params = sum(
    p.numel()
    for p in model.parameters()
    if p.requires_grad
)

print("\nModel:", MODEL_NAME)
print("Total parameters:", total_params)
print("Trainable parameters:", trainable_params)

# ==============================
# LOSS + OPTIMIZER
# ==============================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)

optimizer = torch.optim.AdamW(
    filter(
        lambda p: p.requires_grad,
        model.parameters()
    ),
    lr=LEARNING_RATE,
    weight_decay=0.01
)

# ==============================
# TRAINING
# ==============================

best_val_f1 = 0.0

print("\nStarting training...\n")

for epoch in range(EPOCHS):

    model.train()

    running_loss = 0.0
    train_preds = []
    train_labels = []

    optimizer.zero_grad()

    for step, (images, labels) in enumerate(train_loader):

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss = loss / ACCUMULATION_STEPS

        loss.backward()

        if (
            (step + 1) % ACCUMULATION_STEPS == 0
            or
            (step + 1) == len(train_loader)
        ):

            optimizer.step()
            optimizer.zero_grad()

        running_loss += loss.item() * ACCUMULATION_STEPS

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        train_preds.extend(
            predictions.detach().cpu().numpy()
        )

        train_labels.extend(
            labels.detach().cpu().numpy()
        )

    train_loss = running_loss / len(train_loader)

    train_accuracy = accuracy_score(
        train_labels,
        train_preds
    )

    # ==============================
    # VALIDATION
    # ==============================

    model.eval()

    val_preds = []
    val_labels = []

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)

            outputs = model(images)

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            val_preds.extend(
                predictions.cpu().numpy()
            )

            val_labels.extend(
                labels.numpy()
            )

    val_accuracy = accuracy_score(
        val_labels,
        val_preds
    )

    val_precision = precision_score(
        val_labels,
        val_preds,
        zero_division=0
    )

    val_recall = recall_score(
        val_labels,
        val_preds,
        zero_division=0
    )

    val_f1 = f1_score(
        val_labels,
        val_preds,
        zero_division=0
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

    # Save best model based on anemia F1
    if val_f1 > best_val_f1:

        best_val_f1 = val_f1

        torch.save(
            model.state_dict(),
            "palm_vit_tiny.pth"
        )

        print("  ✓ Best model saved")

# ==============================
# TEST
# ==============================

print("\nLoading best model...")

model.load_state_dict(
    torch.load(
        "palm_vit_tiny.pth",
        map_location=DEVICE
    )
)

model.eval()

test_preds = []
test_labels = []

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(DEVICE)

        outputs = model(images)

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        test_preds.extend(
            predictions.cpu().numpy()
        )

        test_labels.extend(
            labels.numpy()
        )

# ==============================
# FINAL RESULTS
# ==============================

accuracy = accuracy_score(
    test_labels,
    test_preds
)

precision = precision_score(
    test_labels,
    test_preds,
    zero_division=0
)

recall = recall_score(
    test_labels,
    test_preds,
    zero_division=0
)

f1 = f1_score(
    test_labels,
    test_preds,
    zero_division=0
)

print("\n================================")
print("FINAL TEST RESULTS")
print("================================")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")

print("\nClassification Report:")

print(
    classification_report(
        test_labels,
        test_preds,
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
        test_labels,
        test_preds
    )
)

print("\nModel saved as: palm_vit_tiny.pth")