import pandas as pd
import random
from pathlib import Path

random.seed(42)

# --------------------------------------------------
# Load all original CSVs
# --------------------------------------------------

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


# --------------------------------------------------
# Get all unique people
# --------------------------------------------------

eye_people = set(eye["id"].astype(str))
nail_people = set(nail["person_id"].astype(str))
palm_people = set(palm["person_id"].astype(str))

all_people = sorted(eye_people | nail_people | palm_people)

print("=" * 60)
print("CREATING FUSION-LEVEL PERSON SPLIT")
print("=" * 60)

print("Total unique people:", len(all_people))


# --------------------------------------------------
# Shuffle people
# --------------------------------------------------

random.shuffle(all_people)

total = len(all_people)

train_end = int(total * 0.70)
val_end = int(total * 0.85)

train_people = set(all_people[:train_end])
val_people = set(all_people[train_end:val_end])
test_people = set(all_people[val_end:])


# --------------------------------------------------
# Create output directory
# --------------------------------------------------

Path("Dataset/Fusion").mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# Save person IDs
# --------------------------------------------------

pd.DataFrame({
    "person_id": sorted(train_people)
}).to_csv("Dataset/Fusion/fusion_train_people.csv", index=False)

pd.DataFrame({
    "person_id": sorted(val_people)
}).to_csv("Dataset/Fusion/fusion_val_people.csv", index=False)

pd.DataFrame({
    "person_id": sorted(test_people)
}).to_csv("Dataset/Fusion/fusion_test_people.csv", index=False)


# --------------------------------------------------
# Print results
# --------------------------------------------------

print("\nSPLIT RESULTS")
print("-" * 60)

print("Train people:", len(train_people))
print("Validation people:", len(val_people))
print("Test people:", len(test_people))

print("\nPERSON LEAKAGE CHECK")
print("-" * 60)

print("Train ∩ Validation:", len(train_people & val_people))
print("Train ∩ Test:", len(train_people & test_people))
print("Validation ∩ Test:", len(val_people & test_people))

if (
    len(train_people & val_people) == 0
    and len(train_people & test_people) == 0
    and len(val_people & test_people) == 0
):
    print("\n✓ NO PERSON LEAKAGE")
else:
    print("\n✗ PERSON LEAKAGE FOUND")


print("\nFiles created:")
print("Dataset/Fusion/fusion_train_people.csv")
print("Dataset/Fusion/fusion_val_people.csv")
print("Dataset/Fusion/fusion_test_people.csv")

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)