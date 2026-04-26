/**
 * Shared application types extracted from App.tsx.
 *
 * This module centralises every interface and type alias that is used across
 * the app so they can be imported from a single location.
 */

// ============================================
// Content
// ============================================

/** Union of all first-class content categories in the app. */
export type ContentType = 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';

export interface ExperienceProfile {
  effort: 'low' | 'medium' | 'high';
  energy: 'calm' | 'building' | 'intense';
  connection: 'emotional' | 'mixed' | 'physical';
  novelty: 'familiar' | 'varied' | 'adventurous';
  controlBalance: 'shared' | 'one-led';
}

// ============================================
// Seasonal Content
// ============================================

/** A themed content collection that maps to a calendar period. */
export interface SeasonalTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  startMonth: number;
  endMonth: number;
  positions: number[];
  foreplay: number[];
  oral: number[];
  roleplay: number[];
  games: SeasonalGameAction[];
  tips: string[];
}

/** Actions available in a seasonal mini-game. */
export type SeasonalGameAction = 'truth_or_dare' | 'date_night' | 'challenge' | 'spin';

/** Display metadata for a single seasonal game action. */
export interface SeasonalGameOption {
  id: SeasonalGameAction;
  emoji: string;
  title: string;
  description: string;
}

// ============================================
// Truth or Dare
// ============================================

/** A single truth-or-dare prompt. */
export interface TruthOrDareItem {
  id: number;
  type: 'truth' | 'dare';
  intensity: 'mild' | 'medium' | 'spicy' | 'wild';
  text: string;
}

// ============================================
// Music / Playlists
// ============================================

/** A curated playlist link with cross-platform URLs. */
export interface PlaylistLink {
  name: string;
  mood: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  description: string;
}

/** A user-added playlist entry. */
export interface UserPlaylist {
  id: string;
  name: string;
  url: string;
  mood: string;
  platform: 'spotify' | 'apple' | 'youtube' | 'other';
  dateAdded: string;
}

// ============================================
// Analytics (PostHog)
// ============================================

/** Allowed anonymous analytics event names. */
export type AnalyticsEventName =
  | 'content_tried'
  | 'content_completed'
  | 'feature_used'
  | 'category_viewed'
  | 'mood_selected'
  | 'app_opened'
  | 'level_reached'
  | 'onboarding_step'
  | 'paywall_shown'
  | 'paywall_converted'
  | 'session_started'
  | 'retention_signal';

/** Scalar value that may appear in an analytics property bag. */
export type AnalyticsPropertyValue = string | number | boolean;

/** A bag of analytics properties keyed by name. */
export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

// ============================================
// Gamification
// ============================================

/** A single entry in the couple's activity history. */
export interface ActivityLog {
  id: string;
  date: string;
  type: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay' | 'session';
  itemId?: number;
  starsEarned: number;
  achievements: string[];
}

/** An unlockable achievement badge. */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedDate?: string;
  category: 'exploration' | 'consistency' | 'adventure' | 'milestone';
}

/** Aggregated stats for a single calendar month. */
export interface MonthlyStats {
  month: string; // "2024-01"
  totalSessions: number;
  starsEarned: number;
  newThingsTried: number;
  challengesCompleted: number;
}

// ============================================
// Levels & Titles
// ============================================

/** A level tier with its title, badge, and star thresholds. */
export interface Level {
  level: number;
  title: string;
  emoji: string;
  minStars: number;
  maxStars: number;
  color: string;
}

// ============================================
// Weekly Goals
// ============================================

/** A single goal in the weekly goal tracker. */
export interface WeeklyGoal {
  id: string;
  type: 'try_new' | 'use_app' | 'complete_challenge' | 'earn_stars' | 'try_mood';
  target: number;
  current: number;
  description: string;
  emoji: string;
  reward: number; // bonus stars
  completed: boolean;
}

// ============================================
// Mood Playlists
// ============================================

/** A curated mood-based content playlist. */
export interface MoodPlaylist {
  id: string;
  name: string;
  emoji: string;
  description: string;
  mood: string;
  color: string;
}

// ============================================
// Notes
// ============================================

/** A personal note or rating attached to a content item. */
export interface Note {
  id: number;
  type: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';
  itemId: number;
  text: string;
  rating: number;
  date: string;
}

// ============================================
// Smart Learning System
// ============================================

/** Aggregated preference scores used by the recommendation engine. */
export interface UserPreferences {
  /** Category preferences (0-100 score based on usage) */
  categoryScores: Record<string, number>;
  /** Mood preferences */
  moodScores: Record<string, number>;
  /** Difficulty preferences */
  difficultyScores: Record<string, number>;
  /** Content type preferences */
  contentTypeScores: Record<string, number>;
  /** Time-based patterns */
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  /** Interaction patterns */
  avgSessionLength: number;
  favoriteToTriedRatio: number;
  /** Last updated */
  lastUpdated: string;
  /** Experience-level preferences used for intent inference. */
  experienceScores: {
    effort: Record<ExperienceProfile['effort'], number>;
    energy: Record<ExperienceProfile['energy'], number>;
    connection: Record<ExperienceProfile['connection'], number>;
    novelty: Record<ExperienceProfile['novelty'], number>;
    controlBalance: Record<ExperienceProfile['controlBalance'], number>;
  };
  /** Preferred sequence patterns for 3-step session flows. */
  sequenceScores: {
    step1: Record<ContentType, number>;
    step2: Record<ContentType, number>;
    step3: Record<ContentType, number>;
  };
  /** Recent recommendation clusters to prevent repetitive outputs. */
  recentExperienceClusters: string[];
}

/** A single user interaction event fed into the learning system. */
export interface InteractionEvent {
  type: 'view' | 'try' | 'favorite' | 'unfavorite' | 'rate' | 'skip';
  contentType: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';
  itemId: number;
  category?: string;
  mood?: string;
  difficulty?: string;
  rating?: number;
  experienceProfile?: ExperienceProfile;
  sequencePosition?: 1 | 2 | 3 | 4;
  timeSpentSeconds?: number;
  opened?: boolean;
  skipped?: boolean;
  signalStrength?: number;
  source?: 'default' | 'session_feedback';
  timestamp: string;
}

export type SessionReactionEmoji = '🔥' | '💜' | '😐';

export interface SessionStepFeedbackSignal {
  sequencePosition: 1 | 2 | 3 | 4;
  contentType: ContentType;
  itemId: number;
  category?: string;
  mood?: string;
  difficulty?: string;
  experienceProfile?: ExperienceProfile;
  opened: boolean;
  skipped: boolean;
  timeSpentSeconds: number;
}

export interface SessionLearningFeedback {
  moodId?: string;
  mood?: string;
  reaction?: SessionReactionEmoji;
  regenerateCount: number;
  exitedEarly: boolean;
  saved: boolean;
  steps: SessionStepFeedbackSignal[];
}

// ============================================
// Challenges
// ============================================

/** An active or completed content challenge. */
export interface Challenge {
  id: string;
  type: 'position' | 'foreplay' | 'oral';
  itemId: number;
  startDate: string;
  completed: boolean;
}

// ============================================
// Theme System
// ============================================

/** Color tokens for a single app theme. */
export interface ThemeColors {
  background: { primary: string; secondary: string };
  text: { primary: string; secondary: string; muted: string };
  primary: { 400: string; 500: string; 600: string };
  card: string;
  cardLight: string;
  success: string;
  warning: string;
  error: string;
  gold: string;
  silver: string;
  bronze: string;
}

/** A complete visual theme definition. */
export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  colors: ThemeColors;
}

/** Available font size presets for accessibility. */
export type FontSizePreset = 'small' | 'medium' | 'large';

/** Zustand store shape for the theme system. */
export interface ThemeState {
  currentTheme: string;
  fontSize: FontSizePreset;
  setTheme: (themeId: string) => void;
  setFontSize: (size: FontSizePreset) => void;
}
