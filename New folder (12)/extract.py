import fitz  # PyMuPDF
import os

doc = fitz.open("main.pdf")
text = ""
for i, page in enumerate(doc):
    text += f"\n\n--- PAGE {i+1} ---\n\n"
    text += page.get_text()

with open("extracted_text.txt", "w", encoding="utf-8") as f:
    f.write(text)

print(f"Extracted {len(doc)} pages of text.")
