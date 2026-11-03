import re
content = open('index.html', 'r', encoding='utf-8').read()
content = re.sub(r'<span><i class="fas fa-plane"></i>[^<]*?Global Flight Ticketing</span>', '<span><i class="fas fa-plane"></i> Global Flight Ticketing</span>', content)
open('index.html', 'w', encoding='utf-8').write(content)

