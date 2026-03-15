/** Seasonal content, truth-or-dare prompts, and playlist data extracted from App.tsx. */

import type {
  SeasonalTheme,
  SeasonalGameAction,
  SeasonalGameOption,
  TruthOrDareItem,
  PlaylistLink,
} from '@/types/app';
import {
  createLocalizedArrayProxy,
  createLocalizedRecordProxy,
} from '@/i18n/languageGetter';
import {
  SEASONAL_GAME_OPTIONS_ES, SEASONAL_GAME_OPTIONS_PT,
  SEASONAL_THEME_STRINGS_ES, SEASONAL_THEME_STRINGS_PT,
  PLAYLIST_MOODS_ES, PLAYLIST_MOODS_PT,
  CURATED_PLAYLIST_STRINGS_ES, CURATED_PLAYLIST_STRINGS_PT,
  TRUTH_OR_DARE_ES, TRUTH_OR_DARE_PT,
} from '@/i18n/translatedSeasonal';

// ============================================
// SEASONAL GAME OPTIONS (localized)
// ============================================

const _SEASONAL_GAME_OPTIONS_EN: Record<SeasonalGameAction, SeasonalGameOption> = {
  truth_or_dare: {
    id: 'truth_or_dare',
    emoji: '🎲',
    title: 'Truth or Dare',
    description: 'Flirty prompts that match the season vibe',
  },
  date_night: {
    id: 'date_night',
    emoji: '🌙',
    title: 'Date Night Generator',
    description: 'Curated evening flow for connection and fun',
  },
  challenge: {
    id: 'challenge',
    emoji: '🎯',
    title: 'Seasonal Challenge',
    description: 'Goal-based activity for playful progression',
  },
  spin: {
    id: 'spin',
    emoji: '🎰',
    title: 'Spin Surprise',
    description: 'Quick randomizer for spontaneous inspiration',
  },
};

export const SEASONAL_GAME_OPTIONS = createLocalizedRecordProxy<
  Record<SeasonalGameAction, SeasonalGameOption>
>({
  en: _SEASONAL_GAME_OPTIONS_EN,
  es: SEASONAL_GAME_OPTIONS_ES as Record<SeasonalGameAction, SeasonalGameOption>,
  pt: SEASONAL_GAME_OPTIONS_PT as Record<SeasonalGameAction, SeasonalGameOption>,
});

// ============================================
// SEASONAL THEMES (localized name, description, tips)
// ============================================

/** Base theme data (non-translatable structural fields). */
const _SEASONAL_THEMES_EN: SeasonalTheme[] = [
  {
    id: 'valentines',
    name: "Valentine's Day",
    emoji: '💕',
    description: 'Romantic connection & passion',
    color: '#ec4899',
    startMonth: 2, endMonth: 2,
    positions: [1, 5, 8, 12, 18],
    foreplay: [101, 103, 106, 110],
    oral: [201, 202, 205, 206],
    roleplay: [401, 403, 404],
    games: ['date_night', 'truth_or_dare', 'challenge'],
    tips: ['Set up rose petals', 'Light candles everywhere', 'Prepare chocolate-dipped strawberries', 'Write a love note to read together'],
  },
  {
    id: 'spring',
    name: 'Spring Awakening',
    emoji: '🌸',
    description: 'Fresh energy & new beginnings',
    color: '#84cc16',
    startMonth: 3, endMonth: 5,
    positions: [3, 7, 11, 15, 22],
    foreplay: [104, 105, 107, 112],
    oral: [204, 206, 211, 212],
    roleplay: [406, 410, 415],
    games: ['date_night', 'spin', 'challenge'],
    tips: ['Open the windows for fresh air', 'Try morning intimacy', 'Bring flowers to the bedroom', 'Spring clean then celebrate'],
  },
  {
    id: 'summer',
    name: 'Hot Summer Nights',
    emoji: '☀️',
    description: 'Playful & adventurous vibes',
    color: '#f59e0b',
    startMonth: 6, endMonth: 8,
    positions: [4, 9, 14, 20, 25],
    foreplay: [102, 108, 109, 111],
    oral: [203, 207, 208, 210],
    roleplay: [407, 411, 416],
    games: ['spin', 'truth_or_dare', 'challenge'],
    tips: ['Ice cubes for temperature play', 'Try a staycation hotel night', 'Skinny dipping if you can', 'Late night balcony/patio moments'],
  },
  {
    id: 'fall',
    name: 'Cozy Autumn',
    emoji: '🍂',
    description: 'Warm, intimate connection',
    color: '#ea580c',
    startMonth: 9, endMonth: 11,
    positions: [2, 6, 10, 16, 21],
    foreplay: [101, 104, 106, 108],
    oral: [201, 204, 206, 212],
    roleplay: [402, 408, 412],
    games: ['date_night', 'truth_or_dare', 'spin'],
    tips: ['Fireplace or candles for ambiance', 'Warm blankets and cozy vibes', 'Pumpkin spice massage oil', 'Stay in bed on rainy days'],
  },
  {
    id: 'winter',
    name: 'Winter Warmth',
    emoji: '❄️',
    description: 'Body heat & closeness',
    color: '#3b82f6',
    startMonth: 12, endMonth: 1,
    positions: [1, 5, 8, 12, 17],
    foreplay: [101, 105, 108, 112],
    oral: [201, 205, 209, 212],
    roleplay: [403, 405, 409],
    games: ['date_night', 'challenge', 'truth_or_dare'],
    tips: ['Body heat is your friend', 'Hot bath or shower together', 'Fuzzy blankets and bare skin', 'Holiday lingerie surprise'],
  },
  {
    id: 'newyear',
    name: "New Year's Spark",
    emoji: '🎆',
    description: 'Fresh starts & new adventures',
    color: '#a855f7',
    startMonth: 1, endMonth: 1,
    positions: [3, 8, 13, 19, 24],
    foreplay: [102, 103, 106, 110],
    oral: [202, 206, 208, 211],
    roleplay: [401, 406, 414],
    games: ['challenge', 'spin', 'truth_or_dare'],
    tips: ['Make intimacy resolutions together', 'Try something completely new', 'Champagne and celebration', 'Midnight countdown kiss and more'],
  },
];

/** Build localized themes by merging base data with translated strings. */
function buildLocalizedThemes(
  strings: Record<string, { name: string; description: string; tips: string[] }>,
): SeasonalTheme[] {
  return _SEASONAL_THEMES_EN.map(theme => {
    const t = strings[theme.id];
    return t ? { ...theme, name: t.name, description: t.description, tips: t.tips } : theme;
  });
}

export const SEASONAL_THEMES = createLocalizedArrayProxy<SeasonalTheme>({
  en: _SEASONAL_THEMES_EN,
  es: buildLocalizedThemes(SEASONAL_THEME_STRINGS_ES),
  pt: buildLocalizedThemes(SEASONAL_THEME_STRINGS_PT),
});

export function getCurrentSeason(): SeasonalTheme | null {
  const month = new Date().getMonth() + 1;
  return SEASONAL_THEMES.find(s =>
    s.startMonth <= s.endMonth
      ? month >= s.startMonth && month <= s.endMonth
      : month >= s.startMonth || month <= s.endMonth
  ) || null;
}

// ============================================
// TRUTH OR DARE CONTENT (localized)
// ============================================

const _TRUTH_OR_DARE_EN: TruthOrDareItem[] = [
  // MILD TRUTHS
  { id: 1, type: 'truth', intensity: 'mild', text: "What was the exact moment you first realized you were attracted to me?" },
  { id: 2, type: 'truth', intensity: 'mild', text: "What's one small habit of mine that secretly turns you on?" },
  { id: 3, type: 'truth', intensity: 'mild', text: "What's the most romantic non-sexual thing I've done for you?" },
  { id: 4, type: 'truth', intensity: 'mild', text: "When did you first fantasize about kissing me?" },
  { id: 5, type: 'truth', intensity: 'mild', text: "What song always makes you think of me in a romantic way?" },
  { id: 6, type: 'truth', intensity: 'mild', text: "What's one thing about my personality you find especially attractive?" },
  { id: 7, type: 'truth', intensity: 'mild', text: "What's your favorite outfit on me lately?" },
  { id: 8, type: 'truth', intensity: 'mild', text: "What's one compliment from me you still remember?" },
  { id: 9, type: 'truth', intensity: 'mild', text: "What kind of kiss from me lingers in your mind the longest?" },
  { id: 10, type: 'truth', intensity: 'mild', text: "What's your favorite lazy-together moment?" },
  { id: 11, type: 'truth', intensity: 'mild', text: "Rate our last kiss out of 10. What would make it an 11?" },
  { id: 12, type: 'truth', intensity: 'mild', text: "What's the flirtiest thought you've had about me in public?" },
  { id: 13, type: 'truth', intensity: 'mild', text: "What part of my body do you secretly stare at the most?" },
  { id: 14, type: 'truth', intensity: 'mild', text: "When was the last time you got turned on just by looking at me?" },
  { id: 15, type: 'truth', intensity: 'mild', text: "What's one thing you want to try with me but haven't asked yet?" },
  { id: 16, type: 'truth', intensity: 'mild', text: "If we had only 5 minutes alone, how would you seduce me?" },
  // MEDIUM TRUTHS
  { id: 17, type: 'truth', intensity: 'medium', text: "What's one habit of mine that instantly gets your attention?" },
  { id: 18, type: 'truth', intensity: 'medium', text: "What piece of my clothing do you find unreasonably attractive?" },
  { id: 19, type: 'truth', intensity: 'medium', text: "What's the naughtiest thought you've had about me in public?" },
  { id: 20, type: 'truth', intensity: 'medium', text: "What's one thing I do during a kiss that you want more of?" },
  { id: 21, type: 'truth', intensity: 'medium', text: "What outfit makes you want to cancel our plans and stay in?" },
  { id: 22, type: 'truth', intensity: 'medium', text: "What's one place you'd love an extra-long kiss from me?" },
  { id: 23, type: 'truth', intensity: 'medium', text: "What playful dare would you secretly hope I pick for you?" },
  { id: 24, type: 'truth', intensity: 'medium', text: "What role-play vibe would you be curious to explore together?" },
  { id: 25, type: 'truth', intensity: 'medium', text: "What part of our chemistry feels strongest lately?" },
  { id: 26, type: 'truth', intensity: 'medium', text: "What's one way I could tease you better?" },
  { id: 27, type: 'truth', intensity: 'medium', text: "What's a flirty text you'd love to get from me tonight?" },
  { id: 28, type: 'truth', intensity: 'medium', text: "What's one thing I do that builds tension fast?" },
  { id: 29, type: 'truth', intensity: 'medium', text: "What does a private weekend with me look like in your head?" },
  { id: 30, type: 'truth', intensity: 'medium', text: "What kind of first move from me works every time?" },
  { id: 31, type: 'truth', intensity: 'medium', text: "What would be your perfect 'meet me later' message from me?" },
  { id: 32, type: 'truth', intensity: 'medium', text: "What kind of touch from me makes you melt fastest?" },
  // SPICY TRUTHS
  { id: 33, type: 'truth', intensity: 'spicy', text: "What's the boldest kiss you'd want from me tonight?" },
  { id: 34, type: 'truth', intensity: 'spicy', text: "What's one fantasy-friendly idea you'd actually try with me?" },
  { id: 35, type: 'truth', intensity: 'spicy', text: "What scene would you most want us to recreate from a movie?" },
  { id: 36, type: 'truth', intensity: 'spicy', text: "If you could plan the mood for tonight, what would you choose first?" },
  { id: 37, type: 'truth', intensity: 'spicy', text: "What's one place you'd want my lips to linger a little longer?" },
  { id: 38, type: 'truth', intensity: 'spicy', text: "What's one thing I do that makes you lose your train of thought?" },
  { id: 39, type: 'truth', intensity: 'spicy', text: "What kind of slow tease works best on you?" },
  { id: 40, type: 'truth', intensity: 'spicy', text: "What's one bolder move you'd trust me to try?" },
  { id: 41, type: 'truth', intensity: 'spicy', text: "What kind of praise from me lands best when we're close?" },
  { id: 42, type: 'truth', intensity: 'spicy', text: "What's the hottest almost-moment we've had lately?" },
  { id: 43, type: 'truth', intensity: 'spicy', text: "If I told you to take the lead tonight, what would you do first?" },
  { id: 44, type: 'truth', intensity: 'spicy', text: "What's one secret wish you'd finally tell me tonight?" },
  // WILD TRUTHS
  { id: 45, type: 'truth', intensity: 'wild', text: "If we had a whole evening alone with no interruptions, what would you want first?" },
  { id: 46, type: 'truth', intensity: 'wild', text: "What's one daring move you want on your Blisse bucket list?" },
  { id: 47, type: 'truth', intensity: 'wild', text: "If I gave you total control for one minute, how would you use it?" },
  { id: 48, type: 'truth', intensity: 'wild', text: "What's one playful rule you'd love us to break on a private weekend away?" },
  // MILD DARES
  { id: 101, type: 'dare', intensity: 'mild', text: "Give me the softest, slowest forehead kiss possible for 30 seconds." },
  { id: 102, type: 'dare', intensity: 'mild', text: "Hold eye contact with me for 45 seconds." },
  { id: 103, type: 'dare', intensity: 'mild', text: "Whisper something you love about my personality in my ear very slowly." },
  { id: 104, type: 'dare', intensity: 'mild', text: "Trace my collarbone with one fingertip for 20 seconds." },
  { id: 105, type: 'dare', intensity: 'mild', text: "Send me a voice note saying one thing you're grateful for about us." },
  { id: 106, type: 'dare', intensity: 'mild', text: "Hold my hand and lead me in a 30-second slow dance." },
  { id: 107, type: 'dare', intensity: 'mild', text: "Give me a 20-second hug with no talking." },
  { id: 108, type: 'dare', intensity: 'mild', text: "Give me three compliments without repeating yourself." },
  { id: 109, type: 'dare', intensity: 'mild', text: "Brush your lips against my cheek and then stop." },
  { id: 110, type: 'dare', intensity: 'mild', text: "Rest your head on my shoulder for one full minute." },
  { id: 111, type: 'dare', intensity: 'mild', text: "Kiss the back of my hand like we're in a movie." },
  { id: 112, type: 'dare', intensity: 'mild', text: "Trace a heart on my back and let me guess it." },
  { id: 113, type: 'dare', intensity: 'mild', text: "Pick our next song and make me sway with you." },
  { id: 114, type: 'dare', intensity: 'mild', text: "Play with my hair for 30 seconds like you missed me." },
  { id: 115, type: 'dare', intensity: 'mild', text: "Tell me exactly how you'd flirt with me on a first date." },
  { id: 116, type: 'dare', intensity: 'mild', text: "Give me one 'meet me later' look with zero words." },
  // MEDIUM DARES
  { id: 117, type: 'dare', intensity: 'medium', text: "Give me a 15-second shoulder or neck massage using only your lips." },
  { id: 118, type: 'dare', intensity: 'medium', text: "Blindfold yourself and guess what part of me is touching you, three tries." },
  { id: 119, type: 'dare', intensity: 'medium', text: "Text me a very flirty but PG-13 message as if we just matched." },
  { id: 120, type: 'dare', intensity: 'medium', text: "Kiss my neck for 30 seconds, no hands." },
  { id: 121, type: 'dare', intensity: 'medium', text: "Undress down to a comfortable layer while maintaining eye contact." },
  { id: 122, type: 'dare', intensity: 'medium', text: "Give me a slow, teasing upper-thigh kiss and stop early." },
  { id: 123, type: 'dare', intensity: 'medium', text: "Let me guide your hand across my waist and back for 30 seconds." },
  { id: 124, type: 'dare', intensity: 'medium', text: "Blindfold me and kiss any part of my body except my lips, three kisses." },
  { id: 125, type: 'dare', intensity: 'medium', text: "Sit on my lap facing me and sway slowly for 30 seconds." },
  { id: 126, type: 'dare', intensity: 'medium', text: "Recreate the most dramatic movie kiss scene you can think of." },
  { id: 127, type: 'dare', intensity: 'medium', text: "Speak only in terrible pickup lines for the next three turns." },
  { id: 128, type: 'dare', intensity: 'medium', text: "Try to compliment me using only food metaphors for 30 seconds." },
  { id: 129, type: 'dare', intensity: 'medium', text: "Give me your best sexy dance move to a ridiculous song." },
  { id: 130, type: 'dare', intensity: 'medium', text: "Act out your best slow-motion 'come here' move." },
  { id: 131, type: 'dare', intensity: 'medium', text: "Trace one line from my wrist to my shoulder with your lips." },
  { id: 132, type: 'dare', intensity: 'medium', text: "Let me pick the next dare you do, no negotiating." },
  // SPICY DARES
  { id: 133, type: 'dare', intensity: 'spicy', text: "Remove one outer layer and then kiss me for 20 seconds." },
  { id: 134, type: 'dare', intensity: 'spicy', text: "Kiss along my neck and collarbone for 30 seconds." },
  { id: 135, type: 'dare', intensity: 'spicy', text: "Let me guide your wrists while we kiss for 20 seconds." },
  { id: 136, type: 'dare', intensity: 'spicy', text: "Give me a lap dance for 30 seconds, music optional." },
  { id: 137, type: 'dare', intensity: 'spicy', text: "Use an ice cube to trace a slow line down my arm or shoulder." },
  { id: 138, type: 'dare', intensity: 'spicy', text: "Straddle my lap fully clothed and hold eye contact for 20 seconds." },
  { id: 139, type: 'dare', intensity: 'spicy', text: "Let me choose exactly where your next three kisses land." },
  { id: 140, type: 'dare', intensity: 'spicy', text: "Whisper what you want from me tonight without saying anything explicit." },
  { id: 141, type: 'dare', intensity: 'spicy', text: "Give me a slow kiss, pull away, and make me ask for another." },
  { id: 142, type: 'dare', intensity: 'spicy', text: "Let me blindfold you while I give you three teasing kisses." },
  { id: 143, type: 'dare', intensity: 'spicy', text: "Recreate your best 'we shouldn't be doing this' movie moment." },
  { id: 144, type: 'dare', intensity: 'spicy', text: "Tell me 'later' with your body language, not words." },
  // WILD DARES
  { id: 145, type: 'dare', intensity: 'wild', text: "Let your partner choose truth or dare for your next turn, no veto." },
  { id: 146, type: 'dare', intensity: 'wild', text: "Give a 60-second slow dance that turns into a kiss at the end." },
  { id: 147, type: 'dare', intensity: 'wild', text: "Remove one more layer if you're comfortable and own the moment." },
  { id: 148, type: 'dare', intensity: 'wild', text: "Let your partner direct your next 30 seconds of flirting." },
  { id: 149, type: 'dare', intensity: 'wild', text: "Do a dramatic countdown-to-kiss scene and stop at the last second." },
  { id: 150, type: 'dare', intensity: 'wild', text: "Pick one prompt from Blisse you've been avoiding and add it to tonight's plan." },
];

export const TRUTH_OR_DARE = createLocalizedArrayProxy<TruthOrDareItem>({
  en: _TRUTH_OR_DARE_EN,
  es: TRUTH_OR_DARE_ES,
  pt: TRUTH_OR_DARE_PT,
});

// ============================================
// MUSIC PLAYLIST SUGGESTIONS (localized name + description)
// ============================================

const _CURATED_PLAYLISTS_EN: PlaylistLink[] = [
  {
    name: "Romantic Evening",
    mood: "romantic",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn",
    appleMusicUrl: "https://music.apple.com/us/playlist/romantic-evening/pl.acc464c750b94302b8f6c92b5f43edef",
    description: "Soft, intimate tracks for slow, romantic moments",
  },
  {
    name: "Sensual & Slow",
    mood: "sensual",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWXqpDKK4ed9O",
    appleMusicUrl: "https://music.apple.com/us/playlist/r-b-slow-jams/pl.451f921fe7484d48bae203f7f0a3cc2e",
    description: "R&B slow jams for passionate connection",
  },
  {
    name: "After Dark",
    mood: "passionate",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
    appleMusicUrl: "https://music.apple.com/us/playlist/late-night-vibes/pl.6b3e2a7eb16e4c4a9d3b8a2c1f4e5d6a",
    description: "Sultry, late-night vibes",
  },
  {
    name: "Chill & Intimate",
    mood: "relaxed",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX2UgsUIg75Vg",
    appleMusicUrl: "https://music.apple.com/us/playlist/chill-vibes/pl.2b0f1c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    description: "Mellow beats for relaxed intimacy",
  },
  {
    name: "Spicy Latin",
    mood: "playful",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX10zKzsJ2jva",
    appleMusicUrl: "https://music.apple.com/us/playlist/latin-heat/pl.7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    description: "Hot Latin rhythms to heat things up",
  },
  {
    name: "Electric Energy",
    mood: "dynamic",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4fpCWaHOned",
    appleMusicUrl: "https://music.apple.com/us/playlist/dance-workout/pl.9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    description: "High-energy tracks for adventurous nights",
  },
];

/** Merge translated name+description into base playlist data. */
function buildLocalizedPlaylists(strings: Array<{ name: string; description: string }>): PlaylistLink[] {
  return _CURATED_PLAYLISTS_EN.map((pl, i) => {
    const t = strings[i];
    return t ? { ...pl, name: t.name, description: t.description } : pl;
  });
}

export const CURATED_PLAYLISTS = createLocalizedArrayProxy<PlaylistLink>({
  en: _CURATED_PLAYLISTS_EN,
  es: buildLocalizedPlaylists(CURATED_PLAYLIST_STRINGS_ES),
  pt: buildLocalizedPlaylists(CURATED_PLAYLIST_STRINGS_PT),
});

// ============================================
// USER PLAYLIST TYPES & HELPERS
// ============================================

const _PLAYLIST_MOODS_EN = [
  { id: 'romantic', emoji: '🌹', label: 'Romantic' },
  { id: 'sensual', emoji: '🔥', label: 'Sensual' },
  { id: 'passionate', emoji: '💋', label: 'Passionate' },
  { id: 'relaxed', emoji: '🌊', label: 'Relaxed' },
  { id: 'playful', emoji: '😊', label: 'Playful' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic' },
];

export const PLAYLIST_MOODS = createLocalizedArrayProxy<{ id: string; emoji: string; label: string }>({
  en: _PLAYLIST_MOODS_EN,
  es: PLAYLIST_MOODS_ES,
  pt: PLAYLIST_MOODS_PT,
});

export const MAX_USER_PLAYLISTS = 10;

export function detectPlatform(url: string): 'spotify' | 'apple' | 'youtube' | 'other' {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('spotify.com') || lowerUrl.includes('spotify:')) return 'spotify';
  if (lowerUrl.includes('music.apple.com') || lowerUrl.includes('itunes.apple.com')) return 'apple';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('music.youtube.com')) return 'youtube';
  return 'other';
}

export function getPlatformIcon(platform: string): string {
  switch (platform) {
    case 'spotify': return '🟢';
    case 'apple': return '🍎';
    case 'youtube': return '🔴';
    default: return '🎵';
  }
}

export function getPlatformName(platform: string): string {
  switch (platform) {
    case 'spotify': return 'Spotify';
    case 'apple': return 'Apple Music';
    case 'youtube': return 'YouTube Music';
    default: return 'Music Link';
  }
}
