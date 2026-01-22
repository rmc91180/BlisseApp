import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RelationshipType = 'hetero' | 'mm' | 'ff' | 'other';
export type RelationshipDuration = 'new' | 'established' | 'longterm' | 'veteran';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Language = 'en' | 'es' | 'pt-BR';
export type Appearance = 'light' | 'dark' | 'system';
export type MoodType = 'passionate' | 'playful' | 'flowing' | 'grounded' | 'commanding' | 'unified' | 'dynamic' | 'blossoming';

interface PreferencesState {
  // User info
  displayName: string;
  
  // Relationship
  relationshipType: RelationshipType;
  relationshipDuration: RelationshipDuration;
  
  // Preferences
  experienceLevel: ExperienceLevel;
  interests: string[];
  preferredMoods: MoodType[];
  hiddenCategories: string[];
  
  // App settings
  language: Language;
  appearance: Appearance;
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
  
  // Onboarding
  hasCompletedOnboarding: boolean;
  
  // Actions
  setDisplayName: (name: string) => void;
  setRelationshipType: (type: RelationshipType) => void;
  setRelationshipDuration: (duration: RelationshipDuration) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  setInterests: (interests: string[]) => void;
  toggleInterest: (interest: string) => void;
  setPreferredMoods: (moods: MoodType[]) => void;
  toggleMood: (mood: MoodType) => void;
  setHiddenCategories: (categories: string[]) => void;
  toggleHiddenCategory: (category: string) => void;
  setLanguage: (language: Language) => void;
  setAppearance: (appearance: Appearance) => void;
  setSoundsEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  completeOnboarding: () => void;
  resetPreferences: () => void;
}

const defaultState = {
  displayName: '',
  relationshipType: 'hetero' as RelationshipType,
  relationshipDuration: 'established' as RelationshipDuration,
  experienceLevel: 'intermediate' as ExperienceLevel,
  interests: [] as string[],
  preferredMoods: [] as MoodType[],
  hiddenCategories: [] as string[],
  language: 'en' as Language,
  appearance: 'dark' as Appearance,
  soundsEnabled: true,
  hapticsEnabled: true,
  hasCompletedOnboarding: false,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setDisplayName: (displayName) => set({ displayName }),
      
      setRelationshipType: (relationshipType) => set({ relationshipType }),
      
      setRelationshipDuration: (relationshipDuration) => set({ relationshipDuration }),
      
      setExperienceLevel: (experienceLevel) => set({ experienceLevel }),
      
      setInterests: (interests) => set({ interests }),
      
      toggleInterest: (interest) => {
        const current = get().interests;
        if (current.includes(interest)) {
          set({ interests: current.filter((i) => i !== interest) });
        } else {
          set({ interests: [...current, interest] });
        }
      },
      
      setPreferredMoods: (preferredMoods) => set({ preferredMoods }),
      
      toggleMood: (mood) => {
        const current = get().preferredMoods;
        if (current.includes(mood)) {
          set({ preferredMoods: current.filter((m) => m !== mood) });
        } else {
          set({ preferredMoods: [...current, mood] });
        }
      },
      
      setHiddenCategories: (hiddenCategories) => set({ hiddenCategories }),
      
      toggleHiddenCategory: (category) => {
        const current = get().hiddenCategories;
        if (current.includes(category)) {
          set({ hiddenCategories: current.filter((c) => c !== category) });
        } else {
          set({ hiddenCategories: [...current, category] });
        }
      },
      
      setLanguage: (language) => set({ language }),
      
      setAppearance: (appearance) => set({ appearance }),
      
      setSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
      
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      resetPreferences: () => set(defaultState),
    }),
    {
      name: 'blisse-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);