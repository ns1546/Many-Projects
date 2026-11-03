import os
from PIL import Image

folder = r"drive-download-20260503T111429Z-3-001"
all_files = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

print(f"Total files in {folder}: {len(all_files)}")
for f in sorted(all_files):
    p = os.path.join(folder, f)
    im = Image.open(p)
    print(f"{f}: size={im.size}")
