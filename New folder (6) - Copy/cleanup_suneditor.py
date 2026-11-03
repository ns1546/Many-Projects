import codecs
import re

path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# The injected suneditor blocks are typically huge single lines or easily matched if we use regex.
# They look like: <div class="sun-editor" id="suneditor_live-review-editor" ... > ... </div>
# But parsing html with regex is risky. Let's look at the lines:
lines = content.split('\n')
new_lines = []
for i, line in enumerate(lines):
    if 'id="suneditor_live-review-editor"' in line or 'id="suneditor_live-review-editor-agreement"' in line:
        print(f"Removing line {i+1} with length {len(line)}")
        continue
    new_lines.append(line)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write('\n'.join(new_lines))
print("Cleanup complete.")
