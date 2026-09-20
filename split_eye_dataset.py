import pandas as pd
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_csv("Dataset/eye_dataset.csv")

# First split: 70% train, 30% temporary
train_df, temp_df = train_test_split(
    df,
    test_size=0.30,
    stratify=df["label"],
    random_state=42
)

# Second split: 15% validation, 15% test
val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["label"],
    random_state=42
)

# Save the splits
train_df.to_csv("Dataset/eye_train.csv", index=False)
val_df.to_csv("Dataset/eye_val.csv", index=False)
test_df.to_csv("Dataset/eye_test.csv", index=False)

# Print results
print("TRAINING SET")
print("Participants:", len(train_df))
print(train_df["class"].value_counts())
print()

print("VALIDATION SET")
print("Participants:", len(val_df))
print(val_df["class"].value_counts())
print()

print("TEST SET")
print("Participants:", len(test_df))
print(test_df["class"].value_counts())
print()

# Check for participant overlap
train_ids = set(train_df["id"])
val_ids = set(val_df["id"])
test_ids = set(test_df["id"])

print("Train ∩ Validation:", len(train_ids & val_ids))
print("Train ∩ Test:", len(train_ids & test_ids))
print("Validation ∩ Test:", len(val_ids & test_ids))