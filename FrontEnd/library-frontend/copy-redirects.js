const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src', '_redirects');
const destDir = path.join(__dirname, 'dist', 'library-frontend');
const dest = path.join(destDir, '_redirects');

if (!fs.existsSync(src)) {
  console.error('❌ src/_redirects NOT FOUND');
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);

console.log('✅ _redirects copied to dist/library-frontend');
