import pandas as pd

# --------------------------------------------------
# Load all datasets
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
# Create person → label mapping
# --------------------------------------------------

eye_labels = eye.groupby("id")["label"].first().to_dict()
nail_labels = nail.groupby("person_id")["label"].first().to_dict()
palm_labels = palm.groupby("person_id")["label"].first().to_dict()


# --------------------------------------------------
# Find all people
# --------------------------------------------------

all_people = (
    set(eye_labels.keys())
    | set(nail_labels.keys())
    | set(palm_labels.keys())
)

print("=" * 60)
print("FUSION LABEL CONSISTENCY CHECK")
print("=" * 60)

print("Total people:", len(all_people))


# --------------------------------------------------
# Check consistency
# --------------------------------------------------

consistent = 0
inconsistent = 0

inconsistent_people = []

for person in sorted(all_people):

    labels = []

    if person in eye_labels:
        labels.append(("Eye", int(eye_labels[person])))

    if person in nail_labels:
        labels.append(("Nail", int(nail_labels[person])))

    if person in palm_labels:
        labels.append(("Palm", int(palm_labels[person])))

    unique_labels = set(label for _, label in labels)

    if len(unique_labels) == 1:
        consistent += 1
    else:
        inconsistent += 1

        inconsistent_people.append({
            "person_id": person,
            "labels": labels
        })


# --------------------------------------------------
# Results
# --------------------------------------------------

print("\nRESULT")
print("-" * 60)

print("Consistent people  :", consistent)
print("Inconsistent people:", inconsistent)

if inconsistent == 0:

    print("\n✓ ALL LABELS ARE CONSISTENT")
    print("✓ We can safely create the fusion dataset.")

else:

    print("\n⚠ LABEL INCONSISTENCIES FOUND")

    print("\nFirst 20 inconsistent people:")
    print("-" * 60)

    for item in inconsistent_people[:20]:
        print(
            item["person_id"],
            "→",
            item["labels"]
        )


print("\n" + "=" * 60)
print("DONE")
print("=" * 60)