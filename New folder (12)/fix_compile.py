import re

with open('main.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix \item missing list environment
# A naive way: replace \item with a list. But there are multiple \item blocks.
# Let's wrap consecutive lines starting with \item in \begin{itemize} \end{itemize}

def wrap_items(text):
    lines = text.split('\n')
    in_list = False
    new_lines = []
    for line in lines:
        if line.startswith(r'\item '):
            if not in_list:
                new_lines.append(r'\begin{itemize}')
                in_list = True
            new_lines.append(line)
        else:
            if in_list:
                new_lines.append(r'\end{itemize}')
                in_list = False
            new_lines.append(line)
    if in_list:
        new_lines.append(r'\end{itemize}')
    return '\n'.join(new_lines)

# But wait, I added an itemize block in fix_main_tex.py manually for abbreviations:
# \begin{itemize}
#     \item \textbf{AI} - Artificial Intelligence
# Which has leading spaces!
# Let's refine the logic to ignore already wrapped \item or just temporarily unwrap them,
# or simply replace the literal `\item` that we introduced for `•` earlier.
# Wait, I did `text = text.replace('•', '\\item ')`
# Let's just fix it by replacing the unicode characters first.

# Unicode math characters to LaTeX math mode
unicode_map = {
    'ϵ': r'$\epsilon$',
    'δ': r'$\delta$',
    '−': r'$-$',
    'α': r'$\alpha$',
    'γ': r'$\gamma$',
    '∥': r'$\|$',
    'µ': r'$\mu$'
}

for char, latex_rep in unicode_map.items():
    content = content.replace(char, latex_rep)

# Now fix the lists.
# Let's remove the \begin{itemize} ... \end{itemize} we added for abbreviations, 
# then wrap ALL \item, then we are good.
content = content.replace(r'\begin{itemize}', '')
content = content.replace(r'\end{itemize}', '')

# Now wrap \item
lines = content.split('\n')
in_list = False
new_lines = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith(r'\item'):
        if not in_list:
            new_lines.append(r'\begin{itemize}')
            in_list = True
        new_lines.append(line)
    else:
        if in_list and stripped != '': # ignore empty lines inside lists
            new_lines.append(r'\end{itemize}')
            in_list = False
        if not (in_list and stripped == ''):
            new_lines.append(line)
if in_list:
    new_lines.append(r'\end{itemize}')

content = '\n'.join(new_lines)

with open('main.tex', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed items and unicode")
