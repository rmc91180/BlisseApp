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
  { level: 1, title: 'Newcomer', emoji: '🌱', minStars: 0, maxStars: 24, color: '#84cc16' },
  { level: 2, title: 'Explorer', emoji: '🧭', minStars: 25, maxStars: 74, color: '#22c55e' },
  { level: 3, title: 'Adventurer', emoji: '🗺️', minStars: 75, maxStars: 149, color: '#14b8a6' },
  { level: 4, title: 'Enthusiast', emoji: '💫', minStars: 150, maxStars: 299, color: '#06b6d4' },
  { level: 5, title: 'Connoisseur', emoji: '🎯', minStars: 300, maxStars: 499, color: '#3b82f6' },
  { level: 6, title: 'Expert', emoji: '🔥', minStars: 500, maxStars: 749, color: '#8b5cf6' },
  { level: 7, title: 'Master', emoji: '👑', minStars: 750, maxStars: 999, color: '#a855f7' },
  { level: 8, title: 'Legend', emoji: '🏆', minStars: 1000, maxStars: 1499, color: '#ec4899' },
  { level: 9, title: 'Passion Master', emoji: '💎', minStars: 1500, maxStars: 9999, color: '#f43f5e' },
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
    { id: 'try_new', type: 'try_new', target: 2 + Math.floor(userLevel / 3), current: 0, description: 'Try new things', emoji: '✨', reward: 5, completed: false },
    { id: 'earn_stars', type: 'earn_stars', target: 10 + (userLevel * 2), current: 0, description: 'Earn stars', emoji: '⭐', reward: 3, completed: false },
    { id: 'complete_challenge', type: 'complete_challenge', target: 1, current: 0, description: 'Complete a challenge', emoji: '🎯', reward: 5, completed: false },
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
    item: { category?: string; mood?: string; difficulty?: string },
    contentType: string,
    prefs: UserPreferences,
    isTried: boolean,
    isFavorite: boolean
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

    // Add small random factor for variety
    score += Math.random() * 10 - 5;

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

    // Score positions
    allContent.positions.forEach(item => {
      const isTried = userState.tried.includes(item.id);
      const isFavorite = userState.favorites.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'position', prefs, isTried, isFavorite
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'position', item, score, reason });
    });

    // Score foreplay
    allContent.foreplay.forEach(item => {
      const isTried = userState.triedForeplay.includes(item.id);
      const isFavorite = userState.favoriteForeplay.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'foreplay', prefs, isTried, isFavorite
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'foreplay', item, score, reason });
    });

    // Score oral
    allContent.oral.forEach(item => {
      const isTried = userState.triedOral.includes(item.id);
      const isFavorite = userState.favoriteOral.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'oral', prefs, isTried, isFavorite
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'oral', item, score, reason });
    });

    // Score massage
    allContent.massage.forEach(item => {
      const isTried = userState.triedMassage.includes(item.id);
      const isFavorite = userState.favoriteMassage.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'massage', prefs, isTried, isFavorite
      );
      const reason = SmartLearning.getRecommendationReason(item, prefs, isTried);
      scored.push({ type: 'massage', item, score, reason });
    });

    // Score roleplay
    allContent.roleplay.forEach(item => {
      const isTried = userState.triedRoleplay.includes(item.id);
      const isFavorite = userState.favoriteRoleplay.includes(item.id);
      const score = SmartLearning.calculateItemScore(
        item, 'roleplay', prefs, isTried, isFavorite
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
      reasons.push("Something new to try");
    }

    if (item.category && prefs.categoryScores[item.category] > 65) {
      reasons.push(`You enjoy ${item.category.toLowerCase()}`);
    }

    if (item.mood && prefs.moodScores[item.mood] > 65) {
      reasons.push(`Matches your preferred mood`);
    }

    if (item.difficulty === 'Beginner' && prefs.difficultyScores['Beginner'] > 60) {
      reasons.push("Easy and comfortable");
    } else if (item.difficulty === 'Advanced' && prefs.difficultyScores['Advanced'] > 60) {
      reasons.push("Ready for a challenge");
    }

    return reasons.length > 0 ? reasons[0] : "Recommended for you";
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
  { id: 'first_try', name: 'First Steps', description: 'Try your first position', emoji: '🌱', category: 'milestone' },
  { id: 'tried_5', name: 'Getting Started', description: 'Try 5 different things', emoji: '🌿', category: 'milestone' },
  { id: 'tried_10', name: 'Explorer', description: 'Try 10 different things', emoji: '🗺️', category: 'milestone' },
  { id: 'tried_25', name: 'Adventurer', description: 'Try 25 different things', emoji: '⛰️', category: 'milestone' },
  { id: 'tried_50', name: 'Master Explorer', description: 'Try 50 different things', emoji: '🏆', category: 'milestone' },
  { id: 'tried_100', name: 'Legend', description: 'Try 100 different things', emoji: '👑', category: 'milestone' },
  { id: 'first_challenge', name: 'Challenge Accepted', description: 'Complete your first challenge', emoji: '🎯', category: 'adventure' },
  { id: 'challenges_5', name: 'Challenger', description: 'Complete 5 challenges', emoji: '💪', category: 'adventure' },
  { id: 'challenges_10', name: 'Challenge Master', description: 'Complete 10 challenges', emoji: '🔥', category: 'adventure' },
  { id: 'week_streak_2', name: 'Warming Up', description: '2 week intimacy streak', emoji: '🌡️', category: 'consistency' },
  { id: 'week_streak_4', name: 'On Fire', description: '4 week intimacy streak', emoji: '🔥', category: 'consistency' },
  { id: 'all_moods', name: 'Mood Master', description: 'Try positions in all moods', emoji: '🎭', category: 'exploration' },
  { id: 'all_categories', name: 'Well Rounded', description: 'Try all position categories', emoji: '⭕', category: 'exploration' },
  { id: 'advanced_5', name: 'Dare Devil', description: 'Try 5 advanced positions', emoji: '🎪', category: 'adventure' },
  { id: 'notes_10', name: 'Journaler', description: 'Write 10 personal notes', emoji: '📝', category: 'exploration' },
  { id: 'monthly_star', name: 'Star Collector', description: 'Earn 10 stars in one month', emoji: '⭐', category: 'milestone' },
  { id: 'date_night_5', name: 'Date Night Pro', description: 'Complete 5 date nights', emoji: '🌙', category: 'consistency' },
];
