import re

with open('main.tex', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Change to Times New Roman and remove titlesec which changed the theme
c = c.replace(r'\usepackage{lmodern}', r'\usepackage{mathptmx}')
c = c.replace(r'\usepackage{titlesec}', '')

# Remove titlesec settings
c = re.sub(r'\\titleformat\{\\chapter\}\[display\].*?\{20pt\}\{\\Huge\}', '', c, flags=re.DOTALL)
c = re.sub(r'\\titlespacing\*\{\\chapter\}\{0pt\}\{-30pt\}\{30pt\}', '', c)

# 2. Add Cover Page details
# The cover page text from extracted_text.txt was:
# FEDMED-X: Communication-Efficient Privacy-Preserving Federated Learning with Real Edge Hardware Deployment for Medical Image Classification
# By ...
cover_text = r"""
\begin{titlepage}
    \centering
    \vspace*{2cm}
    
    {\fontsize{18}{22}\selectfont \textbf{FEDMED-X: Communication-Efficient Privacy-Preserving Federated Learning with Real Edge Hardware Deployment for Medical Image Classification}\par}
    
    \vspace{2cm}
    
    \textbf{By}\par
    \vspace{1cm}
    
    Mohammad Zunayed\par
    ID: 20234103328\par\vspace{0.5cm}
    
    Md. Najmush Shakib\par
    ID: 20234103357\par\vspace{0.5cm}
    
    Munim Halder\par
    ID: 20234103351\par\vspace{0.5cm}
    
    Md. Nur Alam\par
    ID: 20234103153\par\vspace{0.5cm}
    
    Omar Faruk Jihad\par
    ID: 20234103145\par
    
    \vspace{2cm}
    
    \textbf{Supervisor}\par
    Md. Saddam Hossain\par
    Assistant Professor, CSE, BUBT\par
    
    \vfill
    
    Submitted in partial fulfillment of the requirements of the degree of\par
    Bachelor of Science in\par
    Computer Science and Engineering\par
    
    \vspace{1cm}
    
    \textbf{Department of Computer Science and Engineering}\par
    \textbf{Bangladesh University of Business and Technology}\par
    \textbf{July 2026}
\end{titlepage}
"""

if r'\begin{titlepage}' not in c:
    c = c.replace(r'\begin{document}', r'\begin{document}' + '\n' + cover_text)

# 3. Delete list of figures
c = c.replace(r'\listoffigures', '')
c = c.replace(r'\clearpage' + '\n' + r'\clearpage', r'\clearpage') # cleanup extra clearpages if any

# 4. Approval page edit
# delete external examiner name section and put prof. dr md ahsan habib in the middle
old_approval = r"""    \textbf{External Examiner Name} & \textbf{Prof. Dr. Md. Ahsan Habib} \\
    Member (External) & Convener \\
    Professor, CSE & Chairman, CSE \\
    Capstone Defense Board & Capstone Defense Board \\
    University Name & BUBT, Dhaka \\
\end{tabularx}"""

new_approval = r"""    \multicolumn{2}{c}{\textbf{Prof. Dr. Md. Ahsan Habib}} \\
    \multicolumn{2}{c}{Convener} \\
    \multicolumn{2}{c}{Chairman, CSE} \\
    \multicolumn{2}{c}{Capstone Defense Board} \\
    \multicolumn{2}{c}{BUBT, Dhaka} \\
\end{tabularx}"""

c = c.replace(old_approval, new_approval)

# The extra clearpage from listoffigures deletion
c = c.replace(r'\tableofcontents' + '\n' + r'\clearpage' + '\n' + r'\clearpage' + '\n' + r'\listoftables', r'\tableofcontents' + '\n' + r'\clearpage' + '\n' + r'\listoftables')


with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(c)

print("Applied user changes")
