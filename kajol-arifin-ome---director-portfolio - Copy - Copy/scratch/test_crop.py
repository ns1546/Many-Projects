from PIL import Image, ImageOps

im = Image.open('imdb_bp_poster.jpg')
w, h = im.size
print(f"Original size: {w}x{h}, aspect: {w/h:.3f}")

# Target aspect ratio is 2/3 (0.6667)
target_w = 1000
target_h = 1500

# If we resize im so its height is target_h:
new_h = target_h
new_w = int(w * (new_h / h))
resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
print(f"Resized: {new_w}x{new_h}")

# If we center crop new_w to target_w:
left = (new_w - target_w) // 2
crop_cropped = resized.crop((left, 0, left + target_w, target_h))
crop_cropped.save('test_crop_2_3.jpg', quality=95)

# What if we letterbox/pad or softly blend the top/bottom so the whole poster with logos fits with comfortable margin?
# In fact, if we fit the entire width into 1000px:
fit_w = target_w
fit_h = int(h * (fit_w / w))
print(f"Fitted width: {fit_w}x{fit_h}")
# If fit_h < target_h, we have background above/below.
# Let's inspect the background at top and bottom of imdb_bp_poster.jpg:
# Top has yellow wall color #ffd100 / #f5b800 / etc. Bottom has floor/rug.

