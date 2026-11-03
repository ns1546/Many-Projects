import fitz

doc = fitz.open('Journal Writing Guidelines (Peer Research Lab).pdf')
pages_to_extract = [11, 21, 22, 25, 26]

for p in pages_to_extract:
    page = doc.load_page(p)
    pix = page.get_pixmap(dpi=150)
    pix.save(f'page_{p+1}.png')
