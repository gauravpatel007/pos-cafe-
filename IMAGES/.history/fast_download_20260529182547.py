import os
import urllib.request
import time

products = [
    "Filter Coffee", "Fresh Lime Soda", "Mango Lassi", "Masala Chai", "Sweet Lassi",
    "Aloo Paratha", "Idli Sambar", "Masala Dosa", "Poha", "Upma",
    "Gajar Halwa", "Gulab Jamun", "Jalebi", "Rasgulla", "Rasmalai",
    "Butter Chicken", "Butter Naan", "Dal Makhani", "Palak Paneer", "Paneer Butter Masala", "Veg Biryani",
    "Chole Bhature", "Dahi Vada", "Masala Maggi", "Pani Puri", "Pav Bhaji", "Samosa", "Vada Pav"
]

output_dir = os.path.dirname(os.path.abspath(__file__))

print(f"Starting downloads for {len(products)} products from Unsplash...\n")

success_count = 0

for idx, product in enumerate(products, 1):
    try:
        print(f"[{idx}/28] {product}...", end=" ", flush=True)
        
        # Use Unsplash API direct URL - very reliable
        search_query = product.replace(" ", "%20")
        unsplash_url = f"https://source.unsplash.com/400x400/?{search_query}"
        
        img_path = os.path.join(output_dir, f"{product}.jpg")
        urllib.request.urlretrieve(unsplash_url, img_path)
        print("✓")
        success_count += 1
        time.sleep(0.5)
        
    except Exception as e:
        print(f"✗ ({str(e)[:20]})")

print(f"\nDownloads complete! {success_count}/{len(products)} images saved.")
print(f"Saved in: {output_dir}")
