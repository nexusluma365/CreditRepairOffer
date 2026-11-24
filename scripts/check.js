// Syntax-checks every Netlify function and the inline <script> blocks in index.html.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const root = path.resolve(__dirname, '..');
const functionsDir = path.join(root, 'netlify', 'functions');
let failures = 0;

function check(file, label) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`ok   ${label}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${label}\n${String(error.stderr || error.message)}`);
  }
}

for (const name of fs.readdirSync(functionsDir).filter((f) => f.endsWith('.js')).sort()) {
  check(path.join(functionsDir, name), `netlify/functions/${name}`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)];
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'funnel-check-'));
scripts.forEach((match, index) => {
  const file = path.join(tmpDir, `inline-${index + 1}.js`);
  fs.writeFileSync(file, match[1]);
  check(file, `index.html inline script #${index + 1}`);
});
fs.rmSync(tmpDir, { recursive: true, force: true });

for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try { JSON.parse(match[1]); console.log('ok   index.html JSON-LD'); }
  catch (error) { failures += 1; console.error(`FAIL index.html JSON-LD: ${error.message}`); }
}

if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
