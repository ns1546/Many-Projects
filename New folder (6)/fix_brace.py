import codecs
import re

path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

pattern = r'(if \(state\.arrays\.editableTerms\) editableTerms = state\.arrays\.editableTerms;\s*\n\s*\})\s*\n\s*\}\s*\n\s*\} catch \(e\) \{\s*\n\s*console\.error\("Failed to load state", e\);\s*\n\s*\}\s*\n\s*\}\s*\n\s*// --- DRAFT MANAGEMENT ---'

replacement = r'''\1

                    if (state.inputs) {
                        Object.keys(state.inputs).forEach(id => {
                            const el = document.getElementById(id);
                            if (el) {
                                if (el.type === 'checkbox' || el.type === 'radio') {
                                    el.checked = state.inputs[id];
                                } else {
                                    el.value = state.inputs[id];
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error("Failed to load state", e);
                }
            }
        }
        // --- DRAFT MANAGEMENT ---'''

new_content, count = re.subn(pattern, replacement, content)

if count > 0:
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(new_content)
    print("Fixed via regex.")
else:
    print("Regex not matched!")
