import os
from bing_image_downloader import downloader

# All 28 products
all_products = {
    "Filter Coffee", "Fresh Lime Soda", "Mango Lassi", "Masala Chai", "Sweet Lassi",
    "Aloo Paratha", "Idli Sambar", "Masala Dosa", "Poha", "Upma",
    "Gajar Halwa", "Gulab Jamun", "Jalebi", "Rasgulla", "Rasmalai",
    "Butter Chicken", "Butter Naan", "Dal Makhani", "Palak Paneer", "Paneer Butter Masala", "Veg Biryani",
    "Chole Bhature", "Dahi Vada", "Masala Maggi", "Pani Puri", "Pav Bhaji", "Samosa", "Vada Pav"
}

output_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(output_dir, "dataset")

# Check which ones we have
existing = set()
if os.path.exists(output_dir):
    for f in os.listdir(output_dir):
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            name = os.path.splitext(f)[0]
            existing.add(name)

# Find missing products
missing = all_products - existing
print(f"Already have: {len(existing)} images")
print(f"Missing: {len(missing)} images")
print(f"Missing products: {sorted(missing)}\n")

if missing:
    print("Downloading missing products...\n")
    success = 0
    for idx, product in enumerate(sorted(missing), 1):
        try:
            print(f"[{idx}/{len(missing)}] {product}...", end=" ", flush=True)
            
            downloader.download(
                product,
                limit=1,
                output_dir="dataset",
                adult_filter_off=True,
                force_replace=True,
                timeout=15,
                verbose=False
            )
            print("✓")
            success += 1
            
        except Exception as e:
            print(f"✗ ({str(e)[:30]})")

    print(f"\nDownloaded {success}/{len(missing)} missing images")
else:
    print("All images already downloaded!")
