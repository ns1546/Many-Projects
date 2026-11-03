import codecs
import re

path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
s = scripts[0]
print(f'Total backticks: {s.count("`")}')

lines = s.split('\n')
indent = 0
for i, line in enumerate(lines):
    indent += line.count('{') - line.count('}')
print(f'Final indent with all chars: {indent}')
