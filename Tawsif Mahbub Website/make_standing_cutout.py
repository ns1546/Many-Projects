from rembg import remove, new_session
from PIL import Image, ImageFilter
import shutil

source_path = r'C:\Users\User\.gemini\antigravity-ide\brain\4b00009c-8cb7-4f87-ac86-452dd14ea222\tawsif_full_standing_1792992945738.jpg'
inp = Image.open(source_path).convert('RGBA')

# High quality alpha matting
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

# Smooth edges slightly
r, g, b, a = out.split()
a = a.filter(ImageFilter.GaussianBlur(radius=0.5))
smooth_out = Image.merge('RGBA', (r, g, b, a))

smooth_out.save('public/assets/tawsif_standing_cutout.png')
smooth_out.save('assets/tawsif_standing_cutout.png')
print("Successfully created public/assets/tawsif_standing_cutout.png")
