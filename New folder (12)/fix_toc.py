import fitz
import os

pdf_path = "professional_thesis_ch1_to_3.pdf"
temp_path = "professional_thesis_ch1_to_3_fixed.pdf"

doc = fitz.open(pdf_path)

# 1. Redact List of Figures (index 6)
page_lof = doc[6]
insts_lof = page_lof.search_for("Gantt chart")
if insts_lof:
    rect = fitz.Rect(50, insts_lof[0].y0 - 5, 550, 750)
    page_lof.draw_rect(rect, color=(1,1,1), fill=(1,1,1))
    print("Redacted Gantt chart in List of Figures")

# 2. Redact List of Tables (index 7)
page_lot = doc[7]
insts_lot = page_lot.search_for("Implementation environment")
if insts_lot:
    rect = fitz.Rect(50, insts_lot[0].y0 - 5, 550, 750)
    page_lot.draw_rect(rect, color=(1,1,1), fill=(1,1,1))
    print("Redacted Implementation environment in List of Tables")

# 3. Redact TOC page 3 (index 12)
page_toc = doc[12]
insts_toc = page_toc.search_for("Implementation and Result Analysis")
if insts_toc:
    rect = fitz.Rect(50, insts_toc[0].y0 - 5, 550, 750)
    page_toc.draw_rect(rect, color=(1,1,1), fill=(1,1,1))
    print("Redacted Implementation and Result Analysis in TOC")

# 4. Delete TOC pages 4 and 5 (indices 13 and 14)
doc.delete_pages([13, 14])
print("Deleted TOC pages 4 and 5")

doc.save(temp_path)
doc.close()

# Replace the original file with the fixed one
os.replace(temp_path, pdf_path)
print("Saved fixed PDF to", pdf_path)
