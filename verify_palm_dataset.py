import pandas as pd
import os

for split in ["train", "val", "test"]:

    csv_path = f"Dataset/palm_{split}.csv"
    df = pd.read_csv(csv_path)

    missing = 0

    for path in df["image_path"]:
        if not os.path.exists(path):
            missing += 1

    print(f"\n{split.upper()}")
    print("Images:", len(df))
    print("Missing images:", missing)

print("\n================================")
print("PALM CSV CHECK COMPLETED")
print("================================")