/**
 * Main application Zustand store with AsyncStorage persistence.
 * Extracted from App.tsx monolith.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppLanguage } from '@/i18n/translations';
import type {
  Note,
  Challenge,
  ActivityLog,
  MonthlyStats,
  WeeklyGoal,
  UserPreferences,
  InteractionEvent,
  UserPlaylist,
} from '@/types/app';
import { savePinToSecureStorage } from '@/services/firebase';
import {
  SmartLearning,
  DEFAULT_PREFERENCES,
  getLevel,
  generateWeeklyGoals,
} from '@/constants/gamification';
import { detectPlatform, MAX_USER_PLAYLISTS } from '@/content/seasonal';
import { positions, foreplayIdeas, oralPlayIdeas, massageTechniques, rolePlayScenarios } from '@/content/localizedContent';
import { moods, categories } from '@/content/positions';
import { Analytics } from '@/services/analytics';

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
  currentStreak: number;
  lastActivityDate: string | null;
  dateNightsCompleted: number;
  // Weekly Goals
  weeklyGoals: WeeklyGoal[];
  weeklyGoalsStartDate: string | null;
  // Daily Login
  lastLoginDate: string | null;
  loginStreak: number;
  dailyBonusClaimed: boolean;
  // Security & Settings
  pinCode: string | null;
  useBiometrics: boolean;
  language: AppLanguage;
  dailyJokeNotificationsEnabled: boolean;
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
  logActivity: (type: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay' | 'session', itemId?: number) => { stars: number; newAchievements: string[] };
  completeDateNight: () => { stars: number; newAchievements: string[] };
  checkAndAwardAchievements: () => string[];
  // Weekly Goals & Daily Login
  refreshWeeklyGoals: () => void;
  updateWeeklyGoalProgress: (type: string, amount?: number) => void;
  claimDailyBonus: () => number;
  checkLoginStreak: () => void;
  // Security & Settings Actions
  setPinCode: (pin: string | null) => void;
  setUseBiometrics: (use: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
  setDailyJokeNotificationsEnabled: (enabled: boolean) => void;
  setReactivationNotificationsEnabled: (enabled: boolean) => void;
  agreeToTerms: () => void;
  resetOnboarding: () => void;
  // Smart Learning Actions
  trackInteraction: (event: Omit<InteractionEvent, 'timestamp'>) => void;
  getSmartRecommendations: (count?: number) => Array<{ type: string; item: any; score: number; reason: string }>;
  getUserPreferenceSummary: () => { categories: string[]; moods: string[]; contentTypes: string[] };
  // User Playlists
  userPlaylists: UserPlaylist[];
  addUserPlaylist: (playlist: Omit<UserPlaylist, 'id' | 'dateAdded' | 'platform'>) => boolean;
  removeUserPlaylist: (id: string) => void;
  updateUserPlaylist: (id: string, updates: Partial<Omit<UserPlaylist, 'id' | 'dateAdded'>>) => void;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

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
      currentStreak: 0,
      lastActivityDate: null,
      dateNightsCompleted: 0,
      weeklyGoals: [],
      weeklyGoalsStartDate: null,
      lastLoginDate: null,
      loginStreak: 0,
      dailyBonusClaimed: false,
      pinCode: null,
      useBiometrics: false,
      language: 'en',
      dailyJokeNotificationsEnabled: true,
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
        }
      },

      logActivity: (type, itemId) => {
        const state = get();
        let starsEarned = 1; // Base star for any activity
        const newAchievements: string[] = [];
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
          const interactionEvent: Omit<InteractionEvent, 'timestamp'> = {
            type: 'try',
            contentType: type as InteractionEvent['contentType'],
            itemId,
            category,
            mood,
            difficulty,
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

        set({
          totalStars: state.totalStars + starsEarned,
          activityLog: [...state.activityLog, logEntry],
          currentStreak: newStreak,
          lastActivityDate: today,
          monthlyStats,
        });

        // Check for new achievements
        const achievementResults = get().checkAndAwardAchievements();
        newAchievements.push(...achievementResults);

        return { stars: starsEarned, newAchievements };
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
        const totalTried = state.tried.length + state.triedForeplay.length + state.triedOral.length;

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

      setPinCode: (pin) => {
        set({ pinCode: pin });
        void savePinToSecureStorage(pin);
      },
      setUseBiometrics: (use) => set({ useBiometrics: use }),
      setLanguage: (language) => set({ language }),
      setDailyJokeNotificationsEnabled: (enabled) => set({ dailyJokeNotificationsEnabled: enabled }),
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
        const fullEvent: InteractionEvent = {
          ...event,
          timestamp: new Date().toISOString(),
        };

        // Update preferences based on this interaction
        const updatedPrefs = SmartLearning.updatePreferences(
          state.learningPreferences,
          fullEvent
        );

        // Keep last 100 interactions for history
        const updatedHistory = [...state.interactionHistory, fullEvent].slice(-100);

        set({
          learningPreferences: updatedPrefs,
          interactionHistory: updatedHistory,
        });

        // Track in analytics
        Analytics.trackContentTried(
          event.contentType,
          event.category || '',
          event.mood || ''
        );
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
      partialize: (state) => {
        const { pinCode: removedPinCode, ...persistedState } = state;
        void removedPinCode;
        return persistedState;
      },
    }
  )
);
