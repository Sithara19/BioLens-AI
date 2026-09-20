from pathlib import Path
import pandas as pd

# Paths
dataset_dir = Path("Dataset")
eye_dir = dataset_dir / "Eye"
csv_path = dataset_dir / "Patient_Info.csv"

# Load patient information
df = pd.read_csv(csv_path)

# Clean column names and class values
df.columns = df.columns.str.strip()
df["id"] = df["id"].astype(str).str.strip()
df["Class(Anemia/ Non-Anemia)"] = (
    df["Class(Anemia/ Non-Anemia)"]
    .astype(str)
    .str.strip()
)

# Convert class to numeric label
df["label"] = df["Class(Anemia/ Non-Anemia)"].map({
    "Anemia": 1,
    "Non-Anemia": 0
})

# Eye folders
anemia_left = eye_dir / "Anemia" / "left_crop"
anemia_right = eye_dir / "Anemia" / "right_crop"

non_anemia_left = eye_dir / "Non_Anemia" / "left_conjunctiva"
non_anemia_right = eye_dir / "Non_Anemia" / "right_conjunctiva"

# Create image lookup dictionaries
def create_lookup(folder):
    lookup = {}
    for image in folder.iterdir():
        if image.is_file():
            lookup[image.stem] = str(image)
    return lookup

# Combine both class folders so we can find every participant
left_lookup = {}
right_lookup = {}

for folder in [anemia_left, non_anemia_left]:
    left_lookup.update(create_lookup(folder))

for folder in [anemia_right, non_anemia_right]:
    right_lookup.update(create_lookup(folder))

# Keep only participants who have BOTH eye images
records = []

for _, row in df.iterrows():
    participant_id = row["id"]

    if participant_id in left_lookup and participant_id in right_lookup:
        records.append({
            "id": participant_id,
            "left_eye": left_lookup[participant_id],
            "right_eye": right_lookup[participant_id],
            "HbValue": row["HbValue"],
            "class": row["Class(Anemia/ Non-Anemia)"],
            "label": row["label"]
        })

# Create final dataframe
eye_df = pd.DataFrame(records)

# Save
output_path = dataset_dir / "eye_dataset.csv"
eye_df.to_csv(output_path, index=False)

# Display information
print("\nEye dataset created successfully!")
print("Total participants with both eyes:", len(eye_df))

print("\nClass distribution:")
print(eye_df["class"].value_counts())

print("\nLabel distribution:")
print(eye_df["label"].value_counts())

print("\nFirst 5 records:")
print(eye_df.head().to_string(index=False))

print(f"\nSaved to: {output_path}")