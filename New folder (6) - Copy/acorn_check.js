const acorn = require('acorn');
const fs = require('fs');

const code = fs.readFileSync('temp.js', 'utf8');

try {
    acorn.parse(code, { ecmaVersion: 2020 });
    console.log("Valid syntax!");
} catch (e) {
    console.error(e.message);
}
