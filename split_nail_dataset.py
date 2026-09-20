import os
import random
import pandas as pd

# ==========================================
# SETTINGS
# ==========================================

ROOT = r"Dataset\Nail Beds"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

RANDOM_SEED = 42

random.seed(RANDOM_SEED)


# ==========================================
# COLLECT PERSON IDs
# ==========================================

def get_person_data(class_name):

    class_path = os.path.join(ROOT, class_name)

    person_images = {}

    for folder in os.listdir(class_path):

        folder_path = os.path.join(class_path, folder)

        if not os.path.isdir(folder_path):
            continue

        for file in os.listdir(folder_path):

            if file.lower().endswith(".jpg"):

                person_id = os.path.splitext(file)[0]

                image_path = os.path.join(
                    folder_path,
                    file
                )

                if person_id not in person_images:
                    person_images[person_id] = []

                person_images[person_id].append(
                    image_path
                )

    return person_images


# ==========================================
# SPLIT PERSONS
# ==========================================

def split_persons(person_ids):

    person_ids = list(person_ids)

    random.shuffle(person_ids)

    total = len(person_ids)

    train_end = int(total * TRAIN_RATIO)

    val_end = train_end + int(total * VAL_RATIO)

    train_ids = person_ids[:train_end]

    val_ids = person_ids[train_end:val_end]

    test_ids = person_ids[val_end:]

    return train_ids, val_ids, test_ids


# ==========================================
# LOAD DATA
# ==========================================

print("\n================================")
print("LOADING NAIL DATASET")
print("================================")

anemia_data = get_person_data("Anemia")

non_anemia_data = get_person_data("Non_Anemia")


print(f"Anemia persons: {len(anemia_data)}")
print(f"Non-Anemia persons: {len(non_anemia_data)}")


# ==========================================
# SPLIT EACH CLASS SEPARATELY
# ==========================================

anemia_train, anemia_val, anemia_test = split_persons(
    anemia_data.keys()
)

non_train, non_val, non_test = split_persons(
    non_anemia_data.keys()
)


# ==========================================
# CREATE ROWS
# ==========================================

def create_rows(
    person_ids,
    person_data,
    label
):

    rows = []

    for person_id in person_ids:

        for image_path in person_data[person_id]:

            rows.append({
                "image_path": image_path,
                "person_id": person_id,
                "label": label
            })

    return rows


train_rows = (
    create_rows(anemia_train, anemia_data, 1)
    +
    create_rows(non_train, non_anemia_data, 0)
)

val_rows = (
    create_rows(anemia_val, anemia_data, 1)
    +
    create_rows(non_val, non_anemia_data, 0)
)

test_rows = (
    create_rows(anemia_test, anemia_data, 1)
    +
    create_rows(non_test, non_anemia_data, 0)
)


# ==========================================
# CREATE DATAFRAMES
# ==========================================

train_df = pd.DataFrame(train_rows)
val_df = pd.DataFrame(val_rows)
test_df = pd.DataFrame(test_rows)


# Shuffle rows
train_df = train_df.sample(
    frac=1,
    random_state=RANDOM_SEED
).reset_index(drop=True)

val_df = val_df.sample(
    frac=1,
    random_state=RANDOM_SEED
).reset_index(drop=True)

test_df = test_df.sample(
    frac=1,
    random_state=RANDOM_SEED
).reset_index(drop=True)


# ==========================================
# SAVE CSV FILES
# ==========================================

train_df.to_csv(
    "Dataset/nail_train.csv",
    index=False
)

val_df.to_csv(
    "Dataset/nail_val.csv",
    index=False
)

test_df.to_csv(
    "Dataset/nail_test.csv",
    index=False
)


# ==========================================
# DISPLAY RESULTS
# ==========================================

print("\n================================")
print("NAIL DATASET SPLIT COMPLETED")
print("================================")

print("\nTRAIN")
print(f"Persons: {len(anemia_train) + len(non_train)}")
print(f"Images : {len(train_df)}")
print(
    train_df["label"].value_counts().sort_index()
)

print("\nVALIDATION")
print(f"Persons: {len(anemia_val) + len(non_val)}")
print(f"Images : {len(val_df)}")
print(
    val_df["label"].value_counts().sort_index()
)

print("\nTEST")
print(f"Persons: {len(anemia_test) + len(non_test)}")
print(f"Images : {len(test_df)}")
print(
    test_df["label"].value_counts().sort_index()
)

print("\nFiles created:")
print("Dataset/nail_train.csv")
print("Dataset/nail_val.csv")
print("Dataset/nail_test.csv")

print("\n================================")
print("DONE")
print("================================")