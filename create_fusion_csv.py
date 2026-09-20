import pandas as pd
from pathlib import Path
import ast


# ============================================================
# LOAD ALL ORIGINAL DATA
# ============================================================

eye = pd.concat([
    pd.read_csv("Dataset/eye_train.csv"),
    pd.read_csv("Dataset/eye_val.csv"),
    pd.read_csv("Dataset/eye_test.csv")
], ignore_index=True)

nail = pd.concat([
    pd.read_csv("Dataset/nail_train.csv"),
    pd.read_csv("Dataset/nail_val.csv"),
    pd.read_csv("Dataset/nail_test.csv")
], ignore_index=True)

palm = pd.concat([
    pd.read_csv("Dataset/palm_train.csv"),
    pd.read_csv("Dataset/palm_val.csv"),
    pd.read_csv("Dataset/palm_test.csv")
], ignore_index=True)


# ============================================================
# STANDARDIZE PERSON IDs
# ============================================================

eye["person_id"] = eye["id"].astype(str)
nail["person_id"] = nail["person_id"].astype(str)
palm["person_id"] = palm["person_id"].astype(str)


# ============================================================
# LOAD FUSION PERSON SPLITS
# ============================================================

train_people = set(
    pd.read_csv("Dataset/Fusion/fusion_train_people.csv")["person_id"]
    .astype(str)
)

val_people = set(
    pd.read_csv("Dataset/Fusion/fusion_val_people.csv")["person_id"]
    .astype(str)
)

test_people = set(
    pd.read_csv("Dataset/Fusion/fusion_test_people.csv")["person_id"]
    .astype(str)
)


# ============================================================
# CREATE PERSON-LEVEL RECORDS
# ============================================================

all_people = sorted(
    train_people |
    val_people |
    test_people
)


records = []


for person in all_people:

    # --------------------------------------------------------
    # Eye
    # --------------------------------------------------------

    eye_rows = eye[eye["person_id"] == person]

    if len(eye_rows) > 0:

        eye_row = eye_rows.iloc[0]

        left_eye = str(eye_row["left_eye"])
        right_eye = str(eye_row["right_eye"])

        eye_available = 1

    else:

        left_eye = ""
        right_eye = ""

        eye_available = 0


    # --------------------------------------------------------
    # Nail
    # --------------------------------------------------------

    nail_rows = nail[nail["person_id"] == person]

    if len(nail_rows) > 0:

        nail_paths = nail_rows["image_path"].astype(str).tolist()

        nail_available = 1

    else:

        nail_paths = []

        nail_available = 0


    # --------------------------------------------------------
    # Palm
    # --------------------------------------------------------

    palm_rows = palm[palm["person_id"] == person]

    if len(palm_rows) > 0:

        palm_paths = palm_rows["image_path"].astype(str).tolist()

        palm_available = 1

    else:

        palm_paths = []

        palm_available = 0


    # --------------------------------------------------------
    # Label
    # --------------------------------------------------------

    labels = []

    if len(eye_rows) > 0:
        labels.append(int(eye_rows.iloc[0]["label"]))

    if len(nail_rows) > 0:
        labels.append(int(nail_rows.iloc[0]["label"]))

    if len(palm_rows) > 0:
        labels.append(int(palm_rows.iloc[0]["label"]))

    label = labels[0]


    # --------------------------------------------------------
    # Determine split
    # --------------------------------------------------------

    if person in train_people:
        split = "train"

    elif person in val_people:
        split = "val"

    elif person in test_people:
        split = "test"

    else:
        raise ValueError(
            f"Person {person} does not belong to any split."
        )


    # --------------------------------------------------------
    # Missing-modality mask
    # --------------------------------------------------------

    mask = f"{eye_available},{nail_available},{palm_available}"


    # --------------------------------------------------------
    # Store record
    # --------------------------------------------------------

    records.append({
        "person_id": person,

        "left_eye": left_eye,
        "right_eye": right_eye,

        "nail_paths": str(nail_paths),

        "palm_paths": str(palm_paths),

        "eye_available": eye_available,
        "nail_available": nail_available,
        "palm_available": palm_available,

        "modality_mask": mask,

        "label": label,

        "split": split
    })


# ============================================================
# CREATE DATAFRAME
# ============================================================

fusion_df = pd.DataFrame(records)


# ============================================================
# SAVE
# ============================================================

output_dir = Path("Dataset/Fusion")
output_dir.mkdir(parents=True, exist_ok=True)


fusion_df[fusion_df["split"] == "train"].drop(
    columns=["split"]
).to_csv(
    output_dir / "fusion_train.csv",
    index=False
)

fusion_df[fusion_df["split"] == "val"].drop(
    columns=["split"]
).to_csv(
    output_dir / "fusion_val.csv",
    index=False
)

fusion_df[fusion_df["split"] == "test"].drop(
    columns=["split"]
).to_csv(
    output_dir / "fusion_test.csv",
    index=False
)


# ============================================================
# SUMMARY
# ============================================================

print("=" * 60)
print("FUSION CSV CREATION COMPLETED")
print("=" * 60)

print("\nDataset sizes:")
print("Train:", len(fusion_df[fusion_df["split"] == "train"]))
print("Validation:", len(fusion_df[fusion_df["split"] == "val"]))
print("Test:", len(fusion_df[fusion_df["split"] == "test"]))


print("\nModality combinations:")

for split in ["train", "val", "test"]:

    temp = fusion_df[fusion_df["split"] == split]

    print(f"\n{split.upper()}")

    print(
        temp["modality_mask"]
        .value_counts()
        .sort_index()
    )


print("\nClass distribution:")

for split in ["train", "val", "test"]:

    temp = fusion_df[fusion_df["split"] == split]

    print(f"\n{split.upper()}")

    print(
        temp["label"]
        .value_counts()
        .sort_index()
    )


print("\nFiles created:")

print("Dataset/Fusion/fusion_train.csv")
print("Dataset/Fusion/fusion_val.csv")
print("Dataset/Fusion/fusion_test.csv")

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)