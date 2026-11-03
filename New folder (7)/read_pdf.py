import pypdf

reader = pypdf.PdfReader('Journal Writing Guidelines (Peer Research Lab).pdf')
text = ''
for page in reader.pages:
    text += page.extract_text() + '\n'

with open('output_guidelines.txt', 'w', encoding='utf-8') as f:
    f.write(text)
