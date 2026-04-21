import AsyncStorage from '@react-native-async-storage/async-storage';

type CoachContentType = 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';

interface CoachItem {
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

const SYSTEM_PROMPT = `You are a warm, experienced couples coach with 25 years of experience. 
You think young but have seen everything. Your tone is encouraging, playful, 
and never clinical or judgmental. You write brief, personal coaching notes — 
2-3 sentences max. Never use the word 'boundaries'. Never give warnings. 
Trust the couple. Speak directly to both of them together as 'you two'.`;

const FALLBACK_NOTES: string[] = [
  'Trust yourselves on this one. You know each other better than anyone.',
  "Being here, trying something new together — that's a win.",
  'Take it slow, take it fast, take it your way.',
  'You two do not need perfect, you just need present.',
  'A little curiosity goes a long way when you are already this connected.',
  'Follow the moments that make you both smile and stay there a little longer.',
  "Tonight is about your rhythm, not anyone else's timeline.",
  'You two already have the spark. This just gives it a place to land.',
];

const inflightRequests = new Map<string, Promise<string>>();

const buildCacheKey = (contentType: CoachContentType, itemId: number) =>
  `coach_note_${contentType}_${itemId}`;

const buildUserPrompt = (contentType: CoachContentType, item: CoachItem): string => `Write a brief coach note for this activity:
Name: ${item.name}
Type: ${contentType}
Vibe: ${item.vibe || 'Warm and connecting'}
Why it works: ${item.whyItWorks || item.description || 'It helps you two feel closer'}
Category: ${item.category || 'General'}

The note should feel like a friend who happens to be an expert is cheering you on.`;

const pickFallback = (itemId: number): string => {
  const index = Math.abs(itemId) % FALLBACK_NOTES.length;
  return FALLBACK_NOTES[index];
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

const requestCoachNote = async (contentType: CoachContentType, item: CoachItem): Promise<string> => {
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
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(contentType, item) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const payload = await response.json();
  const note = extractMessage(payload);
  if (!note) {
    throw new Error('Coach note missing from response');
  }

  return note;
};

const loadOrGenerateNote = async (contentType: CoachContentType, item: CoachItem): Promise<string> => {
  const cacheKey = buildCacheKey(contentType, item.id);
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached && cached.trim()) {
    return cached;
  }

  try {
    const generated = await requestCoachNote(contentType, item);
    await AsyncStorage.setItem(cacheKey, generated);
    return generated;
  } catch {
    const fallback = pickFallback(item.id);
    await AsyncStorage.setItem(cacheKey, fallback);
    return fallback;
  }
};

export const coachVoice = {
  async getNote(contentType: CoachContentType, item: CoachItem): Promise<string> {
    const cacheKey = buildCacheKey(contentType, item.id);
    const existing = inflightRequests.get(cacheKey);
    if (existing) return existing;

    const request = loadOrGenerateNote(contentType, item).finally(() => {
      inflightRequests.delete(cacheKey);
    });
    inflightRequests.set(cacheKey, request);
    return request;
  },

  preloadNote(contentType: CoachContentType, item: CoachItem): void {
    void this.getNote(contentType, item);
  },
};
