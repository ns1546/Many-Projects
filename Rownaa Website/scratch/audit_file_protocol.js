const fs = require('fs');
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rootHrefs = [];
  const hrefReg = /href=["'](\/[^"']+)["']/g;
  let m;
  while ((m = hrefReg.exec(content)) !== null) {
    if (!m[1].startsWith('//')) rootHrefs.push(m[1]);
  }
  const rootSrcs = [];
  const srcReg = /src=["'](\/[^"']+)["']/g;
  while ((m = srcReg.exec(content)) !== null) {
    if (!m[1].startsWith('//')) rootSrcs.push(m[1]);
  }
  if (rootHrefs.length > 0 || rootSrcs.length > 0) {
    console.log(file, 'Root hrefs:', rootHrefs, 'Root srcs:', rootSrcs);
  }
});

