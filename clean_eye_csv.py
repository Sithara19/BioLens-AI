import pandas as pd
import os

files = [
    "Dataset/eye_train.csv",
    "Dataset/eye_val.csv",
    "Dataset/eye_test.csv"
]

for file in files:
    df = pd.read_csv(file)

    original_count = len(df)

    valid_rows = []

    for _, row in df.iterrows():
        left_exists = os.path.exists(row["left_eye"])
        right_exists = os.path.exists(row["right_eye"])

        if left_exists and right_exists:
            valid_rows.append(row)
        else:
            print("\nRemoving:")
            print("ID:", row["id"])
            print("Left exists :", left_exists)
            print("Right exists:", right_exists)
            print("Left path   :", row["left_eye"])
            print("Right path  :", row["right_eye"])

    clean_df = pd.DataFrame(valid_rows)

    clean_df.to_csv(file, index=False)

    removed = original_count - len(clean_df)

    print("\n================================")
    print(file)
    print("Original rows:", original_count)
    print("Removed rows :", removed)
    print("Remaining    :", len(clean_df))
    print("================================")