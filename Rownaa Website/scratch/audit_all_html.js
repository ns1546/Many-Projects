const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const results = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all fetch calls in inline scripts
  const fetches = (content.match(/fetch\s*\(/g) || []).length;
  const catches = (content.match(/\.catch\s*\(/g) || []).length;
  const tryCatches = (content.match(/try\s*\{/g) || []).length;
  
  // Check empty onclick
  const emptyOnclicks = (content.match(/onclick=["']\s*["']/g) || []).length;
  
  // Check buttons
  const btnMatches = content.match(/<button[^>]*>/gi) || [];
  let unhandledBtns = 0;
  btnMatches.forEach(b => {
    if (!b.includes('onclick') && !b.includes('type="submit"') && !b.includes('type=\'submit\'') && !b.includes('id=') && !b.includes('class=')) {
      unhandledBtns++;
    }
  });

  results.push({ file, fetches, catches, tryCatches, emptyOnclicks, unhandledBtns });
});

console.table(results);
