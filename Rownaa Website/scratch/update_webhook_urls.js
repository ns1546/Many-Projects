const fs = require('fs');

const NEW_URL = 'https://script.google.com/macros/s/AKfycbz0S9TFcB-6fIqtGba095AZ8CJiYaQi_NLH3h-i0Dq1Yp3sqWDvfasxAJSLaVIidcgH/exec';

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping (not found):', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const targetPattern = /const DEFAULT_GOOGLE_SHEET_URL = '[^']+';/;
  if (targetPattern.test(content)) {
    content = content.replace(targetPattern, "const DEFAULT_GOOGLE_SHEET_URL = '" + NEW_URL + "';");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated URL in:', filePath);
  } else {
    console.log('Pattern not found in:', filePath);
  }
}

updateFile('driver-register.html');
updateFile('netlify-driver-portal/index.html');
updateFile('Rownaa-Frontend-Netlify/driver-register.html');

