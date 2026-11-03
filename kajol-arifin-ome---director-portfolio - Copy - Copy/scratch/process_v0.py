from PIL import Image

im = Image.open('scratch/test_bp2/bp_v0.jpg')
w, h = im.size
print(f"bp_v0 size: {w}x{h}, aspect: {w/h:.3f}")

# Target: 1000 x 1500 (2:3)
target_w = 1000
target_h = 1500

# Rescale so height = 1500:
scale = target_h / h
new_w = int(w * scale)
new_h = target_h
resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
print(f"Resized: {new_w}x{new_h}")

# Center crop to target_w:
left = (new_w - target_w) // 2
cropped = resized.crop((left, 0, left + target_w, target_h))
cropped.save('scratch/test_bp_v0_cropped.jpg', quality=95)
print("Saved scratch/test_bp_v0_cropped.jpg")
