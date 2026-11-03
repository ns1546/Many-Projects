import fitz

doc = fitz.open("main.pdf")
for i in range(19, 49): # pages 20 to 49
    page = doc[i]
    text = page.get_text().strip()
    if len(text) < 100:
        print(f"Page {i+1} has very little text (len={len(text)}): {repr(text)}")
