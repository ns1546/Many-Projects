const fs = require('fs');
const css = fs.readFileSync('g:/Download Official/Rownaa Website/css/design.css', 'utf8');
// Check unclosed braces
let depth = 0;
let inComment = false;
let lines = css.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (inComment) {
      if (line[j] === '*' && line[j+1] === '/') { inComment = false; j++; }
    } else {
      if (line[j] === '/' && line[j+1] === '*') { inComment = true; j++; }
      else if (line[j] === '{') depth++;
      else if (line[j] === '}') depth--;
    }
  }
}
console.log('CSS final brace depth:', depth);
