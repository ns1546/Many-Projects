const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const destDir = path.join(rootDir, 'Rownaa-Frontend-Netlify');
const portalDir = path.join(rootDir, 'netlify-driver-portal');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
if (!fs.existsSync(portalDir)) fs.mkdirSync(portalDir, { recursive: true });

const htmlFiles = [
  'index.html',
  'find-cars.html',
  'checkout.html',
  'customer-panel.html',
  'owner-panel.html',
  'admin-panel.html',
  'driver-register.html',
  'owner-register.html',
  'register.html',
  'login.html',
  'login-sliding.html',
  'login-cinematic.html',
  'invoice.html'
];

htmlFiles.forEach(f => {
  const src = path.join(rootDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(destDir, f));
    console.log('Copied HTML to Rownaa-Frontend-Netlify:', f);
  }
});

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const srcPath = path.join(from, element);
    const destPath = path.join(to, element);
    const stat = fs.lstatSync(srcPath);
    if (stat.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyFolderSync(path.join(rootDir, 'assets'), path.join(destDir, 'assets'));
copyFolderSync(path.join(rootDir, 'shared'), path.join(destDir, 'shared'));
copyFolderSync(path.join(rootDir, 'css'), path.join(destDir, 'css'));
copyFolderSync(path.join(rootDir, 'js'), path.join(destDir, 'js'));

// Sync Driver Portal Standalone Folder
fs.copyFileSync(path.join(rootDir, 'driver-register.html'), path.join(portalDir, 'index.html'));
fs.copyFileSync(path.join(rootDir, 'google_sheet_webhook.gs'), path.join(portalDir, 'google_sheet_webhook.gs'));
console.log('Copied driver-register.html to netlify-driver-portal/index.html');
console.log('Copied google_sheet_webhook.gs to netlify-driver-portal/google_sheet_webhook.gs');

// Write _redirects & netlify.toml into Rownaa-Frontend-Netlify
fs.writeFileSync(path.join(destDir, '_redirects'), '/*  /index.html  200\n');

const netlifyToml = `[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;

fs.writeFileSync(path.join(destDir, 'netlify.toml'), netlifyToml);

// Also write top-level netlify.toml and _redirects in repository root
fs.writeFileSync(path.join(rootDir, 'netlify.toml'), netlifyToml);
fs.writeFileSync(path.join(rootDir, '_redirects'), '/*  /index.html  200\n');

console.log('✅ Rownaa-Frontend-Netlify and netlify-driver-portal successfully synchronized!');
