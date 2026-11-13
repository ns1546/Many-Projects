const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.resolve('hostinger-deploy');

console.log('--- Step 1: Cleaning and preparing target directory ---');
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

console.log('--- Step 2: Copying standalone server files ---');
fs.cpSync('.next/standalone', targetDir, { recursive: true });

console.log('--- Step 3: Copying .next/static bundle ---');
const staticSrc = path.resolve('.next/static');
const staticDest = path.join(targetDir, '.next', 'static');
fs.cpSync(staticSrc, staticDest, { recursive: true });

console.log('--- Step 4: Ensuring public directory is fully included ---');
const publicSrc = path.resolve('public');
const publicDest = path.join(targetDir, 'public');
fs.cpSync(publicSrc, publicDest, { recursive: true });

console.log('--- Step 5: Generating production .env for evorisemedia.com ---');
const envPath = path.resolve('.env');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}
// Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL to evorisemedia.com
envContent = envContent.replace(/NEXTAUTH_URL=.*/g, 'NEXTAUTH_URL="https://evorisemedia.com"');
envContent = envContent.replace(/NEXT_PUBLIC_APP_URL=.*/g, 'NEXT_PUBLIC_APP_URL="https://evorisemedia.com"');
if (!envContent.includes('PORT=')) {
  envContent += '\nPORT=3000\nNODE_ENV=production\n';
}
fs.writeFileSync(path.join(targetDir, '.env'), envContent);

console.log('--- Step 6: Generating .htaccess for Hostinger Apache / LiteSpeed ---');
const htaccessContent = `# Hostinger LiteSpeed / Apache Reverse Proxy Configuration
DirectoryIndex disabled
RewriteEngine On

# Serve public static assets directly
RewriteCond %{DOCUMENT_ROOT}/public%{REQUEST_URI} -f
RewriteRule ^(.*)$ /public/$1 [L]

# Serve Next.js static chunks directly
RewriteCond %{DOCUMENT_ROOT}/.next/static%{REQUEST_URI} -f
RewriteRule ^_next/static/(.*)$ /.next/static/$1 [L]

# Reverse Proxy all web requests to local Node.js port 3000
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
`;
fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccessContent);

console.log('--- Step 7: Generating Hostinger Deployment Guide ---');
const readmeContent = `========================================================================
       EVORISE MEDIA - HOSTINGER DEPLOYMENT INSTRUCTIONS
========================================================================

এই ফোল্ডারে থাকা সমস্ত ফাইল ও ফোল্ডার সরাসরি Hostinger File Manager-এর
public_html ডিরেক্টরিতে আপলোড করার জন্য প্রস্তুত করা হয়েছে।

ফাইল ও ফোল্ডার স্ট্রাকচার:
├── .next/              (সার্ভার ও স্ট্যাটিক বান্ডেল)
├── node_modules/       (প্রয়োজনীয় লাইটওয়েট ডিপেন্ডেন্সিস)
├── public/             (ছবি, অডিও, আইকন ও মিডিয়া ফাইলস)
├── .env                (Supabase ডাটাবেজ ও evorisemedia.com সেটিংস)
├── .htaccess           (হোস্ট্রিঙ্গার রিভার্স প্রক্সি কনফিগ)
├── package.json        (স্টার্ট স্ক্রিপ্ট কনফিগারেশন)
└── server.js           (মেইন Node.js সার্ভার ফাইল)

------------------------------------------------------------------------
হোস্ট্রিঙ্গারে লাইভ করার সহজ ধাপ:
------------------------------------------------------------------------
ধাপ ১: ফাইল আপলোড
  ১. Hostinger hPanel-এ লগইন করে File Manager-এ যান।
  ২. domains/evorisemedia.com/public_html ফোল্ডারে যান।
  ৩. এই ফোল্ডারের ফাইলগুলো আপলোড করুন (অথবা hostinger-deploy.zip আপলোড করে Extract করুন)।

ধাপ ২: Node.js চালু করা (hPanel)
  ১. hPanel-এ বামপাশের মেনু থেকে 'Node.js' বা 'Advanced -> Node.js'-এ যান।
  ২. 'Create Application' (বা Add Application) নির্বাচন করুন:
     - Node.js Version: 20.x বা 22.x
     - Application Root: public_html
     - Application Startup File: server.js
     - Application Mode: Production
  ৩. 'Save' বাটনে ক্লিক করুন।

ধাপ ৩: অ্যাপ্লিকেশন স্টার্ট
  - 'Restart' বা 'Start' বাটনে চাপ দিন।
  - এবার https://evorisemedia.com ব্রাউজারে লোড করুন!
========================================================================
`;
fs.writeFileSync(path.join(targetDir, 'README_HOSTINGER.txt'), readmeContent);

console.log('--- Step 8: Creating hostinger-deploy.zip archive ---');
const zipPath = path.resolve('hostinger-deploy.zip');
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

try {
  // Use powershell Compress-Archive
  execSync(`powershell -Command "Compress-Archive -Path '${targetDir}/*' -DestinationPath '${zipPath}' -Force"`);
  console.log('SUCCESS: hostinger-deploy.zip created successfully!');
} catch (e) {
  console.error('Compress-Archive error (can still use hostinger-deploy folder):', e.message);
}

console.log('====================================================');
console.log('ALL HOSTINGER DEPLOYMENT ASSETS PREPARED IN:');
console.log('Folder: ' + targetDir);
console.log('Archive: ' + zipPath);
console.log('====================================================');

