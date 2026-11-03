import fitz

# Open the new cover, preliminaries, and the original document
cover = fitz.open("cover.pdf")
preliminaries = fitz.open("preliminaries.pdf")
doc = fitz.open("main.pdf")

# Create a new document
final_doc = fitz.open()

# Insert the cover page (which we redesigned)
final_doc.insert_pdf(cover)

# Insert the preliminaries (Declaration, Approval, Dedication, Acknowledgement)
final_doc.insert_pdf(preliminaries)

# Insert the rest of the chapters from main.pdf
# Abstract starts at index 9 in main.pdf, so we start from there to the end of Chapter 3.
for i in range(9, 48):
    page = doc[i]
    text = page.get_text().strip()
    images = page.get_images(full=True)
    # Remove truly blank pages
    if len(text) <= 5 and not images:
        continue
    final_doc.insert_pdf(doc, from_page=i, to_page=i)

# Save the final document
final_doc.save("professional_thesis_ch1_to_3.pdf")
final_doc.close()
doc.close()
preliminaries.close()
cover.close()

print("Successfully merged into professional_thesis_ch1_to_3.pdf")
