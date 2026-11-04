const fs = require('fs');

const OLD_URL = 'https://script.google.com/macros/s/AKfycbz0S9TFcB-6fIqtGba095AZ8CJiYaQi_NLH3h-i0Dq1Yp3sqWDvfasxAJSLaVIidcgH/exec';
const NEW_URL = 'https://script.google.com/macros/s/AKfycbxv6GREV5g3rJz5Bo1OMKUGyGFh8UdLeAzkPtThvqdmbtAMzLUORcRxBjy4dIH18IvgXg/exec';

const files = [
  'driver-register.html',
  'netlify-driver-portal/index.html',
  'Rownaa-Frontend-Netlify/driver-register.html'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(OLD_URL)) {
    content = content.replaceAll(OLD_URL, NEW_URL);
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated DEFAULT_GOOGLE_SHEET_URL in', f);
  } else {
    console.log('OLD_URL not found in', f);
  }
});

