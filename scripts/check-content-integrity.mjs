#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const seasonalPath = path.join(CONTENT_DIR, 'seasonal.ts');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');

const parseIdSetFromFile = (filePath) => {
  const text = read(filePath);
  const ids = new Set();
  const regex = /\bid:\s*(\d+)\b/g;
  let match = regex.exec(text);
  while (match) {
    ids.add(Number(match[1]));
    match = regex.exec(text);
  }
  return ids;
};

const parseNumericArrayRefs = (text, key) => {
  const values = [];
  const regex = new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`, 'g');
  let match = regex.exec(text);
  while (match) {
    const nums = match[1]
      .split(',')
      .map((token) => Number(token.trim()))
      .filter((num) => Number.isFinite(num));
    values.push(...nums);
    match = regex.exec(text);
  }
  return values;
};

const parseGameRefs = (text) => {
  const values = [];
  const regex = /games\s*:\s*\[([^\]]*)\]/g;
  let match = regex.exec(text);
  while (match) {
    const tokens = match[1]
      .split(',')
      .map((token) => token.trim().replace(/^['"`]|['"`]$/g, ''))
      .filter(Boolean);
    values.push(...tokens);
    match = regex.exec(text);
  }
  return values;
};

const parseTruthOrDareIds = (text) => {
  const blockMatch = text.match(/const _TRUTH_OR_DARE_EN[\s\S]*?];/);
  if (!blockMatch) return [];
  const ids = [];
  const regex = /\bid:\s*(\d+)\b/g;
  let match = regex.exec(blockMatch[0]);
  while (match) {
    ids.push(Number(match[1]));
    match = regex.exec(blockMatch[0]);
  }
  return ids;
};

if (!fs.existsSync(seasonalPath)) {
  console.error(`[content-check] Missing ${seasonalPath}`);
  process.exit(1);
}

const positions = parseIdSetFromFile(path.join(CONTENT_DIR, 'positions.ts'));
const foreplay = parseIdSetFromFile(path.join(CONTENT_DIR, 'foreplay.ts'));
const oral = parseIdSetFromFile(path.join(CONTENT_DIR, 'oralplay.ts'));
const roleplay = parseIdSetFromFile(path.join(CONTENT_DIR, 'roleplay.ts'));
const seasonalText = read(seasonalPath);

const seasonalPositionRefs = parseNumericArrayRefs(seasonalText, 'positions');
const seasonalForeplayRefs = parseNumericArrayRefs(seasonalText, 'foreplay');
const seasonalOralRefs = parseNumericArrayRefs(seasonalText, 'oral');
const seasonalRoleplayRefs = parseNumericArrayRefs(seasonalText, 'roleplay');
const seasonalGameRefs = parseGameRefs(seasonalText);

const allowedGameRefs = new Set(['truth_or_dare', 'date_night', 'challenge', 'spin']);
const errors = [];

const findMissing = (refs, sourceSet) => refs.filter((id) => !sourceSet.has(id));
const missingPositions = [...new Set(findMissing(seasonalPositionRefs, positions))];
const missingForeplay = [...new Set(findMissing(seasonalForeplayRefs, foreplay))];
const missingOral = [...new Set(findMissing(seasonalOralRefs, oral))];
const missingRoleplay = [...new Set(findMissing(seasonalRoleplayRefs, roleplay))];
const invalidGames = [...new Set(seasonalGameRefs.filter((game) => !allowedGameRefs.has(game)))];

if (missingPositions.length) errors.push(`Missing seasonal position ids: ${missingPositions.join(', ')}`);
if (missingForeplay.length) errors.push(`Missing seasonal foreplay ids: ${missingForeplay.join(', ')}`);
if (missingOral.length) errors.push(`Missing seasonal oral ids: ${missingOral.join(', ')}`);
if (missingRoleplay.length) errors.push(`Missing seasonal roleplay ids: ${missingRoleplay.join(', ')}`);
if (invalidGames.length) errors.push(`Invalid seasonal game actions: ${invalidGames.join(', ')}`);

const truthOrDareIds = parseTruthOrDareIds(seasonalText);
if (truthOrDareIds.length === 0) {
  errors.push('Truth-or-Dare source block is empty or missing');
} else {
  const uniqueTruthIds = new Set(truthOrDareIds);
  if (uniqueTruthIds.size !== truthOrDareIds.length) {
    errors.push('Truth-or-Dare ids contain duplicates');
  }
}

console.log('[content-check] Summary');
console.log(`  - positions: ${positions.size}`);
console.log(`  - foreplay: ${foreplay.size}`);
console.log(`  - oral: ${oral.size}`);
console.log(`  - roleplay: ${roleplay.size}`);
console.log(`  - seasonal refs: positions=${seasonalPositionRefs.length}, foreplay=${seasonalForeplayRefs.length}, oral=${seasonalOralRefs.length}, roleplay=${seasonalRoleplayRefs.length}`);
console.log(`  - truth/dare prompts: ${truthOrDareIds.length}`);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[content-check] error: ${error}`);
  }
  process.exit(1);
}

console.log('[content-check] Passed');
