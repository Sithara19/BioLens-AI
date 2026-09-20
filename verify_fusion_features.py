import torch
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
FUSION_DIR = PROJECT_ROOT / "Dataset" / "Fusion"


FILES = {
    "TRAIN": FUSION_DIR / "fusion_train_features.pt",
    "VALIDATION": FUSION_DIR / "fusion_val_features.pt",
    "TEST": FUSION_DIR / "fusion_test_features.pt"
}


print("=" * 70)
print("BIOLENS AI - FUSION FEATURE VERIFICATION")
print("=" * 70)


for split_name, file_path in FILES.items():

    print()
    print("=" * 70)
    print(f"{split_name} SET")
    print("=" * 70)

    if not file_path.exists():
        print("ERROR: File not found:")
        print(file_path)
        continue

    data = torch.load(
        file_path,
        map_location="cpu",
        weights_only=False
    )

    person_ids = data["person_ids"]
    eye_features = data["eye_features"]
    nail_features = data["nail_features"]
    palm_features = data["palm_features"]
    mask = data["mask"]
    labels = data["labels"]
    features = data["features"]

    print("File:")
    print(file_path)

    print()
    print("Number of people:", len(person_ids))

    print()
    print("Eye features:")
    print("  Shape:", eye_features.shape)

    print("Nail features:")
    print("  Shape:", nail_features.shape)

    print("Palm features:")
    print("  Shape:", palm_features.shape)

    print("Mask:")
    print("  Shape:", mask.shape)

    print("Labels:")
    print("  Shape:", labels.shape)

    print("Combined features:")
    print("  Shape:", features.shape)

    # --------------------------------------------------------
    # CHECK EXPECTED DIMENSIONS
    # --------------------------------------------------------

    expected_people = len(person_ids)

    checks = {
        "Eye": eye_features.shape == (expected_people, 192),
        "Nail": nail_features.shape == (expected_people, 192),
        "Palm": palm_features.shape == (expected_people, 192),
        "Mask": mask.shape == (expected_people, 3),
        "Labels": labels.shape == (expected_people,),
        "Combined": features.shape == (expected_people, 579)
    }

    print()
    print("Dimension checks:")

    for name, result in checks.items():

        if result:
            print(f"  ✓ {name}: PASS")
        else:
            print(f"  ✗ {name}: FAIL")

    # --------------------------------------------------------
    # LABEL DISTRIBUTION
    # --------------------------------------------------------

    unique_labels, counts = torch.unique(
        labels,
        return_counts=True
    )

    print()
    print("Label distribution:")

    for label, count in zip(unique_labels, counts):

        if int(label) == 0:
            class_name = "Non-Anemia"
        else:
            class_name = "Anemia"

        print(
            f"  {class_name}: {int(count)}"
        )

    # --------------------------------------------------------
    # MODALITY MASK DISTRIBUTION
    # --------------------------------------------------------

    print()
    print("Modality combinations:")

    unique_masks, mask_counts = torch.unique(
        mask,
        dim=0,
        return_counts=True
    )

    for m, count in zip(unique_masks, mask_counts):

        print(
            f"  [{int(m[0])},{int(m[1])},{int(m[2])}]"
            f" : {int(count)} people"
        )

    # --------------------------------------------------------
    # CHECK FOR NaN / INF
    # --------------------------------------------------------

    print()
    print("Numerical checks:")

    tensors_to_check = {
        "Eye features": eye_features,
        "Nail features": nail_features,
        "Palm features": palm_features,
        "Combined features": features
    }

    all_valid = True

    for name, tensor in tensors_to_check.items():

        has_nan = torch.isnan(tensor).any().item()
        has_inf = torch.isinf(tensor).any().item()

        if not has_nan and not has_inf:

            print(f"  ✓ {name}: No NaN/Inf")

        else:

            print(
                f"  ✗ {name}: NaN={has_nan}, Inf={has_inf}"
            )

            all_valid = False

    # --------------------------------------------------------
    # CHECK MASK VALUES
    # --------------------------------------------------------

    valid_mask_values = torch.all(
        (mask == 0) | (mask == 1)
    ).item()

    print()

    if valid_mask_values:
        print("  ✓ Mask values are only 0/1")
    else:
        print("  ✗ Invalid mask values found")

    # --------------------------------------------------------
    # CHECK COMBINED FEATURE CONSTRUCTION
    # --------------------------------------------------------

    reconstructed = torch.cat(
        [
            eye_features,
            nail_features,
            palm_features,
            mask
        ],
        dim=1
    )

    combined_correct = torch.allclose(
        reconstructed,
        features
    )

    print()

    if combined_correct:
        print("  ✓ Combined feature vector verified")
    else:
        print("  ✗ Combined feature vector mismatch")


print()
print("=" * 70)
print("FUSION FEATURE VERIFICATION COMPLETED")
print("=" * 70)