import type {
  Level,
  WeeklyGoal,
  MoodPlaylist,
  UserPreferences,
  InteractionEvent,
  SessionLearningFeedback,
  SessionReactionEmoji,
  Achievement,
  ExperienceProfile,
  ContentType,
} from '@/types/app';
import { buildExperienceClusterKey, resolveExperienceProfile } from '@/content/experienceProfiles';
import { createLocalizedArrayProxy } from '@/i18n/languageGetter';

// ============================================
// LEVELS & TITLES SYSTEM
// ============================================

export const LEVELS: Level[] = [
  { level: 1, title: 'New Sparks', emoji: '🌱', minStars: 0, maxStars: 24, color: '#84cc16' },
  { level: 2, title: 'Secret Explorers', emoji: '🧭', minStars: 25, maxStars: 74, color: '#22c55e' },
  { level: 3, title: 'Playful Troublemakers', emoji: '🗺️', minStars: 75, maxStars: 149, color: '#14b8a6' },
  { level: 4, title: 'Chemistry Builders', emoji: '💫', minStars: 150, maxStars: 299, color: '#06b6d4' },
  { level: 5, title: 'Heat Curators', emoji: '🎯', minStars: 300, maxStars: 499, color: '#3b82f6' },
  { level: 6, title: 'Dare Strategists', emoji: '🔥', minStars: 500, maxStars: 749, color: '#8b5cf6' },
  { level: 7, title: 'Masters of Mischief', emoji: '👑', minStars: 750, maxStars: 999, color: '#a855f7' },
  { level: 8, title: 'Legendary Lovers', emoji: '🏆', minStars: 1000, maxStars: 1499, color: '#ec4899' },
  { level: 9, title: 'Eternal Flame Keepers', emoji: '💎', minStars: 1500, maxStars: 9999, color: '#f43f5e' },
];

export const getLevel = (stars: number): Level => {
  return LEVELS.find(l => stars >= l.minStars && stars <= l.maxStars) || LEVELS[0];
};

export const getNextLevel = (stars: number): Level | null => {
  const currentLevel = getLevel(stars);
  return LEVELS.find(l => l.level === currentLevel.level + 1) || null;
};

// ============================================
// LEVEL UNLOCKS
// ============================================

export type UnlockableFeature =
  | 'beginner_content'
  | 'daily_bonus'
  | 'weekly_goals'
  | 'starter_pack_collections'
  | 'notes_ratings'
  | 'truth_or_dare'
  | 'mood_filtering'
  | 'date_night_generator'
  | 'user_playlists'
  | 'seasonal_content'
  | 'advanced_content_tier'
  | 'legendary_access_badge';

export interface LevelUnlock {
  level: number;
  minStars: number;
  features: UnlockableFeature[];
  unlockMessage: string;
}

export const FEATURE_UNLOCK_LABELS: Record<UnlockableFeature, string> = {
  beginner_content: 'Beginner content access',
  daily_bonus: 'Daily Bonus',
  weekly_goals: 'Weekly Goals',
  starter_pack_collections: 'Starter Pack collections',
  notes_ratings: 'Notes & ratings',
  truth_or_dare: 'Truth or Dare',
  mood_filtering: 'Mood-based filtering',
  date_night_generator: 'Date Night Generator',
  user_playlists: 'User Playlists',
  seasonal_content: 'Seasonal content',
  advanced_content_tier: 'Advanced content tier',
  legendary_access_badge: 'Legendary access badge',
};

export const LEVEL_UNLOCKS: LevelUnlock[] = [
  {
    level: 1,
    minStars: 0,
    features: ['beginner_content', 'daily_bonus', 'weekly_goals'],
    unlockMessage: 'Welcome in. Start with what feels easy and connected ✨',
  },
  {
    level: 2,
    minStars: 25,
    features: ['starter_pack_collections', 'notes_ratings'],
    unlockMessage: 'Your secret garden just got bigger 🌿',
  },
  {
    level: 3,
    minStars: 75,
    features: ['truth_or_dare', 'mood_filtering'],
    unlockMessage: 'Trouble is just another word for fun 🗺️',
  },
  {
    level: 4,
    minStars: 150,
    features: ['date_night_generator', 'user_playlists'],
    unlockMessage: "You're building something real 💫",
  },
  {
    level: 5,
    minStars: 300,
    features: ['seasonal_content', 'advanced_content_tier'],
    unlockMessage: 'The full menu. You earned it 🎯',
  },
  {
    level: 6,
    minStars: 500,
    features: ['legendary_access_badge'],
    unlockMessage: 'Legendary access unlocked. Everything is open 👑',
  },
];

const UNIQUE_BASE_UNLOCKS = Array.from(
  new Set(LEVEL_UNLOCKS.flatMap((unlock) => unlock.features))
) as UnlockableFeature[];

export const ALL_UNLOCKABLE_FEATURES: UnlockableFeature[] = [...UNIQUE_BASE_UNLOCKS];

export const getLevelUnlockByLevel = (level: number): LevelUnlock | null => {
  return LEVEL_UNLOCKS.find((unlock) => unlock.level === level) || null;
};

export const getUnlockedFeaturesForLevel = (level: number): UnlockableFeature[] => {
  if (level >= 6) return ALL_UNLOCKABLE_FEATURES;

  return Array.from(
    new Set(
      LEVEL_UNLOCKS
        .filter((unlock) => unlock.level <= level)
        .flatMap((unlock) => unlock.features)
    )
  ) as UnlockableFeature[];
};

// ============================================
// WEEKLY GOALS SYSTEM
// ============================================

export const generateWeeklyGoals = (userLevel: number): WeeklyGoal[] => {
  const baseGoals: WeeklyGoal[] = [
    { id: 'try_new', type: 'try_new', target: 2 + Math.floor(userLevel / 3), current: 0, description: 'weekly_goals.goal.try_new', emoji: '✨', reward: 5, completed: false },
    { id: 'earn_stars', type: 'earn_stars', target: 10 + (userLevel * 2), current: 0, description: 'weekly_goals.goal.earn_stars', emoji: '⭐', reward: 3, completed: false },
    { id: 'complete_challenge', type: 'complete_challenge', target: 1, current: 0, description: 'weekly_goals.goal.complete_challenge', emoji: '🎯', reward: 5, completed: false },
  ];
  return baseGoals;
};

// ============================================
// MOOD PLAYLISTS
// ============================================

const _MOOD_PLAYLISTS_EN: MoodPlaylist[] = [
  { id: 'romantic', name: 'Romantic Evening', emoji: '🌹', description: 'Slow, intimate, connection-focused', mood: 'unified', color: '#ec4899' },
  { id: 'passionate', name: 'Passionate Night', emoji: '🔥', description: 'Intense, fiery, urgent', mood: 'passionate', color: '#ef4444' },
  { id: 'playful', name: 'Playful Fun', emoji: '😊', description: 'Light, teasing, laughter', mood: 'playful', color: '#f59e0b' },
  { id: 'adventurous', name: 'Adventure Mode', emoji: '🎪', description: 'Try something new & exciting', mood: 'dynamic', color: '#f97316' },
  { id: 'relaxed', name: 'Lazy & Relaxed', emoji: '🌊', description: 'Low effort, maximum comfort', mood: 'flowing', color: '#06b6d4' },
  { id: 'quickie', name: 'Quick & Urgent', emoji: '⚡', description: 'Fast, spontaneous, hot', mood: 'passionate', color: '#a855f7' },
];

const _MOOD_PLAYLISTS_ES: MoodPlaylist[] = [
  { id: 'romantic', name: 'Noche Romántica', emoji: '🌹', description: 'Lenta, íntima y centrada en la conexión', mood: 'unified', color: '#ec4899' },
  { id: 'passionate', name: 'Noche Apasionada', emoji: '🔥', description: 'Intensa, ardiente y con urgencia', mood: 'passionate', color: '#ef4444' },
  { id: 'playful', name: 'Diversión Juguetona', emoji: '😊', description: 'Ligera, coqueta y con risas', mood: 'playful', color: '#f59e0b' },
  { id: 'adventurous', name: 'Modo Aventura', emoji: '🎪', description: 'Probar algo nuevo y emocionante', mood: 'dynamic', color: '#f97316' },
  { id: 'relaxed', name: 'Relajados y Tranquilos', emoji: '🌊', description: 'Poco esfuerzo, máxima comodidad', mood: 'flowing', color: '#06b6d4' },
  { id: 'quickie', name: 'Rápido e Intenso', emoji: '⚡', description: 'Rápido, espontáneo y caliente', mood: 'passionate', color: '#a855f7' },
];

const _MOOD_PLAYLISTS_PT: MoodPlaylist[] = [
  { id: 'romantic', name: 'Noite Romântica', emoji: '🌹', description: 'Lenta, íntima e focada em conexão', mood: 'unified', color: '#ec4899' },
  { id: 'passionate', name: 'Noite Apaixonada', emoji: '🔥', description: 'Intensa, ardente e urgente', mood: 'passionate', color: '#ef4444' },
  { id: 'playful', name: 'Diversão Brincalhona', emoji: '😊', description: 'Leve, provocante e com risadas', mood: 'playful', color: '#f59e0b' },
  { id: 'adventurous', name: 'Modo Aventura', emoji: '🎪', description: 'Experimentar algo novo e empolgante', mood: 'dynamic', color: '#f97316' },
  { id: 'relaxed', name: 'Leve e Relaxado', emoji: '🌊', description: 'Baixo esforço, conforto máximo', mood: 'flowing', color: '#06b6d4' },
  { id: 'quickie', name: 'Rápido e Urgente', emoji: '⚡', description: 'Rápido, espontâneo e quente', mood: 'passionate', color: '#a855f7' },
];

const _MOOD_PLAYLISTS_HI: MoodPlaylist[] = [
  { id: 'romantic', name: 'रोमांटिक शाम', emoji: '🌹', description: 'धीमी, अंतरंग और जुड़ाव-केंद्रित', mood: 'unified', color: '#ec4899' },
  { id: 'passionate', name: 'जुनूनी रात', emoji: '🔥', description: 'तीव्र, गर्मजोशी भरी और तात्कालिक', mood: 'passionate', color: '#ef4444' },
  { id: 'playful', name: 'चुलबुला मज़ा', emoji: '😊', description: 'हल्का, छेड़छाड़ भरा और हँसी से भरा', mood: 'playful', color: '#f59e0b' },
  { id: 'adventurous', name: 'एडवेंचर मोड', emoji: '🎪', description: 'कुछ नया और रोमांचक आज़माएँ', mood: 'dynamic', color: '#f97316' },
  { id: 'relaxed', name: 'आराम और सुकून', emoji: '🌊', description: 'कम मेहनत, अधिकतम आराम', mood: 'flowing', color: '#06b6d4' },
  { id: 'quickie', name: 'तेज़ और तात्कालिक', emoji: '⚡', description: 'तेज़, सहज और गर्मजोशी भरा', mood: 'passionate', color: '#a855f7' },
];

export const MOOD_PLAYLISTS: MoodPlaylist[] = createLocalizedArrayProxy<MoodPlaylist>({
  en: _MOOD_PLAYLISTS_EN,
  es: _MOOD_PLAYLISTS_ES,
  pt: _MOOD_PLAYLISTS_PT,
  hi: _MOOD_PLAYLISTS_HI,
});

// ============================================
// SMART LEARNING SYSTEM
// ============================================

export const DEFAULT_PREFERENCES: UserPreferences = {
  categoryScores: {},
  moodScores: {},
  difficultyScores: {},
  contentTypeScores: {
    position: 50,
    foreplay: 50,
    oral: 50,
    massage: 50,
    roleplay: 50,
  },
  preferredTimeOfDay: null,
  avgSessionLength: 0,
  favoriteToTriedRatio: 0,
  lastUpdated: new Date().toISOString(),
  experienceScores: {
    effort: { low: 50, medium: 50, high: 50 },
    energy: { calm: 50, building: 50, intense: 50 },
    connection: { emotional: 50, mixed: 50, physical: 50 },
    novelty: { familiar: 60, varied: 50, adventurous: 45 },
    controlBalance: { shared: 60, 'one-led': 50 },
  },
  sequenceScores: {
    step1: { position: 50, foreplay: 50, oral: 50, massage: 50, roleplay: 50 },
    step2: { position: 50, foreplay: 50, oral: 50, massage: 50, roleplay: 50 },
    step3: { position: 50, foreplay: 50, oral: 50, massage: 50, roleplay: 50 },
  },
  recentExperienceClusters: [],
};

// Learning weights - how much each action affects preferences
export const LEARNING_WEIGHTS = {
  view: 1,
  try: 5,
  favorite: 8,
  unfavorite: -3,
  rate_high: 10, // Rating 4-5
  rate_medium: 3, // Rating 3
  rate_low: -2, // Rating 1-2
  skip: -1,
};

// Decay factor - preferences slowly decay to allow for changing tastes
export const PREFERENCE_DECAY = 0.98;
export const MAX_PREFERENCE_SCORE = 100;
export const MIN_PREFERENCE_SCORE = 0;

export const getRecommendationRotationKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const stableHash = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getDeterministicVarietyOffset = (
  itemKey: string,
  contentType: string,
  rotationKey: string
): number => {
  // Keep recommendations fresh across days without reshuffling on every render.
  const hash = stableHash(`${rotationKey}:${contentType}:${itemKey}`);
  return ((hash % 1000) / 1000 - 0.5) * 4;
};

const clampScore = (value: number): number => Math.max(MIN_PREFERENCE_SCORE, Math.min(MAX_PREFERENCE_SCORE, value));
const SOFT_RECENCY_BLEND = 0.01;
const EMOJI_REACTION_RATING: Record<SessionReactionEmoji, number> = {
  '🔥': 5,
  '💜': 4,
  '😐': 2,
};

const softlyRecentreScore = (score: number): number => (
  clampScore(score + (50 - score) * SOFT_RECENCY_BLEND)
);

const applySoftRecencyBias = (prefs: UserPreferences): UserPreferences => ({
  ...prefs,
  categoryScores: Object.fromEntries(
    Object.entries(prefs.categoryScores).map(([key, value]) => [key, softlyRecentreScore(value)])
  ),
  moodScores: Object.fromEntries(
    Object.entries(prefs.moodScores).map(([key, value]) => [key, softlyRecentreScore(value)])
  ),
  difficultyScores: Object.fromEntries(
    Object.entries(prefs.difficultyScores).map(([key, value]) => [key, softlyRecentreScore(value)])
  ),
  contentTypeScores: Object.fromEntries(
    Object.entries(prefs.contentTypeScores).map(([key, value]) => [key, softlyRecentreScore(value)])
  ),
  experienceScores: {
    effort: Object.fromEntries(
      Object.entries(prefs.experienceScores.effort).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['experienceScores']['effort'],
    energy: Object.fromEntries(
      Object.entries(prefs.experienceScores.energy).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['experienceScores']['energy'],
    connection: Object.fromEntries(
      Object.entries(prefs.experienceScores.connection).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['experienceScores']['connection'],
    novelty: Object.fromEntries(
      Object.entries(prefs.experienceScores.novelty).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['experienceScores']['novelty'],
    controlBalance: Object.fromEntries(
      Object.entries(prefs.experienceScores.controlBalance).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['experienceScores']['controlBalance'],
  },
  sequenceScores: {
    step1: Object.fromEntries(
      Object.entries(prefs.sequenceScores.step1).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['sequenceScores']['step1'],
    step2: Object.fromEntries(
      Object.entries(prefs.sequenceScores.step2).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['sequenceScores']['step2'],
    step3: Object.fromEntries(
      Object.entries(prefs.sequenceScores.step3).map(([key, value]) => [key, softlyRecentreScore(value)])
    ) as UserPreferences['sequenceScores']['step3'],
  },
});

const enforceComfortBaseline = (prefs: UserPreferences): UserPreferences => ({
  ...prefs,
  experienceScores: {
    ...prefs.experienceScores,
    effort: {
      ...prefs.experienceScores.effort,
      low: Math.max(48, prefs.experienceScores.effort.low),
    },
    energy: {
      ...prefs.experienceScores.energy,
      calm: Math.max(48, prefs.experienceScores.energy.calm),
    },
    connection: {
      ...prefs.experienceScores.connection,
      emotional: Math.max(48, prefs.experienceScores.connection.emotional),
    },
    novelty: {
      ...prefs.experienceScores.novelty,
      familiar: Math.max(52, prefs.experienceScores.novelty.familiar),
    },
  },
});

const getDwellMultiplier = (seconds?: number): number => {
  if (!seconds || !Number.isFinite(seconds)) return 1;
  return Math.max(0.7, Math.min(2.2, 0.7 + (seconds / 50)));
};

const adjustExperienceAxis = (
  prefs: UserPreferences,
  axis: keyof UserPreferences['experienceScores'],
  key: string,
  delta: number
) => {
  const axisScores = prefs.experienceScores[axis] as Record<string, number>;
  const current = axisScores[key] ?? 50;
  axisScores[key] = clampScore(current + delta);
};

const getEventWeight = (event: InteractionEvent): number => {
  if (event.type === 'rate') {
    const baseRateWeight = event.rating && event.rating >= 4
      ? LEARNING_WEIGHTS.rate_high
      : event.rating === 3
        ? LEARNING_WEIGHTS.rate_medium
        : LEARNING_WEIGHTS.rate_low;
    return baseRateWeight * (event.signalStrength ?? 1);
  }
  const actionWeights: Record<string, number> = {
    view: LEARNING_WEIGHTS.view,
    try: LEARNING_WEIGHTS.try,
    favorite: LEARNING_WEIGHTS.favorite,
    unfavorite: LEARNING_WEIGHTS.unfavorite,
    skip: LEARNING_WEIGHTS.skip,
  };
  return (actionWeights[event.type] || 0) * (event.signalStrength ?? 1);
};

const applyExperienceWeight = (
  scores: UserPreferences['experienceScores'],
  profile: ExperienceProfile,
  weight: number
): UserPreferences['experienceScores'] => ({
  effort: { ...scores.effort, [profile.effort]: clampScore(scores.effort[profile.effort] + weight) },
  energy: { ...scores.energy, [profile.energy]: clampScore(scores.energy[profile.energy] + weight) },
  connection: { ...scores.connection, [profile.connection]: clampScore(scores.connection[profile.connection] + weight) },
  novelty: { ...scores.novelty, [profile.novelty]: clampScore(scores.novelty[profile.novelty] + weight) },
  controlBalance: {
    ...scores.controlBalance,
    [profile.controlBalance]: clampScore(scores.controlBalance[profile.controlBalance] + weight),
  },
});

const topPreference = <T extends string>(record: Record<T, number>, fallback: T): T => (
  (Object.entries(record as Record<string, number>)
    .sort(([, a], [, b]) => Number(b) - Number(a))[0]?.[0] as T) || fallback
);

// Smart Learning Helper Functions
export const SmartLearning = {
  // Update preferences based on user interaction
  updatePreferences: (
    currentPrefs: UserPreferences,
    event: InteractionEvent
  ): UserPreferences => {
    const newPrefs = applySoftRecencyBias({
      ...currentPrefs,
      experienceScores: {
        ...currentPrefs.experienceScores,
        effort: { ...currentPrefs.experienceScores.effort },
        energy: { ...currentPrefs.experienceScores.energy },
        connection: { ...currentPrefs.experienceScores.connection },
        novelty: { ...currentPrefs.experienceScores.novelty },
        controlBalance: { ...currentPrefs.experienceScores.controlBalance },
      },
      sequenceScores: {
        step1: { ...currentPrefs.sequenceScores.step1 },
        step2: { ...currentPrefs.sequenceScores.step2 },
        step3: { ...currentPrefs.sequenceScores.step3 },
      },
    });
    const weight = getEventWeight(event);

    // Update category score
    if (event.category) {
      const currentScore = newPrefs.categoryScores[event.category] || 50;
      newPrefs.categoryScores[event.category] = clampScore(currentScore + weight);
    }

    // Update mood score
    if (event.mood) {
      const currentScore = newPrefs.moodScores[event.mood] || 50;
      newPrefs.moodScores[event.mood] = clampScore(currentScore + weight);
    }

    // Update difficulty score
    if (event.difficulty) {
      const currentScore = newPrefs.difficultyScores[event.difficulty] || 50;
      newPrefs.difficultyScores[event.difficulty] = clampScore(currentScore + weight);
    }

    // Update content type score
    const currentTypeScore = newPrefs.contentTypeScores[event.contentType] || 50;
    newPrefs.contentTypeScores[event.contentType] = clampScore(currentTypeScore + weight);

    // Experience-level learning is primary (retention-safe default when sparse).
    const experienceProfile = event.experienceProfile || resolveExperienceProfile(event.contentType, {
      id: event.itemId,
      category: event.category,
      mood: event.mood,
      difficulty: event.difficulty,
    });
    newPrefs.experienceScores = applyExperienceWeight(newPrefs.experienceScores, experienceProfile, weight);

    if (event.sequencePosition) {
      const sequenceKey = `step${event.sequencePosition}` as keyof UserPreferences['sequenceScores'];
      const sequenceScores = { ...newPrefs.sequenceScores[sequenceKey] };
      const sequenceCurrent = sequenceScores[event.contentType] || 50;
      const dwellMultiplier = getDwellMultiplier(event.timeSpentSeconds);
      const engagementMultiplier = event.opened ? 1.2 : event.skipped ? 0.8 : 1;
      sequenceScores[event.contentType] = clampScore(
        sequenceCurrent + (weight * dwellMultiplier * engagementMultiplier)
      );
      newPrefs.sequenceScores = {
        ...newPrefs.sequenceScores,
        [sequenceKey]: sequenceScores,
      };
    }

    // Update time of day preference
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) newPrefs.preferredTimeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) newPrefs.preferredTimeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) newPrefs.preferredTimeOfDay = 'evening';
    else newPrefs.preferredTimeOfDay = 'night';

    newPrefs.lastUpdated = new Date().toISOString();

    return enforceComfortBaseline(newPrefs);
  },

  // Apply decay to preferences (call periodically)
  applyDecay: (prefs: UserPreferences): UserPreferences => {
    const decayScore = (score: number) => {
      const decayed = score * PREFERENCE_DECAY;
      // Decay towards 50 (neutral)
      return decayed + (50 - decayed) * 0.02;
    };

    return {
      ...prefs,
      categoryScores: Object.fromEntries(
        Object.entries(prefs.categoryScores).map(([k, v]) => [k, decayScore(v)])
      ),
      moodScores: Object.fromEntries(
        Object.entries(prefs.moodScores).map(([k, v]) => [k, decayScore(v)])
      ),
      difficultyScores: Object.fromEntries(
        Object.entries(prefs.difficultyScores).map(([k, v]) => [k, decayScore(v)])
      ),
      contentTypeScores: Object.fromEntries(
        Object.entries(prefs.contentTypeScores).map(([k, v]) => [k, decayScore(v)])
      ),
      experienceScores: {
        effort: Object.fromEntries(Object.entries(prefs.experienceScores.effort).map(([k, v]) => [k, decayScore(v)])) as UserPreferences['experienceScores']['effort'],
        energy: Object.fromEntries(Object.entries(prefs.experienceScores.energy).map(([k, v]) => [k, decayScore(v)])) as UserPreferences['experienceScores']['energy'],
        connection: Object.fromEntries(Object.entries(prefs.experienceScores.connection).map(([k, v]) => [k, decayScore(v)])) as UserPreferences['experienceScores']['connection'],
        novelty: Object.fromEntries(Object.entries(prefs.experienceScores.novelty).map(([k, v]) => [k, decayScore(v)])) as UserPreferences['experienceScores']['novelty'],
        controlBalance: Object.fromEntries(Object.entries(prefs.experienceScores.controlBalance).map(([k, v]) => [k, decayScore(v)])) as UserPreferences['experienceScores']['controlBalance'],
      },
      sequenceScores: {
        step1: Object.fromEntries(
          Object.entries(prefs.sequenceScores.step1).map(([key, value]) => [key, decayScore(value)])
        ) as UserPreferences['sequenceScores']['step1'],
        step2: Object.fromEntries(
          Object.entries(prefs.sequenceScores.step2).map(([key, value]) => [key, decayScore(value)])
        ) as UserPreferences['sequenceScores']['step2'],
        step3: Object.fromEntries(
          Object.entries(prefs.sequenceScores.step3).map(([key, value]) => [key, decayScore(value)])
        ) as UserPreferences['sequenceScores']['step3'],
      },
      lastUpdated: new Date().toISOString(),
    };
  },

  applySessionFeedback: (
    currentPrefs: UserPreferences,
    feedback: SessionLearningFeedback
  ): { preferences: UserPreferences; events: InteractionEvent[] } => {
    let nextPrefs = currentPrefs;
    const now = new Date().toISOString();
    const events: InteractionEvent[] = [];

    const appendEvent = (event: Omit<InteractionEvent, 'timestamp'>) => {
      const completeEvent: InteractionEvent = { ...event, timestamp: now };
      nextPrefs = SmartLearning.updatePreferences(nextPrefs, completeEvent);
      events.push(completeEvent);
    };

    feedback.steps.forEach((step) => {
      const eventBase: Omit<InteractionEvent, 'timestamp' | 'type'> = {
        contentType: step.contentType,
        itemId: step.itemId,
        category: step.category,
        mood: step.mood,
        difficulty: step.difficulty,
        experienceProfile: step.experienceProfile,
        sequencePosition: step.sequencePosition,
        timeSpentSeconds: step.timeSpentSeconds,
        opened: step.opened,
        skipped: step.skipped,
        source: 'session_feedback',
      };

      appendEvent({
        ...eventBase,
        type: step.opened ? 'view' : 'skip',
        signalStrength: getDwellMultiplier(step.timeSpentSeconds) * (step.opened ? 1.1 : 1),
      });

      if (feedback.reaction) {
        appendEvent({
          ...eventBase,
          type: 'rate',
          rating: EMOJI_REACTION_RATING[feedback.reaction],
          signalStrength: getDwellMultiplier(step.timeSpentSeconds),
        });
      }

      if (feedback.saved && step.opened) {
        appendEvent({
          ...eventBase,
          type: 'favorite',
          signalStrength: 0.9 + (Math.min(90, step.timeSpentSeconds) / 90),
        });
      }
    });

    if (feedback.mood) {
      const moodDelta = feedback.reaction === '🔥' ? 7 : feedback.reaction === '💜' ? 5 : -1;
      const currentMoodScore = nextPrefs.moodScores[feedback.mood] || 50;
      nextPrefs.moodScores[feedback.mood] = clampScore(currentMoodScore + moodDelta);
    }

    if (feedback.reaction === '🔥') {
      adjustExperienceAxis(nextPrefs, 'energy', 'intense', 6);
      adjustExperienceAxis(nextPrefs, 'energy', 'building', 3);
      adjustExperienceAxis(nextPrefs, 'novelty', 'varied', 3);
      adjustExperienceAxis(nextPrefs, 'novelty', 'adventurous', 2);
    } else if (feedback.reaction === '💜') {
      adjustExperienceAxis(nextPrefs, 'energy', 'building', 4);
      adjustExperienceAxis(nextPrefs, 'energy', 'calm', 2);
      adjustExperienceAxis(nextPrefs, 'novelty', 'familiar', 2);
      adjustExperienceAxis(nextPrefs, 'novelty', 'varied', 2);
      adjustExperienceAxis(nextPrefs, 'connection', 'emotional', 3);
    } else if (feedback.reaction === '😐') {
      adjustExperienceAxis(nextPrefs, 'effort', 'low', 5);
      adjustExperienceAxis(nextPrefs, 'energy', 'calm', 4);
      adjustExperienceAxis(nextPrefs, 'novelty', 'familiar', 4);
      adjustExperienceAxis(nextPrefs, 'energy', 'intense', -2);
      adjustExperienceAxis(nextPrefs, 'novelty', 'adventurous', -2);
    }

    if (feedback.regenerateCount > 0) {
      const regenDelta = Math.min(8, feedback.regenerateCount * 2);
      adjustExperienceAxis(nextPrefs, 'novelty', 'varied', regenDelta);
      adjustExperienceAxis(nextPrefs, 'energy', 'building', Math.max(1, Math.floor(regenDelta / 2)));
    }

    if (feedback.exitedEarly) {
      adjustExperienceAxis(nextPrefs, 'effort', 'low', 5);
      adjustExperienceAxis(nextPrefs, 'connection', 'emotional', 4);
      adjustExperienceAxis(nextPrefs, 'novelty', 'familiar', 3);
      adjustExperienceAxis(nextPrefs, 'energy', 'calm', 3);
      adjustExperienceAxis(nextPrefs, 'energy', 'intense', -2);
      adjustExperienceAxis(nextPrefs, 'novelty', 'adventurous', -2);
    }

    nextPrefs.lastUpdated = now;

    return {
      preferences: enforceComfortBaseline(nextPrefs),
      events,
    };
  },

  // Calculate recommendation score for an item
  calculateItemScore: (
    item: { id?: string | number; name?: string; category?: string; mood?: string; difficulty?: string; duration?: string },
    contentType: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay',
    prefs: UserPreferences,
    isTried: boolean,
    isFavorite: boolean,
    rotationKey: string
  ): number => {
    let score = 50; // Base score

    // Category preference
    if (item.category && prefs.categoryScores[item.category]) {
      score += (prefs.categoryScores[item.category] - 50) * 0.3;
    }

    // Mood preference
    if (item.mood && prefs.moodScores[item.mood]) {
      score += (prefs.moodScores[item.mood] - 50) * 0.25;
    }

    // Difficulty preference
    if (item.difficulty && prefs.difficultyScores[item.difficulty]) {
      score += (prefs.difficultyScores[item.difficulty] - 50) * 0.2;
    }

    // Content type preference (secondary to experience-level fit).
    if (prefs.contentTypeScores[contentType]) {
      score += (prefs.contentTypeScores[contentType] - 50) * 0.15;
    }

    const profile = resolveExperienceProfile(contentType, {
      id: Number(item.id || 0),
      category: item.category,
      mood: item.mood,
      difficulty: item.difficulty,
      duration: item.duration,
    });
    score += (prefs.experienceScores.effort[profile.effort] - 50) * 0.25;
    score += (prefs.experienceScores.energy[profile.energy] - 50) * 0.2;
    score += (prefs.experienceScores.connection[profile.connection] - 50) * 0.3;
    score += (prefs.experienceScores.novelty[profile.novelty] - 50) * 0.2;
    score += (prefs.experienceScores.controlBalance[profile.controlBalance] - 50) * 0.15;

    // Retention-safe default: favor comforting/low-effort on sparse history.
    const profileKey = buildExperienceClusterKey(profile);
    if (prefs.recentExperienceClusters[0] === profileKey) {
      score -= 18;
    }
    if (prefs.recentExperienceClusters.includes(profileKey)) {
      score -= 8;
    }

    // Novelty bonus - prefer untried items slightly
    if (!isTried) {
      score += 6;
    }

    // Favorite penalty - don't recommend what they already love
    if (isFavorite) {
      score -= 5;
    }

    const itemKey = String(item.id ?? item.name ?? `${contentType}-fallback`);

    // Add a small deterministic daily rotation so recommendations feel fresh
    // without changing unpredictably during a session.
    score += getDeterministicVarietyOffset(itemKey, contentType, rotationKey);

    return Math.max(0, Math.min(100, score));
  },

  // Get personalized recommendations
  getRecommendations: (
    prefs: UserPreferences,
    allContent: {
      positions: any[];
      foreplay: any[];
      oral: any[];
      massage: any[];
      roleplay: any[];
    },
    userState: {
      tried: number[];
      triedForeplay: number[];
      triedOral: number[];
      triedMassage: number[];
      triedRoleplay: number[];
      favorites: number[];
      favoriteForeplay: number[];
      favoriteOral: number[];
      favoriteMassage: number[];
      favoriteRoleplay: number[];
    },
    count: number = 5
  ): Array<{ type: string; item: any; score: number; reason: string }> => {
    const scored: Array<{ type: string; item: any; score: number; reason: string }> = [];
    const rotationKey = getRecommendationRotationKey();

    // Score positions
    allContent.positions.forEach(item => {
      const isTried = userState.tried.includes(item.id);
      const isFavorite = userState.favorites.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'position', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, 'position', prefs, isTried);
      scored.push({ type: 'position', item, score, reason });
    });

    // Score foreplay
    allContent.foreplay.forEach(item => {
      const isTried = userState.triedForeplay.includes(item.id);
      const isFavorite = userState.favoriteForeplay.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'foreplay', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, 'foreplay', prefs, isTried);
      scored.push({ type: 'foreplay', item, score, reason });
    });

    // Score oral
    allContent.oral.forEach(item => {
      const isTried = userState.triedOral.includes(item.id);
      const isFavorite = userState.favoriteOral.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'oral', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, 'oral', prefs, isTried);
      scored.push({ type: 'oral', item, score, reason });
    });

    // Score massage
    allContent.massage.forEach(item => {
      const isTried = userState.triedMassage.includes(item.id);
      const isFavorite = userState.favoriteMassage.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'massage', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, 'massage', prefs, isTried);
      scored.push({ type: 'massage', item, score, reason });
    });

    // Score roleplay
    allContent.roleplay.forEach(item => {
      const isTried = userState.triedRoleplay.includes(item.id);
      const isFavorite = userState.favoriteRoleplay.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'roleplay', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, 'roleplay', prefs, isTried);
      scored.push({ type: 'roleplay', item, score, reason });
    });

    // Sort and avoid near-duplicate clusters in a single recommendation set.
    const selected: Array<{ type: string; item: any; score: number; reason: string }> = [];
    const seenClusters = new Set<string>();
    scored.sort((a, b) => b.score - a.score).forEach((candidate) => {
      if (selected.length >= count) return;
      const profile = resolveExperienceProfile(candidate.type as ContentType, {
        id: Number(candidate.item?.id || 0),
        category: candidate.item?.category,
        mood: candidate.item?.mood,
        difficulty: candidate.item?.difficulty,
        duration: candidate.item?.duration,
      });
      const cluster = `${candidate.type}:${buildExperienceClusterKey(profile)}`;
      if (seenClusters.has(cluster)) return;
      seenClusters.add(cluster);
      selected.push(candidate);
    });

    return selected;
  },

  // Generate human-readable reason for recommendation
  getRecommendationReason: (
    item: { id?: number; category?: string; mood?: string; difficulty?: string; duration?: string },
    contentType: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay',
    prefs: UserPreferences,
    isTried: boolean
  ): string => {
    const profile = resolveExperienceProfile(contentType, {
      id: item.id || 0,
      category: item.category,
      mood: item.mood,
      difficulty: item.difficulty,
      duration: item.duration,
    });
    const dominantEffort = topPreference(prefs.experienceScores.effort, 'low');
    const dominantConnection = topPreference(prefs.experienceScores.connection, 'emotional');
    const dominantNovelty = topPreference(prefs.experienceScores.novelty, 'familiar');

    if (!isTried && profile.effort === 'low' && profile.connection === 'emotional') {
      return 'You tend to like it slow and connected.';
    }
    if (profile.effort === dominantEffort && profile.connection === dominantConnection) {
      return 'This one fits you.';
    }
    if (profile.novelty === dominantNovelty) {
      return dominantNovelty === 'familiar'
        ? 'This is right in your comfort zone - in a good way.'
        : 'This matches your favorite kind of energy.';
    }
    return 'You come back to this kind of vibe.';
  },

  // Get top preferences for display
  getTopPreferences: (prefs: UserPreferences): {
    categories: string[];
    moods: string[];
    contentTypes: string[];
  } => {
    const sortByScore = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .filter(([, score]) => score > 55)
        .map(([key]) => key);

    return {
      categories: sortByScore(prefs.categoryScores).slice(0, 3),
      moods: sortByScore(prefs.moodScores).slice(0, 3),
      contentTypes: sortByScore(prefs.contentTypeScores).slice(0, 3),
    };
  },
};

// ============================================
// ACHIEVEMENTS DEFINITIONS
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_try', name: 'Found your comfort rhythm', description: 'You started discovering what feels good together', emoji: '🌱', category: 'milestone' },
  { id: 'tried_5', name: 'Tried something new - your way', description: 'You explored new moments in a way that felt right for you', emoji: '🌿', category: 'milestone' },
  { id: 'tried_10', name: 'Exploring with care', description: 'You are gently learning more of your shared rhythm', emoji: '🗺️', category: 'milestone' },
  { id: 'tried_25', name: 'Playful Momentum', description: 'Try 25 different ideas together', emoji: '⛰️', category: 'milestone' },
  { id: 'tried_50', name: 'Heat Builder', description: 'Try 50 different ideas together', emoji: '🏆', category: 'milestone' },
  { id: 'tried_100', name: 'Legendary Chemistry', description: 'Try 100 different ideas together', emoji: '👑', category: 'milestone' },
  { id: 'first_challenge', name: 'Challenge Accepted', description: 'Complete your first challenge', emoji: '🎯', category: 'adventure' },
  { id: 'challenges_5', name: 'Bold Pair', description: 'Complete 5 challenges', emoji: '💪', category: 'adventure' },
  { id: 'challenges_10', name: 'Dare Duo', description: 'Complete 10 challenges', emoji: '🔥', category: 'adventure' },
  { id: 'week_streak_2', name: 'Kept things gentle this week', description: 'You returned and stayed connected in your own pace', emoji: '🌡️', category: 'consistency' },
  { id: 'week_streak_4', name: 'Balanced familiarity and curiosity', description: 'You kept showing up with both comfort and openness', emoji: '🔥', category: 'consistency' },
  { id: 'all_moods', name: 'Mood Shifter', description: 'Try positions in all moods', emoji: '🎭', category: 'exploration' },
  { id: 'all_categories', name: 'Full Menu', description: 'Try all position categories', emoji: '⭕', category: 'exploration' },
  { id: 'advanced_5', name: 'Edge Explorer', description: 'Try 5 advanced positions', emoji: '🎪', category: 'adventure' },
  { id: 'notes_10', name: 'Memory Keeper', description: 'Write 10 personal notes', emoji: '📝', category: 'exploration' },
  { id: 'monthly_star', name: 'Star Stacker', description: 'Earn 10 stars in one month', emoji: '⭐', category: 'milestone' },
  { id: 'date_night_5', name: 'Date Night Ritual', description: 'Complete 5 date nights', emoji: '🌙', category: 'consistency' },
  { id: 'favorites_10', name: 'Favorite Collector', description: 'Save 10 favorites across the app', emoji: '💘', category: 'exploration' },
  { id: 'week_streak_12', name: 'Long-Game Heat', description: 'Keep a 12 week streak', emoji: '❤️‍🔥', category: 'consistency' },
  { id: 'all_content_types', name: 'Whole-Vibe Player', description: 'Try at least one idea in every content type', emoji: '🎼', category: 'adventure' },
];
