import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const ROOT = process.cwd();
const nodeRequire = createRequire(import.meta.url);
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const OUTPUT_DIR = path.join(ROOT, 'src', 'i18n', 'content');
const CACHE_FILE = path.join(OUTPUT_DIR, '.translation-cache.json');
const SPLIT_TOKEN = '|||BLISSE_SPLIT|||';
const BATCH_SIZE = 14;
const RETRY_LIMIT = 4;
const RETRY_DELAY_MS = 700;

const LANGUAGES = [
  { key: 'es', target: 'es' },
  { key: 'pt', target: 'pt-BR' },
  { key: 'hi', target: 'hi' },
];

const SOURCE_FILES = [
  { file: 'positions.ts', exportName: 'positions', type: 'positions' },
  { file: 'foreplay.ts', exportName: 'foreplayIdeas', type: 'foreplay' },
  { file: 'oralplay.ts', exportName: 'oralPlayIdeas', type: 'oral' },
  { file: 'massage.ts', exportName: 'massageTechniques', type: 'massage' },
  { file: 'roleplay.ts', exportName: 'rolePlayScenarios', type: 'roleplay' },
];

const FIELDS_TO_TRANSLATE = {
  positions: ['name', 'vibe', 'description', 'howTo', 'whyItWorks', 'tips', 'pairsWellWith', 'goodFor'],
  foreplay: ['name', 'vibe', 'description', 'howTo', 'tips', 'pairsWellWith'],
  oral: ['name', 'vibe', 'description', 'howTo', 'tips', 'pairsWellWith'],
  massage: ['name', 'vibe', 'description', 'howTo', 'tips', 'pairsWellWith', 'bodyArea'],
  roleplay: ['name', 'vibe', 'description', 'setup', 'howToPlay', 'tips', 'pairsWellWith'],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runTsModule = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
      esModuleInterop: true,
    },
    fileName: path.basename(filePath),
  }).outputText;

  const moduleRef = { exports: {} };
  const sandbox = {
    module: moduleRef,
    exports: moduleRef.exports,
    require: nodeRequire,
    __filename: filePath,
    __dirname: path.dirname(filePath),
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(transpiled, sandbox, { filename: filePath });
  return sandbox.module.exports;
};

const normalizeValue = (value) => (value || '').toString().replace(/\s+/g, ' ').trim();

const extractStrings = (contentByType) => {
  const values = new Set();
  for (const [type, items] of Object.entries(contentByType)) {
    const fields = FIELDS_TO_TRANSLATE[type];
    if (!fields) continue;
    for (const item of items) {
      for (const field of fields) {
        const raw = item[field];
        if (Array.isArray(raw)) {
          raw.forEach((entry) => {
            const normalized = normalizeValue(entry);
            if (normalized) values.add(normalized);
          });
        } else {
          const normalized = normalizeValue(raw);
          if (normalized) values.add(normalized);
        }
      }
    }
  }
  return [...values];
};

const parseTranslatedPayload = (rawPayload, expectedCount) => {
  if (!Array.isArray(rawPayload) || !Array.isArray(rawPayload[0])) return null;
  const translatedText = rawPayload[0].map((entry) => entry?.[0] || '').join('');
  const split = translatedText.split(SPLIT_TOKEN);
  if (split.length !== expectedCount) return null;
  return split.map((part) => part.trim());
};

const fetchTranslationBatch = async (targetLanguage, inputs) => {
  const query = inputs.map((input) => input.replaceAll(SPLIT_TOKEN, ' ')).join(SPLIT_TOKEN);
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'en',
    tl: targetLanguage,
    dt: 't',
    q: query,
  });

  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Translator HTTP ${response.status}`);
  }
  const payload = await response.json();
  const parsed = parseTranslatedPayload(payload, inputs.length);
  if (!parsed) {
    throw new Error('Translator payload parsing failed');
  }
  return parsed;
};

const translateSingle = async (targetLanguage, input) => {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'en',
    tl: targetLanguage,
    dt: 't',
    q: input,
  });

  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Translator HTTP ${response.status}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error('Invalid translator payload');
  }
  return payload[0].map((entry) => entry?.[0] || '').join('').trim() || input;
};

const translateWithRetry = async (fn) => {
  let attempt = 0;
  while (attempt < RETRY_LIMIT) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt >= RETRY_LIMIT) throw error;
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw new Error('Unreachable retry state');
};

const ensureCacheShape = (cache) => {
  if (!cache || typeof cache !== 'object') return { es: {}, pt: {}, hi: {} };
  return {
    es: cache.es && typeof cache.es === 'object' ? cache.es : {},
    pt: cache.pt && typeof cache.pt === 'object' ? cache.pt : {},
    hi: cache.hi && typeof cache.hi === 'object' ? cache.hi : {},
  };
};

const loadCache = async () => {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    return ensureCacheShape(JSON.parse(raw));
  } catch (_error) {
    return { es: {}, pt: {}, hi: {} };
  }
};

const saveCache = async (cache) => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
};

const buildLocalizedOverlay = (contentByType, translatedMap) => {
  const output = {
    generatedAt: new Date().toISOString(),
    sourceSchema: 'blisse-v3',
    positions: {},
    foreplay: {},
    oral: {},
    massage: {},
    roleplay: {},
  };

  for (const [type, items] of Object.entries(contentByType)) {
    const fields = FIELDS_TO_TRANSLATE[type];
    if (!fields) continue;

    for (const item of items) {
      const localized = {};
      for (const field of fields) {
        const raw = item[field];
        if (Array.isArray(raw)) {
          localized[field] = raw.map((entry) => translatedMap[normalizeValue(entry)] || entry);
        } else {
          const normalized = normalizeValue(raw);
          localized[field] = normalized ? (translatedMap[normalized] || raw) : raw;
        }
      }
      output[type][String(item.id)] = localized;
    }
  }

  return output;
};

const main = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const contentByType = {};
  for (const descriptor of SOURCE_FILES) {
    const fullPath = path.join(CONTENT_DIR, descriptor.file);
    const mod = await runTsModule(fullPath);
    const data = mod[descriptor.exportName];
    if (!Array.isArray(data)) {
      throw new Error(`Failed to load ${descriptor.exportName} from ${descriptor.file}`);
    }
    contentByType[descriptor.type] = data;
  }

  const allStrings = extractStrings(contentByType);
  const cache = await loadCache();

  for (const language of LANGUAGES) {
    const cacheBucket = cache[language.key];
    const missing = allStrings.filter((text) => !cacheBucket[text]);
    console.log(`[${language.key}] Missing translations: ${missing.length}`);

    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const batch = missing.slice(i, i + BATCH_SIZE);
      try {
        const translatedBatch = await translateWithRetry(() => fetchTranslationBatch(language.target, batch));
        batch.forEach((sourceText, idx) => {
          cacheBucket[sourceText] = translatedBatch[idx] || sourceText;
        });
      } catch (_batchError) {
        for (const text of batch) {
          const translated = await translateWithRetry(() => translateSingle(language.target, text));
          cacheBucket[text] = translated || text;
        }
      }
      if (i % (BATCH_SIZE * 20) === 0) {
        await saveCache(cache);
      }
      await sleep(140);
    }

    const localizedOverlay = buildLocalizedOverlay(contentByType, cacheBucket);
    const outputFile = path.join(OUTPUT_DIR, `${language.key}.generated.json`);
    await fs.writeFile(outputFile, JSON.stringify(localizedOverlay, null, 2), 'utf8');
    console.log(`[${language.key}] Wrote ${outputFile}`);
  }

  await saveCache(cache);
  console.log('Translation generation complete.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
