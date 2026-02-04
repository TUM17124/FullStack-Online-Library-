const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src', '_redirects');
const destDir = path.join(__dirname, 'dist', 'library-frontend');
const dest = path.join(destDir, '_redirects');

console.log('Looking for _redirects at:', src);

if (fs.existsSync(src)) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log('Created dist/library-frontend directory');
  }
  fs.copyFileSync(src, dest);
  console.log('_redirects copied to dist/library-frontend');
} else {
  console.warn('No _redirects file found in src/. Skipping copy.');
}