const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/flex-shrink-0/g, 'shrink-0');
    content = content.replace(/max-w-screen-xl/g, 'max-w-7xl');
    content = content.replace(/bg-gradient-to-tr/g, 'bg-linear-to-tr');
    content = content.replace(/bg-gradient-to-r/g, 'bg-linear-to-r');
    content = content.replace(/aspect-\[4\/5\]/g, 'aspect-4/5');
    content = content.replace(/leading-\[1\.0\]/g, 'leading-none');
    content = content.replace(/leading-\[1\]/g, 'leading-none');
    content = content.replace(/max-w-\[1200px\]/g, 'max-w-300');
    content = content.replace(/min-w-\[260px\]/g, 'min-w-65');
    content = content.replace(/z-\[100\]/g, 'z-100');
    content = content.replace(/z-\[101\]/g, 'z-101');
    content = content.replace(/z-\[200\]/g, 'z-200');
    content = content.replace(/z-\[201\]/g, 'z-201');
    content = content.replace(/z-\[9999\]/g, 'z-9999');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next') continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'storefront'));
walkDir(path.join(__dirname, 'platform-admin'));
console.log("Done");
