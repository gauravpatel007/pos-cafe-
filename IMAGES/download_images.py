import os
import re
from bing_image_downloader import downloader

# Product list
products = [
    # Beverages
    "Filter Coffee",
    "Fresh Lime Soda",
    "Mango Lassi",
    "Masala Chai",
    "Sweet Lassi",
    # Breakfast
    "Aloo Paratha",
    "Idli Sambar",
    "Masala Dosa",
    "Poha",
    "Upma",
    # Desserts
    "Gajar Halwa",
    "Gulab Jamun",
    "Jalebi",
    "Rasgulla",
    "Rasmalai",
    # Main Course
    "Butter Chicken",
    "Butter Naan",
    "Dal Makhani",
    "Palak Paneer",
    "Paneer Butter Masala",
    "Veg Biryani",
    # Snacks
    "Chole Bhature",
    "Dahi Vada",
    "Masala Maggi",
    "Pani Puri",
    "Pav Bhaji",
    "Samosa",
    "Vada Pav"
]

# Create output directory
output_dir = os.path.dirname(os.path.abspath(__file__))

print(f"Starting image downloads for {len(products)} products...")
print(f"Saving to: {output_dir}\n")

# Download images for each product
for idx, product in enumerate(products, 1):
    try:
        print(f"[{idx}/{len(products)}] Downloading images for: {product}")
        
        # Create a safe folder name
        safe_name = re.sub(r'[<>:"/\\|?*]', '_', product)
        product_folder = os.path.join(output_dir, safe_name)
        
        # Download 1 image per product
        downloader.download(
            product,
            limit=1,
            output_dir="dataset",
            adult_filter_off=True,
            force_replace=False,
            timeout=15,
            verbose=False
        )
        
        # Move downloaded image to main folder with product name
        dataset_path = os.path.join(output_dir, "dataset", product)
        if os.path.exists(dataset_path):
            images = [f for f in os.listdir(dataset_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]
            if images:
                old_path = os.path.join(dataset_path, images[0])
                # Get file extension
                _, ext = os.path.splitext(images[0])
                new_path = os.path.join(output_dir, f"{safe_name}{ext}")
                if os.path.exists(old_path):
                    os.rename(old_path, new_path)
                    print(f"  ✓ Saved: {safe_name}{ext}")
        
    except Exception as e:
        print(f"  ✗ Error downloading for {product}: {str(e)}")

print("\n✓ Download complete!")
print(f"Check the folder: {output_dir}")
