const fs = require('fs');

const files = [
  'driver-register.html',
  'netlify-driver-portal/index.html',
  'Rownaa-Frontend-Netlify/driver-register.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'id="desc-step-1">Enter your legal identity exactly as shown on your NID (Smart Card) and BRTA Driving License.</span>\n            </div>\n\n            <div class="f-group">',
    'id="desc-step-1">Enter your legal identity exactly as shown on your NID (Smart Card) and BRTA Driving License.</span>\n            </div>\n\n            <div class="grid-2">\n              <div class="f-group">'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed grid-2 in:', file);
});
