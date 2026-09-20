import torch
import torch.nn as nn
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


# ============================================================
# CONFIGURATION
# ============================================================

TEST_FEATURES = "Dataset/Fusion/fusion_test_features.pt"
MODEL_PATH = "fusion_model.pth"

THRESHOLD = 0.55

DEVICE = torch.device("cpu")


# ============================================================
# MODEL
# ============================================================

class MaskAwareFusionModel(nn.Module):

    def __init__(self):
        super().__init__()

        self.eye_projection = nn.Sequential(
            nn.Linear(192, 128),
            nn.ReLU(),
            nn.Dropout(0.3)
        )

        self.nail_projection = nn.Sequential(
            nn.Linear(192, 128),
            nn.ReLU(),
            nn.Dropout(0.3)
        )

        self.palm_projection = nn.Sequential(
            nn.Linear(192, 128),
            nn.ReLU(),
            nn.Dropout(0.3)
        )

        self.classifier = nn.Sequential(
            nn.Linear(387, 128),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(64, 2)
        )

    def forward(self, x):

        eye = x[:, 0:192]
        nail = x[:, 192:384]
        palm = x[:, 384:576]
        mask = x[:, 576:579]

        eye_features = self.eye_projection(eye)
        nail_features = self.nail_projection(nail)
        palm_features = self.palm_projection(palm)

        # Apply modality mask
        eye_features = eye_features * mask[:, 0:1]
        nail_features = nail_features * mask[:, 1:2]
        palm_features = palm_features * mask[:, 2:3]

        fused = torch.cat(
            [
                eye_features,
                nail_features,
                palm_features,
                mask
            ],
            dim=1
        )

        return self.classifier(fused)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("BIOLENS AI - FUSION MODALITY ANALYSIS")
print("=" * 70)

data = torch.load(
    TEST_FEATURES,
    map_location=DEVICE,
    weights_only=False
)

X = data["features"].float()
y = data["labels"].long()
mask = data["mask"].float()

print("\nTest samples:", len(y))
print("Feature shape:", X.shape)
print("Threshold:", THRESHOLD)


# ============================================================
# LOAD MODEL
# ============================================================

model = MaskAwareFusionModel().to(DEVICE)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
    weights_only=False
)

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
else:
    model.load_state_dict(checkpoint)

model.eval()


# ============================================================
# PREDICTIONS
# ============================================================

with torch.no_grad():

    logits = model(X)

    probabilities = torch.softmax(logits, dim=1)[:, 1]

    predictions = (
        probabilities >= THRESHOLD
    ).long()


# ============================================================
# OVERALL TEST PERFORMANCE
# ============================================================

overall_accuracy = accuracy_score(y, predictions)
overall_precision = precision_score(
    y, predictions, zero_division=0
)
overall_recall = recall_score(
    y, predictions, zero_division=0
)
overall_f1 = f1_score(
    y, predictions, zero_division=0
)

print("\n" + "=" * 70)
print("OVERALL TEST PERFORMANCE")
print("=" * 70)

print(f"Accuracy : {overall_accuracy * 100:.2f}")
print(f"Precision: {overall_precision * 100:.2f}")
print(f"Recall   : {overall_recall * 100:.2f}")
print(f"F1 Score : {overall_f1 * 100:.2f}")


# ============================================================
# MODALITY COMBINATION ANALYSIS
# ============================================================

results = []

combination_names = {
    (1, 1, 1): "Eye + Nail + Palm",
    (1, 1, 0): "Eye + Nail",
    (1, 0, 1): "Eye + Palm",
    (0, 1, 1): "Nail + Palm",
    (1, 0, 0): "Eye only",
    (0, 1, 0): "Nail only",
    (0, 0, 1): "Palm only"
}


print("\n" + "=" * 70)
print("PER-MODALITY-COMBINATION TEST RESULTS")
print("=" * 70)


unique_masks = sorted(
    set(tuple(row.int().tolist()) for row in mask)
)

for current_mask in unique_masks:

    mask_tensor = torch.tensor(
        current_mask,
        dtype=torch.float32
    )

    selected = torch.all(
        mask == mask_tensor,
        dim=1
    )

    indices = torch.where(selected)[0]

    if len(indices) == 0:
        continue

    y_true = y[indices]
    y_pred = predictions[indices]

    accuracy = accuracy_score(y_true, y_pred)

    precision = precision_score(
        y_true,
        y_pred,
        zero_division=0
    )

    recall = recall_score(
        y_true,
        y_pred,
        zero_division=0
    )

    f1 = f1_score(
        y_true,
        y_pred,
        zero_division=0
    )

    name = combination_names.get(
        current_mask,
        str(current_mask)
    )

    results.append({
        "Modality Combination": name,
        "Mask": str(current_mask),
        "Samples": len(indices),
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1": f1
    })

    print("\n" + name)
    print("Mask:", current_mask)
    print("Samples:", len(indices))
    print(f"Accuracy : {accuracy * 100:.2f}")
print(f"Precision: {precision * 100:.2f}")
print(f"Recall   : {recall * 100:.2f}")
print(f"F1 Score : {f1 * 100:.2f}")


# ============================================================
# SAVE RESULTS
# ============================================================

results_df = pd.DataFrame(results)

results_df.to_csv(
    "fusion_modality_analysis.csv",
    index=False
)

print("\n" + "=" * 70)
print("ANALYSIS COMPLETED")
print("=" * 70)

print("\nResults saved to:")
print("fusion_modality_analysis.csv")

print("\nIMPORTANT:")
print("- Threshold 0.55 was selected using validation data.")
print("- The test threshold was NOT tuned.")
print("- Small modality groups should not be overinterpreted.")