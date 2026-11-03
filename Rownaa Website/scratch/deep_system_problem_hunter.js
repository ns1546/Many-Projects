const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = [
  'index.html',
  'fleet.html',
  'services.html',
  'pricing.html',
  'about.html',
  'contact.html',
  'booking.html',
  'portal.html',
  'customer-panel.html',
  'owner-panel.html',
  'admin-panel.html',
  'checkout.html',
  'find-cars.html',
  'login.html',
  'login-sliding.html',
  'register.html',
  'owner-register.html',
  'invoice.html'
].filter(f => fs.existsSync(path.join(rootDir, f)));

console.log('--- STARTING FORENSIC DEEP-DIVE AUDIT ---');
console.log('Auditing HTML files count:', htmlFiles.length);

const deadButtons = [];
const unboundSelects = [];
const unboundInputs = [];
const onclickUndefinedChecks = [];

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract all script contents in this file to verify defined functions
  const scriptRegex = /<script\b[^>]*>(.*?)<\/script>/gis;
  let scriptContent = '';
  let sm;
  while ((sm = scriptRegex.exec(content)) !== null) {
    scriptContent += '\n' + sm[1];
  }

  // 1. Audit Buttons
  const buttonRegex = /<button\b([^>]*)>(.*?)<\/button>/gis;
  let m;
  while ((m = buttonRegex.exec(content)) !== null) {
    const attrs = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim() || 'Icon/Blank';
    const hasOnClick = /onclick=["']([^"']+)["']/i.exec(attrs);
    const hasId = /id=["']([^"']+)["']/i.exec(attrs);
    const isSubmit = /type=["']submit["']/i.test(attrs);
    const hasClass = /class=["']([^"']+)["']/i.exec(attrs);

    // If button has an id, check if JS references it
    let idHandled = false;
    if (hasId) {
      const id = hasId[1];
      const idRef = new RegExp(`['"]#?${id}['"]`, 'g');
      if (idRef.test(scriptContent)) {
        idHandled = true;
      }
    }

    if (!hasOnClick && !isSubmit && !idHandled) {
      deadButtons.push({ file, text, id: hasId ? hasId[1] : null, class: hasClass ? hasClass[1] : null, attrs: attrs.trim() });
    }

    // If button has onclick, verify function existence if direct function call
    if (hasOnClick) {
      const code = hasOnClick[1].trim();
      const fnMatch = /^([a-zA-Z0-9_$]+)\s*\(/.exec(code);
      if (fnMatch) {
        const fnName = fnMatch[1];
        // Check if function name is defined in scripts or common browser APIs
        const standardFns = ['alert', 'confirm', 'prompt', 'open', 'close', 'print', 'history', 'location', 'switchTab', 'toggleFilter', 'closeModal'];
        if (!standardFns.includes(fnName)) {
          const fnDefRegex = new RegExp(`function\\s+${fnName}\\b|window\\.${fnName}\\s*=|const\\s+${fnName}\\s*=|let\\s+${fnName}\\s*=|var\\s+${fnName}\\s*=`);
          if (!fnDefRegex.test(scriptContent)) {
            onclickUndefinedChecks.push({ file, fnName, code });
          }
        }
      }
    }
  }

  // 2. Audit Selects
  const selectRegex = /<select\b([^>]*)>(.*?)<\/select>/gis;
  while ((m = selectRegex.exec(content)) !== null) {
    const attrs = m[1];
    const hasOnChange = /onchange=/i.test(attrs);
    const hasId = /id=["']([^"']+)["']/i.exec(attrs);
    let handled = false;
    if (hasId) {
      const id = hasId[1];
      const idRef = new RegExp(`['"]#?${id}['"]`, 'g');
      if (idRef.test(scriptContent)) handled = true;
    }
    if (!hasOnChange && !handled) {
      unboundSelects.push({ file, id: hasId ? hasId[1] : 'NO_ID', attrs: attrs.trim() });
    }
  }
});

console.log('\n--- FINDINGS ---');
console.log('1. Dead Buttons without handler or submit or JS listener:', deadButtons.length);
deadButtons.forEach(b => console.log(`  - [${b.file}] "${b.text}" (id: ${b.id}, class: ${b.class})`));

console.log('\n2. OnClick calls to functions that might be missing locally:', onclickUndefinedChecks.length);
onclickUndefinedChecks.forEach(o => console.log(`  - [${o.file}] function: ${o.fnName} (code: ${o.code})`));

console.log('\n3. Unbound Selects:', unboundSelects.length);
unboundSelects.forEach(s => console.log(`  - [${s.file}] id: ${s.id}`));
