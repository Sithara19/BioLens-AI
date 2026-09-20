import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from pathlib import Path
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent
FUSION_DIR = PROJECT_ROOT / "Dataset" / "Fusion"

TRAIN_FILE = FUSION_DIR / "fusion_train_features.pt"
VAL_FILE = FUSION_DIR / "fusion_val_features.pt"
TEST_FILE = FUSION_DIR / "fusion_test_features.pt"

MODEL_FILE = PROJECT_ROOT / "fusion_model.pth"

DEVICE = torch.device("cpu")

BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001
WEIGHT_DECAY = 0.01

INPUT_DIM = 579

EARLY_STOPPING_PATIENCE = 8


# ============================================================
# LOAD FEATURE DATA
# ============================================================

def load_data(file_path):

    data = torch.load(
        file_path,
        map_location="cpu",
        weights_only=False
    )

    features = data["features"].float()
    labels = data["labels"].long()

    return features, labels


print("=" * 70)
print("BIOLENS AI - MASK-AWARE FUSION TRAINING")
print("=" * 70)

print()
print("Device:", DEVICE)

print()
print("Loading feature files...")

train_features, train_labels = load_data(TRAIN_FILE)
val_features, val_labels = load_data(VAL_FILE)
test_features, test_labels = load_data(TEST_FILE)


print()
print("Dataset sizes:")
print("Train:", len(train_labels))
print("Validation:", len(val_labels))
print("Test:", len(test_labels))


# ============================================================
# CHECK INPUT DIMENSIONS
# ============================================================

print()
print("Feature dimensions:")
print("Train:", train_features.shape)
print("Validation:", val_features.shape)
print("Test:", test_features.shape)


if train_features.shape[1] != INPUT_DIM:
    raise ValueError(
        f"Expected {INPUT_DIM} features, "
        f"but found {train_features.shape[1]}"
    )


# ============================================================
# CLASS DISTRIBUTION
# ============================================================

train_non_anemia = (train_labels == 0).sum().item()
train_anemia = (train_labels == 1).sum().item()

print()
print("Training class distribution:")
print("Non-Anemia:", train_non_anemia)
print("Anemia:", train_anemia)


# ============================================================
# CLASS WEIGHTS
# ============================================================

# Balanced class weights:
#
# weight = total_samples / (number_of_classes * class_count)

total_train = len(train_labels)

weight_non_anemia = (
    total_train /
    (2 * train_non_anemia)
)

weight_anemia = (
    total_train /
    (2 * train_anemia)
)

class_weights = torch.tensor(
    [
        weight_non_anemia,
        weight_anemia
    ],
    dtype=torch.float32
)

print()
print("Class weights:")
print(class_weights)


# ============================================================
# DATA LOADERS
# ============================================================

train_dataset = TensorDataset(
    train_features,
    train_labels
)

val_dataset = TensorDataset(
    val_features,
    val_labels
)

test_dataset = TensorDataset(
    test_features,
    test_labels
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ============================================================
# MASK-AWARE FUSION MODEL
# ============================================================

class MaskAwareFusionModel(nn.Module):

    def __init__(self):

        super().__init__()

        # ----------------------------------------------------
        # Separate projection for each modality
        # ----------------------------------------------------

        self.eye_projection = nn.Sequential(
            nn.Linear(192, 128),
            nn.ReLU(),
            nn.Dropout(0.2)
        )

        self.nail_projection = nn.Sequential(
            nn.Linear(192, 128),
            nn.ReLU(),
            nn.Dropout(0.2)
        )

        self.palm_projection = nn.Sequential(
            nn.Linear(192, 128),
            nn.ReLU(),
            nn.Dropout(0.2)
        )

        # ----------------------------------------------------
        # Fusion classifier
        #
        # 128 eye
        # +128 nail
        # +128 palm
        # +3 mask
        #
        # = 387 inputs
        # ----------------------------------------------------

        self.classifier = nn.Sequential(

            nn.Linear(387, 128),

            nn.ReLU(),

            nn.Dropout(0.3),

            nn.Linear(128, 64),

            nn.ReLU(),

            nn.Dropout(0.2),

            nn.Linear(64, 2)
        )


    def forward(self, x):

        # ----------------------------------------------------
        # Split input
        # ----------------------------------------------------

        eye = x[:, 0:192]

        nail = x[:, 192:384]

        palm = x[:, 384:576]

        mask = x[:, 576:579]


        # ----------------------------------------------------
        # Project each modality
        # ----------------------------------------------------

        eye_features = self.eye_projection(eye)

        nail_features = self.nail_projection(nail)

        palm_features = self.palm_projection(palm)


        # ----------------------------------------------------
        # IMPORTANT:
        #
        # Explicitly apply modality mask to features.
        #
        # If a modality is missing:
        #
        # mask = 0
        #
        # its feature contribution becomes zero.
        # ----------------------------------------------------

        eye_mask = mask[:, 0:1]

        nail_mask = mask[:, 1:2]

        palm_mask = mask[:, 2:3]


        eye_features = (
            eye_features * eye_mask
        )

        nail_features = (
            nail_features * nail_mask
        )

        palm_features = (
            palm_features * palm_mask
        )


        # ----------------------------------------------------
        # Concatenate
        # ----------------------------------------------------

        fused = torch.cat(
            [
                eye_features,
                nail_features,
                palm_features,
                mask
            ],
            dim=1
        )


        # ----------------------------------------------------
        # Classification
        # ----------------------------------------------------

        output = self.classifier(fused)

        return output


# ============================================================
# CREATE MODEL
# ============================================================

model = MaskAwareFusionModel()

model.to(DEVICE)


print()
print("Model:")
print(model)


# ============================================================
# LOSS FUNCTION
# ============================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights.to(DEVICE)
)


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# ============================================================
# SCHEDULER
# ============================================================

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=3
)


# ============================================================
# TRAIN ONE EPOCH
# ============================================================

def train_one_epoch():

    model.train()

    total_loss = 0.0

    all_predictions = []
    all_labels = []

    for features, labels in train_loader:

        features = features.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(features)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        total_loss += (
            loss.item() *
            features.size(0)
        )

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

    average_loss = (
        total_loss /
        len(train_loader.dataset)
    )

    accuracy = accuracy_score(
        all_labels,
        all_predictions
    )

    return average_loss, accuracy


# ============================================================
# VALIDATION
# ============================================================

def evaluate(loader):

    model.eval()

    total_loss = 0.0

    all_probabilities = []
    all_labels = []

    with torch.no_grad():

        for features, labels in loader:

            features = features.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(features)

            loss = criterion(
                outputs,
                labels
            )

            total_loss += (
                loss.item() *
                features.size(0)
            )

            probabilities = torch.softmax(
                outputs,
                dim=1
            )[:, 1]

            all_probabilities.extend(
                probabilities.cpu().numpy()
            )

            all_labels.extend(
                labels.cpu().numpy()
            )

    average_loss = (
        total_loss /
        len(loader.dataset)
    )

    return (
        average_loss,
        all_labels,
        all_probabilities
    )


# ============================================================
# METRICS
# ============================================================

def calculate_metrics(
    labels,
    probabilities,
    threshold=0.5
):

    predictions = [
        1 if p >= threshold else 0
        for p in probabilities
    ]

    accuracy = accuracy_score(
        labels,
        predictions
    )

    precision = precision_score(
        labels,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        labels,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        labels,
        predictions,
        zero_division=0
    )

    return (
        accuracy,
        precision,
        recall,
        f1
    )


# ============================================================
# FIND BEST VALIDATION THRESHOLD
# ============================================================

def find_best_threshold(
    labels,
    probabilities
):

    best_threshold = 0.5
    best_f1 = -1

    print()
    print("=" * 70)
    print("VALIDATION THRESHOLD SEARCH")
    print("=" * 70)

    print(
        f"{'Threshold':<12}"
        f"{'Accuracy':<12}"
        f"{'Precision':<12}"
        f"{'Recall':<12}"
        f"{'F1':<12}"
    )

    for threshold in [
        0.20,
        0.25,
        0.30,
        0.35,
        0.40,
        0.45,
        0.50,
        0.55,
        0.60,
        0.65,
        0.70
    ]:

        accuracy, precision, recall, f1 = (
            calculate_metrics(
                labels,
                probabilities,
                threshold
            )
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

    print()
    print(
        "Best validation threshold:",
        best_threshold
    )

    print(
        "Best validation F1:",
        f"{best_f1:.4f}"
    )

    return best_threshold


# ============================================================
# TRAINING LOOP
# ============================================================

print()
print("=" * 70)
print("STARTING FUSION TRAINING")
print("=" * 70)

best_val_f1 = -1

epochs_without_improvement = 0


for epoch in range(EPOCHS):

    train_loss, train_accuracy = (
        train_one_epoch()
    )

    val_loss, val_labels, val_probabilities = (
        evaluate(val_loader)
    )

    (
        val_accuracy,
        val_precision,
        val_recall,
        val_f1
    ) = calculate_metrics(
        val_labels,
        val_probabilities,
        threshold=0.5
    )

    scheduler.step(val_f1)

    current_lr = optimizer.param_groups[0]["lr"]

    print()
    print(
        f"Epoch {epoch + 1}/{EPOCHS} | "
        f"Loss: {train_loss:.4f} | "
        f"Train Acc: {train_accuracy:.4f} | "
        f"Val Acc: {val_accuracy:.4f} | "
        f"Val Precision: {val_precision:.4f} | "
        f"Val Recall: {val_recall:.4f} | "
        f"Val F1: {val_f1:.4f} | "
        f"LR: {current_lr:.6f}"
    )

    # --------------------------------------------------------
    # SAVE BEST MODEL BASED ON VALIDATION F1
    # --------------------------------------------------------

    if val_f1 > best_val_f1:

        best_val_f1 = val_f1

        epochs_without_improvement = 0

        torch.save(
            model.state_dict(),
            MODEL_FILE
        )

        print("  ✓ Best fusion model saved")

    else:

        epochs_without_improvement += 1

    # --------------------------------------------------------
    # EARLY STOPPING
    # --------------------------------------------------------

    if (
        epochs_without_improvement
        >= EARLY_STOPPING_PATIENCE
    ):

        print()
        print(
            "Early stopping triggered."
        )

        break


# ============================================================
# LOAD BEST MODEL
# ============================================================

print()
print("=" * 70)
print("LOADING BEST FUSION MODEL")
print("=" * 70)

model.load_state_dict(
    torch.load(
        MODEL_FILE,
        map_location=DEVICE,
        weights_only=True
    )
)

model.eval()


# ============================================================
# VALIDATION THRESHOLD
# ============================================================

_, val_labels, val_probabilities = (
    evaluate(val_loader)
)

best_threshold = find_best_threshold(
    val_labels,
    val_probabilities
)


# ============================================================
# FINAL TEST EVALUATION
# ============================================================

print()
print("=" * 70)
print("FINAL TEST RESULTS")
print("=" * 70)

_, test_labels, test_probabilities = (
    evaluate(test_loader)
)


(
    test_accuracy,
    test_precision,
    test_recall,
    test_f1
) = calculate_metrics(
    test_labels,
    test_probabilities,
    threshold=best_threshold
)


print()
print(
    f"Threshold: {best_threshold:.2f}"
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


# ============================================================
# CONFUSION MATRIX
# ============================================================

test_predictions = [
    1 if p >= best_threshold else 0
    for p in test_probabilities
]

cm = confusion_matrix(
    test_labels,
    test_predictions
)

print()
print("Confusion Matrix:")
print(cm)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print()
print("Classification Report:")

print(
    classification_report(
        test_labels,
        test_predictions,
        target_names=[
            "Non-Anemia",
            "Anemia"
        ],
        zero_division=0
    )
)


# ============================================================
# FINAL
# ============================================================

print()
print("=" * 70)
print("FUSION TRAINING COMPLETED")
print("=" * 70)

print()
print("Best validation F1:", f"{best_val_f1:.4f}")

print(
    "Selected threshold:",
    f"{best_threshold:.2f}"
)

print()
print("Fusion model saved as:")
print(MODEL_FILE)

print()
print("Final test evaluation completed.")