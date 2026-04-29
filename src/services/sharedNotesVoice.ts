import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLanguage } from '@/i18n/languageGetter';
import type { AppLanguage } from '@/i18n/translations';
import { getVoiceCopy } from '@/copy';

type SharedNoteContentType = 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';

interface SharedNoteItem {
  id: number;
  name: string;
  vibe?: string;
  whyItWorks?: string;
  description?: string;
  category?: string;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5.4-mini';
const MAX_TOKENS = 150;

const inflightRequests = new Map<string, Promise<string>>();

const buildCacheKey = (language: AppLanguage, contentType: SharedNoteContentType, itemId: number) =>
  `shared_note_${language}_${contentType}_${itemId}`;

const pickFallback = (language: AppLanguage, itemId: number): string => {
  const localizedFallbacks = getVoiceCopy(language).sharedNotes.fallbackNotes;
  const index = Math.abs(itemId) % localizedFallbacks.length;
  return localizedFallbacks[index];
};

const extractMessage = (payload: any): string | null => {
  const maybeText = payload?.choices?.[0]?.message?.content;
  if (typeof maybeText === 'string' && maybeText.trim()) {
    return maybeText.trim();
  }
  if (Array.isArray(maybeText)) {
    const joined = maybeText
      .map((chunk) => (typeof chunk?.text === 'string' ? chunk.text : ''))
      .join(' ')
      .trim();
    return joined || null;
  }
  return null;
};

const requestSharedNote = async (
  language: AppLanguage,
  contentType: SharedNoteContentType,
  item: SharedNoteItem
): Promise<string> => {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key missing');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: getVoiceCopy(language).sharedNotes.systemPrompt },
        { role: 'user', content: getVoiceCopy(language).sharedNotes.userPrompt(contentType, item) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const payload = await response.json();
  const note = extractMessage(payload);
  if (!note) {
    throw new Error('Shared note missing from response');
  }

  return note;
};

const loadOrGenerateNote = async (contentType: SharedNoteContentType, item: SharedNoteItem): Promise<string> => {
  const language = getCurrentLanguage();
  const cacheKey = buildCacheKey(language, contentType, item.id);
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached && cached.trim()) {
    return cached;
  }

  try {
    const generated = await requestSharedNote(language, contentType, item);
    await AsyncStorage.setItem(cacheKey, generated);
    return generated;
  } catch {
    const fallback = pickFallback(language, item.id);
    await AsyncStorage.setItem(cacheKey, fallback);
    return fallback;
  }
};

export const sharedNotesVoice = {
  async getNote(contentType: SharedNoteContentType, item: SharedNoteItem): Promise<string> {
    const language = getCurrentLanguage();
    const cacheKey = buildCacheKey(language, contentType, item.id);
    const existing = inflightRequests.get(cacheKey);
    if (existing) return existing;

    const request = loadOrGenerateNote(contentType, item).finally(() => {
      inflightRequests.delete(cacheKey);
    });
    inflightRequests.set(cacheKey, request);
    return request;
  },

  preloadNote(contentType: SharedNoteContentType, item: SharedNoteItem): void {
    void this.getNote(contentType, item);
  },
};
