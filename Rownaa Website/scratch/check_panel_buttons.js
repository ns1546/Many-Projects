const fs = require('fs');

['owner-panel.html', 'admin-panel.html', 'customer-panel.html'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const btnRegex = /<button\b([^>]*)>(.*?)<\/button>/gis;
  let m;
  const missing = [];
  while ((m = btnRegex.exec(content)) !== null) {
    const attrs = m[1];
    const oc = /onclick=["']([^"']+)["']/i.exec(attrs);
    if (oc) {
      const fn = /^([a-zA-Z0-9_$]+)\s*\(/.exec(oc[1]);
      if (fn) {
        const fnName = fn[1];
        const standard = ['alert', 'confirm', 'prompt', 'closeSlide', 'openSlide', 'switchTab'];
        if (!standard.includes(fnName)) {
          const hasDef = content.includes('function ' + fnName) || content.includes('window.' + fnName) || content.includes(fnName + ' =');
          if (!hasDef) missing.push({ fnName, code: oc[1] });
        }
      }
    }
  }
  console.log(`[${file}] Missing button functions:`, missing.length);
  missing.forEach(x => console.log(`  - ${x.fnName}: ${x.code}`));
});
