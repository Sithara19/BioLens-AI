import pandas as pd

TRAIN = "Dataset/nail_train.csv"
VAL = "Dataset/nail_val.csv"
TEST = "Dataset/nail_test.csv"

train = pd.read_csv(TRAIN)
val = pd.read_csv(VAL)
test = pd.read_csv(TEST)

train_people = set(train["person_id"])
val_people = set(val["person_id"])
test_people = set(test["person_id"])

print("\n================================")
print("VERIFYING NAIL DATASET SPLIT")
print("================================")

print(f"Train persons: {len(train_people)}")
print(f"Validation persons: {len(val_people)}")
print(f"Test persons: {len(test_people)}")

train_val = train_people & val_people
train_test = train_people & test_people
val_test = val_people & test_people

print("\nPerson overlap:")
print(f"Train ∩ Validation : {len(train_val)}")
print(f"Train ∩ Test       : {len(train_test)}")
print(f"Validation ∩ Test  : {len(val_test)}")

if len(train_val) == 0 and len(train_test) == 0 and len(val_test) == 0:
    print("\n✓ NO PERSON LEAKAGE")
    print("✓ Train, validation and test persons are completely separate.")
else:
    print("\n✗ PERSON LEAKAGE FOUND!")
    print("Some persons appear in more than one split.")

print("\n================================")
print("DONE")
print("================================")