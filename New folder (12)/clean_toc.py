import fitz

doc = fitz.open("main.pdf")
out_doc = fitz.open()

for i in range(48):
    out_doc.insert_pdf(doc, from_page=i, to_page=i)

# Page 9 (List of Figures)
# Figure 3 is chapter 5. Redact from "3\nGantt chart" down
page = out_doc[9]
insts = page.search_for("Gantt chart")
if insts:
    inst = insts[0]
    rect = fitz.Rect(50, inst.y0 - 5, 550, 750)
    page.draw_rect(rect, color=(1,1,1), fill=(1,1,1))

# Page 10 (List of Tables)
# Table 6 is chapter 4. Redact from "Implementation environment" down
page = out_doc[10]
insts = page.search_for("Implementation environment")
if insts:
    inst = insts[0]
    rect = fitz.Rect(50, inst.y0 - 5, 550, 750)
    page.draw_rect(rect, color=(1,1,1), fill=(1,1,1))

# Page 15 (Table of Contents)
# Redact from "Implementation and Result Analysis" down
page = out_doc[15]
insts = page.search_for("Implementation and Result Analysis")
if insts:
    inst = insts[0]
    rect = fitz.Rect(50, inst.y0 - 5, 550, 750)
    page.draw_rect(rect, color=(1,1,1), fill=(1,1,1))

# Page 16 (Table of Contents)
# Redact from top of list to bottom
page = out_doc[16]
rect = fitz.Rect(50, 80, 550, 750)
page.draw_rect(rect, color=(1,1,1), fill=(1,1,1))

# Page 17 (Table of Contents - Chapter 6 and References)
page = out_doc[17]
rect = fitz.Rect(50, 80, 550, 750)
page.draw_rect(rect, color=(1,1,1), fill=(1,1,1))

out_doc.save("Chapters_1_to_3.pdf")
out_doc.close()
doc.close()

print("PDF processed successfully.")
