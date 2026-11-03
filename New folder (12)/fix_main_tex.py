import re

with open('main.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Section 1.3 Research Objectives page break
content = content.replace(
    r'\section{Research Objectives}',
    r'\newpage' + '\n' + r'\section{Research Objectives}'
)

# Fix 2: Subsection 2.1.1 page break to prevent orphan
content = content.replace(
    r'\subsection{Federated Learning for Medical Imaging}',
    r'\newpage' + '\n' + r'\subsection{Federated Learning for Medical Imaging}'
)

# Fix 3: ToC, LoF, LoT page numbers
# I will use \usepackage[nottoc]{tocbibind} in the preamble if not already there,
# or manually use \addcontentsline after \listoffigures and \listoftables
if 'tocbibind' not in content:
    content = content.replace(
        r'\usepackage{tabularx}',
        r'\usepackage{tabularx}' + '\n' + r'\usepackage[nottoc]{tocbibind}' + '\n' + r'\usepackage{booktabs}'
    )

# Fix 4: Page number on the page after xv
# Usually \cleardoublepage before Chapter 1 causes a blank page without a number.
# We will use \pagenumbering{arabic} \setcounter{page}{1} right before Chapter 1.
# And ensure it's visible.

# Insert ToC, LoF, LoT before Chapter 1
toc_block = r"""
\tableofcontents
\clearpage
\listoffigures
\clearpage
\listoftables
\clearpage
\chapter*{List of Abbreviations and Acronyms}
\addcontentsline{toc}{chapter}{List of Abbreviations and Acronyms}
\begin{itemize}
    \item \textbf{AI} - Artificial Intelligence
    \item \textbf{FL} - Federated Learning
    \item \textbf{DP} - Differential Privacy
    \item \textbf{CBAM} - Convolutional Block Attention Module
\end{itemize}
\clearpage
\pagenumbering{arabic}
\setcounter{page}{1}
"""

if r'\tableofcontents' not in content:
    content = content.replace(
        r'\chapter{Introduction}',
        toc_block + r'\chapter{Introduction}'
    )

# Fix 5: Replace Table 1 text with a proper LaTeX table
table1_regex = re.compile(r'Table 1: Conceptual comparison of prior research directions and FEDMED-X focus.*?(?=\\section{Problem Analysis})', re.DOTALL)

table1_latex = r"""
\begin{table}[htbp]
\centering
\caption{Conceptual comparison of prior research directions and FEDMED-X focus}
\begin{tabularx}{\textwidth}{|>{\hsize=.2\hsize}X|>{\hsize=.3\hsize}X|>{\hsize=.35\hsize}X|>{\hsize=.15\hsize}X|}
\hline
\textbf{Research Direction} & \textbf{What Prior Work Contributes} & \textbf{Typical Limitation} & \textbf{Addressed in FEDMED-X} \\
\hline
Medical FL surveys & Map privacy, architecture, and communication issues & Often no complete system implementation & Yes \\
\hline
FedProx / non-IID FL & Improve robustness under heterogeneous clients & Limited joint privacy + compression + edge evaluation & Yes \\
\hline
DP medical FL & Formal or practical privacy protection & Weak edge deployment analysis & Yes \\
\hline
Compressed FL & Reduce communication cost & Privacy interaction not always quantified & Yes \\
\hline
Edge medical AI & Show on-device feasibility & Often inference-only or incomplete FL stack & Partially \\
\hline
\textbf{FEDMED-X} & \textbf{Unified FedProx + DP-SGD + TopK/INT8 + MedNet} & \textbf{Controlled benchmark setting} & \textbf{Core focus} \\
\hline
\end{tabularx}
\end{table}

"""

content = table1_regex.sub(lambda m: table1_latex, content)

with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fixes to main.tex")
