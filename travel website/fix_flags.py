import re
content = open('index.html', 'r', encoding='utf-8').read()
content = content.replace('🇸🇦', '????')
content = content.replace('🇲🇻', '????')
content = content.replace('🇦🇪', '????')
content = content.replace('🇵🇹', '????')
content = content.replace('🇮🇳', '????')
open('index.html', 'w', encoding='utf-8').write(content)

