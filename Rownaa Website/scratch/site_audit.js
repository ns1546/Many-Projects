const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

console.log('==============================================');
console.log('         ROWNAA FULL PLATFORM AUDIT           ');
console.log('==============================================\n');

// 1. Check all linked local resources (scripts, styles, images)
console.log('--- 1. Checking Asset & Resource Links ---');
let missingAssets = 0;
htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('/socket.io/')) {
            const cleanSrc = src.split('?')[0].replace(/^\//, '');
            if (!fs.existsSync(cleanSrc)) {
                console.error(`[MISSING SCRIPT] in ${file}: "${src}" not found on disk!`);
                missingAssets++;
            }
        }
    });

    $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('//')) {
            const cleanHref = href.split('?')[0].replace(/^\//, '');
            if (!fs.existsSync(cleanHref)) {
                console.error(`[MISSING CSS] in ${file}: "${href}" not found on disk!`);
                missingAssets++;
            }
        }
    });

    $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
            const cleanSrc = src.split('?')[0].replace(/^\//, '');
            if (!fs.existsSync(cleanSrc)) {
                console.error(`[MISSING IMAGE] in ${file}: "${src}" not found on disk!`);
                missingAssets++;
            }
        }
    });
});

// 2. Check all Page-to-Page Navigation Links (<a> tags)
console.log('\n--- 2. Checking Page-to-Page Links (<a> hrefs) ---');
let brokenLinks = 0;
htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
            const cleanHref = href.split('?')[0].split('#')[0].replace(/^\//, '');
            if (cleanHref && !fs.existsSync(cleanHref)) {
                console.error(`[BROKEN 404 LINK] in ${file}: <a href="${href}"> points to non-existent file "${cleanHref}"!`);
                brokenLinks++;
            }
        }
    });
});

// 3. Check inline event handlers (onclick, onchange, etc.)
console.log('\n--- 3. Checking Inline Event Handlers ---');
const handlerRegex = /on[a-z]+="([^"]+)"/gi;
htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    let match;
    const handlers = [];
    while ((match = handlerRegex.exec(html)) !== null) {
        handlers.push(match[1]);
    }
    if (handlers.length > 0) {
        console.log(`${file} has ${handlers.length} inline event handlers (e.g. ${handlers.slice(0, 3).join(' | ')})`);
    }
});

// 4. Check for type="module" conflicts
console.log('\n--- 4. Checking type="module" vs Global Scopes ---');
htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);
    const moduleScripts = $('script[type="module"]').length;
    const normalScripts = $('script:not([type="module"])').length;
    console.log(`${file}: ${moduleScripts} module scripts, ${normalScripts} regular scripts`);
});

// 5. Inspect API endpoints called in client code
console.log('\n--- 5. API Endpoints Called in Frontend JS vs Express Routes ---');
const fetchRegex = /fetch\(\s*['"`]([^'"`]+)['"`]/g;
const clientEndpoints = new Set();
htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = fetchRegex.exec(html)) !== null) {
        clientEndpoints.add(`${file} -> ${match[1]}`);
    }
});
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join('js', file), 'utf8');
    let match;
    while ((match = fetchRegex.exec(content)) !== null) {
        clientEndpoints.add(`js/${file} -> ${match[1]}`);
    }
});
console.log('Discovered frontend fetch targets:');
Array.from(clientEndpoints).sort().forEach(ep => console.log('  ' + ep));

