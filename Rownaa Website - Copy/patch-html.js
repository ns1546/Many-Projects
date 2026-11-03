const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Replace <script src=" with <script type="module" src="
    content = content.replace(/<script\s+src="/g, '<script type="module" src="');
    fs.writeFileSync(path.join(dir, file), content);
    console.log(`Patched ${file}`);
});
console.log('All HTML files patched for Vite modules.');
