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

const domMethods = new Set([
  'alert', 'confirm', 'prompt', 'open', 'close', 'print', 'scrollTo', 'fetch', 
  'parseInt', 'parseFloat', 'Boolean', 'Math', 'encodeURIComponent', 'setTimeout', 'setInterval',
  'getElementById', 'querySelector', 'querySelectorAll', 'toggle', 'preventDefault', 'getAttribute', 
  'setAttribute', 'replace', 'trim', 'split', 'includes', 'toUpperCase', 'toLowerCase', 'toLocaleString'
]);

let totalHandlers = 0;
let missingHandlers = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  const declaredFuncs = new Set(domMethods);
  const funcRegex = /(?:function\s+([a-zA-Z0-9_$]+)|window\.([a-zA-Z0-9_$]+)\s*=|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)|([a-zA-Z0-9_$]+)\s*:\s*function)/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const fn = match[1] || match[2] || match[3] || match[4];
    if (fn) declaredFuncs.add(fn);
  }

  fs.readdirSync('js').forEach(jsFile => {
    if (jsFile.endsWith('.js')) {
      const jsContent = fs.readFileSync('js/' + jsFile, 'utf8');
      while ((match = funcRegex.exec(jsContent)) !== null) {
        const fn = match[1] || match[2] || match[3] || match[4];
        if (fn) declaredFuncs.add(fn);
      }
    }
  });

  const callRegex = /on(?:click|change|keyup|submit)\s*=\s*["']([^"']+)["']/g;
  const missingInFile = [];

  while ((match = callRegex.exec(content)) !== null) {
    totalHandlers++;
    const code = match[1];
    const callNames = [...code.matchAll(/([a-zA-Z0-9_$]+)\s*\(/g)].map(m => m[1]);
    callNames.forEach(fn => {
      if (['if', 'else', 'for', 'while', 'switch', 'return', 'typeof', 'void'].includes(fn)) return;
      if (!declaredFuncs.has(fn)) {
        missingInFile.push({ fn, code });
      }
    });
  }

  if (missingInFile.length > 0) {
    missingHandlers += missingInFile.length;
    console.log(`[ALERT] ${file} has ${missingInFile.length} unverified function calls:`, missingInFile);
  } else {
    console.log(`[PERFECT PASS] ${file}: All handlers are verified.`);
  }
});

console.log(`\nFinal Audit: Verified ${totalHandlers} handlers across all files. Unresolved: ${missingHandlers}`);
