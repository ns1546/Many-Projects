import codecs

path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

firebase_scripts = """    <!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics-compat.js"></script>
</head>"""

# We accidentally replaced EVERY "</head>" with the firebase scripts.
# Let's revert all of them back to "</head>".
content = content.replace(firebase_scripts, "</head>")

# Now, we only replace the FIRST occurrence of "</head>"!
content = content.replace("</head>", firebase_scripts, 1)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Reverted multiple firebase scripts and applied only to the first head.")
