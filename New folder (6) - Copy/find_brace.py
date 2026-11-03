import codecs
import re

path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
s = scripts[0]

# Replace string contents with empty strings to avoid brace counting issues inside strings
# We must be careful not to strip `${...}` inside template literals if possible, but actually `${` doesn't affect balance if `}` is also inside the literal. Wait, if `${` has a `{` and `}`, they balance each other out! So stripping the whole literal is fine!
s = re.sub(r'"(?:\\.|[^\\"])*"', '""', s)
s = re.sub(r"'(?:\\.|[^\\'])*'", "''", s)
s = re.sub(r"`(?:\\.|[^\\`])*`", "``", s)
# Single line comments
s = re.sub(r'//.*', '', s)
# Multi line comments
s = re.sub(r'/\*.*?\*/', '', s, flags=re.DOTALL)

lines = s.split('\n')
stack = []
for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            stack.append(i+1)
        elif char == '}':
            if stack:
                stack.pop()
            else:
                print(f"Extra closing brace at line {i+1}")

print("Unclosed braces at lines:")
print(stack)
