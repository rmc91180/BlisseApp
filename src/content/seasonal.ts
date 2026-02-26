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
  { id: 1, type: 'truth', intensity: 'mild', text: "What's your favorite thing about our physical connection?" },
  { id: 2, type: 'truth', intensity: 'mild', text: "When did you first know you were attracted to me?" },
  { id: 3, type: 'truth', intensity: 'mild', text: "What's one thing I do that always makes you smile?" },
  { id: 4, type: 'truth', intensity: 'mild', text: "What's your favorite memory of us together?" },
  { id: 5, type: 'truth', intensity: 'mild', text: "Where's the most romantic place you'd want to travel with me?" },
  { id: 6, type: 'truth', intensity: 'mild', text: "What outfit of mine do you find most attractive?" },
  { id: 7, type: 'truth', intensity: 'mild', text: "What's something sweet I do that you've never told me you noticed?" },
  { id: 8, type: 'truth', intensity: 'mild', text: "What song makes you think of me?" },
  { id: 9, type: 'truth', intensity: 'mild', text: "What was going through your mind the first time we kissed?" },
  { id: 10, type: 'truth', intensity: 'mild', text: "What's your favorite way to spend a lazy Sunday together?" },
  { id: 11, type: 'truth', intensity: 'mild', text: "What's the most romantic thing I've ever done for you?" },
  { id: 12, type: 'truth', intensity: 'mild', text: "If we could relive any moment together, which would you choose?" },
  { id: 13, type: 'truth', intensity: 'mild', text: "What little thing do I do that makes you feel loved?" },
  { id: 14, type: 'truth', intensity: 'mild', text: "What were your first impressions of me?" },
  { id: 15, type: 'truth', intensity: 'mild', text: "What's your favorite compliment I've ever given you?" },
  { id: 16, type: 'truth', intensity: 'mild', text: "What movie scene reminds you of us?" },
  // MEDIUM TRUTHS
  { id: 17, type: 'truth', intensity: 'medium', text: "What's something you've always wanted to try in the bedroom?" },
  { id: 18, type: 'truth', intensity: 'medium', text: "Where's the most adventurous place you'd want to be intimate?" },
  { id: 19, type: 'truth', intensity: 'medium', text: "What's your biggest turn-on that I do?" },
  { id: 20, type: 'truth', intensity: 'medium', text: "What time of day do you feel most in the mood?" },
  { id: 21, type: 'truth', intensity: 'medium', text: "What's a fantasy you've had about us?" },
  { id: 22, type: 'truth', intensity: 'medium', text: "What part of your body do you most like me to touch?" },
  { id: 23, type: 'truth', intensity: 'medium', text: "What's something I do that drives you wild?" },
  { id: 24, type: 'truth', intensity: 'medium', text: "Have you ever had a dream about us? Describe it." },
  { id: 25, type: 'truth', intensity: 'medium', text: "What's the most attractive thing about my body?" },
  { id: 26, type: 'truth', intensity: 'medium', text: "What kind of touch from me makes you melt instantly?" },
  { id: 27, type: 'truth', intensity: 'medium', text: "What's something you want more of in our intimate life?" },
  { id: 28, type: 'truth', intensity: 'medium', text: "Where do you like to be kissed that I might not know about?" },
  { id: 29, type: 'truth', intensity: 'medium', text: "What's your favorite thing about our chemistry?" },
  { id: 30, type: 'truth', intensity: 'medium', text: "What would make a perfect date night ending?" },
  { id: 31, type: 'truth', intensity: 'medium', text: "What's a subtle signal you give when you're in the mood?" },
  { id: 32, type: 'truth', intensity: 'medium', text: "What's the longest you've thought about being intimate with me?" },
  // SPICY TRUTHS
  { id: 33, type: 'truth', intensity: 'spicy', text: "What's your most secret fantasy you've never shared?" },
  { id: 34, type: 'truth', intensity: 'spicy', text: "What's the boldest thing you want me to do to you tonight?" },
  { id: 35, type: 'truth', intensity: 'spicy', text: "Describe your perfect intimate evening in detail." },
  { id: 36, type: 'truth', intensity: 'spicy', text: "What role play scenario turns you on most?" },
  { id: 37, type: 'truth', intensity: 'spicy', text: "What's the most spontaneous thing you want us to do?" },
  { id: 38, type: 'truth', intensity: 'spicy', text: "If you could have me do anything right now, what would it be?" },
  { id: 39, type: 'truth', intensity: 'spicy', text: "What's a position from the app you're most curious to try?" },
  { id: 40, type: 'truth', intensity: 'spicy', text: "Where's the riskiest place you'd want to be intimate with me?" },
  { id: 41, type: 'truth', intensity: 'spicy', text: "What's the longest you'd want our intimate sessions to last?" },
  { id: 42, type: 'truth', intensity: 'spicy', text: "Describe what you want me to do to you using only sounds." },
  { id: 43, type: 'truth', intensity: 'spicy', text: "What's something you've seen that you want us to recreate?" },
  { id: 44, type: 'truth', intensity: 'spicy', text: "If I whispered something in your ear right now, what would you want it to be?" },
  // WILD TRUTHS
  { id: 45, type: 'truth', intensity: 'wild', text: "What's the wildest fantasy you've ever imagined about us?" },
  { id: 46, type: 'truth', intensity: 'wild', text: "Describe exactly how you want tonight to go, in explicit detail." },
  { id: 47, type: 'truth', intensity: 'wild', text: "What's something you've always wanted to try but been too shy to ask?" },
  { id: 48, type: 'truth', intensity: 'wild', text: "If there were no limits tonight, what would you want us to do?" },
  // MILD DARES
  { id: 101, type: 'dare', intensity: 'mild', text: "Give your partner a 30-second shoulder massage." },
  { id: 102, type: 'dare', intensity: 'mild', text: "Whisper something you love about them in their ear." },
  { id: 103, type: 'dare', intensity: 'mild', text: "Hold hands and look into each other's eyes for 60 seconds." },
  { id: 104, type: 'dare', intensity: 'mild', text: "Give your partner a slow, romantic kiss." },
  { id: 105, type: 'dare', intensity: 'mild', text: "Tell your partner three things you find attractive about them." },
  { id: 106, type: 'dare', intensity: 'mild', text: "Slow dance together to an imaginary song for one minute." },
  { id: 107, type: 'dare', intensity: 'mild', text: "Feed your partner something sweet." },
  { id: 108, type: 'dare', intensity: 'mild', text: "Write 'I love you' somewhere on your partner with your finger." },
  { id: 109, type: 'dare', intensity: 'mild', text: "Give your partner butterfly kisses on their cheeks." },
  { id: 110, type: 'dare', intensity: 'mild', text: "Play with your partner's hair for one minute." },
  { id: 111, type: 'dare', intensity: 'mild', text: "Hug your partner from behind and hold for 30 seconds." },
  { id: 112, type: 'dare', intensity: 'mild', text: "Describe your partner using only compliments for 30 seconds." },
  { id: 113, type: 'dare', intensity: 'mild', text: "Give your partner an Eskimo kiss (rub noses together)." },
  { id: 114, type: 'dare', intensity: 'mild', text: "Trace the outline of your partner's face with your fingertip." },
  { id: 115, type: 'dare', intensity: 'mild', text: "Let your partner pick the next song and dance to it together." },
  { id: 116, type: 'dare', intensity: 'mild', text: "Give your partner a hand massage for one minute." },
  // MEDIUM DARES
  { id: 117, type: 'dare', intensity: 'medium', text: "Kiss your partner's neck for 30 seconds." },
  { id: 118, type: 'dare', intensity: 'medium', text: "Remove one piece of your clothing seductively." },
  { id: 119, type: 'dare', intensity: 'medium', text: "Give your partner a sensual back massage for 2 minutes." },
  { id: 120, type: 'dare', intensity: 'medium', text: "Trace your lips across your partner's collarbone." },
  { id: 121, type: 'dare', intensity: 'medium', text: "Whisper your biggest fantasy in your partner's ear." },
  { id: 122, type: 'dare', intensity: 'medium', text: "Let your partner undress you with only their teeth for one item." },
  { id: 123, type: 'dare', intensity: 'medium', text: "Kiss your partner everywhere except their lips for 1 minute." },
  { id: 124, type: 'dare', intensity: 'medium', text: "Do your best seductive dance for 30 seconds." },
  { id: 125, type: 'dare', intensity: 'medium', text: "Nibble your partner's ear gently for 20 seconds." },
  { id: 126, type: 'dare', intensity: 'medium', text: "Let your partner blindfold you for the next dare." },
  { id: 127, type: 'dare', intensity: 'medium', text: "Kiss from your partner's wrist up to their shoulder." },
  { id: 128, type: 'dare', intensity: 'medium', text: "Breathe warm air on your partner's neck without touching." },
  { id: 129, type: 'dare', intensity: 'medium', text: "Give your partner a foot massage for 2 minutes." },
  { id: 130, type: 'dare', intensity: 'medium', text: "Remove your partner's socks using only your mouth." },
  { id: 131, type: 'dare', intensity: 'medium', text: "Describe what you want to do to your partner in a whisper." },
  { id: 132, type: 'dare', intensity: 'medium', text: "Let your partner draw something on your back - guess what it is." },
  // SPICY DARES
  { id: 133, type: 'dare', intensity: 'spicy', text: "Remove your partner's shirt using only your mouth." },
  { id: 134, type: 'dare', intensity: 'spicy', text: "Demonstrate your favorite position on your partner (clothes on)." },
  { id: 135, type: 'dare', intensity: 'spicy', text: "Give your partner a full-body massage for 3 minutes." },
  { id: 136, type: 'dare', intensity: 'spicy', text: "Kiss your partner's entire body from head to toe." },
  { id: 137, type: 'dare', intensity: 'spicy', text: "Blindfold your partner and tease them for 2 minutes." },
  { id: 138, type: 'dare', intensity: 'spicy', text: "Act out a steamy scene from a movie together." },
  { id: 139, type: 'dare', intensity: 'spicy', text: "Use an ice cube to trace a path on your partner's body." },
  { id: 140, type: 'dare', intensity: 'spicy', text: "Straddle your partner and kiss them passionately for 1 minute." },
  { id: 141, type: 'dare', intensity: 'spicy', text: "Let your partner be in complete control of your hands for 2 minutes." },
  { id: 142, type: 'dare', intensity: 'spicy', text: "Leave a trail of kisses from your partner's neck to their waistline." },
  { id: 143, type: 'dare', intensity: 'spicy', text: "Pin your partner's hands above their head and kiss them." },
  { id: 144, type: 'dare', intensity: 'spicy', text: "Give your partner a lap dance for 1 minute." },
  // WILD DARES
  { id: 145, type: 'dare', intensity: 'wild', text: "Recreate your partner's favorite fantasy right now." },
  { id: 146, type: 'dare', intensity: 'wild', text: "Let your partner be completely in control for the next 5 minutes." },
  { id: 147, type: 'dare', intensity: 'wild', text: "Try a new position from the app right now." },
  { id: 148, type: 'dare', intensity: 'wild', text: "Your partner gets to direct exactly what happens for 5 minutes." },
  { id: 149, type: 'dare', intensity: 'wild', text: "Act out the last fantasy either of you mentioned tonight." },
  { id: 150, type: 'dare', intensity: 'wild', text: "Use only your mouth for the next 3 minutes - no hands allowed." },
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
