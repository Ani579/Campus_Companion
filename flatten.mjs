import fs from 'fs';
import path from 'path';

const oldDir = 'C:\\Users\\USER\\.gemini\\antigravity\\scratch\\campus-companion';
const newDir = 'C:\\Users\\USER\\.gemini\\antigravity\\scratch\\companion_campus';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'uploads') {
        arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(oldDir);

// 1. Copy all files to root
allFiles.forEach(filePath => {
  const fileName = path.basename(filePath);
  const dest = path.join(newDir, fileName);
  fs.copyFileSync(filePath, dest);
});

// 2. Rewrite contents
const newFiles = fs.readdirSync(newDir);
newFiles.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.html') || file.endsWith('.css')) {
    const filePath = path.join(newDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix HTML
    if (file === 'index.html') {
      content = content.replace('/src/main.jsx', '/main.jsx');
    }

    // Fix Tailwind config
    if (file === 'tailwind.config.js') {
      content = content.replace('./index.html', './index.html').replace('./src/**/*.{js,ts,jsx,tsx}', './*.{js,ts,jsx,tsx}');
    }

    // Rewrite JS/JSX imports
    // Matches: import X from './path/to/File' or import './path/to/File'
    content = content.replace(/from\s+['"](?:\.\/|\.\.\/)+.*?([^/]+)['"]/g, "from './$1'");
    content = content.replace(/import\s+['"](?:\.\/|\.\.\/)+.*?([^/]+)['"]/g, "import './$1'");

    // Specifically for server.js imports
    content = content.replace(/from\s+['"]\.\/routes\/([^/]+)['"]/g, "from './$1'");
    content = content.replace(/from\s+['"]\.\.\/models\/([^/]+)['"]/g, "from './$1'");
    content = content.replace(/from\s+['"]\.\.\/middleware\/([^/]+)['"]/g, "from './$1'");

    fs.writeFileSync(filePath, content);
  }
});
console.log('Flattening complete.');
