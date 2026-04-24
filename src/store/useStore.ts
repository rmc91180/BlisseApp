/**
 * Main application Zustand store with AsyncStorage persistence.
 * Extracted from App.tsx monolith.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppLanguage } from '@/i18n/translations';
import type {
  Level,
  Note,
  Challenge,
  ActivityLog,
  MonthlyStats,
  WeeklyGoal,
  UserPreferences,
  InteractionEvent,
  SessionLearningFeedback,
  UserPlaylist,
} from '@/types/app';
import { savePinToSecureStorage } from '@/services/firebase';
import {
  SmartLearning,
  ALL_UNLOCKABLE_FEATURES,
  DEFAULT_PREFERENCES,
  getLevelUnlockByLevel,
  getUnlockedFeaturesForLevel,
  getLevel,
  generateWeeklyGoals,
  type UnlockableFeature,
} from '@/constants/gamification';
import { resolveExperienceProfile } from '@/content/experienceProfiles';
import { detectPlatform, MAX_USER_PLAYLISTS } from '@/content/seasonal';
import { positions, foreplayIdeas, oralPlayIdeas, massageTechniques, rolePlayScenarios } from '@/content/localizedContent';
import { moods, categories } from '@/content/positions';
import { Analytics } from '@/services/analytics';

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: Level;
  unlockedFeatures: UnlockableFeature[];
  unlockMessage: string;
}

export interface StorageStats {
  activityLogCount: number;
  interactionHistoryCount: number;
  notesCount: number;
  totalStarsEarned: number;
}

export interface UserState {
  name: string;
  relationshipType: string | null;
  interests: string[];
  experience: string | null;
  hasCompletedOnboarding: boolean;
  hasSeenTutorial: boolean;
  currentMood: string | null;
  favorites: number[];
  tried: number[];
  favoriteForeplay: number[];
  triedForeplay: number[];
  favoriteOral: number[];
  triedOral: number[];
  favoriteMassage: number[];
  triedMassage: number[];
  favoriteRoleplay: number[];
  triedRoleplay: number[];
  notes: Note[];
  currentChallenge: Challenge | null;
  completedChallenges: Challenge[];
  // Gamification
  totalStars: number;
  activityLog: ActivityLog[];
  earnedAchievements: string[];
  monthlyStats: MonthlyStats[];
  archivedMonthlyStats: MonthlyStats[];
  currentStreak: number;
  lastActivityDate: string | null;
  dateNightsCompleted: number;
  unlockedFeatures: UnlockableFeature[];
  pendingLevelUp: LevelUpResult | null;
  // Weekly Goals
  weeklyGoals: WeeklyGoal[];
  weeklyGoalsStartDate: string | null;
  // Daily Login
  lastLoginDate: string | null;
  loginStreak: number;
  dailyBonusClaimed: boolean;
  firstOpenDate: string | null;
  // Security & Settings
  pinCode: string | null;
  useBiometrics: boolean;
  language: AppLanguage;
  notificationsEnabled: boolean;
  dailyJokeNotificationsEnabled: boolean;
  dailyStreakNotificationsEnabled: boolean;
  reactivationNotificationsEnabled: boolean;
  hasAgreedToTerms: boolean;
  agreedToTermsDate: string | null;
  // Smart Learning
  learningPreferences: UserPreferences;
  interactionHistory: InteractionEvent[];
  // Actions
  setName: (name: string) => void;
  setRelationshipType: (type: string) => void;
  setInterests: (interests: string[]) => void;
  setExperience: (exp: string) => void;
  completeOnboarding: () => void;
  completeTutorial: () => void;
  setCurrentMood: (mood: string | null) => void;
  toggleFavorite: (id: number) => void;
  markTried: (id: number) => void;
  toggleForeplayFavorite: (id: number) => void;
  markForeplayTried: (id: number) => void;
  toggleOralFavorite: (id: number) => void;
  markOralTried: (id: number) => void;
  toggleMassageFavorite: (id: number) => void;
  markMassageTried: (id: number) => void;
  toggleRoleplayFavorite: (id: number) => void;
  markRoleplayTried: (id: number) => void;
  addNote: (note: Omit<Note, 'id' | 'date'>) => void;
  updateNote: (id: number, text: string, rating: number) => void;
  deleteNote: (id: number) => void;
  setChallenge: (challenge: Challenge | null) => void;
  completeChallenge: () => void;
  // Gamification Actions
  logActivity: (
    type: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay' | 'session',
    itemId?: number
  ) => { stars: number; newAchievements: string[]; levelUp: LevelUpResult };
  completeDateNight: () => { stars: number; newAchievements: string[] };
  checkAndAwardAchievements: () => string[];
  onLevelUp: (newLevel: Level) => LevelUpResult;
  clearPendingLevelUp: () => void;
  grantSubscriberAccess: () => void;
  // Weekly Goals & Daily Login
  refreshWeeklyGoals: () => void;
  updateWeeklyGoalProgress: (type: string, amount?: number) => void;
  archiveOldStats: () => void;
  claimDailyBonus: () => number;
  checkLoginStreak: () => void;
  setFirstOpenDate: (date: string) => void;
  storageStats: () => StorageStats;
  // Security & Settings Actions
  setPinCode: (pin: string | null) => void;
  setUseBiometrics: (use: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyJokeNotificationsEnabled: (enabled: boolean) => void;
  setDailyStreakNotificationsEnabled: (enabled: boolean) => void;
  setReactivationNotificationsEnabled: (enabled: boolean) => void;
  agreeToTerms: () => void;
  resetOnboarding: () => void;
  // Smart Learning Actions
  trackInteraction: (event: Omit<InteractionEvent, 'timestamp'>) => void;
  trackSessionFeedback: (feedback: SessionLearningFeedback) => void;
  getSmartRecommendations: (count?: number) => Array<{ type: string; item: any; score: number; reason: string }>;
  getUserPreferenceSummary: () => { categories: string[]; moods: string[]; contentTypes: string[] };
  // User Playlists
  userPlaylists: UserPlaylist[];
  addUserPlaylist: (playlist: Omit<UserPlaylist, 'id' | 'dateAdded' | 'platform'>) => boolean;
  removeUserPlaylist: (id: string) => void;
  updateUserPlaylist: (id: string, updates: Partial<Omit<UserPlaylist, 'id' | 'dateAdded'>>) => void;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);
const getMonthIndex = (month: string): number => {
  const [yearRaw, monthRaw] = month.split('-');
  const year = Number(yearRaw);
  const monthNumber = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return Number.NaN;
  }
  return year * 12 + (monthNumber - 1);
};

const asString = (value: unknown, fallback = ''): string => (
  typeof value === 'string' ? value : fallback
);

const asStringOrNull = (value: unknown): string | null => (
  typeof value === 'string' ? value : null
);

const asBoolean = (value: unknown, fallback = false): boolean => (
  typeof value === 'boolean' ? value : fallback
);

const asFiniteNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asNumberArray = (value: unknown): number[] => (
  Array.isArray(value)
    ? value.filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry))
    : []
);

const asStringArray = (value: unknown): string[] => (
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : []
);

const asObjectArray = <T>(value: unknown): T[] => (
  Array.isArray(value)
    ? value.filter((entry): entry is T => Boolean(entry && typeof entry === 'object'))
    : []
);

const sanitizeLanguage = (value: unknown): AppLanguage => (
  value === 'es' || value === 'pt' || value === 'hi' ? value : 'en'
);

const sanitizeLearningPreferences = (value: unknown): UserPreferences => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_PREFERENCES;
  }

  const prefs = value as Partial<UserPreferences>;
  return {
    ...DEFAULT_PREFERENCES,
    ...prefs,
    categoryScores: typeof prefs.categoryScores === 'object' && prefs.categoryScores ? prefs.categoryScores : DEFAULT_PREFERENCES.categoryScores,
    moodScores: typeof prefs.moodScores === 'object' && prefs.moodScores ? prefs.moodScores : DEFAULT_PREFERENCES.moodScores,
    difficultyScores: typeof prefs.difficultyScores === 'object' && prefs.difficultyScores ? prefs.difficultyScores : DEFAULT_PREFERENCES.difficultyScores,
    contentTypeScores: {
      ...DEFAULT_PREFERENCES.contentTypeScores,
      ...(prefs.contentTypeScores || {}),
    },
    experienceScores: {
      effort: {
        ...DEFAULT_PREFERENCES.experienceScores.effort,
        ...(prefs.experienceScores?.effort || {}),
      },
      energy: {
        ...DEFAULT_PREFERENCES.experienceScores.energy,
        ...(prefs.experienceScores?.energy || {}),
      },
      connection: {
        ...DEFAULT_PREFERENCES.experienceScores.connection,
        ...(prefs.experienceScores?.connection || {}),
      },
      novelty: {
        ...DEFAULT_PREFERENCES.experienceScores.novelty,
        ...(prefs.experienceScores?.novelty || {}),
      },
      controlBalance: {
        ...DEFAULT_PREFERENCES.experienceScores.controlBalance,
        ...(prefs.experienceScores?.controlBalance || {}),
      },
    },
    sequenceScores: {
      step1: {
        ...DEFAULT_PREFERENCES.sequenceScores.step1,
        ...(prefs.sequenceScores?.step1 || {}),
      },
      step2: {
        ...DEFAULT_PREFERENCES.sequenceScores.step2,
        ...(prefs.sequenceScores?.step2 || {}),
      },
      step3: {
        ...DEFAULT_PREFERENCES.sequenceScores.step3,
        ...(prefs.sequenceScores?.step3 || {}),
      },
    },
    recentExperienceClusters: asStringArray(prefs.recentExperienceClusters).slice(0, 12),
    preferredTimeOfDay: prefs.preferredTimeOfDay ?? null,
    avgSessionLength: asFiniteNumber(prefs.avgSessionLength, 0),
    favoriteToTriedRatio: asFiniteNumber(prefs.favoriteToTriedRatio, 0),
    lastUpdated: asString(prefs.lastUpdated, new Date().toISOString()),
  };
};

const sanitizePersistedState = (persistedState: Partial<UserState>, version: number): Partial<UserState> => {
  const state: Partial<UserState> = { ...persistedState };
  const earnedAchievements = asStringArray(state.earnedAchievements);
  const rawUnlockedFeatures = Array.isArray(state.unlockedFeatures)
    ? state.unlockedFeatures.filter(
      (feature): feature is UnlockableFeature =>
        typeof feature === 'string' && (ALL_UNLOCKABLE_FEATURES as string[]).includes(feature)
    )
    : null;

  state.name = asString(state.name, '');
  state.relationshipType = asStringOrNull(state.relationshipType);
  state.interests = asStringArray(state.interests);
  state.experience = asStringOrNull(state.experience);
  state.hasCompletedOnboarding = asBoolean(state.hasCompletedOnboarding, false);
  state.hasSeenTutorial = asBoolean(state.hasSeenTutorial, false);
  state.currentMood = asStringOrNull(state.currentMood);
  state.favorites = asNumberArray(state.favorites);
  state.tried = asNumberArray(state.tried);
  state.favoriteForeplay = asNumberArray(state.favoriteForeplay);
  state.triedForeplay = asNumberArray(state.triedForeplay);
  state.favoriteOral = asNumberArray(state.favoriteOral);
  state.triedOral = asNumberArray(state.triedOral);
  state.favoriteMassage = asNumberArray(state.favoriteMassage);
  state.triedMassage = asNumberArray(state.triedMassage);
  state.favoriteRoleplay = asNumberArray(state.favoriteRoleplay);
  state.triedRoleplay = asNumberArray(state.triedRoleplay);
  state.notes = asObjectArray<Note>(state.notes);
  state.currentChallenge = (state.currentChallenge && typeof state.currentChallenge === 'object')
    ? state.currentChallenge
    : null;
  state.completedChallenges = asObjectArray<Challenge>(state.completedChallenges);
  state.totalStars = asFiniteNumber(state.totalStars, 0);
  state.activityLog = asObjectArray<ActivityLog>(state.activityLog).slice(-500);
  state.earnedAchievements = earnedAchievements;
  state.monthlyStats = asObjectArray<MonthlyStats>(state.monthlyStats);
  state.archivedMonthlyStats = asObjectArray<MonthlyStats>(state.archivedMonthlyStats);
  state.currentStreak = asFiniteNumber(state.currentStreak, 0);
  state.lastActivityDate = asStringOrNull(state.lastActivityDate);
  state.dateNightsCompleted = asFiniteNumber(state.dateNightsCompleted, 0);
  state.pendingLevelUp = null;

  if (rawUnlockedFeatures) {
    state.unlockedFeatures = Array.from(new Set(rawUnlockedFeatures));
  } else if (version < 2) {
    state.unlockedFeatures = earnedAchievements.length > 5 ? [...ALL_UNLOCKABLE_FEATURES] : [];
  } else {
    state.unlockedFeatures = getUnlockedFeaturesForLevel(1);
  }

  state.weeklyGoals = asObjectArray<WeeklyGoal>(state.weeklyGoals);
  state.weeklyGoalsStartDate = asStringOrNull(state.weeklyGoalsStartDate);
  state.lastLoginDate = asStringOrNull(state.lastLoginDate);
  state.loginStreak = asFiniteNumber(state.loginStreak, 0);
  state.dailyBonusClaimed = asBoolean(state.dailyBonusClaimed, false);
  state.firstOpenDate = asStringOrNull(state.firstOpenDate);

  state.pinCode = asStringOrNull(state.pinCode);
  if (state.pinCode && !/^\d{4}$/.test(state.pinCode)) {
    state.pinCode = null;
  }
  state.useBiometrics = asBoolean(state.useBiometrics, false);
  state.language = sanitizeLanguage(state.language);
  state.notificationsEnabled = asBoolean(state.notificationsEnabled, true);
  state.dailyJokeNotificationsEnabled = asBoolean(state.dailyJokeNotificationsEnabled, true);
  state.dailyStreakNotificationsEnabled = asBoolean(state.dailyStreakNotificationsEnabled, true);
  state.reactivationNotificationsEnabled = asBoolean(state.reactivationNotificationsEnabled, true);
  state.hasAgreedToTerms = asBoolean(state.hasAgreedToTerms, false);
  state.agreedToTermsDate = asStringOrNull(state.agreedToTermsDate);

  state.learningPreferences = sanitizeLearningPreferences(state.learningPreferences);
  state.interactionHistory = asObjectArray<InteractionEvent>(state.interactionHistory).slice(-100);
  state.userPlaylists = asObjectArray<UserPlaylist>(state.userPlaylists);

  const hasRequiredOnboardingState =
    state.hasAgreedToTerms &&
    Boolean(state.relationshipType) &&
    Boolean(state.experience);
  if (state.hasCompletedOnboarding && !hasRequiredOnboardingState) {
    state.hasCompletedOnboarding = false;
  }

  return state;
};

export const useStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      relationshipType: null,
      interests: [],
      experience: null,
      hasCompletedOnboarding: false,
      hasSeenTutorial: false,
      currentMood: null,
      favorites: [],
      tried: [],
      favoriteForeplay: [],
      triedForeplay: [],
      favoriteOral: [],
      triedOral: [],
      favoriteMassage: [],
      triedMassage: [],
      favoriteRoleplay: [],
      triedRoleplay: [],
      notes: [],
      currentChallenge: null,
      completedChallenges: [],
      totalStars: 0,
      activityLog: [],
      earnedAchievements: [],
      monthlyStats: [],
      archivedMonthlyStats: [],
      currentStreak: 0,
      lastActivityDate: null,
      dateNightsCompleted: 0,
      unlockedFeatures: getUnlockedFeaturesForLevel(1),
      pendingLevelUp: null,
      weeklyGoals: [],
      weeklyGoalsStartDate: null,
      lastLoginDate: null,
      loginStreak: 0,
      dailyBonusClaimed: false,
      firstOpenDate: null,
      pinCode: null,
      useBiometrics: false,
      language: 'en',
      notificationsEnabled: true,
      dailyJokeNotificationsEnabled: true,
      dailyStreakNotificationsEnabled: true,
      reactivationNotificationsEnabled: true,
      hasAgreedToTerms: false,
      agreedToTermsDate: null,
      // Smart Learning
      learningPreferences: DEFAULT_PREFERENCES,
      interactionHistory: [],
      userPlaylists: [],

      setName: (name) => set({ name }),
      setRelationshipType: (type) => set({ relationshipType: type }),
      setInterests: (interests) => set({ interests }),
      setExperience: (exp) => set({ experience: exp }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      completeTutorial: () => set({ hasSeenTutorial: true }),
      setCurrentMood: (mood) => set({ currentMood: mood }),
      onLevelUp: (newLevel) => {
        const state = get();
        const targetUnlocks = getUnlockedFeaturesForLevel(newLevel.level);
        const currentUnlocks = state.unlockedFeatures || [];
        const newlyUnlocked = targetUnlocks.filter((feature) => !currentUnlocks.includes(feature));
        const levelUnlock = getLevelUnlockByLevel(newLevel.level);
        const result: LevelUpResult = {
          leveledUp: true,
          newLevel,
          unlockedFeatures: newlyUnlocked,
          unlockMessage: levelUnlock?.unlockMessage || '',
        };

        set({
          unlockedFeatures: Array.from(new Set([...currentUnlocks, ...targetUnlocks])),
          pendingLevelUp: result,
        });

        return result;
      },
      clearPendingLevelUp: () => set({ pendingLevelUp: null }),
      grantSubscriberAccess: () => {
        const state = get();
        const merged = Array.from(new Set([...state.unlockedFeatures, ...ALL_UNLOCKABLE_FEATURES]));
        if (merged.length !== state.unlockedFeatures.length) {
          set({ unlockedFeatures: merged });
        }
      },

      toggleFavorite: (id) => {
        const favs = get().favorites;
        set({ favorites: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] });
      },
      markTried: (id) => {
        const tried = get().tried;
        if (!tried.includes(id)) set({ tried: [...tried, id] });
      },
      toggleForeplayFavorite: (id) => {
        const favs = get().favoriteForeplay;
        set({ favoriteForeplay: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] });
      },
      markForeplayTried: (id) => {
        const tried = get().triedForeplay;
        if (!tried.includes(id)) set({ triedForeplay: [...tried, id] });
      },
      toggleOralFavorite: (id) => {
        const favs = get().favoriteOral;
        set({ favoriteOral: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] });
      },
      markOralTried: (id) => {
        const tried = get().triedOral;
        if (!tried.includes(id)) set({ triedOral: [...tried, id] });
      },
      toggleMassageFavorite: (id) => {
        const favs = get().favoriteMassage;
        set({ favoriteMassage: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] });
      },
      markMassageTried: (id) => {
        const tried = get().triedMassage;
        if (!tried.includes(id)) set({ triedMassage: [...tried, id] });
      },
      toggleRoleplayFavorite: (id) => {
        const favs = get().favoriteRoleplay;
        set({ favoriteRoleplay: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] });
      },
      markRoleplayTried: (id) => {
        const tried = get().triedRoleplay;
        if (!tried.includes(id)) set({ triedRoleplay: [...tried, id] });
      },

      addNote: (note) => {
        const notes = get().notes;
        const newNote: Note = { ...note, id: Date.now(), date: new Date().toISOString() };
        set({ notes: [...notes, newNote] });
      },
      updateNote: (id, text, rating) => {
        const notes = get().notes.map((n) => n.id === id ? { ...n, text, rating } : n);
        set({ notes });
      },
      deleteNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),

      setChallenge: (challenge) => set({ currentChallenge: challenge }),
      completeChallenge: () => {
        const current = get().currentChallenge;
        if (current) {
          set({
            completedChallenges: [...get().completedChallenges, { ...current, completed: true }],
            currentChallenge: null,
          });
          get().updateWeeklyGoalProgress('complete_challenge', 1);
        }
      },

      logActivity: (type, itemId) => {
        const state = get();
        let starsEarned = 1; // Base star for any activity
        const newAchievements: string[] = [];
        const previousLevel = getLevel(state.totalStars);
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = getCurrentMonth();

        // Track anonymous analytics and get item details
        let category = '';
        let mood = '';
        let difficulty = '';
        if (type === 'position' && itemId) {
          const pos = positions.find(p => p.id === itemId);
          category = pos?.category || '';
          mood = pos?.mood || '';
          difficulty = pos?.difficulty || '';
        } else if (type === 'foreplay' && itemId) {
          const item = foreplayIdeas.find(f => f.id === itemId);
          category = item?.category || '';
          mood = item?.mood || '';
        } else if (type === 'oral' && itemId) {
          const item = oralPlayIdeas.find(o => o.id === itemId);
          category = item?.category || '';
          mood = item?.mood || '';
        } else if (type === 'massage' && itemId) {
          const item = massageTechniques.find(m => m.id === itemId);
          category = item?.category || '';
          mood = item?.mood || '';
        } else if (type === 'roleplay' && itemId) {
          const item = rolePlayScenarios.find(r => r.id === itemId);
          category = item?.category || '';
          mood = item?.mood || '';
        }

        // Track for smart learning system
        if (itemId && type !== 'session') {
          const experienceProfile = resolveExperienceProfile(type as InteractionEvent['contentType'], {
            id: itemId,
            category,
            mood,
            difficulty,
          });
          const interactionEvent: Omit<InteractionEvent, 'timestamp'> = {
            type: 'try',
            contentType: type as InteractionEvent['contentType'],
            itemId,
            category,
            mood,
            difficulty,
            experienceProfile,
          };

          // Update learning preferences
          const updatedPrefs = SmartLearning.updatePreferences(
            state.learningPreferences,
            { ...interactionEvent, timestamp: new Date().toISOString() }
          );

          // Will be saved along with other state updates below
          set({ learningPreferences: updatedPrefs });
        }

        // Send anonymous analytics (no user ID, just category/mood counts)
        Analytics.trackContentTried(type, category, mood);

        // Check if this is a new item (bonus stars!)
        let isNewItem = false;
        if (type === 'position' && itemId && !state.tried.includes(itemId)) {
          isNewItem = true;
          starsEarned += 2; // Bonus for trying new position
          const pos = positions.find(p => p.id === itemId);
          if (pos?.difficulty === 'Advanced') starsEarned += 2; // Extra for advanced
        } else if (type === 'foreplay' && itemId && !state.triedForeplay.includes(itemId)) {
          isNewItem = true;
          starsEarned += 1;
        } else if (type === 'oral' && itemId && !state.triedOral.includes(itemId)) {
          isNewItem = true;
          starsEarned += 1;
        } else if (type === 'massage' && itemId && !state.triedMassage.includes(itemId)) {
          isNewItem = true;
          starsEarned += 2; // Massage takes effort, reward it
        } else if (type === 'roleplay' && itemId && !state.triedRoleplay.includes(itemId)) {
          isNewItem = true;
          starsEarned += 3; // Roleplay is brave! Extra reward
        }

        // Update streak
        let newStreak = state.currentStreak;
        if (state.lastActivityDate) {
          const lastDate = new Date(state.lastActivityDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            newStreak = state.currentStreak + 1;
            if (newStreak % 2 === 0) starsEarned += 1; // Streak bonus
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        // Create activity log entry
        const logEntry: ActivityLog = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type,
          itemId,
          starsEarned,
          achievements: [],
        };

        // Update monthly stats
        const monthlyStats = [...state.monthlyStats];
        const monthIndex = monthlyStats.findIndex(m => m.month === currentMonth);
        if (monthIndex >= 0) {
          monthlyStats[monthIndex] = {
            ...monthlyStats[monthIndex],
            totalSessions: monthlyStats[monthIndex].totalSessions + 1,
            starsEarned: monthlyStats[monthIndex].starsEarned + starsEarned,
            newThingsTried: monthlyStats[monthIndex].newThingsTried + (isNewItem ? 1 : 0),
          };
        } else {
          monthlyStats.push({
            month: currentMonth,
            totalSessions: 1,
            starsEarned,
            newThingsTried: isNewItem ? 1 : 0,
            challengesCompleted: 0,
          });
        }

        const newTotalStars = state.totalStars + starsEarned;
        let newActivityLog = [...state.activityLog, logEntry];
        if (newActivityLog.length > 500) {
          newActivityLog = newActivityLog.slice(-500);
        }

        set({
          totalStars: newTotalStars,
          activityLog: newActivityLog,
          currentStreak: newStreak,
          lastActivityDate: today,
          monthlyStats,
        });

        const reachedLevel = getLevel(newTotalStars);
        let levelUpResult: LevelUpResult = {
          leveledUp: false,
          newLevel: reachedLevel,
          unlockedFeatures: [],
          unlockMessage: '',
        };
        if (reachedLevel.level > previousLevel.level) {
          levelUpResult = get().onLevelUp(reachedLevel);
        }

        // Weekly goals should reflect live activity momentum.
        get().updateWeeklyGoalProgress('earn_stars', starsEarned);
        if (isNewItem) {
          get().updateWeeklyGoalProgress('try_new', 1);
        }

        // Check for new achievements
        const achievementResults = get().checkAndAwardAchievements();
        newAchievements.push(...achievementResults);

        return { stars: starsEarned, newAchievements, levelUp: levelUpResult };
      },

      completeDateNight: () => {
        const state = get();
        const starsEarned = 5; // Date nights are worth more!
        const newAchievements: string[] = [];
        const currentMonth = getCurrentMonth();

        // Update monthly stats
        const monthlyStats = [...state.monthlyStats];
        const monthIndex = monthlyStats.findIndex(m => m.month === currentMonth);
        if (monthIndex >= 0) {
          monthlyStats[monthIndex].starsEarned += starsEarned;
          monthlyStats[monthIndex].totalSessions += 1;
        }

        set({
          totalStars: state.totalStars + starsEarned,
          dateNightsCompleted: state.dateNightsCompleted + 1,
          monthlyStats,
        });

        const achievementResults = get().checkAndAwardAchievements();
        newAchievements.push(...achievementResults);

        return { stars: starsEarned, newAchievements };
      },

      checkAndAwardAchievements: () => {
        const state = get();
        const newlyEarned: string[] = [];
        const totalTried =
          state.tried.length +
          state.triedForeplay.length +
          state.triedOral.length +
          state.triedMassage.length +
          state.triedRoleplay.length;

        const checkAndAdd = (id: string, condition: boolean) => {
          if (condition && !state.earnedAchievements.includes(id)) {
            newlyEarned.push(id);
          }
        };

        // Milestone achievements
        checkAndAdd('first_try', totalTried >= 1);
        checkAndAdd('tried_5', totalTried >= 5);
        checkAndAdd('tried_10', totalTried >= 10);
        checkAndAdd('tried_25', totalTried >= 25);
        checkAndAdd('tried_50', totalTried >= 50);
        checkAndAdd('tried_100', totalTried >= 100);

        // Challenge achievements
        checkAndAdd('first_challenge', state.completedChallenges.length >= 1);
        checkAndAdd('challenges_5', state.completedChallenges.length >= 5);
        checkAndAdd('challenges_10', state.completedChallenges.length >= 10);

        // Streak achievements
        checkAndAdd('week_streak_2', state.currentStreak >= 2);
        checkAndAdd('week_streak_4', state.currentStreak >= 4);

        // Exploration achievements
        const triedMoods = new Set(state.tried.map(id => positions.find(p => p.id === id)?.mood).filter(Boolean));
        checkAndAdd('all_moods', triedMoods.size >= moods.length);

        const triedCategories = new Set(state.tried.map(id => positions.find(p => p.id === id)?.category).filter(Boolean));
        checkAndAdd('all_categories', triedCategories.size >= categories.length);

        const advancedTried = state.tried.filter(id => positions.find(p => p.id === id)?.difficulty === 'Advanced').length;
        checkAndAdd('advanced_5', advancedTried >= 5);

        // Notes achievement
        checkAndAdd('notes_10', state.notes.length >= 10);

        // Monthly star achievement
        const currentMonthStats = state.monthlyStats.find(m => m.month === getCurrentMonth());
        checkAndAdd('monthly_star', (currentMonthStats?.starsEarned || 0) >= 10);

        // Date night achievement
        checkAndAdd('date_night_5', state.dateNightsCompleted >= 5);

        // Favorites achievement
        const totalFavorites =
          state.favorites.length +
          state.favoriteForeplay.length +
          state.favoriteOral.length +
          state.favoriteMassage.length +
          state.favoriteRoleplay.length;
        checkAndAdd('favorites_10', totalFavorites >= 10);

        // Long consistency streak
        checkAndAdd('week_streak_12', state.currentStreak >= 12);

        // At least one try in each content type
        const hasAllContentTypesTried =
          state.tried.length > 0 &&
          state.triedForeplay.length > 0 &&
          state.triedOral.length > 0 &&
          state.triedMassage.length > 0 &&
          state.triedRoleplay.length > 0;
        checkAndAdd('all_content_types', hasAllContentTypesTried);

        if (newlyEarned.length > 0) {
          set({ earnedAchievements: [...state.earnedAchievements, ...newlyEarned] });
        }

        return newlyEarned;
      },

      // Weekly Goals System
      refreshWeeklyGoals: () => {
        const state = get();
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        const weekStart = startOfWeek.toISOString().split('T')[0];

        // Check if we need new goals
        if (state.weeklyGoalsStartDate !== weekStart) {
          const userLevel = getLevel(state.totalStars).level;
          const newGoals = generateWeeklyGoals(userLevel);
          set({ weeklyGoals: newGoals, weeklyGoalsStartDate: weekStart });
        }
      },

      updateWeeklyGoalProgress: (type, amount = 1) => {
        const state = get();
        const updatedGoals = state.weeklyGoals.map(goal => {
          if (goal.type === type && !goal.completed) {
            const newCurrent = goal.current + amount;
            const completed = newCurrent >= goal.target;
            if (completed && !goal.completed) {
              // Award bonus stars for completing goal
              set({ totalStars: get().totalStars + goal.reward });
            }
            return { ...goal, current: newCurrent, completed };
          }
          return goal;
        });
        set({ weeklyGoals: updatedGoals });
      },

      archiveOldStats: () => {
        const state = get();
        if (state.monthlyStats.length === 0) return;

        const currentMonthIndex = getMonthIndex(getCurrentMonth());
        if (!Number.isFinite(currentMonthIndex)) return;

        const activeStats: MonthlyStats[] = [];
        const toArchive: MonthlyStats[] = [];

        state.monthlyStats.forEach((stat) => {
          const statMonthIndex = getMonthIndex(stat.month);
          if (!Number.isFinite(statMonthIndex)) {
            activeStats.push(stat);
            return;
          }

          if ((currentMonthIndex - statMonthIndex) >= 6) {
            toArchive.push(stat);
          } else {
            activeStats.push(stat);
          }
        });

        if (toArchive.length === 0) return;

        const archivedMap = new Map<string, MonthlyStats>();
        state.archivedMonthlyStats.forEach((stat) => {
          archivedMap.set(stat.month, stat);
        });

        toArchive.forEach((stat) => {
          const existing = archivedMap.get(stat.month);
          if (existing) {
            archivedMap.set(stat.month, {
              month: stat.month,
              totalSessions: existing.totalSessions + stat.totalSessions,
              starsEarned: existing.starsEarned + stat.starsEarned,
              newThingsTried: existing.newThingsTried + stat.newThingsTried,
              challengesCompleted: existing.challengesCompleted + stat.challengesCompleted,
            });
            return;
          }
          archivedMap.set(stat.month, stat);
        });

        const archivedMonthlyStats = Array.from(archivedMap.values()).sort((a, b) => a.month.localeCompare(b.month));
        set({ monthlyStats: activeStats, archivedMonthlyStats });
      },

      // Daily Login System
      checkLoginStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        if (state.lastLoginDate !== today) {
          let newStreak = 1;
          if (state.lastLoginDate) {
            const lastDate = new Date(state.lastLoginDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreak = state.loginStreak + 1;
            }
          }
          set({ lastLoginDate: today, loginStreak: newStreak, dailyBonusClaimed: false });
        }
      },

      claimDailyBonus: () => {
        const state = get();
        if (state.dailyBonusClaimed) return 0;

        // Bonus increases with login streak (1-5 stars)
        const bonus = Math.min(5, 1 + Math.floor(state.loginStreak / 3));
        set({
          totalStars: state.totalStars + bonus,
          dailyBonusClaimed: true
        });
        return bonus;
      },

      setFirstOpenDate: (date) => {
        if (!get().firstOpenDate) {
          set({ firstOpenDate: date });
        }
      },

      storageStats: () => {
        const state = get();
        return {
          activityLogCount: state.activityLog.length,
          interactionHistoryCount: state.interactionHistory.length,
          notesCount: state.notes.length,
          totalStarsEarned: state.totalStars,
        };
      },

      setPinCode: (pin) => {
        set({ pinCode: pin });
        void savePinToSecureStorage(pin);
      },
      setUseBiometrics: (use) => set({ useBiometrics: use }),
      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDailyJokeNotificationsEnabled: (enabled) => set({ dailyJokeNotificationsEnabled: enabled }),
      setDailyStreakNotificationsEnabled: (enabled) => set({ dailyStreakNotificationsEnabled: enabled }),
      setReactivationNotificationsEnabled: (enabled) => set({ reactivationNotificationsEnabled: enabled }),
      agreeToTerms: () => set({ hasAgreedToTerms: true, agreedToTermsDate: new Date().toISOString() }),

      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
          hasSeenTutorial: false,
          name: '',
          relationshipType: null,
          interests: [],
          experience: null,
          pinCode: null,
          useBiometrics: false,
        });
        void savePinToSecureStorage(null);
      },

      // Smart Learning Actions
      trackInteraction: (event) => {
        const state = get();
        const resolvedProfile = event.experienceProfile || resolveExperienceProfile(event.contentType, {
          id: event.itemId,
          category: event.category,
          mood: event.mood,
          difficulty: event.difficulty,
        });
        const fullEvent: InteractionEvent = {
          ...event,
          experienceProfile: resolvedProfile,
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = [...state.interactionHistory, fullEvent].slice(-100);
        const updates: Partial<UserState> = {
          interactionHistory: updatedHistory,
        };

        // Passive impressions are useful history, but they should not reshuffle
        // recommendations during the render that displayed them.
        if (event.type !== 'view') {
          updates.learningPreferences = SmartLearning.updatePreferences(
            state.learningPreferences,
            fullEvent
          );
        }

        set(updates);

        // Track in analytics
        Analytics.trackContentTried(
          event.contentType,
          event.category || '',
          event.mood || ''
        );
      },

      trackSessionFeedback: (feedback) => {
        const state = get();
        const normalizedFeedback: SessionLearningFeedback = {
          ...feedback,
          steps: feedback.steps.filter((step) => Number(step.itemId) > 0),
        };
        if (normalizedFeedback.steps.length === 0 && !normalizedFeedback.exitedEarly) {
          return;
        }

        const sessionLearning = SmartLearning.applySessionFeedback(
          state.learningPreferences,
          normalizedFeedback
        );
        const updatedHistory = [...state.interactionHistory, ...sessionLearning.events].slice(-100);

        set({
          learningPreferences: sessionLearning.preferences,
          interactionHistory: updatedHistory,
        });
      },

      getSmartRecommendations: (count = 5) => {
        const state = get();
        return SmartLearning.getRecommendations(
          state.learningPreferences,
          {
            positions,
            foreplay: foreplayIdeas,
            oral: oralPlayIdeas,
            massage: massageTechniques,
            roleplay: rolePlayScenarios,
          },
          {
            tried: state.tried,
            triedForeplay: state.triedForeplay,
            triedOral: state.triedOral,
            triedMassage: state.triedMassage,
            triedRoleplay: state.triedRoleplay,
            favorites: state.favorites,
            favoriteForeplay: state.favoriteForeplay,
            favoriteOral: state.favoriteOral,
            favoriteMassage: state.favoriteMassage,
            favoriteRoleplay: state.favoriteRoleplay,
          },
          count
        );
      },

      getUserPreferenceSummary: () => {
        const state = get();
        return SmartLearning.getTopPreferences(state.learningPreferences);
      },

      // User Playlist Actions
      addUserPlaylist: (playlist: Omit<UserPlaylist, 'id' | 'dateAdded' | 'platform'>) => {
        const current = get().userPlaylists;
        if (current.length >= MAX_USER_PLAYLISTS) {
          return false;
        }
        const newPlaylist: UserPlaylist = {
          ...playlist,
          id: Date.now().toString(),
          platform: detectPlatform(playlist.url),
          dateAdded: new Date().toISOString(),
        };
        set({ userPlaylists: [...current, newPlaylist] });
        return true;
      },

      removeUserPlaylist: (id: string) => {
        set({ userPlaylists: get().userPlaylists.filter(p => p.id !== id) });
      },

      updateUserPlaylist: (id: string, updates: Partial<Omit<UserPlaylist, 'id' | 'dateAdded'>>) => {
        set({
          userPlaylists: get().userPlaylists.map(p =>
            p.id === id
              ? { ...p, ...updates, platform: updates.url ? detectPlatform(updates.url) : p.platform }
              : p
          ),
        });
      },
    }),
    {
      name: 'blisse-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persistedState, version) => {
        return sanitizePersistedState((persistedState || {}) as Partial<UserState>, version);
      },
      merge: (persistedState, currentState) => {
        const sanitized = sanitizePersistedState((persistedState || {}) as Partial<UserState>, 3);
        return {
          ...(currentState as UserState),
          ...sanitized,
        };
      },
      partialize: (state) => {
        return {
          name: state.name,
          relationshipType: state.relationshipType,
          interests: state.interests,
          experience: state.experience,
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          hasSeenTutorial: state.hasSeenTutorial,
          currentMood: state.currentMood,
          favorites: state.favorites,
          tried: state.tried,
          favoriteForeplay: state.favoriteForeplay,
          triedForeplay: state.triedForeplay,
          favoriteOral: state.favoriteOral,
          triedOral: state.triedOral,
          favoriteMassage: state.favoriteMassage,
          triedMassage: state.triedMassage,
          favoriteRoleplay: state.favoriteRoleplay,
          triedRoleplay: state.triedRoleplay,
          notes: state.notes,
          currentChallenge: state.currentChallenge,
          completedChallenges: state.completedChallenges,
          totalStars: state.totalStars,
          activityLog: state.activityLog,
          earnedAchievements: state.earnedAchievements,
          monthlyStats: state.monthlyStats,
          archivedMonthlyStats: state.archivedMonthlyStats,
          currentStreak: state.currentStreak,
          lastActivityDate: state.lastActivityDate,
          dateNightsCompleted: state.dateNightsCompleted,
          unlockedFeatures: state.unlockedFeatures,
          weeklyGoals: state.weeklyGoals,
          weeklyGoalsStartDate: state.weeklyGoalsStartDate,
          lastLoginDate: state.lastLoginDate,
          loginStreak: state.loginStreak,
          dailyBonusClaimed: state.dailyBonusClaimed,
          firstOpenDate: state.firstOpenDate,
          useBiometrics: state.useBiometrics,
          language: state.language,
          notificationsEnabled: state.notificationsEnabled,
          dailyJokeNotificationsEnabled: state.dailyJokeNotificationsEnabled,
          dailyStreakNotificationsEnabled: state.dailyStreakNotificationsEnabled,
          reactivationNotificationsEnabled: state.reactivationNotificationsEnabled,
          hasAgreedToTerms: state.hasAgreedToTerms,
          agreedToTermsDate: state.agreedToTermsDate,
          learningPreferences: state.learningPreferences,
          interactionHistory: state.interactionHistory,
          userPlaylists: state.userPlaylists,
        };
      },
    }
  )
);
