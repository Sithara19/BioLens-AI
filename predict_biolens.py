import torch
import torch.nn as nn
import timm

from PIL import Image
from torchvision import transforms


DEVICE = torch.device("cpu")

IMAGE_SIZE = 224
FEATURE_DIM = 192
THRESHOLD = 0.55


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# ViT MODEL
# ============================================================

def load_vit_model(model_path):

    model = timm.create_model(
        "vit_tiny_patch16_224",
        pretrained=False,
        num_classes=2
    )

    checkpoint = torch.load(
        model_path,
        map_location=DEVICE,
        weights_only=False
    )

    if (
        isinstance(checkpoint, dict)
        and "model_state_dict" in checkpoint
    ):
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)

    # Remove classification head
    model.reset_classifier(0)

    model.to(DEVICE)
    model.eval()

    return model


# ============================================================
# LOAD YOUR MODELS ONCE
# ============================================================

eye_model = load_vit_model(
    "eye_vit_tiny.pth"
)

nail_model = load_vit_model(
    "nail_vit_tiny.pth"
)

palm_model = load_vit_model(
    "palm_vit_tiny.pth"
)


# ============================================================
# FUSION MODEL
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

        eye_features *= mask[:, 0:1]
        nail_features *= mask[:, 1:2]
        palm_features *= mask[:, 2:3]

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
# LOAD FUSION MODEL
# ============================================================

fusion_model = MaskAwareFusionModel()

checkpoint = torch.load(
    "fusion_model.pth",
    map_location=DEVICE,
    weights_only=False
)

if (
    isinstance(checkpoint, dict)
    and "model_state_dict" in checkpoint
):
    fusion_model.load_state_dict(
        checkpoint["model_state_dict"]
    )
else:
    fusion_model.load_state_dict(checkpoint)

fusion_model.to(DEVICE)
fusion_model.eval()


# ============================================================
# EXTRACT FEATURE FROM UPLOADED IMAGE
# ============================================================

def extract_feature(uploaded_image, model):

    image = Image.open(uploaded_image).convert("RGB")

    image = transform(image)

    image = image.unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        feature = model(image)

    return feature


# ============================================================
# PREDICT FROM UPLOADED IMAGES
# ============================================================

def predict_uploaded_images(
    eye_image,
    nail_image,
    palm_image
):

    # --------------------------------------------------------
    # Extract features from uploaded images
    # --------------------------------------------------------

    eye_feature = extract_feature(
        eye_image,
        eye_model
    )

    nail_feature = extract_feature(
        nail_image,
        nail_model
    )

    palm_feature = extract_feature(
        palm_image,
        palm_model
    )


    # --------------------------------------------------------
    # Create mask
    # Eye = 1
    # Nail = 1
    # Palm = 1
    # --------------------------------------------------------

    mask = torch.tensor(
        [[1.0, 1.0, 1.0]],
        dtype=torch.float32
    )


    # --------------------------------------------------------
    # Create 579-dimensional input
    # --------------------------------------------------------

    features = torch.cat(
        [
            eye_feature,
            nail_feature,
            palm_feature,
            mask
        ],
        dim=1
    )


    # --------------------------------------------------------
    # Full prediction
    # --------------------------------------------------------

    with torch.no_grad():

        logits = fusion_model(features)

        probabilities = torch.softmax(
            logits,
            dim=1
        )

        anemia_probability = (
            probabilities[0, 1].item()
        )


    # --------------------------------------------------------
    # Remove Eye
    # --------------------------------------------------------

    eye_removed = features.clone()

    eye_removed[:, 0:192] = 0

    eye_removed_probability = get_probability(
        eye_removed
    )


    # --------------------------------------------------------
    # Remove Nail
    # --------------------------------------------------------

    nail_removed = features.clone()

    nail_removed[:, 192:384] = 0

    nail_removed_probability = get_probability(
        nail_removed
    )


    # --------------------------------------------------------
    # Remove Palm
    # --------------------------------------------------------

    palm_removed = features.clone()

    palm_removed[:, 384:576] = 0

    palm_removed_probability = get_probability(
        palm_removed
    )


    # --------------------------------------------------------
    # Calculate contribution
    # --------------------------------------------------------

    eye_effect = max(
        anemia_probability -
        eye_removed_probability,
        0
    )

    nail_effect = max(
        anemia_probability -
        nail_removed_probability,
        0
    )

    palm_effect = max(
        anemia_probability -
        palm_removed_probability,
        0
    )


    total = (
        eye_effect +
        nail_effect +
        palm_effect
    )


    if total > 0:

        eye_percent = (
            eye_effect / total
        ) * 100

        nail_percent = (
            nail_effect / total
        ) * 100

        palm_percent = (
            palm_effect / total
        ) * 100

    else:

        eye_percent = 0
        nail_percent = 0
        palm_percent = 0


    # --------------------------------------------------------
    # Screening result
    # --------------------------------------------------------

    if anemia_probability >= THRESHOLD:

        result = "Anemia Risk Detected"

    else:

        result = (
            "No Significant Anemia Risk Detected"
        )


    # --------------------------------------------------------
    # Return result to website
    # --------------------------------------------------------

    return {

        "result": result,

        "confidence": round(
            anemia_probability * 100,
            2
        ),

        "anemia_risk": round(
            anemia_probability * 100,
            2
        ),

        "eye_contribution": round(
            eye_percent,
            2
        ),

        "nail_contribution": round(
            nail_percent,
            2
        ),

        "palm_contribution": round(
            palm_percent,
            2
        )
    }


# ============================================================
# GET PROBABILITY
# ============================================================

def get_probability(features):

    with torch.no_grad():

        logits = fusion_model(features)

        probabilities = torch.softmax(
            logits,
            dim=1
        )

        return probabilities[0, 1].item()