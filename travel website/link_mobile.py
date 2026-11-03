import os
files = ['index.html', 'contact.html', 'packages.html', 'visas.html']
for f in files:
    content = open(f, 'r', encoding='utf-8').read()
    if 'mobile.css' not in content:
        content = content.replace(
            '<link rel="stylesheet" href="style.css" />',
            '<link rel="stylesheet" href="style.css" />\n  <link rel="stylesheet" href="mobile.css" />'
        )
        open(f, 'w', encoding='utf-8').write(content)
        print(f'Linked mobile.css into {f}')
    else:
        print(f'{f} already has mobile.css')
