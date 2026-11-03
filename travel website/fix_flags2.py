import re
content = open('index.html', 'r', encoding='utf-8').read()
content = re.sub(r'<i class="fas fa-plane"></i> 🇸🇦 Saudi Arabia Work Visas', '<i class="fas fa-plane"></i> ???? Saudi Arabia Work Visas', content)
content = re.sub(r'<i class="fas fa-plane"></i> 🇲🇻 Maldives Resort Jobs', '<i class="fas fa-plane"></i> ???? Maldives Resort Jobs', content)
content = re.sub(r'<i class="fas fa-plane"></i> 🇦🇪 Dubai Fast Processing', '<i class="fas fa-plane"></i> ???? Dubai Fast Processing', content)
content = re.sub(r'<i class="fas fa-plane"></i> 🇵🇹 Portugal D1 Visa Gateway', '<i class="fas fa-plane"></i> ???? Portugal D1 Visa Gateway', content)
content = re.sub(r'<i class="fas fa-plane"></i> 🇮🇳 Indian Medical &amp; Business Visas', '<i class="fas fa-plane"></i> ???? Indian Medical &amp; Business Visas', content)
content = re.sub(r'<i class="fas fa-plane"></i> 🇮🇳 Indian Medical & Business Visas', '<i class="fas fa-plane"></i> ???? Indian Medical & Business Visas', content)
open('index.html', 'w', encoding='utf-8').write(content)

