import os
import shutil
import time
from bing_image_downloader import downloader

# Product list
products = [
    "Filter Coffee", "Fresh Lime Soda", "Mango Lassi", "Masala Chai", "Sweet Lassi",
    "Aloo Paratha", "Idli Sambar", "Masala Dosa", "Poha", "Upma",
    "Gajar Halwa", "Gulab Jamun", "Jalebi", "Rasgulla", "Rasmalai",
    "Butter Chicken", "Butter Naan", "Dal Makhani", "Palak Paneer", "Paneer Butter Masala", "Veg Biryani",
    "Chole Bhature", "Dahi Vada", "Masala Maggi", "Pani Puri", "Pav Bhaji", "Samosa", "Vada Pav"
]

output_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(output_dir, "dataset")

print(f"Starting image downloads for {len(products)} products...\n")

success_count = 0
failed_count = 0

for idx, product in enumerate(products, 1):
    try:
        print(f"[{idx}/{len(products)}] Downloading: {product}...", end=" ", flush=True)
        
        # Download image
        downloader.download(
            product,
            limit=1,
            output_dir="dataset",
            adult_filter_off=True,
            force_replace=False,
            timeout=15,
            verbose=False
        )
        
        # Move image to main folder
        product_dataset_path = os.path.join(dataset_dir, product)
        if os.path.exists(product_dataset_path):
            images = [f for f in os.listdir(product_dataset_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]
            if images:
                old_path = os.path.join(product_dataset_path, images[0])
                _, ext = os.path.splitext(images[0])
                new_path = os.path.join(output_dir, f"{product}{ext}")
                shutil.move(old_path, new_path)
                print("✓")
                success_count += 1
                time.sleep(1)  # Rate limiting
            else:
                print("✗ (No image found)")
                failed_count += 1
        else:
            print("✗ (Folder not created)")
            failed_count += 1
            
    except Exception as e:
        print(f"✗ ({str(e)[:30]})")
        failed_count += 1
        time.sleep(1)

# Cleanup dataset folder
if os.path.exists(dataset_dir):
    try:
        shutil.rmtree(dataset_dir)
        print("\nCleaned up temporary dataset folder")
    except:
        pass

print(f"\n{'='*50}")
print(f"✓ Success: {success_count}")
print(f"✗ Failed: {failed_count}")
print(f"Total: {success_count + failed_count}")
print(f"{'='*50}")
print(f"Images saved in: {output_dir}")
