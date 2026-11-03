const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = 'G:\\Download Official';

console.log('1. Finding all nested .git folders to rename temporarily...');

let renamed = [];

function findAndRenameGit(dir, depth = 0) {
  if (depth > 5) return;
  try {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      if (item === '.git') {
        if (dir !== root) { // Don't rename root .git!
          const oldPath = path.join(dir, item);
          const newPath = path.join(dir, '.git_submodule_backup');
          try {
            fs.renameSync(oldPath, newPath);
            renamed.push({ oldPath, newPath });
          } catch(e) {
            console.warn('Could not rename:', oldPath, e.message);
          }
        }
        continue;
      }
      // Skip ignored dirs
      if (['node_modules', '.next', '.venv', 'venv', 'dist', 'build', 'cloned_repos', 'foundation_extract', 'bagisto', 'saleor'].includes(item)) continue;
      const full = path.join(dir, item);
      try {
        if (fs.statSync(full).isDirectory()) {
          findAndRenameGit(full, depth + 1);
        }
      } catch(e) {}
    }
  } catch(e) {}
}

findAndRenameGit(root);
console.log(`Renamed ${renamed.length} nested .git folders to .git_submodule_backup`);

try {
  console.log('2. Running git add . in G:\\Download Official...');
  execSync('git add .', { cwd: root, stdio: 'inherit' });
  console.log('✅ git add . completed successfully!');
} catch (err) {
  console.error('❌ Error during git add:', err.message);
} finally {
  console.log('3. Restoring all nested .git folders...');
  renamed.forEach(r => {
    try {
      if (fs.existsSync(r.newPath)) {
        fs.renameSync(r.newPath, r.oldPath);
      }
    } catch(e) {
      console.warn('Could not restore:', r.oldPath, e.message);
    }
  });
  console.log(`Restored ${renamed.length} nested .git folders.`);
}

