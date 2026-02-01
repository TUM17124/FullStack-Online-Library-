const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src', '_redirects');
const dest = path.join(__dirname, 'dist', 'library-frontend', '_redirects');

fs.copyFileSync(src, dest);
console.log('_redirects copied to dist/library-frontend');
