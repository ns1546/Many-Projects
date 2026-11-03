import re

with open('chapters_raw.tex', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Chapter X
# Chapter 1
# Introduction
# -> \chapter{Introduction}
text = re.sub(r'^Chapter \d+\n(.+)$', r'\\chapter{\1}', text, flags=re.MULTILINE)

# Replace x.y Section Name
# 1.1
# Problem Statement
# -> \section{Problem Statement}
text = re.sub(r'^\d+\.\d+\n(.+)$', r'\\section{\1}', text, flags=re.MULTILINE)

# Replace x.y.z Subsection Name
text = re.sub(r'^\d+\.\d+\.\d+\n(.+)$', r'\\subsection{\1}', text, flags=re.MULTILINE)

# Replace bullets (• -> \item)
# But it needs \begin{itemize} and \end{itemize}
# I will leave • as it is or replace it with \textbullet if needed, or better, we can manually fix lists later.
# For now, replace bullet points:
text = text.replace('•', '\\item')

# Let's save this as formatted.tex
with open('formatted.tex', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved to formatted.tex")
