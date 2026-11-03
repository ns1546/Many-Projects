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

const jsFiles = fs.readdirSync('js').filter(j => j.endsWith('.js'));
const allJsContent = jsFiles.map(jf => fs.readFileSync('js/' + jf, 'utf8')).join('\n');

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const onclicks = [...content.matchAll(/onclick=["']([a-zA-Z0-9_]+)\s*\(/g)].map(m => m[1]);
  const uniqueHandlers = [...new Set(onclicks)];
  
  const missing = [];
  uniqueHandlers.forEach(h => {
    if (['alert', 'confirm', 'prompt', 'print'].includes(h)) return;
    const isDefInHtml = content.includes('function ' + h) || content.includes(h + ' = function') || content.includes('window.' + h) || content.includes(h + ': function') || content.includes(h + '(');
    const isDefInJs = allJsContent.includes('function ' + h) || allJsContent.includes(h + ' = function') || allJsContent.includes('window.' + h) || allJsContent.includes(h + ': function');
    if (!isDefInHtml && !isDefInJs) {
      missing.push(h);
    }
  });

  if (missing.length > 0) {
    console.log(`[UNDEFINED ONCLICK] in ${f}:`, missing);
  } else {
    console.log(`[OK] ${f}: All ${uniqueHandlers.length} onclick handlers defined.`);
  }
});
