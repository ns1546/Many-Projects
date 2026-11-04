const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const p = content.indexOf('async function handleSubmit');
if (p !== -1) {
  console.log(content.slice(p, p + 3000));
} else {
  const p2 = content.indexOf('addEventListener(\'submit\'');
  console.log('addEventListener submit at:', p2);
  console.log(content.slice(p2, p2 + 2500));
}
