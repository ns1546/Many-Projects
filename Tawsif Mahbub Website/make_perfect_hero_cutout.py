import os
from PIL import Image
from rembg import remove, new_session

input_path = r"g:\Download Official\Tawsif Mahbub Website\public\assets\tawsif_hero.jpg"
output_path1 = r"g:\Download Official\Tawsif Mahbub Website\public\assets\tawsif_hero_cutout_perfect.png"

print("Loading image:", input_path)
input_img = Image.open(input_path)

print("Running rembg remove...")
# High quality neural removal with rembg
session = new_session()
output_img = remove(input_img, session=session, post_process_mask=True)

output_img.save(output_path1)
print("Saved to:", output_path1)
