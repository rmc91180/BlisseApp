// Blisse Design System - Theme Constants

export const colors = {
  // Primary Purple
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Secondary Rose
  secondary: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
  },

  // Warm Neutrals
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },

  // Background (Dark theme)
  background: {
    primary: '#1A0F24',
    secondary: '#2D1B3D',
    card: '#231530',
    elevated: '#3D2A4D',
  },

  // Text
  text: {
    primary: '#FFF8E7',
    secondary: '#E8A4B8',
    muted: '#a8a29e',
    inverse: '#1A0F24',
  },

  // Mood Colors
  mood: {
    passionate: '#ef4444',
    playful: '#f59e0b',
    flowing: '#06b6d4',
    grounded: '#84cc16',
    commanding: '#8b5cf6',
    unified: '#ec4899',
    dynamic: '#f97316',
    blossoming: '#d946ef',
  },

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const gradients = {
  primary: ['#a855f7', '#ec4899'],
  warm: ['#f43f5e', '#f59e0b'],
  tonight: ['#7c3aed', '#db2777', '#f59e0b'],
  background: ['#1A0F24', '#2D1B3D'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  glow: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
};

const theme = {
  colors,
  gradients,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
};

export default theme;