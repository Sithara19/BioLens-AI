from PIL import Image
import os

root = "Dataset/Eye"
bad_files = []

for folder, _, files in os.walk(root):
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            path = os.path.join(folder, file)

            try:
                if os.path.getsize(path) == 0:
                    bad_files.append((path, "EMPTY FILE"))
                    continue

                with Image.open(path) as img:
                    img.verify()

            except Exception as e:
                bad_files.append((path, str(e)))

print("\n================================")
print("IMAGE CHECK COMPLETED")
print("================================")
print("Bad images:", len(bad_files))

for path, error in bad_files:
    print("\n", path)
    print("  ->", error)

if len(bad_files) == 0:
    print("\nAll images are valid.")