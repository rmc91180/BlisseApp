/** App-wide configuration constants extracted from App.tsx. */
import {
  createLocalizedArrayProxy,
  createLocalizedRecordProxy,
  pickByLanguage,
} from '@/i18n/languageGetter';
import {
  HOME_SPARK_MESSAGES_ES, HOME_SPARK_MESSAGES_PT,
  TONIGHT_SUGGESTION_TEASERS_ES, TONIGHT_SUGGESTION_TEASERS_PT,
  LEVEL_MOTIVATOR_LINES_ES, LEVEL_MOTIVATOR_LINES_PT,
  SEASONAL_HOME_SPARK_MESSAGES_ES, SEASONAL_HOME_SPARK_MESSAGES_PT,
  SEASONAL_TONIGHT_TEASERS_ES, SEASONAL_TONIGHT_TEASERS_PT,
  SEASONAL_HOOK_LINES_ES, SEASONAL_HOOK_LINES_PT,
  DAILY_JOKE_NOTIFICATION_TITLE_ES, DAILY_JOKE_NOTIFICATION_TITLE_PT,
  COUPLE_PROMPTS_ES, COUPLE_PROMPTS_PT,
} from '@/i18n/translatedAppConfig';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

export const AUTH_RETRY_DELAY_MS = 2000;
export const AUTH_MAX_RETRIES = 20;
export const AUTH_SYNC_LOOP_MS = 5 * 60 * 1000;
export const FIREBASE_FUNCTIONS_REGION = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION || 'us-central1';
export const FIREBASE_FUNCTIONS_BASE_URL =
  process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_BASE_URL ||
  `https://${FIREBASE_FUNCTIONS_REGION}-${firebaseConfig.projectId}.cloudfunctions.net`;
export const PIN_SECURE_STORAGE_KEY = 'blisse-pin-code';
export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCKOUT_MS = 30 * 1000;
export const FORMSPREE_ENDPOINT = process.env.EXPO_PUBLIC_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xvzgeaqp';
export const CONFETTI_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#fbbf24'];
export const FORMSPREE_SUBMIT_COOLDOWN_MS = 45 * 1000;
export const FORMSPREE_LAST_SUBMIT_KEY = 'blisse-formspree-last-submit-at-v1';
export const FORMSPREE_QUEUE_KEY = 'blisse-formspree-queue-v1';
export const FORMSPREE_QUEUE_LIMIT = 15;
export const FORMSPREE_HONEYPOT_FIELD = 'website';
export const FORMSPREE_MIN_MESSAGE_LENGTH = 6;

// Rotating couple connection prompts for the Home screen
const _COUPLE_PROMPTS_EN = [
  { emoji: '\u{1F4AC}', text: 'Ask: what made you feel most wanted this week?' },
  { emoji: '\u{1F48B}', text: 'Give one slow, teasing kiss. No rushing.' },
  { emoji: '\u{1F4A5}', text: 'Tell your partner one fantasy-friendly idea for tonight.' },
  { emoji: '\u{1F3B5}', text: 'Play "your song" and dance for one full minute.' },
  { emoji: '\u{1F525}', text: 'Whisper one thing you find irresistible about them.' },
  { emoji: '\u{1F917}', text: '20-second hug challenge. Phones down, eyes up.' },
  { emoji: '\u{1F4CC}', text: 'Rate last night 1-10, then beat that score tonight.' },
  { emoji: '\u{1F440}', text: 'Hold eye contact for 15 seconds, then follow the vibe.' },
  { emoji: '\u{1F48C}', text: 'Write a one-line "meet me later" note.' },
  { emoji: '\u{1F31F}', text: 'Share your favorite naughty-but-sweet memory together.' },
];

export const ANALYTICS_STRING_LIMIT = 80;
export const FORMSPREE_MESSAGE_LIMIT = 4000;
const _DAILY_JOKE_NOTIFICATION_TITLE_EN = 'Blisse Daily Tease \u{1F48C}';
/** Returns the localized notification title (resolves at call-time, not import-time). */
export const getDailyJokeNotificationTitle = (): string =>
  pickByLanguage({
    en: _DAILY_JOKE_NOTIFICATION_TITLE_EN,
    es: DAILY_JOKE_NOTIFICATION_TITLE_ES,
    pt: DAILY_JOKE_NOTIFICATION_TITLE_PT,
  });
/** @deprecated Use getDailyJokeNotificationTitle() for localized version */
export const DAILY_JOKE_NOTIFICATION_TITLE = _DAILY_JOKE_NOTIFICATION_TITLE_EN;
export const DAILY_JOKE_NOTIFICATION_HOUR = 19;
export const DAILY_JOKE_NOTIFICATION_MINUTE = 30;
export const DAILY_JOKE_QUIET_HOURS_START = 22;
export const DAILY_JOKE_QUIET_HOURS_END = 8;
export const DAILY_JOKE_NOTIFICATION_FREQUENCY_CAP_PER_DAY = 1;
export const DAILY_JOKE_NOTIFICATION_DAYS_AHEAD = 14;
export const DAILY_JOKE_NOTIFICATION_REFRESH_WINDOW_DAYS = 1;
export const DAILY_JOKE_NOTIFICATION_IDS_KEY = 'blisse-daily-joke-notification-ids-v1';
export const DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY = 'blisse-daily-joke-notification-refresh-at-v1';
export const DAILY_JOKE_BANK_CACHE_KEY = 'blisse-daily-joke-bank-cache-v1';
export const DAILY_JOKE_BANK_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
export const DAILY_JOKE_BANK_DOC_PATH = ['app_config', 'daily_jokes'] as const;
export const FEATURE_FLAGS_CACHE_KEY = 'blisse-feature-flags-cache-v1';
export const FEATURE_FLAGS_CACHE_TTL_MS = 10 * 60 * 1000;
export const FEATURE_FLAGS_DOC_PATH = ['feature_flags', 'mobile'] as const;
export const REACTIVATION_NOTIFICATION_ID_KEY = 'blisse-reactivation-notification-id-v1';
export const REACTIVATION_NOTIFICATION_SCHEDULED_FOR_KEY = 'blisse-reactivation-notification-scheduled-for-v1';
export const REACTIVATION_DAYS_INACTIVE = 3;
export const REACTIVATION_NOTIFICATION_HOUR = 18;
export const REACTIVATION_NOTIFICATION_MINUTE = 15;
export const STREAK_NOTIFICATION_ID_KEY = 'blisse-streak-notification-id-v1';
export const STREAK_NOTIFICATION_HOUR = 20;
export const STREAK_NOTIFICATION_MINUTE = 15;
// ============================================
// LOCALIZED CONTENT CONSTANTS (Proxy-based: auto-resolve to current language)
// ============================================

const _HOME_SPARK_MESSAGES_EN: Array<{ headline: string; body: string }> = [
  { headline: 'Tonight\'s mission: make each other blush \u{1F608}', body: 'Pick one playful idea and follow it all the way through.' },
  { headline: 'Less overthinking, more chemistry \u2728', body: 'Open Blisse, choose your mood, and let momentum do the rest.' },
  { headline: 'Date-night energy in under 2 minutes \u{1F618}', body: 'One prompt, one dare, one kiss can flip the whole night.' },
  { headline: 'Your love story just unlocked bonus levels \u{1F319}', body: 'Collect stars, stack streaks, and keep things fun on purpose.' },
  { headline: 'Warm hearts. Playful trouble. \u{1F525}', body: 'Tiny intentional moments now, unforgettable memories later.' },
];
export const HOME_SPARK_MESSAGES = createLocalizedArrayProxy<{ headline: string; body: string }>({
  en: _HOME_SPARK_MESSAGES_EN, es: HOME_SPARK_MESSAGES_ES, pt: HOME_SPARK_MESSAGES_PT,
});

const _TONIGHT_SUGGESTION_TEASERS_EN: string[] = [
  'Ready for a cozy adventure? Start soft and stay curious.',
  'Tonight is for eye contact, laughter, and one bold move.',
  'No pressure. Just presence, play, and good chemistry.',
  'Pick one idea and commit to it like it\'s your favorite secret.',
  'Small spark now, unforgettable memory later.',
];
export const TONIGHT_SUGGESTION_TEASERS = createLocalizedArrayProxy<string>({
  en: _TONIGHT_SUGGESTION_TEASERS_EN, es: TONIGHT_SUGGESTION_TEASERS_ES, pt: TONIGHT_SUGGESTION_TEASERS_PT,
});

const _LEVEL_MOTIVATOR_LINES_EN: string[] = [
  'Every star makes the next dare a little better.',
  'You two are building trust, play, and momentum together.',
  'Progress is attractive. Keep going, lovebirds.',
  'From New Sparks to Eternal Flame, one playful step at a time.',
  'You are not just leveling up the app. You are leveling up us.',
];
export const LEVEL_MOTIVATOR_LINES = createLocalizedArrayProxy<string>({
  en: _LEVEL_MOTIVATOR_LINES_EN, es: LEVEL_MOTIVATOR_LINES_ES, pt: LEVEL_MOTIVATOR_LINES_PT,
});

const _SEASONAL_HOME_SPARK_MESSAGES_EN: Record<string, Array<{ headline: string; body: string }>> = {
  valentines: [
    { headline: 'Valentine energy, all month long \u{1F495}', body: 'Extra eye contact, extra kisses, extra playful trouble tonight.' },
    { headline: 'Love notes are welcome here \u{1F339}', body: 'Keep it sweet, flirty, and a little bolder than usual.' },
  ],
  spring: [
    { headline: 'Spring is your reset button \u{1F338}', body: 'Fresh mood, fresh energy, fresh stories to create together.' },
    { headline: 'New season, new sparks \u{1F33F}', body: 'Try one new thing tonight and let curiosity lead.' },
  ],
  summer: [
    { headline: 'Hot summer nights unlocked \u2600\uFE0F', body: 'Playful challenges, spontaneous vibes, and zero overthinking.' },
    { headline: 'Bring the heat, keep it fun \u{1F379}', body: 'Adventure mode is on. Pick a dare and go.' },
  ],
  fall: [
    { headline: 'Cozy season, closer connection \u{1F342}', body: 'Slow down, warm up, and keep the playful tension alive.' },
    { headline: 'Autumn nights, softer lights \u{1F56F}\uFE0F', body: 'Comfort plus chemistry is a very good combo.' },
  ],
  winter: [
    { headline: 'Winter warmth starts here \u2744\uFE0F', body: 'Blankets, body heat, and zero excuses.' },
    { headline: 'Cold outside, spark inside \u{1F525}', body: 'Make tonight feel like your favorite secret.' },
  ],
  newyear: [
    { headline: 'New year, same love, bolder play \u{1F386}', body: 'Set one playful intention and make it happen tonight.' },
    { headline: 'Fresh chapter energy \u2728', body: 'Small shared rituals now, big relationship momentum later.' },
  ],
};
export const SEASONAL_HOME_SPARK_MESSAGES = createLocalizedRecordProxy<Record<string, Array<{ headline: string; body: string }>>>({
  en: _SEASONAL_HOME_SPARK_MESSAGES_EN, es: SEASONAL_HOME_SPARK_MESSAGES_ES, pt: SEASONAL_HOME_SPARK_MESSAGES_PT,
});

const _SEASONAL_TONIGHT_TEASERS_EN: Record<string, string[]> = {
  valentines: ['Romantic and playful with just the right amount of heat.'],
  spring: ['Fresh-energy date night: soft start, bold finish.'],
  summer: ['Spontaneous and spicy, with zero pressure.'],
  fall: ['Cozy, close, and impossible to rush.'],
  winter: ['Warm up slowly and stay close longer.'],
  newyear: ['Try one new thing and call it your lucky ritual.'],
};
export const SEASONAL_TONIGHT_TEASERS = createLocalizedRecordProxy<Record<string, string[]>>({
  en: _SEASONAL_TONIGHT_TEASERS_EN, es: SEASONAL_TONIGHT_TEASERS_ES, pt: SEASONAL_TONIGHT_TEASERS_PT,
});

const _SEASONAL_HOOK_LINES_EN: Record<string, string[]> = {
  valentines: ['Valentine vibe: extra eye contact, extra kisses, extra trouble.'],
  spring: ['Fresh beginnings and playful experiments await.'],
  summer: ['Longer nights, bolder choices, more laughter.'],
  fall: ['Comfort meets chemistry in every cozy moment.'],
  winter: ['Blankets + body heat + playful intent = winter perfection.'],
  newyear: ['Fresh starts and daring first moves.'],
};
export const SEASONAL_HOOK_LINES = createLocalizedRecordProxy<Record<string, string[]>>({
  en: _SEASONAL_HOOK_LINES_EN, es: SEASONAL_HOOK_LINES_ES, pt: SEASONAL_HOOK_LINES_PT,
});

export const COUPLE_PROMPTS = createLocalizedArrayProxy<{ emoji: string; text: string }>({
  en: _COUPLE_PROMPTS_EN,
  es: COUPLE_PROMPTS_ES,
  pt: COUPLE_PROMPTS_PT,
});
