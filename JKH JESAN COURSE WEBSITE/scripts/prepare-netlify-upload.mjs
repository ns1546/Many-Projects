import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();
const targetDir = path.join(rootDir, 'NETLIFY_UPLOAD');
const zipFilePath = path.join(rootDir, 'NETLIFY_UPLOAD.zip');

console.log('[Netlify Packager] Initializing Netlify deployment folder...');

// Remove old build folder and zip if existing
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
if (fs.existsSync(zipFilePath)) {
  fs.rmSync(zipFilePath, { force: true });
}

fs.mkdirSync(targetDir, { recursive: true });

function copyRecursive(src, dest, ignoreList = []) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    const baseName = path.basename(src);
    if (ignoreList.includes(baseName)) return;

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (ignoreList.includes(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry), ignoreList);
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

const ignoreList = [
  'node_modules',
  '.next',
  '.git',
  '.agents',
  '.windsurf',
  'project_backups',
  'backups',
  'scratch',
  'NETLIFY_UPLOAD',
  'NETLIFY_UPLOAD.zip',
  '.env.local',
  'sample.pdf',
  'dev.log',
  'tsconfig.tsbuildinfo'
];

console.log('[Netlify Packager] Copying codebase into NETLIFY_UPLOAD...');

// Copy root files and directories
const filesAndDirsToCopy = [
  'src',
  'public',
  'prisma',
  'scripts',
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'middleware.ts',
  'components.json',
  'netlify.toml',
  'eslint.config.mjs',
  '.env.netlify',
  'netlify-env-for-upload.txt',
  '.env.example'
];

for (const item of filesAndDirsToCopy) {
  const itemPath = path.join(rootDir, item);
  if (fs.existsSync(itemPath)) {
    copyRecursive(itemPath, path.join(targetDir, item), ignoreList);
  }
}

// Write deployment guide inside NETLIFY_UPLOAD
const guideContent = `# 🚀 EvoRise Media - Netlify Deployment Guide

এই ফোল্ডারটি (\`NETLIFY_UPLOAD\`) Netlify-তে Deploy করার জন্য সম্পূর্ণ প্রস্তুত করা হয়েছে।

---

## 📋 ধাপ ১: Environment Variables সেটআপ (বাধ্যতামূলক)

Netlify Dashboard এ আপনার সাইটে যান:
**Site configuration** ➡️ **Environment variables** ➡️ **Add a variable** (অথবা **Import from .env**):

\`netlify-env-for-upload.txt\` ফাইলে থাকা ভেরিয়েবলগুলো কপি করে পেস্ট করুন:
- \`DATABASE_URL\`
- \`DIRECT_URL\`
- \`NEXTAUTH_SECRET\`
- \`NEXTAUTH_URL\` (আপনার Netlify ডোমেইন যেমন: \`https://media.evorise.agency\` বা \`https://your-site.netlify.app\`)
- \`NEXT_PUBLIC_APP_URL\`
- \`GOOGLE_CLIENT_ID\` & \`GOOGLE_CLIENT_SECRET\`
- \`EMAIL_SERVER_*\` ক্রেডেনশিয়াল
- \`UDDOKTAPAY_*\` ক্রেডেনশিয়াল
- \`FACEBOOK_PIXEL_ID\`

---

## ⚡ ধাপ ২: Deploy করার সহজ উপায়

### উপায় ১: GitHub / Git রিপোজিটরি দিয়ে (Recommended)
1. এই ফোল্ডারের ফাইলগুলো আপনার GitHub রিপোজিটরিতে Push করুন।
2. Netlify-তে **Add new site** ➡️ **Import an existing project** ➡️ **GitHub** সিলেক্ট করুন।
3. Netlify স্বয়ংক্রিয়ভাবে \`netlify.toml\` ফাইল পড়ে বিল্ড কমান্ড এবং প্লাগইন সেট করে নেবে:
   - **Build command**: \`prisma generate && next build --webpack\`
   - **Publish directory**: \`.next\`
   - **Plugin**: \`@netlify/plugin-nextjs\` (Next.js 16 সার্ভারলেস ও এপিআই সাপোর্ট)

### উপায় ২: Netlify CLI দিয়ে এক ক্লিকে Deploy
কমান্ড প্রম্পট (PowerShell / Terminal) ওপেন করে এই ফোল্ডারে রান করুন:
\`\`\`bash
npx netlify deploy --build --prod
\`\`\`

---

✅ তৈরি সম্পন্ন!
`;

fs.writeFileSync(path.join(targetDir, 'README_NETLIFY_DEPLOY.md'), guideContent, 'utf-8');

console.log('[Netlify Packager] Creating NETLIFY_UPLOAD.zip archive...');
const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${targetDir}\\*' -DestinationPath '${zipFilePath}' -CompressionLevel Optimal -Force"`;
execSync(psCommand, { stdio: 'inherit' });

const stats = fs.statSync(zipFilePath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`\n========================================`);
console.log(`SUCCESS! Netlify Upload Folder & ZIP Ready.`);
console.log(`Folder Path: ${targetDir}`);
console.log(`ZIP File   : ${zipFilePath} (${sizeMB} MB)`);
console.log(`========================================\n`);
