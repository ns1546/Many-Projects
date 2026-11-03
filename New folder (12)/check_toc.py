import fitz

doc = fitz.open("temp_45_pages.pdf")
with open("toc_out.txt", "w", encoding="utf-8") as f:
    for i, page in enumerate(doc):
        text = page.get_text()
        if "Contents" in text or "Chapter" in text or "4" in text:
            f.write(f"--- PAGE {i} ---\n")
            f.write(text + "\n")
