/**
 * Theme store - separate from main store for reactivity.
 * Manages color themes and font size preferences.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeColors, AppTheme, FontSizePreset, ThemeState } from '@/types/app';

// ============================================
// THEME DEFINITIONS
// ============================================
export const THEMES: AppTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight Purple',
    emoji: '🔮',
    colors: {
      background: { primary: '#1A0F24', secondary: '#2D1B3D' },
      text: { primary: '#FFF8E7', secondary: '#E8A4B8', muted: '#a8a29e' },
      primary: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea' },
      card: '#231530',
      cardLight: '#2a1a3a',
      success: '#84cc16',
      warning: '#f59e0b',
      error: '#ef4444',
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#cd7c32',
    }
  },
  {
    id: 'rosegold',
    name: 'Rose Gold',
    emoji: '🌹',
    colors: {
      background: { primary: '#1f1518', secondary: '#2d1f24' },
      text: { primary: '#FFF5F5', secondary: '#F4A4A4', muted: '#b8a8a8' },
      primary: { 400: '#f9a8d4', 500: '#ec4899', 600: '#db2777' },
      card: '#2a1a1f',
      cardLight: '#3a252b',
      success: '#84cc16',
      warning: '#f59e0b',
      error: '#ef4444',
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#cd7c32',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    emoji: '🌊',
    colors: {
      background: { primary: '#0f1729', secondary: '#1a2744' },
      text: { primary: '#F0F9FF', secondary: '#7DD3FC', muted: '#94a3b8' },
      primary: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7' },
      card: '#1e293b',
      cardLight: '#273449',
      success: '#84cc16',
      warning: '#f59e0b',
      error: '#ef4444',
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#cd7c32',
    }
  },
  {
    id: 'ember',
    name: 'Ember Glow',
    emoji: '🔥',
    colors: {
      background: { primary: '#1a1008', secondary: '#2d1c10' },
      text: { primary: '#FFF7ED', secondary: '#FDBA74', muted: '#a8998a' },
      primary: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c' },
      card: '#292015',
      cardLight: '#3a2d1c',
      success: '#84cc16',
      warning: '#f59e0b',
      error: '#ef4444',
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#cd7c32',
    }
  },
  {
    id: 'emerald',
    name: 'Emerald Night',
    emoji: '💚',
    colors: {
      background: { primary: '#0a1612', secondary: '#132620' },
      text: { primary: '#ECFDF5', secondary: '#6EE7B7', muted: '#9ca8a3' },
      primary: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
      card: '#1a2f26',
      cardLight: '#243d32',
      success: '#84cc16',
      warning: '#f59e0b',
      error: '#ef4444',
      gold: '#fbbf24',
      silver: '#94a3b8',
      bronze: '#cd7c32',
    }
  },
];

// Font size presets
export const FONT_SIZES: Record<FontSizePreset, { base: number; small: number; large: number; xlarge: number }> = {
  small: { base: 13, small: 11, large: 16, xlarge: 20 },
  medium: { base: 15, small: 13, large: 18, xlarge: 24 },
  large: { base: 17, small: 15, large: 22, xlarge: 28 },
};

// Helper to get current theme colors
export const getThemeColors = (themeId: string): ThemeColors => {
  return THEMES.find(t => t.id === themeId)?.colors || THEMES[0].colors;
};

// Default colors (midnight theme)
export const colors = {
  background: { primary: '#1A0F24', secondary: '#2D1B3D' },
  text: { primary: '#FFF8E7', secondary: '#E8A4B8', muted: '#a8a29e' },
  primary: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea' },
  card: '#231530',
  cardLight: '#2a1a3a',
  success: '#84cc16',
  warning: '#f59e0b',
  error: '#ef4444',
  gold: '#fbbf24',
  silver: '#94a3b8',
  bronze: '#cd7c32',
  // Theme-independent utility colors
  white: '#FFF',
  black: '#000',
  textDark: '#1a1a1a',
  info: '#3b82f6',
  cyan: '#06b6d4',
  green: '#22c55e',
};

// Reusable gradient presets (avoids repeated hex arrays throughout the app)
export const GRADIENT_PRESETS = {
  primary: ['#a855f7', '#ec4899'],
  purplePink: ['#8b5cf6', '#ec4899'],
  warm: ['#f59e0b', '#ef4444'],
  success: ['#84cc16', '#22c55e'],
  tonight: ['#7c3aed', '#db2777'],
  tonightFull: ['#7c3aed', '#db2777', '#f59e0b'],
  cyanGreen: ['#06b6d4', '#22c55e'],
  blueViolet: ['#3b82f6', '#8b5cf6'],
  pinkRose: ['#ec4899', '#f43f5e'],
  amberGold: ['#fbbf24', '#f59e0b'],
  cyanViolet: ['#06b6d4', '#8b5cf6'],
  disabled: ['#4a4a4a', '#3a3a3a'],
} as const;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: 'midnight',
      fontSize: 'medium',
      setTheme: (themeId) => set({ currentTheme: themeId }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    { name: 'blisse-theme', storage: createJSONStorage(() => AsyncStorage) }
  )
);
