import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import pandas as pd
import timm

from torchvision import transforms

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)


# =========================
# SETTINGS
# =========================

DEVICE = torch.device("cpu")

IMAGE_SIZE = 224
BATCH_SIZE = 2


# =========================
# DATASET
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

            left_image = self.transform(
                left_image
            )

            right_image = self.transform(
                right_image
            )

        label = torch.tensor(
            row["label"],
            dtype=torch.long
        )

        return (
            left_image,
            right_image,
            label
        )


# =========================
# TRANSFORM
# =========================

test_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================
# TEST DATA
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
# LOAD BASELINE MODEL
# =========================

print("Loading baseline ViT-Tiny...")

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
# GET ANEMIA PROBABILITIES
# =========================

all_probabilities = []
all_labels = []


print("Getting model probabilities...")


with torch.no_grad():

    for (
        left_images,
        right_images,
        labels
    ) in test_loader:

        left_images = left_images.to(
            DEVICE
        )

        right_images = right_images.to(
            DEVICE
        )


        left_output = model(
            left_images
        )

        right_output = model(
            right_images
        )


        # Average both eye logits

        outputs = (
            left_output +
            right_output
        ) / 2


        # Convert logits to probabilities

        probabilities = torch.softmax(
            outputs,
            dim=1
        )


        # Probability of Anemia

        anemia_probability = probabilities[
            :, 1
        ]


        all_probabilities.extend(
            anemia_probability.cpu().numpy()
        )

        all_labels.extend(
            labels.numpy()
        )


# =========================
# TEST DIFFERENT THRESHOLDS
# =========================

print("\n")
print("=" * 75)
print("THRESHOLD ANALYSIS")
print("=" * 75)

print(
    "\nThreshold | Accuracy | Precision | Recall | F1"
)

print("-" * 75)


thresholds = [
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
]


results = []


for threshold in thresholds:

    predictions = [

        1 if probability >= threshold
        else 0

        for probability in all_probabilities

    ]


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
        f"{threshold:8.2f} | "
        f"{accuracy:8.4f} | "
        f"{precision:9.4f} | "
        f"{recall:6.4f} | "
        f"{f1:6.4f}"
    )


# =========================
# BEST F1
# =========================

best_result = max(
    results,
    key=lambda x: x[4]
)


print("\n")
print("=" * 75)
print("BEST F1 THRESHOLD")
print("=" * 75)


print(
    f"Threshold : {best_result[0]:.2f}"
)

print(
    f"Accuracy  : {best_result[1]:.4f}"
)

print(
    f"Precision : {best_result[2]:.4f}"
)

print(
    f"Recall    : {best_result[3]:.4f}"
)

print(
    f"F1 Score  : {best_result[4]:.4f}"
)


# =========================
# BEST RECALL
# =========================

best_recall = max(
    results,
    key=lambda x: x[3]
)


print("\n")
print("=" * 75)
print("BEST RECALL THRESHOLD")
print("=" * 75)


print(
    f"Threshold : {best_recall[0]:.2f}"
)

print(
    f"Accuracy  : {best_recall[1]:.4f}"
)

print(
    f"Precision : {best_recall[2]:.4f}"
)

print(
    f"Recall    : {best_recall[3]:.4f}"
)

print(
    f"F1 Score  : {best_recall[4]:.4f}"
)