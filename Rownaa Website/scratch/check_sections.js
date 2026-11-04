const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
console.log('index.html total lines:', lines.length);

const idxServices = lines.findIndex(l => l.includes('id="services"'));
const idxProcess = lines.findIndex(l => l.includes('id="how-it-works"'));
console.log('Services at line:', idxServices, 'Process at line:', idxProcess);
