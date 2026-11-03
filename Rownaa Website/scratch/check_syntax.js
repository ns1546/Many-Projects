const fs = require('fs');

function testHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const scripts = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
  console.log(`Checking ${filePath} (${scripts ? scripts.length : 0} scripts)...`);
  
  if (!scripts) return;
  scripts.forEach((s, idx) => {
    const code = s.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
    try {
      new Function(code);
      console.log(`  Script ${idx}: VALID JS`);
    } catch (e) {
      console.error(`  Script ${idx}: ERROR -> ${e.message}`);
    }
  });
}

testHtml('driver-register.html');
testHtml('netlify-driver-portal/index.html');
