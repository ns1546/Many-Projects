import fitz

doc = fitz.open('Related Work.pdf')
text = ''
for page in doc.pages():
    text += page.get_text() + '\n'

with open('related_work_extract.txt', 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Total pages: {doc.page_count}")
print("Done")
