import urllib.request
from PIL import Image
import io
import os

url = "https://image.tmdb.org/t/p/original/v0jEBcZoRpQQYiJmYZUP0ZRkdp.jpg"
headers = {'User-Agent': 'Mozilla/5.0'}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    data = resp.read()

im = Image.open(io.BytesIO(data))
print("Original size:", im.size)

# Target resolution: 1200 x 1800 (Aspect ratio 2:3 = 0.66666...)
target_w = 1200
target_h = 1800

scale = target_h / im.height
new_w = int(im.width * scale)
new_h = target_h
resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
print("Resized to height 1800:", resized.size)

left = (new_w - target_w) // 2
cropped = resized.crop((left, 0, left + target_w, target_h))
print("Final 2:3 cropped size:", cropped.size)

# Save to public/gallery/bachelor point.jpg and public/gallery/bachelor-point-poster.jpg
p1 = "public/gallery/bachelor point.jpg"
p2 = "public/gallery/bachelor-point-poster.jpg"

cropped.save(p1, "JPEG", quality=95, optimize=True)
cropped.save(p2, "JPEG", quality=95, optimize=True)

print(f"Saved {p1} and {p2} ({os.path.getsize(p1)} bytes)")
