const fs = require('fs');
const content = fs.readFileSync('EvoRise Document Generator - EvoRise Solutions.html', 'utf8');

const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    const code = scriptMatch[1];
    try {
        new Function(code);
        console.log("Syntax is valid!");
    } catch (e) {
        console.error(e.message);
        // Node's new Function doesn't always give a perfect line number if it's missing a closing brace at EOF. 
        // But let's see what it says!
    }
}
