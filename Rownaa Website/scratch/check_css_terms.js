const fs = require('fs');
const files = ['css/design.css', 'css/pages.css', 'css/desktop.css', 'css/mobile.css'];
files.forEach(f => {
  if (fs.existsSync('g:/Download Official/Rownaa Website/' + f)) {
    const content = fs.readFileSync('g:/Download Official/Rownaa Website/' + f, 'utf8');
    ['wizard', 'w-card', 'w-step', 'w-form'].forEach(term => {
      const idx = content.indexOf(term);
      if (idx !== -1) {
        console.log(`Found ${term} in ${f} at index ${idx}`);
      }
    });
  }
});
