const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = [
    'index.html',
    'owner-panel.html',
    'customer-panel.html',
    'admin-panel.html',
    'checkout.html',
    'find-cars.html',
    'login-sliding.html',
    'login.html',
    'register.html',
    'owner-register.html',
    'invoice.html'
];

htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
    const deadLinkRegex = /<a\b([^>]*href=["']#["'][^>]*)>(.*?)<\/a>/gis;
    let match;
    while ((match = deadLinkRegex.exec(content)) !== null) {
        const attrs = match[1];
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        if (!/onclick=/i.test(attrs)) {
            console.log(`[DEAD LINK] in ${file}: text="${text}" attrs="${attrs}"`);
        }
    }

    const imgRegex = /<img\b([^>]*)>/gi;
    while ((match = imgRegex.exec(content)) !== null) {
        const attrs = match[1];
        if (!/alt=/i.test(attrs)) {
            console.log(`[MISSING ALT] in ${file}: attrs="${attrs}"`);
        }
    }
});

// Check mobile nav
const customerHtml = fs.readFileSync(path.join(rootDir, 'customer-panel.html'), 'utf8');
const ownerHtml = fs.readFileSync(path.join(rootDir, 'owner-panel.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(rootDir, 'admin-panel.html'), 'utf8');

console.log('customer has mobile-nav?', customerHtml.includes('mobile-nav') || customerHtml.includes('mobile-bottom-nav'));
console.log('owner has mobile-nav?', ownerHtml.includes('mobile-nav') || ownerHtml.includes('mobile-bottom-nav'));
console.log('admin has mobile-nav?', adminHtml.includes('mobile-nav') || adminHtml.includes('mobile-bottom-nav'));
