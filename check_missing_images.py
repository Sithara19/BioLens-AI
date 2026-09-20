import pandas as pd
from pathlib import Path


CSV_FILES = [
    "Dataset/eye_train.csv",
    "Dataset/eye_val.csv",
    "Dataset/eye_test.csv"
]

IMAGE_COLUMNS = [
    "left_eye",
    "right_eye"
]


print("\n================================")
print("CHECKING FOR MISSING IMAGES")
print("================================\n")


total_missing = 0


for csv_file in CSV_FILES:

    print(f"\nChecking: {csv_file}")

    df = pd.read_csv(csv_file)

    missing = []

    for column in IMAGE_COLUMNS:

        for path in df[column]:

            path = Path(path)

            if not path.exists():

                missing.append(str(path))

    # Remove duplicates
    missing = sorted(set(missing))

    print("Rows:", len(df))
    print("Missing images:", len(missing))

    if missing:

        print("\nMissing files:")

        for path in missing[:20]:
            print("  ", path)

        if len(missing) > 20:
            print(f"\n...and {len(missing) - 20} more.")


    total_missing += len(missing)


print("\n================================")
print("CHECK COMPLETED")
print("================================")

print("Total missing image paths:", total_missing)