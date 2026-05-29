import os
import time
import requests
from io import BytesIO
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

products = [
    "Filter Coffee", "Fresh Lime Soda", "Mango Lassi", "Masala Chai", "Sweet Lassi",
    "Aloo Paratha", "Idli Sambar", "Masala Dosa", "Poha", "Upma",
    "Gajar Halwa", "Gulab Jamun", "Jalebi", "Rasgulla", "Rasmalai",
    "Butter Chicken", "Butter Naan", "Dal Makhani", "Palak Paneer", "Paneer Butter Masala", "Veg Biryani",
    "Chole Bhature", "Dahi Vada", "Masala Maggi", "Pani Puri", "Pav Bhaji", "Samosa", "Vada Pav"
]

output_dir = os.path.dirname(os.path.abspath(__file__))

# Setup Chrome options
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--disable-blink-features=AutomationControlled')

print(f"Starting Google Images download for {len(products)} products...\n")

success_count = 0
failed_count = 0

# Initialize driver
try:
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    for idx, product in enumerate(products, 1):
        try:
            print(f"[{idx}/{len(products)}] Downloading: {product}...", end=" ", flush=True)
            
            # Navigate to Google Images
            driver.get(f"https://www.google.com/search?q={product}&tbm=isch")
            
            # Wait for images to load
            time.sleep(2)
            
            # Find first image
            images = driver.find_elements(By.CSS_SELECTOR, "img.rg_i")
            
            if images:
                # Click first image
                images[0].click()
                time.sleep(1)
                
                # Get actual image URL
                images = driver.find_elements(By.CSS_SELECTOR, "img.n3VNCb")
                for image in images:
                    src = image.get_attribute('src')
                    if src and 'http' in src and not 'base64' in src:
                        # Download image
                        response = requests.get(src, timeout=10)
                        if response.status_code == 200:
                            # Open and save
                            img = Image.open(BytesIO(response.content))
                            img_path = os.path.join(output_dir, f"{product}.png")
                            img.save(img_path, 'PNG')
                            print("✓")
                            success_count += 1
                            time.sleep(0.5)
                            break
                        
            if success_count == idx:  # Image was downloaded
                pass
            else:
                print("✗")
                failed_count += 1
                
        except Exception as e:
            print(f"✗")
            failed_count += 1
            
    driver.quit()
    
except Exception as e:
    print(f"Error: {e}")

print(f"\n{'='*50}")
print(f"✓ Success: {success_count}")
print(f"✗ Failed: {failed_count}")
print(f"Total: {success_count + failed_count}")
print(f"{'='*50}")
print(f"Images saved in: {output_dir}")
