import fitz

doc = fitz.open("main.pdf")
print("--- PAGE 48 (index 47) ---")
print(doc[47].get_text()[:200])
print("--- PAGE 49 (index 48) ---")
print(doc[48].get_text()[:200])
print("--- PAGE 50 (index 49) ---")
print(doc[49].get_text()[:200])
