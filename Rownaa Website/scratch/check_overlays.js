const fs = require('fs');
const css = fs.readFileSync('g:/Download Official/Rownaa Website/css/design.css', 'utf8');
const lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('position: fixed') || lines[i].includes('position: absolute')) {
    if (lines.slice(i, i+10).some(l => l.includes('100vh') || l.includes('100%') || l.includes('z-index: 999') || l.includes('inset: 0'))) {
      console.log(`Line ${i+1}:`, lines.slice(i, i+8).join('\n'));
      console.log('---');
    }
  }
}
