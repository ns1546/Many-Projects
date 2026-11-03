const acorn = require('acorn');
const fs = require('fs');

let code = fs.readFileSync('temp.js', 'utf8');

// The file has a lot of functions. We'll iteratively remove the last function from the file 
// until it parses successfully (or we see a different error).
const lines = code.split('\n');

for (let i = lines.length; i > 0; i -= 10) {
    const chunk = lines.slice(0, i).join('\n') + "\n});";
    try {
        acorn.parse(chunk, { ecmaVersion: 2020 });
        console.log("Success with lines up to " + i);
        break;
    } catch (e) {
        if (!e.message.includes('Unexpected token')) {
            console.log(`Different error at line ${i}: ${e.message}`);
        }
    }
}
