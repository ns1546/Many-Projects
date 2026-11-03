const fs = require('fs');
const css = fs.readFileSync('g:/Download Official/Rownaa Website/css/design.css', 'utf8');
const idx = css.indexOf('wizard');
console.log(css.substring(Math.max(0, idx - 150), Math.min(css.length, idx + 250)));
