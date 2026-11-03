const fs = require('fs');
const content = fs.readFileSync('EvoRise Document Generator - EvoRise Solutions.html', 'utf8');

const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    const code = scriptMatch[1];
    fs.writeFileSync('temp.js', code);
}
