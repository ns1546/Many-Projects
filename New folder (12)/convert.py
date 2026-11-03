from pdf2docx import Converter

cv = Converter("main.pdf")
cv.convert("main.docx")
cv.close()
