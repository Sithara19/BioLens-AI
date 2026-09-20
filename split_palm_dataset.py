import os
import pandas as pd
from sklearn.model_selection import train_test_split

# ==============================
# SETTINGS
# ==============================

BASE_DIR = "Dataset/Palm"
OUTPUT_DIR = "Dataset"

RANDOM_STATE = 42

# ==============================
# COLLECT PERSON DATA
# ==============================

records = []

for label_name, label in [("Non_Anemia", 0), ("Anemia", 1)]:

    class_dir = os.path.join(BASE_DIR, label_name)

    for side in ["Left Palm", "Right Palm"]:

        side_dir = os.path.join(class_dir, side)

        for filename in os.listdir(side_dir):

            if filename.lower().endswith((".jpg", ".jpeg", ".png")):

                # Filename example: P008.jpg
                person_id = os.path.splitext(filename)[0]

                image_path = os.path.join(
                    class_dir,
                    side,
                    filename
                )

                records.append({
                    "person_id": person_id,
                    "side": side,
                    "image_path": image_path.replace("\\", "/"),
                    "label": label
                })

df = pd.DataFrame(records)

print("\n================================")
print("PALM DATASET INFORMATION")
print("================================")

print("Total images:", len(df))

print("\nImages by class:")
print(df["label"].value_counts().rename(index={
    0: "Non-Anemia",
    1: "Anemia"
}))

print("\nUnique persons:")
print(df.groupby("label")["person_id"].nunique().rename(index={
    0: "Non-Anemia",
    1: "Anemia"
}))

# ==============================
# CHECK PERSON IN BOTH CLASSES
# ==============================

anemia_people = set(
    df[df["label"] == 1]["person_id"]
)

non_anemia_people = set(
    df[df["label"] == 0]["person_id"]
)

overlap = anemia_people & non_anemia_people

print("\nPersons appearing in BOTH classes:", len(overlap))

if overlap:
    print("WARNING: Same person appears in both classes.")
    print(sorted(overlap)[:20])

# ==============================
# PERSON-LEVEL SPLIT
# ==============================

def split_class(class_df):

    persons = class_df["person_id"].unique()

    train_people, temp_people = train_test_split(
        persons,
        test_size=0.30,
        random_state=RANDOM_STATE
    )

    val_people, test_people = train_test_split(
        temp_people,
        test_size=0.50,
        random_state=RANDOM_STATE
    )

    train_df = class_df[
        class_df["person_id"].isin(train_people)
    ]

    val_df = class_df[
        class_df["person_id"].isin(val_people)
    ]

    test_df = class_df[
        class_df["person_id"].isin(test_people)
    ]

    return train_df, val_df, test_df


train_parts = []
val_parts = []
test_parts = []

for label in [0, 1]:

    class_df = df[df["label"] == label]

    train_part, val_part, test_part = split_class(class_df)

    train_parts.append(train_part)
    val_parts.append(val_part)
    test_parts.append(test_part)

train_df = pd.concat(train_parts).sample(
    frac=1,
    random_state=RANDOM_STATE
)

val_df = pd.concat(val_parts).sample(
    frac=1,
    random_state=RANDOM_STATE
)

test_df = pd.concat(test_parts).sample(
    frac=1,
    random_state=RANDOM_STATE
)

# ==============================
# SAVE CSV FILES
# ==============================

train_df.to_csv(
    os.path.join(OUTPUT_DIR, "palm_train.csv"),
    index=False
)

val_df.to_csv(
    os.path.join(OUTPUT_DIR, "palm_val.csv"),
    index=False
)

test_df.to_csv(
    os.path.join(OUTPUT_DIR, "palm_test.csv"),
    index=False
)

# ==============================
# PRINT RESULTS
# ==============================

print("\n================================")
print("TRAIN")
print("================================")
print("Persons:", train_df["person_id"].nunique())
print("Images :", len(train_df))
print(train_df["label"].value_counts().rename(index={
    0: "Non-Anemia",
    1: "Anemia"
}))

print("\n================================")
print("VALIDATION")
print("================================")
print("Persons:", val_df["person_id"].nunique())
print("Images :", len(val_df))
print(val_df["label"].value_counts().rename(index={
    0: "Non-Anemia",
    1: "Anemia"
}))

print("\n================================")
print("TEST")
print("================================")
print("Persons:", test_df["person_id"].nunique())
print("Images :", len(test_df))
print(test_df["label"].value_counts().rename(index={
    0: "Non-Anemia",
    1: "Anemia"
}))

print("\n================================")
print("PERSON LEAKAGE CHECK")
print("================================")

train_people = set(train_df["person_id"])
val_people = set(val_df["person_id"])
test_people = set(test_df["person_id"])

print("Train ∩ Validation :", len(train_people & val_people))
print("Train ∩ Test       :", len(train_people & test_people))
print("Validation ∩ Test  :", len(val_people & test_people))

if (
    len(train_people & val_people) == 0
    and len(train_people & test_people) == 0
    and len(val_people & test_people) == 0
):
    print("\n✓ NO PERSON LEAKAGE")
    print("✓ Train, validation and test persons are completely separate.")
else:
    print("\n⚠ PERSON LEAKAGE DETECTED")

print("\nCSV files created:")
print("Dataset/palm_train.csv")
print("Dataset/palm_val.csv")
print("Dataset/palm_test.csv")