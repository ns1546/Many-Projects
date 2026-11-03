import os
with open("Dashboard/index.html", "r", encoding="utf-8") as f:
    html = f.read()

out = f'const char dashboard_html[] PROGMEM = R"rawliteral(\n{html}\n)rawliteral";\n'

with open("dashboard.h", "w", encoding="utf-8") as f:
    f.write(out)
