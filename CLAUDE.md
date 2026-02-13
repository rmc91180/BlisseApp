# Blisse App

Blisse is an intimate couples wellness app built with React Native and Expo. It provides curated content for couples including positions, foreplay techniques, massage guides, roleplay scenarios, and oral play guides.

## Tech Stack

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: React Navigation v7 (native-stack + bottom-tabs)
- **Backend**: Firebase
- **Analytics**: PostHog
- **Authentication**: Expo Apple Authentication, Expo Local Authentication (biometrics)

## Project Structure

```
src/
├── assets/           # Images, fonts, and other static assets
├── components/       # Reusable UI components (currently empty)
├── constants/        # Theme and app constants
│   └── theme.ts      # Design system (colors, spacing, typography, shadows)
├── content/          # Static content data
│   ├── positions.ts  # Position content with Position interface
│   ├── foreplay.ts   # Foreplay techniques
│   ├── massage.ts    # Massage guides
│   ├── roleplay.ts   # Roleplay scenarios
│   └── oralplay.ts   # Oral play guides
├── hooks/            # Custom React hooks (currently empty)
├── i18n/             # Internationalization (supports en, es, pt-BR)
├── navigation/       # React Navigation setup
│   └── AppNavigator.tsx  # Root navigator with onboarding flow
├── screens/          # Screen components
│   └── onboarding/   # Onboarding flow screens
├── services/         # External service integrations (Firebase, etc.)
├── store/            # Zustand stores
│   └── usePreferencesStore.ts  # User preferences and settings
├── types/            # TypeScript type definitions
│   └── navigation.ts # Navigation param lists
└── utils/            # Utility functions (currently empty)
```

## Commands

```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

## Key Patterns

### Path Aliases
Use `@/` prefix for imports from src directory:
```typescript
import { colors } from '@/constants/theme';
import { usePreferencesStore } from '@/store/usePreferencesStore';
```

### State Management
Zustand store with persistence pattern:
```typescript
import { usePreferencesStore } from '@/store/usePreferencesStore';

// Use in components
const { displayName, setDisplayName } = usePreferencesStore();
```

### Navigation Types
Use typed navigation with RootStackParamList:
```typescript
import { RootStackParamList, MainTabParamList } from '@/types/navigation';
```

### Theme Usage
Import design tokens from theme.ts:
```typescript
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';
```

## Content Data Structure

Content items (positions, foreplay, etc.) follow a consistent interface:
```typescript
interface Position {
  id: number;
  name: string;
  category: string;
  mood: string;  // Maps to MoodType
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  vibe: string;
  description: string;
  howTo: string;
  whyItWorks: string;
  tips: string[];
  pairsWellWith: string[];
  goodFor: string[];
}
```

## User Preferences

Key preference types from `usePreferencesStore`:
- `RelationshipType`: 'hetero' | 'mm' | 'ff' | 'other'
- `ExperienceLevel`: 'beginner' | 'intermediate' | 'advanced'
- `MoodType`: 'passionate' | 'playful' | 'flowing' | 'grounded' | 'commanding' | 'unified' | 'dynamic' | 'blossoming'
- `Language`: 'en' | 'es' | 'pt-BR'
- `Appearance`: 'light' | 'dark' | 'system'

## Design System

### Colors
- Primary: Purple palette (#a855f7 as primary-500)
- Secondary: Rose palette (#f43f5e as secondary-500)
- Background: Dark theme (#1A0F24 primary, #2D1B3D secondary)
- Text: Warm cream (#FFF8E7 primary)
- Mood colors defined for each MoodType

### Gradients
- `primary`: Purple to pink
- `warm`: Rose to amber
- `tonight`: Purple to pink to amber
- `background`: Dark purple gradient

## Navigation Flow

1. **Onboarding** (when `hasCompletedOnboarding` is false):
   Welcome → NameInput → RelationshipType → Preferences → ExperienceLevel → MoodSelection → Legal → CreateAccount/SignIn

2. **Main App** (after onboarding):
   MainTabs (Home, Explore, Favorites, Profile) with modal screens for content detail views

## Platform Configuration

- iOS: Bundle ID `com.blisse.app`, supports Face ID and Apple Sign-In
- Android: Package `com.blisse.app`, supports biometrics and in-app billing
- New Architecture: Currently disabled on both platforms
