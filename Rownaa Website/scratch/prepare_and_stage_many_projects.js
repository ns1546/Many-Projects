const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = 'G:\\Download Official';

const subGits = [
  'JKH JESAN COURSE WEBSITE',
  'New folder (14)',
  'New folder (16)',
  'NS-Antigravity-Zone-2.0',
  'Rownaa Website'
];

console.log('1. Setting Git user and postBuffer config...');
execSync('git config user.name "ns1546"', { cwd: root });
execSync('git config user.email "nstasin81@gmail.com"', { cwd: root });
execSync('git config http.postBuffer 524288000', { cwd: root });

try {
  execSync('git remote add origin https://github.com/ns1546/Many-Projects.git', { cwd: root });
  console.log('Added remote origin: https://github.com/ns1546/Many-Projects.git');
} catch (e) {
  execSync('git remote set-url origin https://github.com/ns1546/Many-Projects.git', { cwd: root });
  console.log('Set existing remote origin: https://github.com/ns1546/Many-Projects.git');
}

console.log('2. Temporarily renaming nested .git folders to include full source code...');
subGits.forEach(sg => {
  const oldPath = path.join(root, sg, '.git');
  const newPath = path.join(root, sg, '.git_submodule_backup');
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${sg}/.git -> .git_submodule_backup`);
  }
});

try {
  console.log('3. Staging all projects via git add . (this may take a minute)...');
  execSync('git add .', { cwd: root, stdio: 'inherit' });
  console.log('✅ git add . completed successfully!');
} catch (err) {
  console.error('Error during git add:', err.message);
} finally {
  console.log('4. Restoring original .git folders in all subprojects...');
  subGits.forEach(sg => {
    const oldPath = path.join(root, sg, '.git_submodule_backup');
    const newPath = path.join(root, sg, '.git');
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Restored: ${sg}/.git`);
    }
  });
}

console.log('All nested .git folders restored. Check complete.');

