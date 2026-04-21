#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE_FILE = path.join(ROOT, 'src', 'i18n', 'content', '.translation-cache.json');
const SPLIT_TOKEN = '|||BLISSE_SPLIT|||';
const BATCH_SIZE = 14;
const RETRY_LIMIT = 4;
const RETRY_DELAY_MS = 700;

const LANGUAGES = [
  { key: 'es', target: 'es' },
  { key: 'pt', target: 'pt-BR' },
  { key: 'hi', target: 'hi' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRefreshEntry = (source, translated) => {
  const s = String(source || '').trim();
  const t = String(translated || '').trim();
  if (!s || !t) return false;
  if (s.toLowerCase() !== t.toLowerCase()) return false;
  // Skip purely numeric/symbol entries (e.g., "69")
  if (!/[a-zA-Z]/.test(s)) return false;
  return true;
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
  if (!response.ok) throw new Error(`Translator HTTP ${response.status}`);
  const payload = await response.json();
  const parsed = parseTranslatedPayload(payload, inputs.length);
  if (!parsed) throw new Error('Translator payload parsing failed');
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
  if (!response.ok) throw new Error(`Translator HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) throw new Error('Invalid translator payload');
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

const main = async () => {
  const raw = await fs.readFile(CACHE_FILE, 'utf8');
  const cache = JSON.parse(raw);

  for (const language of LANGUAGES) {
    const bucket = cache[language.key] || {};
    const refreshCandidates = Object.entries(bucket)
      .filter(([source, translated]) => shouldRefreshEntry(source, translated))
      .map(([source]) => source);

    console.log(`[${language.key}] refreshing ${refreshCandidates.length} untranslated entries`);
    for (let i = 0; i < refreshCandidates.length; i += BATCH_SIZE) {
      const batch = refreshCandidates.slice(i, i + BATCH_SIZE);
      try {
        const translatedBatch = await translateWithRetry(() => fetchTranslationBatch(language.target, batch));
        batch.forEach((sourceText, idx) => {
          bucket[sourceText] = translatedBatch[idx] || sourceText;
        });
      } catch (_error) {
        for (const sourceText of batch) {
          const translated = await translateWithRetry(() => translateSingle(language.target, sourceText));
          bucket[sourceText] = translated || sourceText;
        }
      }
      await sleep(140);
    }
    cache[language.key] = bucket;
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log('Cache refresh complete.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
