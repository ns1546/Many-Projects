import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();
const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFolderName = `JKH_JESAN_BACKUP_${dateStr}`;
const backupParentDir = path.join(rootDir, 'project_backups');
const targetDir = path.join(backupParentDir, backupFolderName);
const zipFilePath = path.join(backupParentDir, `${backupFolderName}.zip`);

console.log(`[Backup System] Initializing backup to: ${targetDir}`);

if (!fs.existsSync(backupParentDir)) {
  fs.mkdirSync(backupParentDir, { recursive: true });
}

fs.mkdirSync(targetDir, { recursive: true });

// Helper to copy files/directories recursively with ignore list
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

// 1. DATABASE PART
console.log('[1/5] Extracting Database subsystem...');
const dbDir = path.join(targetDir, '01_DATABASE');
fs.mkdirSync(dbDir, { recursive: true });

copyRecursive(path.join(rootDir, 'prisma'), path.join(dbDir, 'prisma'));
copyRecursive(path.join(rootDir, 'backups'), path.join(dbDir, 'json_snapshots'));
copyRecursive(path.join(rootDir, 'scripts'), path.join(dbDir, 'db_scripts'));
if (fs.existsSync(path.join(rootDir, 'src', 'lib', 'prisma.ts'))) {
  copyRecursive(path.join(rootDir, 'src', 'lib', 'prisma.ts'), path.join(dbDir, 'client', 'prisma.ts'));
}
// Seed scripts from root if any
['seed-data.js', 'migrate-setting.js'].forEach(file => {
  if (fs.existsSync(path.join(rootDir, file))) {
    copyRecursive(path.join(rootDir, file), path.join(dbDir, 'db_scripts', file));
  }
});

fs.writeFileSync(
  path.join(dbDir, 'README.md'),
  `# Database Subsystem Backup
- **Prisma Schema & Migrations**: \`prisma/schema.prisma\`, \`prisma/seed.ts\`, \`prisma/dev.db\`
- **Database Snapshots**: \`json_snapshots/\` (Prisma JSON state dumps)
- **Database Scripts**: \`db_scripts/\` (Backup, Restore, Seeding, Migration)
- **Client Instance**: \`client/prisma.ts\` (Global Prisma Client Singleton)

## How to restore Database:
1. Ensure connection URL in \`.env\` (\`DATABASE_URL\` and \`DIRECT_URL\`).
2. Run \`npx prisma db push\` or \`npx prisma migrate dev\`.
3. To seed demo data: \`npx prisma db seed\` or \`node scripts/restore.js\`.
`
);

// 2. BACKEND PART
console.log('[2/5] Extracting Backend subsystem...');
const backendDir = path.join(targetDir, '02_BACKEND');
fs.mkdirSync(backendDir, { recursive: true });

copyRecursive(path.join(rootDir, 'src', 'app', 'api'), path.join(backendDir, 'api_routes'));
if (fs.existsSync(path.join(rootDir, 'middleware.ts'))) {
  copyRecursive(path.join(rootDir, 'middleware.ts'), path.join(backendDir, 'middleware.ts'));
}
copyRecursive(path.join(rootDir, 'src', 'lib'), path.join(backendDir, 'lib'));

fs.writeFileSync(
  path.join(backendDir, 'README.md'),
  `# Backend Subsystem Backup
- **API Routes**: \`api_routes/\` (Next.js App Router API handlers for Auth, Admin, Courses, Enrollments, Payments, Users, etc.)
- **Middleware**: \`middleware.ts\` (NextAuth session token gatekeeper & route protection)
- **Core Backend Services**: \`lib/\`
  - \`auth.ts\`: NextAuth configuration, credentials provider, token/session callbacks
  - \`mail.ts\`: SMTP / Resend email dispatcher
  - \`rate-limit.ts\`: API rate limiting helper
  - \`self-healing.ts\`: Automatic database repair & sync
  - \`prisma.ts\`: DB connection adapter
`
);

// 3. FRONTEND PART
console.log('[3/5] Extracting Frontend subsystem...');
const frontendDir = path.join(targetDir, '03_FRONTEND');
fs.mkdirSync(frontendDir, { recursive: true });

copyRecursive(path.join(rootDir, 'src', 'components'), path.join(frontendDir, 'components'));
copyRecursive(path.join(rootDir, 'src', 'hooks'), path.join(frontendDir, 'hooks'));
copyRecursive(path.join(rootDir, 'public'), path.join(frontendDir, 'public'));

// Copy app routes excluding api
const appPagesDir = path.join(frontendDir, 'app_pages');
fs.mkdirSync(appPagesDir, { recursive: true });
const appEntries = fs.readdirSync(path.join(rootDir, 'src', 'app'));
for (const entry of appEntries) {
  if (entry === 'api') continue;
  copyRecursive(path.join(rootDir, 'src', 'app', entry), path.join(appPagesDir, entry));
}

// Copy styles
const stylesDir = path.join(frontendDir, 'styles');
fs.mkdirSync(stylesDir, { recursive: true });
if (fs.existsSync(path.join(rootDir, 'src', 'app', 'globals.css'))) {
  copyRecursive(path.join(rootDir, 'src', 'app', 'globals.css'), path.join(stylesDir, 'globals.css'));
}
if (fs.existsSync(path.join(rootDir, 'src', 'app', 'mobile.css'))) {
  copyRecursive(path.join(rootDir, 'src', 'app', 'mobile.css'), path.join(stylesDir, 'mobile.css'));
}
if (fs.existsSync(path.join(rootDir, 'postcss.config.mjs'))) {
  copyRecursive(path.join(rootDir, 'postcss.config.mjs'), path.join(stylesDir, 'postcss.config.mjs'));
}

fs.writeFileSync(
  path.join(frontendDir, 'README.md'),
  `# Frontend Subsystem Backup
- **App Pages & Views**: \`app_pages/\` (Home, Auth, Courses, Admin, Dashboard, Checkout, Learn, Profile, FAQ, etc.)
- **UI Components**: \`components/\` (Navbars, Footers, Modals, Course Cards, Admin Analytics, Shadcn UI elements)
- **Custom Hooks**: \`hooks/\`
- **Styles**: \`styles/\` (Tailwind CSS tokens, mobile responsiveness, animations)
- **Public Assets**: \`public/\` (Static images, icons, logos, banners)
`
);

// 4. CONFIGS & DEVOPS
console.log('[4/5] Extracting Project Configurations...');
const configDir = path.join(targetDir, '04_PROJECT_CONFIGS');
fs.mkdirSync(configDir, { recursive: true });

const configFiles = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'next.config.ts',
  'components.json',
  'vercel.json',
  'eslint.config.mjs',
  'postcss.config.mjs',
  '.gitignore',
  'README.md',
  'DESIGN.md',
  'Enterprise_Audit_Report.md'
];

configFiles.forEach(file => {
  if (fs.existsSync(path.join(rootDir, file))) {
    copyRecursive(path.join(rootDir, file), path.join(configDir, file));
  }
});

// Create sanitized .env.example
if (fs.existsSync(path.join(rootDir, '.env'))) {
  const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
  // Copy original to config (for backup) and also sanitized example
  fs.writeFileSync(path.join(configDir, '.env.backup'), envContent);
  const sanitizedEnv = envContent
    .replace(/(DATABASE_URL=")[^"]+(")/, '$1postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB]$2')
    .replace(/(DIRECT_URL=")[^"]+(")/, '$1postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB]$2')
    .replace(/(NEXTAUTH_SECRET=")[^"]+(")/, '$1your-nextauth-secret-here$2');
  fs.writeFileSync(path.join(configDir, '.env.example'), sanitizedEnv);
}

// 5. COMPLETE RESTORABLE CODEBASE (CLEAN PRODUCTION SOURCE TREE)
console.log('[5/5] Extracting Full Restorable Codebase (Clean source tree without node_modules/.next/.git)...');
const restorableDir = path.join(targetDir, '05_FULL_RESTORABLE_CODEBASE');
fs.mkdirSync(restorableDir, { recursive: true });

const globalIgnores = [
  'node_modules',
  '.next',
  '.git',
  '.windsurf',
  'project_backups',
  'scratch',
  '.turbo',
  'dev.log',
  'tsconfig.tsbuildinfo'
];

copyRecursive(rootDir, restorableDir, globalIgnores);

// Backup Manifest
const manifestContent = `# JKH JESAN COURSE WEBSITE - COMPREHENSIVE ARCHIVE MANIFEST
**Backup Generated At**: ${new Date().toISOString()}
**Project**: JKH Jesan Music Academy / Online Course Platform
**Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Prisma ORM

## Structure of this Archive:
1. **01_DATABASE**: Prisma schema, seed script, SQLite dev db, database JSON snapshots, migration scripts, and Prisma singleton.
2. **02_BACKEND**: Next.js App Router API endpoints, NextAuth middleware, server utilities, email services, rate limiters, and self-healing DB mechanisms.
3. **03_FRONTEND**: UI Components, App Pages (Admin, Student, Course player, Auth, Checkout), custom hooks, CSS styles, and public media assets.
4. **04_PROJECT_CONFIGS**: Package configurations, TypeScript configs, Next.js config, Tailwind/PostCSS, Vercel deployment spec, and environment templates.
5. **05_FULL_RESTORABLE_CODEBASE**: Clean complete copy of the original project structure. Ready to launch with \`npm install && npm run dev\`.

## Quick Restoration:
1. Copy the contents of \`05_FULL_RESTORABLE_CODEBASE\` to your desired directory.
2. Copy \`04_PROJECT_CONFIGS/.env.backup\` to \`.env\`.
3. Run:
   \`\`\`bash
   npm install
   npx prisma generate
   npm run dev
   \`\`\`
`;

fs.writeFileSync(path.join(targetDir, 'README_BACKUP_MANIFEST.md'), manifestContent);

console.log('[Archive Creation] Compressing folder to ZIP...');

// Use PowerShell Compress-Archive for standard Windows zip compatibility
const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${targetDir}\\*' -DestinationPath '${zipFilePath}' -CompressionLevel Optimal -Force"`;
execSync(psCommand, { stdio: 'inherit' });

const zipStats = fs.statSync(zipFilePath);
const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);

console.log(`\n========================================`);
console.log(`SUCCESS! Archive created successfully.`);
console.log(`Target Folder: ${targetDir}`);
console.log(`ZIP Archive  : ${zipFilePath}`);
console.log(`ZIP File Size: ${zipSizeMB} MB`);
console.log(`========================================\n`);
