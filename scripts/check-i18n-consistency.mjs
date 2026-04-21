#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const TRANSLATIONS_PATH = path.join(ROOT, 'src', 'i18n', 'translations.ts');
const HI_GENERATED_UI_PATH = path.join(ROOT, 'src', 'i18n', 'hi-ui.generated.json');
const REQUIRED_LANGUAGES = ['en', 'es', 'pt', 'hi'];
const HI_LEGACY_UI_KEY_ALIASES = {
  'settings.notifications.streaks': 'settings.notifications.daily_streak',
  'settings.notifications.reengagement': 'settings.notifications.reactivation',
  'settings.notifications.note': 'settings.notifications.master',
};

const fail = (message) => {
  console.error(`\n[i18n-check] ${message}`);
  process.exit(1);
};

if (!fs.existsSync(TRANSLATIONS_PATH)) {
  fail(`Missing file: ${TRANSLATIONS_PATH}`);
}
const hiGenerated = fs.existsSync(HI_GENERATED_UI_PATH)
  ? JSON.parse(fs.readFileSync(HI_GENERATED_UI_PATH, 'utf8'))
  : {};
const hiGeneratedKeys = Object.keys(hiGenerated || {});

const sourceText = fs.readFileSync(TRANSLATIONS_PATH, 'utf8');
const sourceFile = ts.createSourceFile(
  TRANSLATIONS_PATH,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

const getName = (nameNode) => {
  if (!nameNode) return null;
  if (ts.isIdentifier(nameNode)) return nameNode.text;
  if (ts.isStringLiteralLike(nameNode)) return nameNode.text;
  return null;
};

const getObjectProperty = (obj, key) =>
  obj.properties.find((property) => getName(property.name) === key);

let uiTranslationsNode = null;
for (const statement of sourceFile.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    if (ts.isIdentifier(declaration.name) && declaration.name.text === 'UI_TRANSLATIONS') {
      if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
        uiTranslationsNode = declaration.initializer;
      }
    }
  }
}

if (!uiTranslationsNode) {
  fail('Could not locate UI_TRANSLATIONS object literal in translations.ts');
}

const keyMap = new Map();
for (const lang of REQUIRED_LANGUAGES) {
  const langProp = getObjectProperty(uiTranslationsNode, lang);
  if (!langProp || !ts.isPropertyAssignment(langProp)) {
    fail(`Language block "${lang}" is missing in UI_TRANSLATIONS`);
  }
  if (!ts.isObjectLiteralExpression(langProp.initializer)) {
    fail(`Language block "${lang}" is not an object literal`);
  }

  const keys = [];
  for (const property of langProp.initializer.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const keyName = getName(property.name);
    if (keyName) keys.push(keyName);
  }
  keyMap.set(lang, keys);
}

const baseKeys = new Set(keyMap.get('en'));
const errors = [];
const warnings = [];

for (const lang of REQUIRED_LANGUAGES) {
  const keys = keyMap.get(lang) || [];
  const normalizedKeys = lang === 'hi'
    ? [...keys.map((key) => HI_LEGACY_UI_KEY_ALIASES[key] || key), ...hiGeneratedKeys]
    : keys;
  const keySet = new Set(
    lang === 'hi'
      ? [...(keyMap.get('en') || []), ...normalizedKeys]
      : normalizedKeys
  );

  if (keySet.size !== normalizedKeys.length && lang !== 'hi') {
    warnings.push(`${lang}: duplicate UI keys detected`);
  }

  const missing = [...baseKeys].filter((key) => !keySet.has(key));
  const extras = [...keySet].filter((key) => !baseKeys.has(key));

  if (missing.length > 0) {
    errors.push(`${lang}: missing ${missing.length} keys (e.g. ${missing.slice(0, 8).join(', ')})`);
  }
  if (extras.length > 0) {
    errors.push(`${lang}: has ${extras.length} extra keys not in EN (e.g. ${extras.slice(0, 8).join(', ')})`);
  }
}

console.log('[i18n-check] UI translation key counts:');
for (const lang of REQUIRED_LANGUAGES) {
  const rawCount = (keyMap.get(lang) || []).length;
  const hiNormalizedKeys = [
    ...(keyMap.get('hi') || []).map((key) => HI_LEGACY_UI_KEY_ALIASES[key] || key),
    ...hiGeneratedKeys,
  ];
  const effectiveCount = lang === 'hi'
    ? new Set([...(keyMap.get('en') || []), ...hiNormalizedKeys]).size
    : rawCount;
  const suffix = lang === 'hi' && effectiveCount !== rawCount
    ? ` (effective ${effectiveCount} via generated map + EN fallback merge)`
    : '';
  console.log(`  - ${lang}: ${rawCount}${suffix}`);
}

for (const warning of warnings) {
  console.warn(`[i18n-check] warning: ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[i18n-check] error: ${error}`);
  }
  process.exit(1);
}

console.log('[i18n-check] Passed');
