import re

with open('extracted_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Find Chapter 1 start
start_idx = text.find('Chapter 1\n')
# Find Chapter 4 start (or end of Chapter 3)
end_idx = text.find('Chapter 4\n')
if end_idx == -1:
    end_idx = len(text)

content = text[start_idx:end_idx]

# Remove page markers
content = re.sub(r'--- PAGE \d+ ---\n+', '', content)
# Remove page numbers on solitary lines
content = re.sub(r'^\d+$\n', '', content, flags=re.MULTILINE)

# Basic heuristic to join lines:
# If a line does not end with a period, colon, or newline, and the next line starts with a lowercase letter, join them.
lines = content.split('\n')
new_lines = []
i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line:
        new_lines.append('')
        i += 1
        continue
    
    # while it's a continuing sentence
    while i + 1 < len(lines) and lines[i+1].strip() and not line.endswith(('.', ':', '?', '!')) and (lines[i+1].strip()[0].islower() or lines[i+1].strip()[0].isdigit() or lines[i+1].strip().startswith('(') or lines[i+1].strip().startswith('[')):
        line += ' ' + lines[i+1].strip()
        i += 1
        
    new_lines.append(line)
    i += 1

# Re-join
processed = '\n'.join(new_lines)

# Further cleanup of multiple empty lines
processed = re.sub(r'\n{3,}', '\n\n', processed)

with open('chapters_raw.tex', 'w', encoding='utf-8') as f:
    f.write(processed)
print("Saved to chapters_raw.tex")
