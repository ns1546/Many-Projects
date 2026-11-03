import cv2
import numpy as np

# Load original RGB and initial cutout
rgb = cv2.imread(r"g:\Download Official\Tawsif Mahbub Website\public\assets\fb\fb_photo_page_0.jpg")
cutout = cv2.imread(r"g:\Download Official\Tawsif Mahbub Website\public\assets\tawsif_fb_cutout_clean.png", cv2.IMREAD_UNCHANGED)

alpha = cutout[:, :, 3]

# Keep only the largest connected component
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats((alpha > 30).astype(np.uint8))
largest_idx = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
clean_mask = (labels == largest_idx).astype(np.uint8) * 255

# Fill internal holes in the mask
contours, _ = cv2.findContours(clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
filled_mask = np.zeros_like(clean_mask)
cv2.drawContours(filled_mask, contours, -1, 255, thickness=cv2.FILLED)

# Multiply by original alpha to preserve feathered hair edges
refined_alpha = (alpha.astype(np.float32) / 255.0) * (filled_mask.astype(np.float32) / 255.0)

# Apply gentle edge antialiasing (0.8px Gaussian) only along the edge band
edge_band = cv2.morphologyEx(filled_mask, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
blurred_alpha = cv2.GaussianBlur(refined_alpha, (3, 3), 0.7)
final_alpha = np.where(edge_band > 0, blurred_alpha, refined_alpha)
final_alpha = np.clip(final_alpha * 255, 0, 255).astype(np.uint8)

# Color decontamination for edge pixels (prevent dark or blue fringe from original background)
# Where alpha is semi-transparent (10 < alpha < 240), blend color with eroded foreground color
solid_fg = (final_alpha > 240).astype(np.uint8)
# Inpaint color outward from solid foreground
dilated_fg_rgb = cv2.inpaint(rgb, (final_alpha < 240).astype(np.uint8), 3, cv2.INPAINT_TELEA)

# For final image, use original RGB where solid, and inpainted color where transitioning
blend_factor = (final_alpha.astype(np.float32) / 255.0)[:, :, np.newaxis]
final_rgb = rgb.astype(np.float32) * blend_factor + dilated_fg_rgb.astype(np.float32) * (1.0 - blend_factor)
final_rgb = np.clip(final_rgb, 0, 255).astype(np.uint8)

# Assemble 4-channel PNG
result = np.dstack([final_rgb, final_alpha])

out_path = r"g:\Download Official\Tawsif Mahbub Website\public\assets\tawsif_sunglasses_cutout.png"
cv2.imwrite(out_path, result)
print("Saved refined cutout:", out_path)
