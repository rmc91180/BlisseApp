/**
 * @deprecated This module re-exports from useStore for backwards compatibility.
 * Import directly from '@/store/useStore' instead.
 *
 * The canonical types are defined in '@/types/app' and '@/i18n/translations'.
 */
export { useStore as usePreferencesStore } from '@/store/useStore';
export type { UserState as PreferencesState } from '@/store/useStore';

// Re-export commonly used preference-related types
export type { AppLanguage as Language } from '@/i18n/translations';

// These types match the app's actual usage
export type RelationshipType = 'hetero' | 'mm' | 'ff' | 'other';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Appearance = 'light' | 'dark' | 'system';
export type MoodType = 'passionate' | 'playful' | 'flowing' | 'grounded' | 'commanding' | 'unified' | 'dynamic' | 'blossoming';
