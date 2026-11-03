const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let totalFixed = 0;
htmlFiles.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace <script type="module" src="js/ with <script src="js/
    if (content.includes('<script type="module" src="js/')) {
        content = content.replace(/<script\s+type="module"\s+src="js\//g, '<script src="js/');
        fs.writeFileSync(fullPath, content);
        console.log(`[RESTORED] Synchronous scripts in ${file}`);
        totalFixed++;
    }
});
console.log(`Done. Updated ${totalFixed} HTML files.`);
