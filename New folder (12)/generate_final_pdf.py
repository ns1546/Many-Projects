import fitz
import os
import subprocess

latex_code = r"""\documentclass[12pt,a4paper]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\geometry{top=1.0in, bottom=1.0in, left=1.5in, right=1.0in}
\usepackage{lmodern}
\usepackage{setspace}

\begin{document}
\pagenumbering{roman}
\setcounter{page}{14}

\chapter*{Contents}
\vspace{-1.5em}

\begin{spacing}{1.2}
\noindent\textbf{Declaration} \dotfill \textbf{iii}\\
\textbf{Approval} \dotfill \textbf{vi}\\
\textbf{Dedication} \dotfill \textbf{vii}\\
\textbf{Acknowledgement} \dotfill \textbf{viii}\\
\textbf{Abstract} \dotfill \textbf{ix}\\
\textbf{List of Figures} \dotfill \textbf{x}\\
\textbf{List of Tables} \dotfill \textbf{xi}\\
\textbf{List of Abbreviations and Acronyms} \dotfill \textbf{xiii}\\
\\
\textbf{1\hspace{1em}Introduction} \dotfill \textbf{1}\\
\textbf{2\hspace{1em}Background Study} \dotfill \textbf{9}\\
\textbf{3\hspace{1em}Research Methodology} \dotfill \textbf{18}\\
\end{spacing}

\end{document}
"""

with open("custom_toc.tex", "w") as f:
    f.write(latex_code)

# Compile the latex file
subprocess.run(["pdflatex", "custom_toc.tex"], check=True)

# Now, open the PDFs and merge
doc = fitz.open("main.pdf")
custom_toc = fitz.open("custom_toc.pdf")
out_doc = fitz.open()

# Insert pages before TOC (indices 0 to 13)
out_doc.insert_pdf(doc, from_page=0, to_page=13)

# Insert the custom TOC
out_doc.insert_pdf(custom_toc, from_page=0, to_page=0)

# Insert Chapters 1 to 3 (indices 19 to 47)
# Note: 47 is page 48 in the original doc, which is the end of Chapter 3.
out_doc.insert_pdf(doc, from_page=19, to_page=47)

out_doc.save("Chapters_1_to_3.pdf")
out_doc.close()
doc.close()
custom_toc.close()

print("Successfully created Chapters_1_to_3.pdf with clean TOC")
