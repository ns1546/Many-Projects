const fs = require('fs');

const files = [
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

console.log('=== 2. AUDITING ALL BUTTONS, INPUTS, FORMS, AND SELECTS ACROSS ALL FILES ===\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n--- Inspecting ${file} ---`);

  // 1. Buttons without onclick or type=submit
  const buttonRegex = /<button\b([^>]*)>(.*?)<\/button>/gis;
  let match;
  let unhandledButtons = [];
  while ((match = buttonRegex.exec(content)) !== null) {
    const attrs = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim().slice(0, 30);
    const hasOnClick = /onclick=/i.test(attrs);
    const isSubmit = /type=["']submit["']/i.test(attrs);
    const hasId = /id=["']([^"']+)["']/i.test(attrs);
    const id = hasId ? attrs.match(/id=["']([^"']+)["']/i)[1] : null;

    // Check if id is attached via addEventListener in script
    let hasListener = false;
    if (id) {
      const listenerRegex = new RegExp(`['"]#?${id}['"].*?addEventListener`, 'i');
      const getElemListener = new RegExp(`getElementById\\(['"]${id}['"]\\)\\.addEventListener`, 'i');
      hasListener = listenerRegex.test(content) || getElemListener.test(content);
    }

    if (!hasOnClick && !isSubmit && !hasListener) {
      unhandledButtons.push({ text, id, attrs: attrs.trim() });
    }
  }

  if (unhandledButtons.length > 0) {
    console.log(`[POTENTIAL UNHANDLED BUTTONS] (${unhandledButtons.length}):`);
    unhandledButtons.forEach(b => console.log(`   - text: "${b.text}", id: "${b.id}", attrs: ${b.attrs}`));
  } else {
    console.log(`[OK] All <button> elements have handlers or submit types.`);
  }

  // 2. Dead href="#" links without onclick
  const deadLinkRegex = /<a\b([^>]*href=["']#["'][^>]*)>(.*?)<\/a>/gis;
  let deadLinks = [];
  while ((match = deadLinkRegex.exec(content)) !== null) {
    const attrs = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim().slice(0, 30);
    if (!/onclick=/i.test(attrs)) {
      deadLinks.push({ text, attrs: attrs.trim() });
    }
  }
  if (deadLinks.length > 0) {
    console.log(`[DEAD HREF="#" LINKS WITHOUT ONCLICK] (${deadLinks.length}):`);
    deadLinks.forEach(l => console.log(`   - "${l.text}" attrs: ${l.attrs}`));
  } else {
    console.log(`[OK] No dead href="#" links.`);
  }

  // 3. Inputs / Selects with onchange or onkeyup
  const selects = [...content.matchAll(/<select\b([^>]*)>/gi)];
  let unhandledSelects = [];
  selects.forEach(s => {
    const attrs = s[1];
    const hasOnchange = /onchange=/i.test(attrs);
    const hasId = /id=["']([^"']+)["']/i.test(attrs);
    const id = hasId ? attrs.match(/id=["']([^"']+)["']/i)[1] : null;
    let hasListener = false;
    if (id) {
      const listenerRegex = new RegExp(`getElementById\\(['"]${id}['"]\\)\\.addEventListener`, 'i');
      hasListener = listenerRegex.test(content);
    }
    // If it's not in a form or has no change handler/id
    if (!hasOnchange && !hasListener && !hasId) {
      unhandledSelects.push(attrs.trim());
    }
  });
  if (unhandledSelects.length > 0) {
    console.log(`[POTENTIAL UNHANDLED <select>] (${unhandledSelects.length}):`, unhandledSelects);
  }
});
