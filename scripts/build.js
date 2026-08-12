const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const publicFiles = [
  'index.html',
  '_headers',
  '_redirects',
  'favicon.svg',
  'site.webmanifest',
  'Credit repairkit.png',
  'credit-repair-negative-items.mp4',
  'credit-repair-negative-items-poster.jpg',
  'Credit repair playbook.png',
  'New Update on product image transparent.png',
  '20 credit dispute letters (1).png',
  'credit-template-preview.webp'
];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of publicFiles) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing public asset: ${file}`);
  }

  fs.copyFileSync(source, path.join(dist, file));
}

console.log(`Built ${publicFiles.length} public files into dist/`);
