import fs from 'node:fs';

const files = [
  ['Spanish generated content', 'src/i18n/content/es.generated.json', /[\u0900-\u097F]/],
  ['Portuguese generated content', 'src/i18n/content/pt.generated.json', /[\u0900-\u097F]/],
];

let failed = false;

for (const [label, path, forbiddenPattern] of files) {
  const raw = fs.readFileSync(path, 'utf8');
  if (forbiddenPattern.test(raw)) {
    console.error(`[content-language-audit] ${label} contains Devanagari/Hindi characters: ${path}`);
    failed = true;
  } else {
    console.log(`[content-language-audit] OK: ${label}`);
  }
}

const app = fs.readFileSync('App.tsx', 'utf8');

const rawAppLeakPatterns = [
  />Play<\/Text>/,
  /label:\s*['"]Play['"]/,
  />Position of the Day/,
  />Why Blisse/,
  /category\.toUpperCase\(\)/,
  /difficulty\.toUpperCase\(\)/,
];

for (const pattern of rawAppLeakPatterns) {
  if (pattern.test(app)) {
    console.error(`[content-language-audit] App.tsx has raw localization leak pattern: ${pattern}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('[content-language-audit] Passed.');
