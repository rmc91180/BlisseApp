import type {
  Level,
  WeeklyGoal,
  MoodPlaylist,
  UserPreferences,
  InteractionEvent,
  Achievement,
} from '@/types/app';

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

export const MOOD_PLAYLISTS: MoodPlaylist[] = [
  { id: 'romantic', name: 'Romantic Evening', emoji: '🌹', description: 'Slow, intimate, connection-focused', mood: 'unified', color: '#ec4899' },
  { id: 'passionate', name: 'Passionate Night', emoji: '🔥', description: 'Intense, fiery, urgent', mood: 'passionate', color: '#ef4444' },
  { id: 'playful', name: 'Playful Fun', emoji: '😊', description: 'Light, teasing, laughter', mood: 'playful', color: '#f59e0b' },
  { id: 'adventurous', name: 'Adventure Mode', emoji: '🎪', description: 'Try something new & exciting', mood: 'dynamic', color: '#f97316' },
  { id: 'relaxed', name: 'Lazy & Relaxed', emoji: '🌊', description: 'Low effort, maximum comfort', mood: 'flowing', color: '#06b6d4' },
  { id: 'quickie', name: 'Quick & Urgent', emoji: '⚡', description: 'Fast, spontaneous, hot', mood: 'passionate', color: '#a855f7' },
];

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

const getRecommendationRotationKey = (date: Date = new Date()): string => {
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

// Smart Learning Helper Functions
export const SmartLearning = {
  // Update preferences based on user interaction
  updatePreferences: (
    currentPrefs: UserPreferences,
    event: InteractionEvent
  ): UserPreferences => {
    const newPrefs = { ...currentPrefs };

    // Determine the weight for this action
    let weight = 0;
    if (event.type === 'rate') {
      // Handle rating separately since it uses rate_high/medium/low
      if (event.rating && event.rating >= 4) weight = LEARNING_WEIGHTS.rate_high;
      else if (event.rating === 3) weight = LEARNING_WEIGHTS.rate_medium;
      else weight = LEARNING_WEIGHTS.rate_low;
    } else {
      // For non-rate actions, look up directly
      const actionWeights: Record<string, number> = {
        view: LEARNING_WEIGHTS.view,
        try: LEARNING_WEIGHTS.try,
        favorite: LEARNING_WEIGHTS.favorite,
        unfavorite: LEARNING_WEIGHTS.unfavorite,
        skip: LEARNING_WEIGHTS.skip,
      };
      weight = actionWeights[event.type] || 0;
    }

    // Update category score
    if (event.category) {
      const currentScore = newPrefs.categoryScores[event.category] || 50;
      newPrefs.categoryScores[event.category] = Math.max(
        MIN_PREFERENCE_SCORE,
        Math.min(MAX_PREFERENCE_SCORE, currentScore + weight)
      );
    }

    // Update mood score
    if (event.mood) {
      const currentScore = newPrefs.moodScores[event.mood] || 50;
      newPrefs.moodScores[event.mood] = Math.max(
        MIN_PREFERENCE_SCORE,
        Math.min(MAX_PREFERENCE_SCORE, currentScore + weight)
      );
    }

    // Update difficulty score
    if (event.difficulty) {
      const currentScore = newPrefs.difficultyScores[event.difficulty] || 50;
      newPrefs.difficultyScores[event.difficulty] = Math.max(
        MIN_PREFERENCE_SCORE,
        Math.min(MAX_PREFERENCE_SCORE, currentScore + weight)
      );
    }

    // Update content type score
    const currentTypeScore = newPrefs.contentTypeScores[event.contentType] || 50;
    newPrefs.contentTypeScores[event.contentType] = Math.max(
      MIN_PREFERENCE_SCORE,
      Math.min(MAX_PREFERENCE_SCORE, currentTypeScore + weight)
    );

    // Update time of day preference
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) newPrefs.preferredTimeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) newPrefs.preferredTimeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) newPrefs.preferredTimeOfDay = 'evening';
    else newPrefs.preferredTimeOfDay = 'night';

    newPrefs.lastUpdated = new Date().toISOString();

    return newPrefs;
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
      lastUpdated: new Date().toISOString(),
    };
  },

  // Calculate recommendation score for an item
  calculateItemScore: (
    item: { id?: string | number; name?: string; category?: string; mood?: string; difficulty?: string },
    contentType: string,
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

    // Content type preference
    if (prefs.contentTypeScores[contentType]) {
      score += (prefs.contentTypeScores[contentType] - 50) * 0.15;
    }

    // Novelty bonus - prefer untried items slightly
    if (!isTried) {
      score += 10;
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
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'position', item, score, reason });
    });

    // Score foreplay
    allContent.foreplay.forEach(item => {
      const isTried = userState.triedForeplay.includes(item.id);
      const isFavorite = userState.favoriteForeplay.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'foreplay', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'foreplay', item, score, reason });
    });

    // Score oral
    allContent.oral.forEach(item => {
      const isTried = userState.triedOral.includes(item.id);
      const isFavorite = userState.favoriteOral.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'oral', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'oral', item, score, reason });
    });

    // Score massage
    allContent.massage.forEach(item => {
      const isTried = userState.triedMassage.includes(item.id);
      const isFavorite = userState.favoriteMassage.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'massage', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'massage', item, score, reason });
    });

    // Score roleplay
    allContent.roleplay.forEach(item => {
      const isTried = userState.triedRoleplay.includes(item.id);
      const isFavorite = userState.favoriteRoleplay.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'roleplay', prefs, isTried, isFavorite, rotationKey
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'roleplay', item, score, reason });
    });

    // Sort by score and return top N
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  },

  // Generate human-readable reason for recommendation
  getRecommendationReason: (
    item: { category?: string; mood?: string; difficulty?: string },
    prefs: UserPreferences,
    isTried: boolean
  ): string => {
    const reasons: string[] = [];

    if (!isTried) {
      reasons.push('Fresh spark for tonight');
    }

    if (item.category && prefs.categoryScores[item.category] > 65) {
      reasons.push('Fits your favorite vibe');
    }

    if (item.mood && prefs.moodScores[item.mood] > 65) {
      reasons.push('Matches your current mood');
    }

    if (item.difficulty === 'Beginner' && prefs.difficultyScores['Beginner'] > 60) {
      reasons.push('Easy win to warm up');
    } else if (item.difficulty === 'Advanced' && prefs.difficultyScores['Advanced'] > 60) {
      reasons.push("You're ready for a bolder move");
    }

    return reasons.length > 0 ? reasons[0] : 'Picked for your chemistry';
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
  { id: 'first_try', name: 'First Spark', description: 'Try your first couple idea', emoji: '🌱', category: 'milestone' },
  { id: 'tried_5', name: 'Chemistry Starter', description: 'Try 5 different ideas together', emoji: '🌿', category: 'milestone' },
  { id: 'tried_10', name: 'Curious Hearts', description: 'Try 10 different ideas together', emoji: '🗺️', category: 'milestone' },
  { id: 'tried_25', name: 'Playful Momentum', description: 'Try 25 different ideas together', emoji: '⛰️', category: 'milestone' },
  { id: 'tried_50', name: 'Heat Builder', description: 'Try 50 different ideas together', emoji: '🏆', category: 'milestone' },
  { id: 'tried_100', name: 'Legendary Chemistry', description: 'Try 100 different ideas together', emoji: '👑', category: 'milestone' },
  { id: 'first_challenge', name: 'Challenge Accepted', description: 'Complete your first challenge', emoji: '🎯', category: 'adventure' },
  { id: 'challenges_5', name: 'Bold Pair', description: 'Complete 5 challenges', emoji: '💪', category: 'adventure' },
  { id: 'challenges_10', name: 'Dare Duo', description: 'Complete 10 challenges', emoji: '🔥', category: 'adventure' },
  { id: 'week_streak_2', name: 'Two-Week Glow', description: 'Keep a 2 week streak', emoji: '🌡️', category: 'consistency' },
  { id: 'week_streak_4', name: 'Firekeeper', description: 'Keep a 4 week streak', emoji: '🔥', category: 'consistency' },
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
