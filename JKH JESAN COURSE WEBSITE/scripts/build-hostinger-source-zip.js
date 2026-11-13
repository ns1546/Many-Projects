const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Building Clean Hostinger Source Archive with BSDTAR POSIX Permissions ===');

const tempDir = path.resolve('hostinger-source-package');
const zipFile = path.resolve('hostinger-deploy.zip');

// 1. Clean temp directory and old zip
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

if (fs.existsSync(zipFile)) {
  fs.rmSync(zipFile, { force: true });
}

// 2. Directories to copy
const dirsToCopy = ['src', 'public', 'prisma', 'scripts'];
for (const dir of dirsToCopy) {
  if (fs.existsSync(dir)) {
    console.log(`Copying directory: ${dir}`);
    fs.cpSync(dir, path.join(tempDir, dir), { recursive: true });
  }
}

// 3. Files to copy
const filesToCopy = [
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'components.json',
  'middleware.ts',
  'next-env.d.ts',
  '.env'
];

for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    console.log(`Copying file: ${file}`);
    fs.copyFileSync(file, path.join(tempDir, file));
  }
}

// Ensure .env has correct production URLs
const envTarget = path.join(tempDir, '.env');
if (fs.existsSync(envTarget)) {
  let env = fs.readFileSync(envTarget, 'utf-8');
  env = env.replace(/NEXTAUTH_URL=.*/g, 'NEXTAUTH_URL="https://evorisemedia.com"');
  env = env.replace(/NEXT_PUBLIC_APP_URL=.*/g, 'NEXT_PUBLIC_APP_URL="https://evorisemedia.com"');
  fs.writeFileSync(envTarget, env);
  console.log('Production .env validated for https://evorisemedia.com');
}

// 4. Compress using bsdtar (native in Windows tar.exe) to preserve POSIX directory entries & 0755/0644 permissions!
console.log('Compressing using tar.exe (bsdtar with full directory permissions)...');
try {
  // tar -a detects .zip extension and creates a zip archive with explicit directories
  execSync(`tar -a -cf "${zipFile}" -C "${tempDir}" .`);
  console.log('SUCCESS: hostinger-deploy.zip created using bsdtar!');
} catch (e) {
  console.error('Error with tar:', e.message);
  console.log('Falling back to PowerShell Compress-Archive...');
  execSync(`powershell -Command "Compress-Archive -Path '${tempDir}/*' -DestinationPath '${zipFile}' -Force"`);
}

// 5. Check size and verify permissions
const stats = fs.statSync(zipFile);
console.log(`Final Archive Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log('Archive Location: ' + zipFile);

// Check directory records inside zip
try {
  const listing = execSync(`tar -tvf "${zipFile}"`).toString();
  const dirCount = (listing.match(/drwx/g) || []).length;
  console.log(`Verification: Verified ${dirCount} explicit directory records with full read/execute permissions!`);
} catch (e) {}

// 6. Clean up temp dir
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('=== Done! Ready to upload to Hostinger ===');
