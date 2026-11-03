from rembg import remove, new_session
from PIL import Image, ImageFilter
import numpy as np

# Test high quality alpha matting on fb_photo_0
inp = Image.open('public/assets/fb/fb_photo_0.jpg').convert('RGBA')

# Using u2net with alpha matting
session = new_session('u2net')
out = remove(
    inp,
    session=session,
    alpha_matting=True,
    alpha_matting_foreground_threshold=240,
    alpha_matting_background_threshold=15,
    alpha_matting_erode_size=5,
    post_process_mask=True
)

# Smooth the alpha channel slightly to eliminate any harsh pixelation
r, g, b, a = out.split()
a = a.filter(ImageFilter.GaussianBlur(radius=0.75))
smooth_out = Image.merge('RGBA', (r, g, b, a))

smooth_out.save('public/assets/fb/tawsif_matting_hq.png')
print("Successfully generated tawsif_matting_hq.png")
