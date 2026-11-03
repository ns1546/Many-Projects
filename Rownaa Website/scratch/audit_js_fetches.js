const fs = require('fs');

fs.readdirSync('js').forEach(f => {
  const c = fs.readFileSync('js/' + f, 'utf8');
  const fetches = [];
  const reg = /fetch\(["']([^"']+)["']/g;
  let m;
  while ((m = reg.exec(c)) !== null) {
    fetches.push(m[1]);
  }
  if (fetches.length > 0) {
    const hasFileCheck = c.includes("protocol !== 'file:'") || c.includes('protocol === "file:"') || c.includes("protocol === 'file:'");
    console.log(f, 'hasFileCheck:', hasFileCheck, 'fetches:', [...new Set(fetches)]);
  }
});

