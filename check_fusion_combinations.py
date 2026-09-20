import pandas as pd

# Load all images from the original datasets
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


# Get unique persons
eye_people = set(eye["id"].astype(str))
nail_people = set(nail["person_id"].astype(str))
palm_people = set(palm["person_id"].astype(str))

all_people = eye_people | nail_people | palm_people

print("=" * 50)
print("FUSION DATASET ANALYSIS")
print("=" * 50)

print(f"Total unique people: {len(all_people)}")
print(f"Eye people        : {len(eye_people)}")
print(f"Nail people       : {len(nail_people)}")
print(f"Palm people       : {len(palm_people)}")

print("\nMODALITY COMBINATIONS")
print("-" * 50)

counts = {
    "Eye + Nail + Palm": 0,
    "Eye + Nail": 0,
    "Eye + Palm": 0,
    "Nail + Palm": 0,
    "Eye only": 0,
    "Nail only": 0,
    "Palm only": 0,
}

for person in all_people:

    has_eye = person in eye_people
    has_nail = person in nail_people
    has_palm = person in palm_people

    if has_eye and has_nail and has_palm:
        counts["Eye + Nail + Palm"] += 1

    elif has_eye and has_nail:
        counts["Eye + Nail"] += 1

    elif has_eye and has_palm:
        counts["Eye + Palm"] += 1

    elif has_nail and has_palm:
        counts["Nail + Palm"] += 1

    elif has_eye:
        counts["Eye only"] += 1

    elif has_nail:
        counts["Nail only"] += 1

    elif has_palm:
        counts["Palm only"] += 1


for name, count in counts.items():
    print(f"{name:20s}: {count}")


print("\n" + "=" * 50)
print("DONE")
print("=" * 50)