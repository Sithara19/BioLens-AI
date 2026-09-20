from PIL import Image
import os

ROOT = r"Dataset\Nail Beds"

bad_images = []
total_images = 0

for root, dirs, files in os.walk(ROOT):

    for file in files:

        if file.lower().endswith(".jpg"):

            total_images += 1

            path = os.path.join(root, file)

            try:
                with Image.open(path) as img:
                    img.verify()

            except Exception as e:
                bad_images.append((path, str(e)))


print("\n================================")
print("NAIL IMAGE CHECK COMPLETED")
print("================================")

print(f"Total JPG images checked: {total_images}")
print(f"Bad images: {len(bad_images)}")

if bad_images:

    print("\nBad image files:")

    for path, error in bad_images:
        print(path)
        print("Error:", error)

else:

    print("\nAll images are valid.")