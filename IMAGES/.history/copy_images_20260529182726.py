import os
import shutil
from pathlib import Path

dataset_dir = r"g:\cafe-odoo(anti)\new2\IMAGES\dataset"
output_dir = r"g:\cafe-odoo(anti)\new2\IMAGES"

print("Copying downloaded images to main folder...\n")

count = 0
for product_folder in os.listdir(dataset_dir):
    product_path = os.path.join(dataset_dir, product_folder)
    if os.path.isdir(product_path):
        # Find image files in this folder
        images = [f for f in os.listdir(product_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]
        if images:
            src_image = os.path.join(product_path, images[0])
            _, ext = os.path.splitext(images[0])
            dst_image = os.path.join(output_dir, f"{product_folder}{ext}")
            
            try:
                # Check if destination already exists
                if os.path.exists(dst_image):
                    os.remove(dst_image)
                shutil.copy(src_image, dst_image)
                print(f"✓ {product_folder}{ext}")
                count += 1
            except Exception as e:
                print(f"✗ {product_folder}: {str(e)}")

print(f"\nTotal images copied: {count}")
