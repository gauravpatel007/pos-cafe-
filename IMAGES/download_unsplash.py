import os
import requests
import urllib.request
from pathlib import Path

products = [
    "Filter Coffee", "Fresh Lime Soda", "Mango Lassi", "Masala Chai", "Sweet Lassi",
    "Aloo Paratha", "Idli Sambar", "Masala Dosa", "Poha", "Upma",
    "Gajar Halwa", "Gulab Jamun", "Jalebi", "Rasgulla", "Rasmalai",
    "Butter Chicken", "Butter Naan", "Dal Makhani", "Palak Paneer", "Paneer Butter Masala", "Veg Biryani",
    "Chole Bhature", "Dahi Vada", "Masala Maggi", "Pani Puri", "Pav Bhaji", "Samosa", "Vada Pav"
]

output_dir = os.path.dirname(os.path.abspath(__file__))

print(f"Downloading images for {len(products)} products from Unsplash...\n")

success_count = 0
failed_count = 0

for idx, product in enumerate(products, 1):
    try:
        print(f"[{idx}/{len(products)}] {product}...", end=" ", flush=True)
        
        # Use Unsplash API to get image URL
        search_query = product.replace(" ", "%20")
        unsplash_url = f"https://source.unsplash.com/400x400/?{search_query}"
        
        # Download image
        img_path = os.path.join(output_dir, f"{product}.jpg")
        urllib.request.urlretrieve(unsplash_url, img_path)
        print("✓")
        success_count += 1
        
    except Exception as e:
        print(f"✗")
        failed_count += 1

print(f"\n{'='*50}")
print(f"✓ Success: {success_count}/{len(products)}")
print(f"✗ Failed: {failed_count}/{len(products)}")
print(f"{'='*50}")
print(f"Images saved in: {output_dir}")
