import React, { useState, useMemo, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Dimensions,
  Animated,
  Modal,
  Share,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { positions as basePositions, moods, categories, Position } from '@/content/positions';
import { foreplayIdeas as baseForeplayIdeas, foreplayCategories, ForeplayIdea } from '@/content/foreplay';
import { oralPlayIdeas as baseOralPlayIdeas, oralCategories, OralPlayIdea } from '@/content/oralplay';
import { massageTechniques as baseMassageTechniques, MassageTechnique } from '@/content/massage';
import { rolePlayScenarios as baseRolePlayScenarios, RolePlayScenario } from '@/content/roleplay';
import { AppLanguage, SUPPORTED_LANGUAGES, getContentTypeKey, getLanguageLabel, translateFromAuthPack, translateFromUiPack, translateTerm, translateUi } from '@/i18n/translations';
import { ContentCatalog, getLocalizedContentCatalog } from '@/i18n/localizedContent';
import * as Linking from 'expo-linking';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { initializeApp } from 'firebase/app';
import {
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  User as FirebaseUser,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as AppleAuthentication from 'expo-apple-authentication';
import { PostHogProvider, usePostHog, type PostHogOptions } from 'posthog-react-native';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

const AUTH_RETRY_DELAY_MS = 2000;
const AUTH_MAX_RETRIES = 20;
const AUTH_SYNC_LOOP_MS = 5 * 60 * 1000;
const PIN_SECURE_STORAGE_KEY = 'blisse-pin-code';
const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_MS = 30 * 1000;
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzgeaqp';
const CONFETTI_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#fbbf24'];
const ANALYTICS_STRING_LIMIT = 80;
const FORMSPREE_MESSAGE_LIMIT = 4000;
const DAILY_JOKE_NOTIFICATION_TITLE = 'Blisse Daily Tease 💌';
const DAILY_JOKE_NOTIFICATION_HOUR = 19;
const DAILY_JOKE_NOTIFICATION_MINUTE = 30;
const DAILY_JOKE_NOTIFICATION_DAYS_AHEAD = 14;
const DAILY_JOKE_NOTIFICATION_REFRESH_WINDOW_DAYS = 1;
const DAILY_JOKE_NOTIFICATION_IDS_KEY = 'blisse-daily-joke-notification-ids-v1';
const DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY = 'blisse-daily-joke-notification-refresh-at-v1';
const DAILY_JOKE_BANK_CACHE_KEY = 'blisse-daily-joke-bank-cache-v1';
const DAILY_JOKE_BANK_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DAILY_JOKE_BANK_DOC_PATH = ['app_config', 'daily_jokes'] as const;
const HOME_SPARK_MESSAGES: Array<{ headline: string; body: string }> = [
  {
    headline: 'Ignite the spark tonight 💕',
    body: 'Playful touches, honest whispers, and one small adventure at a time.',
  },
  {
    headline: 'Connection looks good on you ✨',
    body: 'Open Blisse, pick a vibe, and turn ordinary moments into inside jokes.',
  },
  {
    headline: 'Less scrolling, more chemistry 😘',
    body: 'Choose a mood and let the app nudge both of you into something memorable.',
  },
  {
    headline: 'Your love story, with bonus levels 🌙',
    body: 'Collect stars, unlock surprises, and keep your bond playful all week.',
  },
  {
    headline: 'Warm hearts. Mischievous smiles. 🔥',
    body: 'A little intention tonight can feel like a big reset for both of you.',
  },
];
const TONIGHT_SUGGESTION_TEASERS: string[] = [
  'Ready for a cozy adventure? No rush, just playful intimacy.',
  'Tonight is for eye contact, laughter, and one bold move.',
  'Start soft, stay curious, and let chemistry do the heavy lifting.',
  'Think less pressure, more presence, and a lot more fun.',
  'Small spark now, unforgettable memory later.',
];
const LEVEL_MOTIVATOR_LINES: string[] = [
  'Every star is a tiny vote for your relationship.',
  'You are building trust, play, and momentum together.',
  'Progress is attractive. Keep going, lovebirds.',
  'From Newcomer to Eternal Flame, one playful step at a time.',
  'You are not just leveling up the app. You are leveling up us.',
];
const SEASONAL_HOME_SPARK_MESSAGES: Record<string, Array<{ headline: string; body: string }>> = {
  valentines: [
    { headline: 'Valentine energy, all month long 💕', body: 'Romantic rituals, playful dares, and extra eye contact tonight.' },
    { headline: 'Love notes are welcome here 🌹', body: 'Keep it sweet, flirty, and a little bold in the best way.' },
  ],
  spring: [
    { headline: 'Spring is your reset button 🌸', body: 'Fresh mood, fresh energy, fresh stories to create together.' },
    { headline: 'New season, new sparks 🌿', body: 'Try one new thing tonight and let curiosity lead.' },
  ],
  summer: [
    { headline: 'Hot summer nights unlocked ☀️', body: 'Playful challenges, spontaneous vibes, and zero overthinking.' },
    { headline: 'Bring the heat, keep it fun 🍹', body: 'Adventure mode is on. Pick a dare and go.' },
  ],
  fall: [
    { headline: 'Cozy season, closer connection 🍂', body: 'Slow down, warm up, and keep the playful tension alive.' },
    { headline: 'Autumn nights, softer lights 🕯️', body: 'Comfort plus chemistry is a very good combo.' },
  ],
  winter: [
    { headline: 'Winter warmth starts here ❄️', body: 'Blankets, body heat, and intentional closeness.' },
    { headline: 'Cold outside, spark inside 🔥', body: 'Make tonight feel like your favorite secret.' },
  ],
  newyear: [
    { headline: 'New year, same love, bolder play 🎆', body: 'Set one playful intention and make it happen tonight.' },
    { headline: 'Fresh chapter energy ✨', body: 'Small shared rituals now, big relationship momentum later.' },
  ],
};
const SEASONAL_TONIGHT_TEASERS: Record<string, string[]> = {
  valentines: ['Romantic and playful with just the right amount of heat.'],
  spring: ['Fresh-energy date night: soft start, bold finish.'],
  summer: ['Spontaneous and spicy, with zero pressure.'],
  fall: ['Cozy, close, and impossible to rush.'],
  winter: ['Warm up slowly and stay close longer.'],
  newyear: ['Try one new thing and call it your lucky ritual.'],
};
const SEASONAL_HOOK_LINES: Record<string, string[]> = {
  valentines: ['Turn ordinary nights into love-fest energy.'],
  spring: ['Fresh beginnings and playful experiments await.'],
  summer: ['Longer nights, bolder choices, more laughter.'],
  fall: ['Comfort meets chemistry in every cozy moment.'],
  winter: ['Body heat and closeness are the whole vibe.'],
  newyear: ['Fresh starts and daring first moves.'],
};

// ============================================
// LAZY FIREBASE INITIALIZATION
// Firebase is only initialized when first accessed (inside React components)
// This prevents native module crashes at app startup
// ============================================
let _firebaseApp: ReturnType<typeof initializeApp> | null = null;
let _firebaseAuth: ReturnType<typeof getAuth> | null = null;
let _firebaseDb: ReturnType<typeof getFirestore> | null = null;
let _firebaseError: Error | null = null;

const getFirebaseApp = (): ReturnType<typeof initializeApp> | null => {
  if (_firebaseError) return null;
  if (_firebaseApp) return _firebaseApp;
  
  try {
    _firebaseApp = initializeApp(firebaseConfig);
    return _firebaseApp;
  } catch (error) {
    console.error('Firebase app initialization error:', error);
    _firebaseError = error as Error;
    return null;
  }
};

const getFirebaseAuth = (): ReturnType<typeof getAuth> | null => {
  if (_firebaseError) return null;
  if (_firebaseAuth) return _firebaseAuth;
  
  const app = getFirebaseApp();
  if (!app) return null;
  
  try {
    _firebaseAuth = getAuth(app);
    return _firebaseAuth;
  } catch (error) {
    console.error('Firebase auth initialization error:', error);
    _firebaseError = error as Error;
    return null;
  }
};

const getFirebaseDb = (): ReturnType<typeof getFirestore> | null => {
  if (_firebaseError) return null;
  if (_firebaseDb) return _firebaseDb;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    _firebaseDb = getFirestore(app);
    return _firebaseDb;
  } catch (error) {
    console.error('Firebase firestore initialization error:', error);
    return null;
  }
};

const savePinToSecureStorage = async (pin: string | null): Promise<void> => {
  try {
    if (pin) {
      await SecureStore.setItemAsync(PIN_SECURE_STORAGE_KEY, pin);
    } else {
      await SecureStore.deleteItemAsync(PIN_SECURE_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Secure PIN storage error:', error);
  }
};

const loadPinFromSecureStorage = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(PIN_SECURE_STORAGE_KEY);
  } catch (error) {
    console.error('Secure PIN read error:', error);
    return null;
  }
};

// ============================================
// AUTH CONTEXT
// ============================================
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  initError: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize Firebase lazily and retry until auth is available.
  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: (() => void) | null = null;
    let retryCount = 0;

    const initializeAuth = () => {
      if (!isMounted) return;

      const auth = getFirebaseAuth();
      if (!auth) {
        retryCount += 1;
        if (retryCount >= AUTH_MAX_RETRIES) {
          setInitError('Authentication is currently unavailable. Please restart the app and try again.');
          setLoading(false);
          return;
        }
        retryTimer = setTimeout(initializeAuth, AUTH_RETRY_DELAY_MS);
        return;
      }

      setFirebaseReady(true);
      setInitError(null);
      unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        setUser(firebaseUser);
        setLoading(false);
      }, (error) => {
        console.error('Auth state observer error:', error);
        setInitError('Authentication sync failed. Please sign in again.');
        setLoading(false);
      });
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Keep Firebase auth synced with provider state while app is running.
  useEffect(() => {
    if (!firebaseReady) return;

    const syncLoop = setInterval(() => {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        auth.currentUser.reload().catch(() => {});
      }
    }, AUTH_SYNC_LOOP_MS);

    return () => clearInterval(syncLoop);
  }, [firebaseReady]);

  const signUp = async (email: string, password: string, _name: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithApple = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const provider = new OAuthProvider('apple.com');
      const oAuthCredential = provider.credential({
        idToken: credential.identityToken!,
      });
      
      await signInWithCredential(auth, oAuthCredential);
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        throw error;
      }
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, initError, signUp, signIn, signInWithApple, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// ============================================
// MASSAGE & ROLEPLAY CATEGORIES
// ============================================
const massageCategories = ['Relaxation', 'Sensual', 'Therapeutic'];
const rolePlayCategories = ['Romantic', 'Fantasy', 'Playful', 'Adventurous'];

const BASE_CONTENT_CATALOG: ContentCatalog = {
  positions: basePositions,
  foreplay: baseForeplayIdeas,
  oral: baseOralPlayIdeas,
  massage: baseMassageTechniques,
  roleplay: baseRolePlayScenarios,
};

const getCurrentLanguageSafe = (): AppLanguage => {
  try {
    return useStore.getState().language || 'en';
  } catch (_error) {
    return 'en';
  }
};

const getLocalizedCatalogForCurrentLanguage = (): ContentCatalog => {
  return getLocalizedContentCatalog(getCurrentLanguageSafe(), BASE_CONTENT_CATALOG);
};

const createLocalizedArrayProxy = <T,>(resolver: () => T[]): T[] => {
  return new Proxy([] as unknown as T[], {
    get(_target, property) {
      const resolved = resolver();
      if (property === Symbol.iterator) return resolved[Symbol.iterator].bind(resolved);
      if (property === 'length') return resolved.length;
      const value = (resolved as unknown as Record<PropertyKey, unknown>)[property];
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(resolved) : value;
    },
    ownKeys() {
      return Reflect.ownKeys(resolver());
    },
    getOwnPropertyDescriptor(_target, property) {
      const resolved = resolver() as unknown as object;
      const descriptor = Object.getOwnPropertyDescriptor(resolved, property);
      if (descriptor) return descriptor;
      return undefined;
    },
  });
};

const positions: Position[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().positions);
const foreplayIdeas: ForeplayIdea[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().foreplay);
const oralPlayIdeas: OralPlayIdea[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().oral);
const massageTechniques: MassageTechnique[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().massage);
const rolePlayScenarios: RolePlayScenario[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().roleplay);

// ============================================
// SEASONAL CONTENT
// ============================================
interface SeasonalTheme {
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

type SeasonalGameAction = 'truth_or_dare' | 'date_night' | 'challenge' | 'spin';

interface SeasonalGameOption {
  id: SeasonalGameAction;
  emoji: string;
  title: string;
  description: string;
}

const SEASONAL_GAME_OPTIONS: Record<SeasonalGameAction, SeasonalGameOption> = {
  truth_or_dare: {
    id: 'truth_or_dare',
    emoji: '🎲',
    title: 'Truth or Dare',
    description: 'Flirty prompts that match the season vibe',
  },
  date_night: {
    id: 'date_night',
    emoji: '🌙',
    title: 'Date Night Generator',
    description: 'Curated evening flow for connection and fun',
  },
  challenge: {
    id: 'challenge',
    emoji: '🎯',
    title: 'Seasonal Challenge',
    description: 'Goal-based activity for playful progression',
  },
  spin: {
    id: 'spin',
    emoji: '🎰',
    title: 'Spin Surprise',
    description: 'Quick randomizer for spontaneous inspiration',
  },
};

const SEASONAL_THEMES: SeasonalTheme[] = [
  {
    id: 'valentines',
    name: "Valentine's Day",
    emoji: '💕',
    description: 'Romantic connection & passion',
    color: '#ec4899',
    startMonth: 2, endMonth: 2,
    positions: [1, 5, 8, 12, 18], // Romantic positions
    foreplay: [101, 103, 106, 110],
    oral: [201, 202, 205, 206],
    roleplay: [401, 403, 404], // Romantic roleplay
    games: ['date_night', 'truth_or_dare', 'challenge'],
    tips: ['Set up rose petals', 'Light candles everywhere', 'Prepare chocolate-dipped strawberries', 'Write a love note to read together']
  },
  {
    id: 'spring',
    name: 'Spring Awakening',
    emoji: '🌸',
    description: 'Fresh energy & new beginnings',
    color: '#84cc16',
    startMonth: 3, endMonth: 5,
    positions: [3, 7, 11, 15, 22],
    foreplay: [104, 105, 107, 112],
    oral: [204, 206, 211, 212],
    roleplay: [406, 410, 415],
    games: ['date_night', 'spin', 'challenge'],
    tips: ['Open the windows for fresh air', 'Try morning intimacy', 'Bring flowers to the bedroom', 'Spring clean then celebrate']
  },
  {
    id: 'summer',
    name: 'Hot Summer Nights',
    emoji: '☀️',
    description: 'Playful & adventurous vibes',
    color: '#f59e0b',
    startMonth: 6, endMonth: 8,
    positions: [4, 9, 14, 20, 25],
    foreplay: [102, 108, 109, 111],
    oral: [203, 207, 208, 210],
    roleplay: [407, 411, 416],
    games: ['spin', 'truth_or_dare', 'challenge'],
    tips: ['Ice cubes for temperature play', 'Try a staycation hotel night', 'Skinny dipping if you can', 'Late night balcony/patio moments']
  },
  {
    id: 'fall',
    name: 'Cozy Autumn',
    emoji: '🍂',
    description: 'Warm, intimate connection',
    color: '#ea580c',
    startMonth: 9, endMonth: 11,
    positions: [2, 6, 10, 16, 21],
    foreplay: [101, 104, 106, 108],
    oral: [201, 204, 206, 212],
    roleplay: [402, 408, 412],
    games: ['date_night', 'truth_or_dare', 'spin'],
    tips: ['Fireplace or candles for ambiance', 'Warm blankets and cozy vibes', 'Pumpkin spice massage oil', 'Stay in bed on rainy days']
  },
  {
    id: 'winter',
    name: 'Winter Warmth',
    emoji: '❄️',
    description: 'Body heat & closeness',
    color: '#3b82f6',
    startMonth: 12, endMonth: 1,
    positions: [1, 5, 8, 12, 17],
    foreplay: [101, 105, 108, 112],
    oral: [201, 205, 209, 212],
    roleplay: [403, 405, 409],
    games: ['date_night', 'challenge', 'truth_or_dare'],
    tips: ['Body heat is your friend', 'Hot bath or shower together', 'Fuzzy blankets and bare skin', 'Holiday lingerie surprise']
  },
  {
    id: 'newyear',
    name: "New Year's Spark",
    emoji: '🎆',
    description: 'Fresh starts & new adventures',
    color: '#a855f7',
    startMonth: 1, endMonth: 1,
    positions: [3, 8, 13, 19, 24],
    foreplay: [102, 103, 106, 110],
    oral: [202, 206, 208, 211],
    roleplay: [401, 406, 414],
    games: ['challenge', 'spin', 'truth_or_dare'],
    tips: ['Make intimacy resolutions together', 'Try something completely new', 'Champagne and celebration', 'Midnight countdown kiss and more']
  },
];

const getCurrentSeason = (): SeasonalTheme | null => {
  const month = new Date().getMonth() + 1;
  return SEASONAL_THEMES.find(s => 
    s.startMonth <= s.endMonth 
      ? month >= s.startMonth && month <= s.endMonth
      : month >= s.startMonth || month <= s.endMonth
  ) || null;
};

// ============================================
// TRUTH OR DARE CONTENT
// ============================================
interface TruthOrDareItem {
  id: number;
  type: 'truth' | 'dare';
  intensity: 'mild' | 'medium' | 'spicy' | 'wild';
  text: string;
}

const TRUTH_OR_DARE: TruthOrDareItem[] = [
  // ============================================
  // MILD TRUTHS (16 items - doubled from 8)
  // ============================================
  { id: 1, type: 'truth', intensity: 'mild', text: "What's your favorite thing about our physical connection?" },
  { id: 2, type: 'truth', intensity: 'mild', text: "When did you first know you were attracted to me?" },
  { id: 3, type: 'truth', intensity: 'mild', text: "What's one thing I do that always makes you smile?" },
  { id: 4, type: 'truth', intensity: 'mild', text: "What's your favorite memory of us together?" },
  { id: 5, type: 'truth', intensity: 'mild', text: "Where's the most romantic place you'd want to travel with me?" },
  { id: 6, type: 'truth', intensity: 'mild', text: "What outfit of mine do you find most attractive?" },
  { id: 7, type: 'truth', intensity: 'mild', text: "What's something sweet I do that you've never told me you noticed?" },
  { id: 8, type: 'truth', intensity: 'mild', text: "What song makes you think of me?" },
  // NEW MILD TRUTHS
  { id: 9, type: 'truth', intensity: 'mild', text: "What was going through your mind the first time we kissed?" },
  { id: 10, type: 'truth', intensity: 'mild', text: "What's your favorite way to spend a lazy Sunday together?" },
  { id: 11, type: 'truth', intensity: 'mild', text: "What's the most romantic thing I've ever done for you?" },
  { id: 12, type: 'truth', intensity: 'mild', text: "If we could relive any moment together, which would you choose?" },
  { id: 13, type: 'truth', intensity: 'mild', text: "What little thing do I do that makes you feel loved?" },
  { id: 14, type: 'truth', intensity: 'mild', text: "What were your first impressions of me?" },
  { id: 15, type: 'truth', intensity: 'mild', text: "What's your favorite compliment I've ever given you?" },
  { id: 16, type: 'truth', intensity: 'mild', text: "What movie scene reminds you of us?" },

  // ============================================
  // MEDIUM TRUTHS (16 items - doubled from 8)
  // ============================================
  { id: 17, type: 'truth', intensity: 'medium', text: "What's something you've always wanted to try in the bedroom?" },
  { id: 18, type: 'truth', intensity: 'medium', text: "Where's the most adventurous place you'd want to be intimate?" },
  { id: 19, type: 'truth', intensity: 'medium', text: "What's your biggest turn-on that I do?" },
  { id: 20, type: 'truth', intensity: 'medium', text: "What time of day do you feel most in the mood?" },
  { id: 21, type: 'truth', intensity: 'medium', text: "What's a fantasy you've had about us?" },
  { id: 22, type: 'truth', intensity: 'medium', text: "What part of your body do you most like me to touch?" },
  { id: 23, type: 'truth', intensity: 'medium', text: "What's something I do that drives you wild?" },
  { id: 24, type: 'truth', intensity: 'medium', text: "Have you ever had a dream about us? Describe it." },
  // NEW MEDIUM TRUTHS
  { id: 25, type: 'truth', intensity: 'medium', text: "What's the most attractive thing about my body?" },
  { id: 26, type: 'truth', intensity: 'medium', text: "What kind of touch from me makes you melt instantly?" },
  { id: 27, type: 'truth', intensity: 'medium', text: "What's something you want more of in our intimate life?" },
  { id: 28, type: 'truth', intensity: 'medium', text: "Where do you like to be kissed that I might not know about?" },
  { id: 29, type: 'truth', intensity: 'medium', text: "What's your favorite thing about our chemistry?" },
  { id: 30, type: 'truth', intensity: 'medium', text: "What would make a perfect date night ending?" },
  { id: 31, type: 'truth', intensity: 'medium', text: "What's a subtle signal you give when you're in the mood?" },
  { id: 32, type: 'truth', intensity: 'medium', text: "What's the longest you've thought about being intimate with me?" },

  // ============================================
  // SPICY TRUTHS (12 items - doubled from 6)
  // ============================================
  { id: 33, type: 'truth', intensity: 'spicy', text: "What's your most secret fantasy you've never shared?" },
  { id: 34, type: 'truth', intensity: 'spicy', text: "What's the boldest thing you want me to do to you tonight?" },
  { id: 35, type: 'truth', intensity: 'spicy', text: "Describe your perfect intimate evening in detail." },
  { id: 36, type: 'truth', intensity: 'spicy', text: "What role play scenario turns you on most?" },
  { id: 37, type: 'truth', intensity: 'spicy', text: "What's the most spontaneous thing you want us to do?" },
  { id: 38, type: 'truth', intensity: 'spicy', text: "If you could have me do anything right now, what would it be?" },
  // NEW SPICY TRUTHS
  { id: 39, type: 'truth', intensity: 'spicy', text: "What's a position from the app you're most curious to try?" },
  { id: 40, type: 'truth', intensity: 'spicy', text: "Where's the riskiest place you'd want to be intimate with me?" },
  { id: 41, type: 'truth', intensity: 'spicy', text: "What's the longest you'd want our intimate sessions to last?" },
  { id: 42, type: 'truth', intensity: 'spicy', text: "Describe what you want me to do to you using only sounds." },
  { id: 43, type: 'truth', intensity: 'spicy', text: "What's something you've seen that you want us to recreate?" },
  { id: 44, type: 'truth', intensity: 'spicy', text: "If I whispered something in your ear right now, what would you want it to be?" },

  // ============================================
  // WILD TRUTHS (4 items - doubled from 2)
  // ============================================
  { id: 45, type: 'truth', intensity: 'wild', text: "What's the wildest fantasy you've ever imagined about us?" },
  { id: 46, type: 'truth', intensity: 'wild', text: "Describe exactly how you want tonight to go, in explicit detail." },
  // NEW WILD TRUTHS
  { id: 47, type: 'truth', intensity: 'wild', text: "What's something you've always wanted to try but been too shy to ask?" },
  { id: 48, type: 'truth', intensity: 'wild', text: "If there were no limits tonight, what would you want us to do?" },

  // ============================================
  // MILD DARES (16 items - doubled from 8)
  // ============================================
  { id: 101, type: 'dare', intensity: 'mild', text: "Give your partner a 30-second shoulder massage." },
  { id: 102, type: 'dare', intensity: 'mild', text: "Whisper something you love about them in their ear." },
  { id: 103, type: 'dare', intensity: 'mild', text: "Hold hands and look into each other's eyes for 60 seconds." },
  { id: 104, type: 'dare', intensity: 'mild', text: "Give your partner a slow, romantic kiss." },
  { id: 105, type: 'dare', intensity: 'mild', text: "Tell your partner three things you find attractive about them." },
  { id: 106, type: 'dare', intensity: 'mild', text: "Slow dance together to an imaginary song for one minute." },
  { id: 107, type: 'dare', intensity: 'mild', text: "Feed your partner something sweet." },
  { id: 108, type: 'dare', intensity: 'mild', text: "Write 'I love you' somewhere on your partner with your finger." },
  // NEW MILD DARES
  { id: 109, type: 'dare', intensity: 'mild', text: "Give your partner butterfly kisses on their cheeks." },
  { id: 110, type: 'dare', intensity: 'mild', text: "Play with your partner's hair for one minute." },
  { id: 111, type: 'dare', intensity: 'mild', text: "Hug your partner from behind and hold for 30 seconds." },
  { id: 112, type: 'dare', intensity: 'mild', text: "Describe your partner using only compliments for 30 seconds." },
  { id: 113, type: 'dare', intensity: 'mild', text: "Give your partner an Eskimo kiss (rub noses together)." },
  { id: 114, type: 'dare', intensity: 'mild', text: "Trace the outline of your partner's face with your fingertip." },
  { id: 115, type: 'dare', intensity: 'mild', text: "Let your partner pick the next song and dance to it together." },
  { id: 116, type: 'dare', intensity: 'mild', text: "Give your partner a hand massage for one minute." },

  // ============================================
  // MEDIUM DARES (16 items - doubled from 8)
  // ============================================
  { id: 117, type: 'dare', intensity: 'medium', text: "Kiss your partner's neck for 30 seconds." },
  { id: 118, type: 'dare', intensity: 'medium', text: "Remove one piece of your clothing seductively." },
  { id: 119, type: 'dare', intensity: 'medium', text: "Give your partner a sensual back massage for 2 minutes." },
  { id: 120, type: 'dare', intensity: 'medium', text: "Trace your lips across your partner's collarbone." },
  { id: 121, type: 'dare', intensity: 'medium', text: "Whisper your biggest fantasy in your partner's ear." },
  { id: 122, type: 'dare', intensity: 'medium', text: "Let your partner undress you with only their teeth for one item." },
  { id: 123, type: 'dare', intensity: 'medium', text: "Kiss your partner everywhere except their lips for 1 minute." },
  { id: 124, type: 'dare', intensity: 'medium', text: "Do your best seductive dance for 30 seconds." },
  // NEW MEDIUM DARES
  { id: 125, type: 'dare', intensity: 'medium', text: "Nibble your partner's ear gently for 20 seconds." },
  { id: 126, type: 'dare', intensity: 'medium', text: "Let your partner blindfold you for the next dare." },
  { id: 127, type: 'dare', intensity: 'medium', text: "Kiss from your partner's wrist up to their shoulder." },
  { id: 128, type: 'dare', intensity: 'medium', text: "Breathe warm air on your partner's neck without touching." },
  { id: 129, type: 'dare', intensity: 'medium', text: "Give your partner a foot massage for 2 minutes." },
  { id: 130, type: 'dare', intensity: 'medium', text: "Remove your partner's socks using only your mouth." },
  { id: 131, type: 'dare', intensity: 'medium', text: "Describe what you want to do to your partner in a whisper." },
  { id: 132, type: 'dare', intensity: 'medium', text: "Let your partner draw something on your back - guess what it is." },

  // ============================================
  // SPICY DARES (12 items - doubled from 6)
  // ============================================
  { id: 133, type: 'dare', intensity: 'spicy', text: "Remove your partner's shirt using only your mouth." },
  { id: 134, type: 'dare', intensity: 'spicy', text: "Demonstrate your favorite position on your partner (clothes on)." },
  { id: 135, type: 'dare', intensity: 'spicy', text: "Give your partner a full-body massage for 3 minutes." },
  { id: 136, type: 'dare', intensity: 'spicy', text: "Kiss your partner's entire body from head to toe." },
  { id: 137, type: 'dare', intensity: 'spicy', text: "Blindfold your partner and tease them for 2 minutes." },
  { id: 138, type: 'dare', intensity: 'spicy', text: "Act out a steamy scene from a movie together." },
  // NEW SPICY DARES
  { id: 139, type: 'dare', intensity: 'spicy', text: "Use an ice cube to trace a path on your partner's body." },
  { id: 140, type: 'dare', intensity: 'spicy', text: "Straddle your partner and kiss them passionately for 1 minute." },
  { id: 141, type: 'dare', intensity: 'spicy', text: "Let your partner be in complete control of your hands for 2 minutes." },
  { id: 142, type: 'dare', intensity: 'spicy', text: "Leave a trail of kisses from your partner's neck to their waistline." },
  { id: 143, type: 'dare', intensity: 'spicy', text: "Pin your partner's hands above their head and kiss them." },
  { id: 144, type: 'dare', intensity: 'spicy', text: "Give your partner a lap dance for 1 minute." },

  // ============================================
  // WILD DARES (6 items - doubled from 3)
  // ============================================
  { id: 145, type: 'dare', intensity: 'wild', text: "Recreate your partner's favorite fantasy right now." },
  { id: 146, type: 'dare', intensity: 'wild', text: "Let your partner be completely in control for the next 5 minutes." },
  { id: 147, type: 'dare', intensity: 'wild', text: "Try a new position from the app right now." },
  // NEW WILD DARES
  { id: 148, type: 'dare', intensity: 'wild', text: "Your partner gets to direct exactly what happens for 5 minutes." },
  { id: 149, type: 'dare', intensity: 'wild', text: "Act out the last fantasy either of you mentioned tonight." },
  { id: 150, type: 'dare', intensity: 'wild', text: "Use only your mouth for the next 3 minutes - no hands allowed." },
];

// ============================================
// MUSIC PLAYLIST SUGGESTIONS
// ============================================
interface PlaylistLink {
  name: string;
  mood: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  description: string;
}

const CURATED_PLAYLISTS: PlaylistLink[] = [
  {
    name: "Romantic Evening",
    mood: "romantic",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn",
    appleMusicUrl: "https://music.apple.com/us/playlist/romantic-evening/pl.acc464c750b94302b8f6c92b5f43edef",
    description: "Soft, intimate tracks for slow, romantic moments"
  },
  {
    name: "Sensual & Slow",
    mood: "sensual",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWXqpDKK4ed9O",
    appleMusicUrl: "https://music.apple.com/us/playlist/r-b-slow-jams/pl.451f921fe7484d48bae203f7f0a3cc2e",
    description: "R&B slow jams for passionate connection"
  },
  {
    name: "After Dark",
    mood: "passionate",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
    appleMusicUrl: "https://music.apple.com/us/playlist/late-night-vibes/pl.6b3e2a7eb16e4c4a9d3b8a2c1f4e5d6a",
    description: "Sultry, late-night vibes"
  },
  {
    name: "Chill & Intimate",
    mood: "relaxed",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX2UgsUIg75Vg",
    appleMusicUrl: "https://music.apple.com/us/playlist/chill-vibes/pl.2b0f1c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    description: "Mellow beats for relaxed intimacy"
  },
  {
    name: "Spicy Latin",
    mood: "playful",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX10zKzsJ2jva",
    appleMusicUrl: "https://music.apple.com/us/playlist/latin-heat/pl.7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    description: "Hot Latin rhythms to heat things up"
  },
  {
    name: "Electric Energy",
    mood: "dynamic",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4fpCWaHOned",
    appleMusicUrl: "https://music.apple.com/us/playlist/dance-workout/pl.9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    description: "High-energy tracks for adventurous nights"
  },
];

// ============================================
// USER PLAYLIST TYPES & HELPERS
// ============================================
interface UserPlaylist {
  id: string;
  name: string;
  url: string;
  mood: string;
  platform: 'spotify' | 'apple' | 'youtube' | 'other';
  dateAdded: string;
}

const PLAYLIST_MOODS = [
  { id: 'romantic', emoji: '🌹', label: 'Romantic' },
  { id: 'sensual', emoji: '🔥', label: 'Sensual' },
  { id: 'passionate', emoji: '💋', label: 'Passionate' },
  { id: 'relaxed', emoji: '🌊', label: 'Relaxed' },
  { id: 'playful', emoji: '😊', label: 'Playful' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic' },
];

const MAX_USER_PLAYLISTS = 10;

const detectPlatform = (url: string): 'spotify' | 'apple' | 'youtube' | 'other' => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('spotify.com') || lowerUrl.includes('spotify:')) return 'spotify';
  if (lowerUrl.includes('music.apple.com') || lowerUrl.includes('itunes.apple.com')) return 'apple';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('music.youtube.com')) return 'youtube';
  return 'other';
};

const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'spotify': return '🟢';
    case 'apple': return '🍎';
    case 'youtube': return '🔴';
    default: return '🎵';
  }
};

const getPlatformName = (platform: string): string => {
  switch (platform) {
    case 'spotify': return 'Spotify';
    case 'apple': return 'Apple Music';
    case 'youtube': return 'YouTube Music';
    default: return 'Music Link';
  }
};

// ============================================
// ANONYMOUS ANALYTICS SYSTEM (PostHog)
// ============================================
// Tracks aggregated usage events only.
// We explicitly disable person profiling and only send sanitized, non-PII properties.
type AnalyticsEventName =
  | 'content_tried'
  | 'feature_used'
  | 'category_viewed'
  | 'mood_selected'
  | 'app_opened'
  | 'level_reached';

type AnalyticsPropertyValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

// PostHog Analytics Helper - uses the PostHog hook inside components
// For use outside components, we queue events and send them when possible
let pendingEvents: Array<{ event: AnalyticsEventName; properties?: Record<string, unknown> }> = [];
const ANALYTICS_BASE_PROPERTIES = {
  anonymous: true,
  analytics_mode: 'anonymous_aggregate',
  $process_person_profile: false,
};
const ALLOWED_ANALYTICS_PROPERTY_KEYS = new Set([
  'contentType',
  'category',
  'mood',
  'feature',
  'level',
]);
const FORMSPREE_ALLOWED_FIELDS = new Set([
  'type',
  'category',
  'ideaType',
  'message',
  'submittedAt',
]);

const sanitizeAnalyticsProperties = (properties?: Record<string, unknown>): AnalyticsProperties => {
  if (!properties) return {};

  const sanitized: AnalyticsProperties = {};
  Object.entries(properties).forEach(([key, value]) => {
    if (!ALLOWED_ANALYTICS_PROPERTY_KEYS.has(key)) return;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = typeof value === 'string' ? value.trim().slice(0, ANALYTICS_STRING_LIMIT) : value;
    }
  });
  return sanitized;
};

const sanitizeFormspreePayload = (payload: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (!FORMSPREE_ALLOWED_FIELDS.has(key)) return;
    const normalized = value.trim();
    if (!normalized) return;

    sanitized[key] = key === 'message'
      ? normalized.slice(0, FORMSPREE_MESSAGE_LIMIT)
      : normalized.slice(0, ANALYTICS_STRING_LIMIT);
  });
  return sanitized;
};

const submitFormspreeMessage = async (payload: Record<string, string>): Promise<void> => {
  const sanitizedPayload = sanitizeFormspreePayload(payload);
  if (!sanitizedPayload.message) {
    throw new Error('Formspree payload is missing a message');
  }

  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(sanitizedPayload),
  });
  if (!response.ok) {
    throw new Error(`Formspree request failed (${response.status})`);
  }
};

const DAILY_JOKE_SETUPS: string[] = [
  'Why did the candle blush on date night?',
  'What did one silk sheet say to the other?',
  'Why was the bedroom playlist smiling?',
  'What is the flirtiest way to burn calories?',
  'Why did the mirror ask for a front-row seat?',
  'What did the rose whisper at sunset?',
  'Why did the zipper start laughing?',
  'What is a couple is favorite cardio?',
  'Why did the pillow request overtime?',
  'What did the lace robe say at midnight?',
  'Why did the massage oil get promoted?',
  'What is the fastest way to raise the heat?',
  'Why did the moonlight refuse to leave?',
  'What did the wink text at 9 PM?',
  'Why did the couch feel left out?',
  'What is the secret ingredient in chemistry?',
  'Why did the lipstick check the time twice?',
  'What did the teasing glance say?',
  'Why did the champagne pop early?',
  'What is the best kind of homework for two?',
  'Why did the neck kiss get an encore?',
  'What did the slow dance promise?',
  'Why did the blanket call it destiny?',
  'What is a playful way to say hello?',
  'Why did the hallway become a runway?',
  'What did the perfume announce?',
  'Why did the countdown feel electric?',
  'What is the warmest winter activity?',
  'Why did the date night timer break?',
  'What did one heartbeat text the other?',
  'Why did the naughty grin stay up late?',
  'What is the best way to start a rematch?',
  'Why did the dim lights stay on?',
  'What did the after-dinner look mean?',
  'Why did the blush travel from cheeks to ears?',
  'What is tonight is quickest confidence boost?',
  'Why did the kiss ask for round two?',
  'What did the playful challenge card say?',
  'Why did the silk ribbon tie up the evening?',
  'What did the midnight message tease?',
];

const DAILY_JOKE_PUNCHLINES: string[] = [
  'Because things were clearly getting lit.',
  'Stick with me and tonight gets smoother.',
  'Two tracks in and everyone forgot their to-do list.',
  'A slow chase from the kitchen to the bedroom.',
  'It heard the chemistry was about to be visual.',
  'Stay close, the petals are just the trailer.',
  'Every outfit tonight had a short runtime.',
  'Longer kisses, shorter excuses.',
  'It knew cuddling might become a contact sport.',
  'I am not dramatic, I am just effective.',
  'It keeps making tension disappear on contact.',
  'One whisper and one daring smile.',
  'It said this vibe deserves overtime.',
  'Bring your best look, I brought mine.',
  'Because the sparks kept moving rooms.',
  'Confidence with a side of playful chaos.',
  'It wanted to be seen before being smudged.',
  'Meet me halfway and lose track of time.',
  'It heard someone opened the flirt tab.',
  'Partner squats, with bonus giggles.',
  'The audience requested another performance.',
  'Tonight is about rhythm, not rushing.',
  'It knew cozy was one step from spicy.',
  'A smile, a kiss, and no further questions.',
  'Every step looked like a preview.',
  'You are about to remember this scent.',
  'Because anticipation is doing push-ups.',
  'Blankets plus body heat equals happy chaos.',
  'No one could agree on just one round.',
  'Same pulse, same trouble.',
  'It had unfinished business with your lips.',
  'Winner gets bragging rights and a kiss.',
  'The mood was too good to interrupt.',
  'It meant save room for dessert part two.',
  'Because the plot twist was adorable.',
  'A compliment and a bold first move.',
  'The first one was just the warm-up.',
  'Pick truth, dare, or kiss anyway.',
  'It tied the evening to your favorite smile.',
  'Open the app and claim your reward.',
  'Because flirting is the best foreplay.',
  'The punchline is you in that look.',
  'Tonight is forecast: 100% chance of sparks.',
];

interface DailyJoke {
  id: string;
  setup: string;
  punchline: string;
}

interface DailyJokeBank {
  setups: string[];
  punchlines: string[];
  version?: string;
}

interface DailyJokeBankCache {
  fetchedAt: number;
  bank: DailyJokeBank;
}

const getDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
};

const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b);

const sanitizeJokePartList = (parts: unknown): string[] => {
  if (!Array.isArray(parts)) return [];
  return parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part.length > 0);
};

const normalizeDailyJokeBank = (raw: unknown): DailyJokeBank | null => {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as { setups?: unknown; punchlines?: unknown; version?: unknown };
  const setups = sanitizeJokePartList(candidate.setups);
  const punchlines = sanitizeJokePartList(candidate.punchlines);
  if (setups.length < 10 || punchlines.length < 10) return null;

  const punchlinePeriod = punchlines.length / gcd(punchlines.length, 13);
  const yearlyCycle = lcm(setups.length, punchlinePeriod);
  if (yearlyCycle < 366) {
    console.warn('Remote daily joke bank rejected: cycle must cover at least 366 unique days.');
    return null;
  }

  return {
    setups,
    punchlines,
    version: typeof candidate.version === 'string' ? candidate.version.trim() : undefined,
  };
};

const readCachedDailyJokeBank = async (allowStale = false): Promise<DailyJokeBank | null> => {
  try {
    const cacheRaw = await AsyncStorage.getItem(DAILY_JOKE_BANK_CACHE_KEY);
    if (!cacheRaw) return null;

    const parsed = JSON.parse(cacheRaw) as DailyJokeBankCache;
    const bank = normalizeDailyJokeBank(parsed?.bank);
    if (!bank) return null;

    const fetchedAt = Number(parsed?.fetchedAt || 0);
    const isFresh = fetchedAt > 0 && Date.now() - fetchedAt <= DAILY_JOKE_BANK_CACHE_TTL_MS;
    if (!allowStale && !isFresh) return null;

    return bank;
  } catch {
    return null;
  }
};

const writeCachedDailyJokeBank = async (bank: DailyJokeBank): Promise<void> => {
  try {
    const payload: DailyJokeBankCache = {
      fetchedAt: Date.now(),
      bank,
    };
    await AsyncStorage.setItem(DAILY_JOKE_BANK_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Non-blocking cache write.
  }
};

const fetchRemoteDailyJokeBank = async (): Promise<DailyJokeBank | null> => {
  try {
    const db = getFirebaseDb();
    if (!db) return null;

    const bankDoc = await getDoc(doc(db, DAILY_JOKE_BANK_DOC_PATH[0], DAILY_JOKE_BANK_DOC_PATH[1]));
    if (!bankDoc.exists()) return null;

    return normalizeDailyJokeBank(bankDoc.data());
  } catch (error) {
    console.warn('Remote daily joke bank fetch failed:', error);
    return null;
  }
};

const getDailyJokeBank = async (forceRemote = false): Promise<DailyJokeBank | null> => {
  if (!forceRemote) {
    const cachedBank = await readCachedDailyJokeBank(false);
    if (cachedBank) return cachedBank;
  }

  const remoteBank = await fetchRemoteDailyJokeBank();
  if (remoteBank) {
    await writeCachedDailyJokeBank(remoteBank);
    return remoteBank;
  }

  return readCachedDailyJokeBank(true);
};

const getDailyJokeForDate = (date: Date, bank?: DailyJokeBank | null): DailyJoke => {
  const setups = bank?.setups?.length ? bank.setups : DAILY_JOKE_SETUPS;
  const punchlines = bank?.punchlines?.length ? bank.punchlines : DAILY_JOKE_PUNCHLINES;
  const dayIndex = Math.max(0, getDayOfYear(date) - 1);
  const year = date.getFullYear();
  const setupIndex = dayIndex % setups.length;
  const punchlineIndex = (dayIndex * 13 + year) % punchlines.length;
  const bankTag = bank?.version?.length ? bank.version : 'local';
  return {
    id: `${year}-${setupIndex}-${punchlineIndex}-${bankTag}`,
    setup: setups[setupIndex],
    punchline: punchlines[punchlineIndex],
  };
};

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const ensureDailyJokeTeaserNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  try {
    const now = new Date();
    const jokeBank = await getDailyJokeBank();
    const refreshAtRaw = await AsyncStorage.getItem(DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY);
    if (refreshAtRaw && new Date(refreshAtRaw) > now) {
      return;
    }

    const permission = await Notifications.getPermissionsAsync();
    let finalStatus = permission.status;
    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }
    if (finalStatus !== 'granted') {
      return;
    }

    const existingIdsRaw = await AsyncStorage.getItem(DAILY_JOKE_NOTIFICATION_IDS_KEY);
    if (existingIdsRaw) {
      const existingIds: string[] = JSON.parse(existingIdsRaw);
      await Promise.all(existingIds.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    }

    const scheduledIds: string[] = [];
    for (let offset = 0; offset < DAILY_JOKE_NOTIFICATION_DAYS_AHEAD; offset += 1) {
      const fireDate = new Date();
      fireDate.setDate(fireDate.getDate() + offset);
      fireDate.setHours(DAILY_JOKE_NOTIFICATION_HOUR, DAILY_JOKE_NOTIFICATION_MINUTE, 0, 0);
      if (fireDate <= now) continue;

      const joke = getDailyJokeForDate(fireDate, jokeBank);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: DAILY_JOKE_NOTIFICATION_TITLE,
          body: `${joke.setup} Open Blisse for the punchline.`,
          sound: false,
          data: { type: 'daily_joke_tease', jokeId: joke.id, dateKey: getDateKey(fireDate) },
        },
        trigger: fireDate as any,
      });
      scheduledIds.push(id);
    }

    const refreshAt = new Date(now);
    refreshAt.setDate(refreshAt.getDate() + DAILY_JOKE_NOTIFICATION_REFRESH_WINDOW_DAYS);

    await AsyncStorage.setItem(DAILY_JOKE_NOTIFICATION_IDS_KEY, JSON.stringify(scheduledIds));
    await AsyncStorage.setItem(DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY, refreshAt.toISOString());
  } catch (error) {
    console.warn('Daily joke notification scheduling failed:', error);
  }
};

const Analytics = {
  trackContentTried: (contentType: string, category: string, mood: string) => {
    pendingEvents.push({ 
      event: 'content_tried', 
      properties: { contentType, category, mood } 
    });
  },
  trackFeatureUsed: (feature: string) => {
    pendingEvents.push({ 
      event: 'feature_used', 
      properties: { feature } 
    });
  },
  trackCategoryViewed: (category: string) => {
    pendingEvents.push({ 
      event: 'category_viewed', 
      properties: { category } 
    });
  },
  trackMoodSelected: (mood: string) => {
    pendingEvents.push({ 
      event: 'mood_selected', 
      properties: { mood } 
    });
  },
  trackAppOpened: () => {
    pendingEvents.push({ event: 'app_opened' });
  },
  trackLevelReached: (level: number) => {
    pendingEvents.push({ 
      event: 'level_reached', 
      properties: { level } 
    });
  },
  // Flush pending events (called from components with PostHog access)
  getPendingEvents: () => {
    const events = [...pendingEvents];
    pendingEvents = [];
    return events;
  },
};

// ============================================
// GAMIFICATION TYPES
// ============================================
interface ActivityLog {
  id: string;
  date: string;
  type: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay' | 'session';
  itemId?: number;
  starsEarned: number;
  achievements: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedDate?: string;
  category: 'exploration' | 'consistency' | 'adventure' | 'milestone';
}

interface MonthlyStats {
  month: string; // "2024-01"
  totalSessions: number;
  starsEarned: number;
  newThingsTried: number;
  challengesCompleted: number;
}

// ============================================
// LEVELS & TITLES SYSTEM
// ============================================
interface Level {
  level: number;
  title: string;
  emoji: string;
  minStars: number;
  maxStars: number;
  color: string;
}

const LEVELS: Level[] = [
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

const getLevel = (stars: number): Level => {
  return LEVELS.find(l => stars >= l.minStars && stars <= l.maxStars) || LEVELS[0];
};

const getNextLevel = (stars: number): Level | null => {
  const currentLevel = getLevel(stars);
  return LEVELS.find(l => l.level === currentLevel.level + 1) || null;
};

// ============================================
// WEEKLY GOALS SYSTEM
// ============================================
interface WeeklyGoal {
  id: string;
  type: 'try_new' | 'use_app' | 'complete_challenge' | 'earn_stars' | 'try_mood';
  target: number;
  current: number;
  description: string;
  emoji: string;
  reward: number; // bonus stars
  completed: boolean;
}

const generateWeeklyGoals = (userLevel: number): WeeklyGoal[] => {
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
interface MoodPlaylist {
  id: string;
  name: string;
  emoji: string;
  description: string;
  mood: string;
  color: string;
}

const MOOD_PLAYLISTS: MoodPlaylist[] = [
  { id: 'romantic', name: 'Romantic Evening', emoji: '🌹', description: 'Slow, intimate, connection-focused', mood: 'unified', color: '#ec4899' },
  { id: 'passionate', name: 'Passionate Night', emoji: '🔥', description: 'Intense, fiery, urgent', mood: 'passionate', color: '#ef4444' },
  { id: 'playful', name: 'Playful Fun', emoji: '😊', description: 'Light, teasing, laughter', mood: 'playful', color: '#f59e0b' },
  { id: 'adventurous', name: 'Adventure Mode', emoji: '🎪', description: 'Try something new & exciting', mood: 'dynamic', color: '#f97316' },
  { id: 'relaxed', name: 'Lazy & Relaxed', emoji: '🌊', description: 'Low effort, maximum comfort', mood: 'flowing', color: '#06b6d4' },
  { id: 'quickie', name: 'Quick & Urgent', emoji: '⚡', description: 'Fast, spontaneous, hot', mood: 'passionate', color: '#a855f7' },
];

interface Note {
  id: number;
  type: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';
  itemId: number;
  text: string;
  rating: number;
  date: string;
}

// ============================================
// SMART LEARNING SYSTEM
// ============================================
// Tracks user behavior to make personalized recommendations

interface UserPreferences {
  // Category preferences (0-100 score based on usage)
  categoryScores: Record<string, number>;
  // Mood preferences
  moodScores: Record<string, number>;
  // Difficulty preferences
  difficultyScores: Record<string, number>;
  // Content type preferences
  contentTypeScores: Record<string, number>;
  // Time-based patterns
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  // Interaction patterns
  avgSessionLength: number;
  favoriteToTriedRatio: number;
  // Last updated
  lastUpdated: string;
}

interface InteractionEvent {
  type: 'view' | 'try' | 'favorite' | 'unfavorite' | 'rate' | 'skip';
  contentType: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';
  itemId: number;
  category?: string;
  mood?: string;
  difficulty?: string;
  rating?: number;
  timestamp: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
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
const LEARNING_WEIGHTS = {
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
const PREFERENCE_DECAY = 0.98;
const MAX_PREFERENCE_SCORE = 100;
const MIN_PREFERENCE_SCORE = 0;

// Smart Learning Helper Functions
const SmartLearning = {
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

interface Challenge {
  id: string;
  type: 'position' | 'foreplay' | 'oral';
  itemId: number;
  startDate: string;
  completed: boolean;
}

// ============================================
// ACHIEVEMENTS DEFINITIONS
// ============================================
const ACHIEVEMENTS: Achievement[] = [
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

// ============================================
// ZUSTAND STORE WITH PERSISTENCE
// ============================================
interface UserState {
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

const useStore = create<UserState>()(
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

      // NEW: Weekly Goals System
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

      // NEW: Daily Login System
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

const useI18n = () => {
  const language = useStore((state) => state.language);
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return translateUi(language, key, params);
  }, [language]);
  const uiPack = useCallback((path: string, params?: Record<string, string | number>) => {
    const translated = translateFromUiPack(language, path, params);
    return translated || path;
  }, [language]);
  const authPack = useCallback((screen: string, path: string, params?: Record<string, string | number>) => {
    const translated = translateFromAuthPack(language, screen, path, params);
    return translated || path;
  }, [language]);
  const localizeTerm = useCallback((term: string) => {
    return translateTerm(language, term);
  }, [language]);
  const languageLabel = useMemo(() => getLanguageLabel(language), [language]);

  return { language, languageLabel, t, uiPack, authPack, localizeTerm };
};

// ============================================
// THEME SYSTEM
// ============================================
interface ThemeColors {
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

interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  colors: ThemeColors;
}

const THEMES: AppTheme[] = [
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
type FontSizePreset = 'small' | 'medium' | 'large';

const FONT_SIZES: Record<FontSizePreset, { base: number; small: number; large: number; xlarge: number }> = {
  small: { base: 13, small: 11, large: 16, xlarge: 20 },
  medium: { base: 15, small: 13, large: 18, xlarge: 24 },
  large: { base: 17, small: 15, large: 22, xlarge: 28 },
};

// Theme store (separate from main store for reactivity)
interface ThemeState {
  currentTheme: string;
  fontSize: FontSizePreset;
  setTheme: (themeId: string) => void;
  setFontSize: (size: FontSizePreset) => void;
}

const useThemeStore = create<ThemeState>()(
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

// Helper to get current theme colors
const getThemeColors = (themeId: string): ThemeColors => {
  return THEMES.find(t => t.id === themeId)?.colors || THEMES[0].colors;
};

// ============================================
// COLORS (default theme - components will use dynamic colors)
// ============================================
const colors = {
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
};

// ============================================
// HAPTIC FEEDBACK HELPER
// ============================================
const haptic = {
  light: () => {},
  medium: () => {},
  success: () => {},
  celebration: () => {},
  error: () => {},
};

// ============================================
// ANIMATION COMPONENTS
// ============================================

// Confetti Particle Component
interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
}

function ConfettiCelebration({ visible, onComplete }: { visible: boolean; onComplete?: () => void }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  
  useEffect(() => {
    if (visible) {
      // Create particles
      const newParticles: ConfettiParticle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: new Animated.Value(width / 2),
          y: new Animated.Value(-20),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(1),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          size: Math.random() * 10 + 6,
        });
      }
      setParticles(newParticles);
      
      // Animate each particle
      newParticles.forEach((particle, index) => {
        const targetX = Math.random() * width;
        const targetY = Dimensions.get('window').height + 50;
        const duration = 2000 + Math.random() * 1000;
        const delay = index * 30;
        
        Animated.parallel([
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.x, {
              toValue: targetX,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.y, {
              toValue: targetY,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.rotation, {
              toValue: Math.random() * 10 - 5,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
      
      // Cleanup after animation
      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3500);
    }
  }, [visible, onComplete]);
  
  if (!visible || particles.length === 0) return null;
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.size / 4,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { rotate: particle.rotation.interpolate({
                inputRange: [-5, 5],
                outputRange: ['-180deg', '180deg'],
              })},
              { scale: particle.scale },
            ],
          }}
        />
      ))}
    </View>
  );
}

// Pulse Heart Animation Component
function _PulseHeart({ filled, onPress, size = 24, color }: { filled: boolean; onPress: () => void; size?: number; color?: string }) {
  const scaleAnim = useState(new Animated.Value(1))[0];
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const _heartColor = color || (filled ? '#ef4444' : themeColors.text.muted);
  
  const handlePress = () => {
    // Trigger pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    haptic.light();
    onPress();
  };
  
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.Text style={{ fontSize: size, transform: [{ scale: scaleAnim }] }}>
        {filled ? '❤️' : '🤍'}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// Scale In Animation Wrapper
function _ScaleIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacityAnim, scaleAnim]);
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      {children}
    </Animated.View>
  );
}

// Slide Up Animation Wrapper
function _SlideUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const translateY = useState(new Animated.Value(30))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacityAnim, translateY]);
  
  return (
    <Animated.View style={{ transform: [{ translateY }], opacity: opacityAnim }}>
      {children}
    </Animated.View>
  );
}

// Shimmer Loading Effect
function _ShimmerEffect({ width: w, height: h, style }: { width: number; height: number; style?: any }) {
  const shimmerAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);
  
  return (
    <View style={[{ width: w, height: h, backgroundColor: colors.card, borderRadius: 8, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors.cardLight,
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.7, 0.3],
          }),
        }}
      />
    </View>
  );
}

// ============================================
// SOUND EFFECTS SYSTEM (Lazy loaded to prevent startup crashes)
// ============================================
const sounds = {
  soundRef: null as any,
  _audioModule: null as any,

  async getAudio() {
    if (!this._audioModule) {
      try {
        const { Audio } = await import('expo-av');
        this._audioModule = Audio;
      } catch (e) {
        console.warn('Failed to load Audio module:', e);
        return null;
      }
    }
    return this._audioModule;
  },

  // Play a celebratory chime for stars
  async playStarChime() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' }, // Short success chime
        { shouldPlay: true, volume: 0.5 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },

  // Play achievement unlocked fanfare
  async playAchievement() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' }, // Achievement fanfare
        { shouldPlay: true, volume: 0.6 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },

  // Play level up celebration
  async playLevelUp() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3' }, // Level up sound
        { shouldPlay: true, volume: 0.6 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },

  // Play daily bonus coin sound
  async playBonus() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3' }, // Coin/bonus sound
        { shouldPlay: true, volume: 0.5 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },
};

// ============================================
// STAR CELEBRATION MODAL
// ============================================
function StarCelebrationModal({ visible, onClose, stars, achievements }: { visible: boolean; onClose: () => void; stars: number; achievements: string[] }) {
  const { t } = useI18n();
  const scaleAnim = useState(new Animated.Value(0))[0];
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      haptic.celebration();
      setShowConfetti(true);
      // Play sounds based on what was earned
      if (achievements.length > 0) {
        sounds.playAchievement();
      } else {
        sounds.playStarChime();
      }
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    } else {
      scaleAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [visible, achievements.length, scaleAnim]);

  const earnedAchievementDetails = achievements.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.celebrationOverlay}>
        <ConfettiCelebration visible={showConfetti} />
        <Animated.View style={[styles.celebrationContent, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.celebrationEmoji}>🌟</Text>
          <Text style={styles.celebrationTitle}>{t('celebration.stars_earned', { count: stars })}</Text>
          <Text style={styles.celebrationSubtitle}>{t('celebration.keep_exploring')}</Text>
          
          {earnedAchievementDetails.length > 0 && (
            <View style={styles.achievementEarnedContainer}>
              <Text style={styles.achievementEarnedTitle}>{t('celebration.achievement_unlocked')}</Text>
              {earnedAchievementDetails.map((achievement) => (
                <View key={achievement!.id} style={styles.achievementEarnedItem}>
                  <Text style={styles.achievementEarnedEmoji}>{achievement!.emoji}</Text>
                  <View>
                    <Text style={styles.achievementEarnedName}>{achievement!.name}</Text>
                    <Text style={styles.achievementEarnedDesc}>{achievement!.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.celebrationButton} onPress={onClose}>
            <Text style={styles.celebrationButtonText}>{t('celebration.awesome')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================
// REUSABLE COMPONENTS
// ============================================
const ScreenWrapper = ({ children, scroll = false }: { children: React.ReactNode; scroll?: boolean }) => {
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  return (
    <LinearGradient colors={[themeColors.background.primary, themeColors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {scroll ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>{children}</ScrollView>
        ) : children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const PrimaryButton = ({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) => {
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  return (
    <TouchableOpacity onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.8} disabled={disabled}>
      <LinearGradient 
        colors={disabled ? ['#4a4a4a', '#3a3a3a'] : [themeColors.primary[500], themeColors.primary[600]]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={styles.primaryButton}
      >
        <Text style={[styles.primaryButtonText, disabled && { opacity: 0.5 }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const BackButton = ({ onPress }: { onPress: () => void }) => {
  const { t } = useI18n();
  return (
    <TouchableOpacity onPress={() => { haptic.light(); onPress(); }} style={styles.backButton}><Text style={styles.backButtonText}>← {t('common.back')}</Text></TouchableOpacity>
  );
};

const OptionCard = ({ title, subtitle, selected, onPress }: { title: string; subtitle?: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[styles.optionCard, selected && styles.optionCardSelected]} onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.7}>
    <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>
    {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

const MultiSelectChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.7}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const SearchBar = ({ value, onChangeText, onClear, placeholder }: { value: string; onChangeText: (text: string) => void; onClear: () => void; placeholder?: string }) => (
  <View style={styles.searchContainer}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput style={styles.searchInput} value={value} onChangeText={onChangeText} placeholder={placeholder || "Search..."} placeholderTextColor={colors.text.muted} />
    {value.length > 0 && <TouchableOpacity onPress={onClear} style={styles.clearButton}><Text style={styles.clearButtonText}>✕</Text></TouchableOpacity>}
  </View>
);

const _StarBadge = ({ count }: { count: number }) => (
  <View style={styles.starBadge}>
    <Text style={styles.starBadgeText}>⭐ {count}</Text>
  </View>
);

const PositionCard = ({ position, onPress }: { position: Position; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm } = useI18n();
  const isFavorite = store.favorites.includes(position.id);
  const isTried = store.tried.includes(position.id);
  const mood = moods.find((m) => m.id === position.mood);
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>{mood?.emoji}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge}>✓</Text>}
          <TouchableOpacity onPress={() => { haptic.light(); store.toggleFavorite(position.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.positionName}>{position.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(position.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{position.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={[styles.difficultyBadge, position.difficulty === 'Beginner' && styles.difficultyBeginner, position.difficulty === 'Intermediate' && styles.difficultyIntermediate, position.difficulty === 'Advanced' && styles.difficultyAdvanced]}>
          <Text style={styles.difficultyText}>{localizeTerm(position.difficulty)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ForeplayCard = ({ item, onPress }: { item: ForeplayIdea; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm } = useI18n();
  const isFavorite = store.favoriteForeplay.includes(item.id);
  const isTried = store.triedForeplay.includes(item.id);
  const mood = moods.find((m) => m.id === item.mood);
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>{mood?.emoji}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge}>✓</Text>}
          <TouchableOpacity onPress={() => { haptic.light(); store.toggleForeplayFavorite(item.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={styles.durationBadge}><Text style={styles.durationText}>{localizeTerm(item.duration)}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

const OralPlayCard = ({ item, onPress }: { item: OralPlayIdea; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm } = useI18n();
  const isFavorite = store.favoriteOral?.includes(item.id) || false;
  const isTried = store.triedOral?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  const giverLabel = item.giver === 'him' ? localizeTerm('He gives') : item.giver === 'her' ? localizeTerm('She gives') : localizeTerm('Mutual');
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>{mood?.emoji}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge}>✓</Text>}
          <TouchableOpacity onPress={() => { haptic.light(); store.toggleOralFavorite(item.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={styles.giverBadge}><Text style={styles.giverText}>{item.giver === 'him' ? '👨→👩' : item.giver === 'her' ? '👩→👨' : '🤝'} {giverLabel}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

const MassageCard = ({ item, onPress }: { item: MassageTechnique; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm } = useI18n();
  const isFavorite = store.favoriteMassage?.includes(item.id) || false;
  const isTried = store.triedMassage?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>💆</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge}>✓</Text>}
          <TouchableOpacity onPress={() => { haptic.light(); store.toggleMassageFavorite(item.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)} • {item.bodyArea}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={styles.durationBadge}><Text style={styles.durationText}>⏱ {localizeTerm(item.duration)}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

const RolePlayCard = ({ item, onPress }: { item: RolePlayScenario; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm } = useI18n();
  const isFavorite = store.favoriteRoleplay?.includes(item.id) || false;
  const isTried = store.triedRoleplay?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  const intensityColor = item.intensity === 'Light' ? colors.success : item.intensity === 'Medium' ? colors.warning : colors.error;
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptic.light(); onPress(); }} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>🎭</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge}>✓</Text>}
          <TouchableOpacity onPress={() => { haptic.light(); store.toggleRoleplayFavorite(item.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={[styles.intensityBadge, { backgroundColor: intensityColor + '30' }]}><Text style={[styles.intensityText, { color: intensityColor }]}>{localizeTerm(item.intensity)}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// ONBOARDING SCREENS
// ============================================
function WelcomeScreen({ navigation }: any) {
  const { authPack } = useI18n();
  const fadeAnim = useState(new Animated.Value(0))[0];
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start(); }, [fadeAnim]);
  return (
    <ScreenWrapper>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <LinearGradient colors={['#FFFAF0', '#FFB6A3', '#D4818F', '#8B4A6B', '#4A2C5A']} style={styles.bloom}>
          <View style={styles.bloomCore} />
        </LinearGradient>
      </Animated.View>
      <View style={styles.content}>
        <Text style={styles.titleLarge}>Blisse</Text>
        <Text style={styles.subtitle}>{authPack('welcome', 'subtitle')}</Text>
      </View>
      <View style={styles.buttons}>
        <PrimaryButton title={authPack('welcome', 'getStarted')} onPress={() => navigation.navigate('NameInput')} />
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.secondaryButtonText}>{authPack('welcome', 'alreadyHaveAccount')} <Text style={styles.linkText}>{authPack('welcome', 'signIn')}</Text></Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

function NameInputScreen({ navigation }: any) {
  const { t, uiPack } = useI18n();
  const [name, setName] = useState('');
  const store = useStore();
  const handleContinue = () => { store.setName(name); navigation.navigate('RelationshipType'); };
  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.screenContent}>
        <Text style={styles.title}>{uiPack('onboarding.name.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.name.greeting_preview')}</Text>
        <TextInput style={styles.textInput} placeholder={uiPack('onboarding.name.placeholder')} placeholderTextColor={colors.text.muted} value={name} onChangeText={setName} autoFocus />
      </View>
      <View style={styles.buttons}><PrimaryButton title={t('common.continue')} onPress={handleContinue} disabled={!name.trim()} /></View>
    </ScreenWrapper>
  );
}

function RelationshipTypeScreen({ navigation }: any) {
  const { authPack } = useI18n();
  const store = useStore();
  const [selected, setSelected] = useState<string | null>(store.relationshipType);
  const options = [
    { id: 'hetero', title: authPack('onboardingRelationship', 'relationshipOptions.hetero') },
    { id: 'mm', title: authPack('onboardingRelationship', 'relationshipOptions.mm') },
    { id: 'ff', title: authPack('onboardingRelationship', 'relationshipOptions.ff') },
    { id: 'other', title: authPack('onboardingRelationship', 'relationshipOptions.other') },
  ];
  const handleContinue = () => { if (selected) store.setRelationshipType(selected); navigation.navigate('Preferences'); };
  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.screenContent}>
        <Text style={styles.title}>{store.name ? `${store.name} 👋` : authPack('onboardingRelationship', 'title')}</Text>
        <Text style={styles.subtitle}>{authPack('onboardingRelationship', 'subtitle')}</Text>
        <View style={styles.optionsContainer}>{options.map((opt) => <OptionCard key={opt.id} title={opt.title} selected={selected === opt.id} onPress={() => setSelected(opt.id)} />)}</View>
      </View>
      <View style={styles.buttons}><PrimaryButton title={authPack('onboardingRelationship', 'continue')} onPress={handleContinue} disabled={!selected} /></View>
    </ScreenWrapper>
  );
}

function PreferencesScreen({ navigation }: any) {
  const { authPack } = useI18n();
  const store = useStore();
  const options = useMemo(() => [
    { id: 'deepConnection', label: authPack('onboardingPreferences', 'preferences.deepConnection') },
    { id: 'spiceThingsUp', label: authPack('onboardingPreferences', 'preferences.spiceThingsUp') },
    { id: 'newPositions', label: authPack('onboardingPreferences', 'preferences.newPositions') },
    { id: 'foreplayIdeas', label: authPack('onboardingPreferences', 'preferences.foreplayIdeas') },
    { id: 'quickies', label: authPack('onboardingPreferences', 'preferences.quickies') },
    { id: 'extendedSessions', label: authPack('onboardingPreferences', 'preferences.extendedSessions') },
    { id: 'communication', label: authPack('onboardingPreferences', 'preferences.communication') },
    { id: 'adventurous', label: authPack('onboardingPreferences', 'preferences.adventurous') },
  ], [authPack]);
  const [selected, setSelected] = useState<string[]>(store.interests);
  const toggleOption = (opt: string) => setSelected((prev) => prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]);
  const handleContinue = () => { store.setInterests(selected); navigation.navigate('ExperienceLevel'); };
  return (
    <ScreenWrapper scroll>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{authPack('onboardingPreferences', 'title')}</Text>
      <Text style={styles.subtitle}>{authPack('onboardingPreferences', 'subtitle')}</Text>
      <View style={styles.chipsContainer}>
        {options.map((opt) => (
          <MultiSelectChip
            key={opt.id}
            label={opt.label}
            selected={selected.includes(opt.id)}
            onPress={() => toggleOption(opt.id)}
          />
        ))}
      </View>
      <View style={[styles.buttons, { marginTop: 40 }]}><PrimaryButton title={authPack('onboardingPreferences', 'continue')} onPress={handleContinue} /></View>
    </ScreenWrapper>
  );
}

function ExperienceLevelScreen({ navigation }: any) {
  const { uiPack, authPack } = useI18n();
  const store = useStore();
  const [selected, setSelected] = useState<string | null>(store.experience);
  const options = [
    { id: 'beginner', title: `🌱 ${uiPack('onboarding.experience.beginner')}`, subtitle: authPack('onboardingPreferences', 'experienceLevels.beginner') },
    { id: 'intermediate', title: `🌿 ${uiPack('onboarding.experience.intermediate')}`, subtitle: authPack('onboardingPreferences', 'experienceLevels.intermediate') },
    { id: 'advanced', title: `🌳 ${uiPack('onboarding.experience.advanced')}`, subtitle: authPack('onboardingPreferences', 'experienceLevels.advanced') },
  ];
  const handleContinue = () => { if (selected) store.setExperience(selected); navigation.navigate('Legal'); };
  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.screenContent}>
        <Text style={styles.title}>{uiPack('onboarding.experience.title')}</Text>
        <Text style={styles.subtitle}>{authPack('onboardingPreferences', 'experienceLevel')}</Text>
        <View style={styles.optionsContainer}>{options.map((opt) => <OptionCard key={opt.id} title={opt.title} subtitle={opt.subtitle} selected={selected === opt.id} onPress={() => setSelected(opt.id)} />)}</View>
      </View>
      <View style={styles.buttons}><PrimaryButton title={authPack('onboardingPreferences', 'continue')} onPress={handleContinue} disabled={!selected} /></View>
    </ScreenWrapper>
  );
}


// ============================================
// ENHANCED LEGAL SCREEN
// ============================================
function LegalScreen({ navigation }: any) {
  const { authPack, t } = useI18n();
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [termsScrolledToEnd, setTermsScrolledToEnd] = useState(false);
  const [privacyScrolledToEnd, setPrivacyScrolledToEnd] = useState(false);
  
  const store = useStore();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  const allConfirmed = hasReadTerms && hasReadPrivacy && confirmedAge;
  
  const handleEnter = () => {
    store.agreeToTerms();
    store.completeOnboarding();
    haptic.success();
  };

  const handleTermsScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50) setTermsScrolledToEnd(true);
  };

  const handlePrivacyScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50) setPrivacyScrolledToEnd(true);
  };

  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView style={styles.screenContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{authPack('legalConsent', 'title')}</Text>
        <Text style={styles.subtitle}>{authPack('legalConsent', 'subtitle')}</Text>
        
        <View style={[styles.legalHighlightBox, { marginTop: 20, marginBottom: 24 }]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>🔐</Text>
          <Text style={[styles.legalHighlightTitle, { color: themeColors.text.primary }]}>{t('legal.privacy_matters_title')}</Text>
          <Text style={[styles.legalHighlightTextSmall, { color: themeColors.text.secondary }]}>{t('legal.privacy_matters_subtitle')}</Text>
        </View>

        <View style={[styles.legalCheckSection, { backgroundColor: themeColors.card }]}>
          <View style={styles.legalCheckHeader}>
            <Text style={[styles.legalCheckTitle, { color: themeColors.text.primary }]}>📜 {authPack('legalConsent', 'termsOfService')}</Text>
            <TouchableOpacity style={[styles.readButton, { backgroundColor: themeColors.primary[500] + '20' }]} onPress={() => setShowTermsModal(true)}>
              <Text style={[styles.readButtonText, { color: themeColors.primary[400] }]}>{t('legal.read_terms')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.legalCheckSummary, { color: themeColors.text.muted }]}>{t('legal.terms_summary')}</Text>
          <TouchableOpacity style={[styles.checkboxRow, hasReadTerms && styles.checkboxRowSelected]} onPress={() => hasReadTerms ? setHasReadTerms(false) : setShowTermsModal(true)}>
            <View style={[styles.checkbox, hasReadTerms && styles.checkboxChecked]}>{hasReadTerms && <Text style={styles.checkmark}>✓</Text>}</View>
            <Text style={styles.checkboxText}>{authPack('legalConsent', 'termsAcceptance')} {authPack('legalConsent', 'termsOfService')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.legalCheckSection, { backgroundColor: themeColors.card }]}>
          <View style={styles.legalCheckHeader}>
            <Text style={[styles.legalCheckTitle, { color: themeColors.text.primary }]}>🔐 {authPack('legalConsent', 'privacyPolicy')}</Text>
            <TouchableOpacity style={[styles.readButton, { backgroundColor: themeColors.primary[500] + '20' }]} onPress={() => setShowPrivacyModal(true)}>
              <Text style={[styles.readButtonText, { color: themeColors.primary[400] }]}>{t('legal.read_policy')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.legalCheckSummary, { color: themeColors.text.muted }]}>{t('legal.privacy_summary')}</Text>
          <TouchableOpacity style={[styles.checkboxRow, hasReadPrivacy && styles.checkboxRowSelected]} onPress={() => hasReadPrivacy ? setHasReadPrivacy(false) : setShowPrivacyModal(true)}>
            <View style={[styles.checkbox, hasReadPrivacy && styles.checkboxChecked]}>{hasReadPrivacy && <Text style={styles.checkmark}>✓</Text>}</View>
            <Text style={styles.checkboxText}>{authPack('legalConsent', 'termsAcceptance')} {authPack('legalConsent', 'privacyPolicy')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.legalCheckSection, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.legalCheckTitle, { color: themeColors.text.primary }]}>🔞 {authPack('legalConsent', 'ageWarning')}</Text>
          <Text style={[styles.legalCheckSummary, { color: themeColors.text.muted, marginTop: 8 }]}>{t('legal.adult_content_notice')}</Text>
          <TouchableOpacity style={[styles.checkboxRow, confirmedAge && styles.checkboxRowSelected]} onPress={() => setConfirmedAge(!confirmedAge)}>
            <View style={[styles.checkbox, confirmedAge && styles.checkboxChecked]}>{confirmedAge && <Text style={styles.checkmark}>✓</Text>}</View>
            <Text style={styles.checkboxText}>{authPack('legalConsent', 'ageVerification')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.buttons}>
        <PrimaryButton title={authPack('onboardingComplete', 'enterApp')} onPress={handleEnter} disabled={!allConfirmed} />
        {!allConfirmed && <Text style={[styles.legalHint, { color: themeColors.text.muted }]}>{authPack('legalConsent', 'mustAcceptAll')}</Text>}
      </View>

      <Modal visible={showTermsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>📜 Terms of Service</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}><Text style={[styles.modalClose, { color: themeColors.text.muted }]}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} onScroll={handleTermsScroll} scrollEventThrottle={16}>
              <Text style={[styles.legalTitle, { color: themeColors.text.primary }]}>Terms of Service</Text>
              <Text style={[styles.legalDate, { color: themeColors.text.muted }]}>Last Updated: February 2026</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>1. Acceptance of Terms</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>By downloading, installing, or using Blisse ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>2. Eligibility</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>You must be at least 18 years of age to use this App. By using Blisse, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into this agreement. The App contains adult content intended for consenting adults only.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>3. Description of Service</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Blisse is an intimate wellness app designed to help couples explore and enhance their relationship through curated suggestions, activity tracking, and educational content. The App is intended for use by consenting adult couples.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>4. User Conduct & Consent</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>You agree to use the App responsibly and ethically. All activities suggested by the App require enthusiastic, ongoing consent from all parties involved. You are solely responsible for ensuring consent in your relationships. The App does not encourage or condone any non-consensual activities.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>5. Health & Safety Disclaimer</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>The content in this App is for informational and entertainment purposes only. It is NOT medical, therapeutic, or professional health advice. Always consult qualified healthcare professionals for any health concerns. Use suggestions at your own discretion and within your physical capabilities.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>6. Intellectual Property</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>All content, features, and functionality of the App, including but not limited to text, graphics, logos, and software, are the exclusive property of Blisse and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written consent.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>7. Privacy</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Your privacy is important to us. Please review our Privacy Policy, which explains how we handle your information. By using the App, you consent to our privacy practices as described therein.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>8. Limitation of Liability</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLISSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP. You use the App at your own risk and discretion.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>9. Indemnification</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>You agree to indemnify and hold harmless Blisse, its affiliates, and their respective officers, directors, and employees from any claims, damages, or expenses arising from your use of the App or violation of these Terms.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>10. Modifications & Termination</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the modified Terms. We may terminate or suspend your access to the App at any time, without notice, for conduct that we believe violates these Terms.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>11. Governing Law and Jurisdiction</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the App shall be subject to the exclusive jurisdiction of the competent courts in Tel Aviv, Israel.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>12. Contact Us</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>If you have questions about these Terms, please contact us at: legal@blisse.online</Text>

              {!termsScrolledToEnd && <View style={styles.scrollHint}><Text style={[styles.scrollHintText, { color: themeColors.primary[400] }]}>↓ Scroll to read all</Text></View>}
              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity style={[styles.legalConfirmButton, { backgroundColor: termsScrolledToEnd ? themeColors.primary[500] : themeColors.text.muted }, !termsScrolledToEnd && { opacity: 0.5 }]} onPress={() => { if (termsScrolledToEnd) { setHasReadTerms(true); setShowTermsModal(false); } }} disabled={!termsScrolledToEnd}>
              <Text style={styles.legalConfirmButtonText}>{termsScrolledToEnd ? 'I Have Read & Agree' : 'Please Read All'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPrivacyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>🔐 Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}><Text style={[styles.modalClose, { color: themeColors.text.muted }]}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} onScroll={handlePrivacyScroll} scrollEventThrottle={16}>
              <Text style={[styles.legalTitle, { color: themeColors.text.primary }]}>Privacy Policy</Text>
              <Text style={[styles.legalDate, { color: themeColors.text.muted }]}>Last Updated: February 2026</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Our Commitment to Privacy</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Blisse is designed with privacy as our highest priority. We understand the sensitive nature of this App and have built it to protect your information. This policy explains what data we collect and how we use it.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Data Stored Locally on Your Device</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Your preferences, favorites, notes, activity history, and settings are stored locally on your device. Authentication is processed by Firebase, and contact/idea messages are sent only when you explicitly submit them through Formspree email delivery.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Authentication Services</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Sign-in is handled by Apple Sign-In and Firebase Authentication (Google). We do not store passwords or access your credentials directly. These services have their own privacy policies.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Anonymous Analytics</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>We use PostHog for anonymous, aggregated analytics to improve the App. This includes:{'\n'}• Which features are most popular{'\n'}• General usage patterns{'\n'}• App performance metrics{'\n\n'}We disable person profiling and send only sanitized event metadata (for example feature, category, and mood). We do not send free-text notes or contact messages to analytics.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Information We NEVER Collect</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>• Your biometric data (Face ID/Touch ID is handled by your device){'\n'}• Your photos, contacts, or personal files{'\n'}• Your precise location{'\n'}• Your free-text notes or support messages in analytics streams{'\n'}• Any sale of your personal information</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Third-Party Services</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>The App uses the following third-party services:{'\n'}• Firebase Authentication (Google) - for secure sign-in{'\n'}• Apple Sign-In - for iOS authentication{'\n'}• PostHog - for anonymous analytics{'\n'}• Formspree - for direct support messages that you submit{'\n\n'}Each service has its own privacy policy governing their data practices.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Data Retention</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Your local data persists until you delete it via Settings or uninstall the App. Anonymous analytics data is retained for up to 24 months to analyze long-term trends.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Children's Privacy</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Blisse is strictly for adults 18 years and older. We do not knowingly collect data from anyone under 18. If we learn we have collected information from a minor, we will delete it immediately.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Your Rights (GDPR/CCPA)</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Since your personal data is stored locally on your device, you have complete control:{'\n'}• Access: View your data anytime in the App{'\n'}• Deletion: Delete all data via Settings → Reset Data{'\n'}• Portability: Your data exists only on your device{'\n\n'}For EU residents (GDPR) and California residents (CCPA), you may contact us to exercise additional rights regarding any data we may process.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Security</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>We use industry-standard security practices. Local data is protected by your device's security. The optional PIN lock uses secure storage. Biometric authentication is handled entirely by your device's secure enclave.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Changes to This Policy</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>We may update this Privacy Policy periodically. We will notify you of significant changes through the App. Continued use after changes constitutes acceptance.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Governing Law and Jurisdiction</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>This Privacy Policy shall be governed by and construed in accordance with the laws of the State of Israel, without regard to conflict of law principles. Any dispute arising out of or relating to this Privacy Policy or the App shall be subject to the exclusive jurisdiction of the competent courts in Tel Aviv, Israel.</Text>

              <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>Contact Us</Text>
              <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>Questions about privacy? Contact us at: privacy@blisse.online</Text>

              {!privacyScrolledToEnd && <View style={styles.scrollHint}><Text style={[styles.scrollHintText, { color: themeColors.primary[400] }]}>↓ Scroll to read all</Text></View>}
              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity style={[styles.legalConfirmButton, { backgroundColor: privacyScrolledToEnd ? themeColors.primary[500] : themeColors.text.muted }, !privacyScrolledToEnd && { opacity: 0.5 }]} onPress={() => { if (privacyScrolledToEnd) { setHasReadPrivacy(true); setShowPrivacyModal(false); } }} disabled={!privacyScrolledToEnd}>
              <Text style={styles.legalConfirmButtonText}>{privacyScrolledToEnd ? 'I Have Read & Agree' : 'Please Read All'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

// ============================================
// ADD PLAYLIST MODAL
// ============================================
function _AddPlaylistModal({ visible, onClose, onSave, editPlaylist }: { visible: boolean; onClose: () => void; onSave: (playlist: { name: string; url: string; mood: string }) => void; editPlaylist?: UserPlaylist | null; }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [mood, setMood] = useState('romantic');
  const [error, setError] = useState('');
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);

  useEffect(() => {
    if (editPlaylist) { setName(editPlaylist.name); setUrl(editPlaylist.url); setMood(editPlaylist.mood); } 
    else { setName(''); setUrl(''); setMood('romantic'); }
    setError('');
  }, [editPlaylist, visible]);

  const validateUrl = (testUrl: string): boolean => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(testUrl) || testUrl.includes('spotify:');

  const handleSave = () => {
    if (!name.trim()) { setError(t('playlist.error.name_required')); return; }
    if (!url.trim()) { setError(t('playlist.error.url_required')); return; }
    if (!validateUrl(url.trim())) { setError(t('playlist.error.url_invalid')); return; }
    onSave({ name: name.trim(), url: url.trim(), mood });
    setName(''); setUrl(''); setMood('romantic'); setError('');
  };

  const detectedPlatform = url ? detectPlatform(url) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>{editPlaylist ? `✏️ ${t('playlist.edit_title')}` : `➕ ${t('playlist.add_title')}`}</Text>
            <TouchableOpacity onPress={onClose}><Text style={[styles.modalClose, { color: themeColors.text.muted }]}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.legalSection, { color: themeColors.text.secondary, marginTop: 0, fontSize: 14 }]}>{t('playlist.name_label')}</Text>
            <TextInput style={[styles.contactInput, { backgroundColor: themeColors.cardLight, color: themeColors.text.primary }]} placeholder={t('playlist.name_placeholder')} placeholderTextColor={themeColors.text.muted} value={name} onChangeText={setName} maxLength={50} />
            <Text style={[styles.legalSection, { color: themeColors.text.secondary, fontSize: 14 }]}>{t('playlist.url_label')}</Text>
            <TextInput style={[styles.contactInput, { backgroundColor: themeColors.cardLight, color: themeColors.text.primary }]} placeholder={t('playlist.url_placeholder')} placeholderTextColor={themeColors.text.muted} value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" />
            {detectedPlatform && <Text style={{ color: themeColors.text.muted, fontSize: 13, marginBottom: 8 }}>{getPlatformIcon(detectedPlatform)} {getPlatformName(detectedPlatform)}</Text>}
            <Text style={[styles.legalSection, { color: themeColors.text.secondary, fontSize: 14 }]}>{t('playlist.mood_label')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PLAYLIST_MOODS.map((m) => (
                <TouchableOpacity key={m.id} style={[{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: themeColors.cardLight, alignItems: 'center' }, mood === m.id && { backgroundColor: themeColors.primary[500] + '30', borderWidth: 1, borderColor: themeColors.primary[500] }]} onPress={() => setMood(m.id)}>
                  <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                  <Text style={{ fontSize: 11, color: mood === m.id ? themeColors.primary[400] : themeColors.text.muted, marginTop: 2 }}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {error ? <Text style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: themeColors.cardLight, alignItems: 'center' }} onPress={onClose}><Text style={{ color: themeColors.text.muted, fontSize: 15 }}>{t('common.cancel')}</Text></TouchableOpacity>
            <TouchableOpacity style={{ flex: 2, padding: 14, borderRadius: 12, backgroundColor: themeColors.primary[500], alignItems: 'center' }} onPress={handleSave}><Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>{editPlaylist ? t('common.update') : t('common.add')}</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================
// AUTHENTICATION SCREENS
// ============================================
function AuthScreen({ navigation: _navigation }: any) {
  const { authPack, uiPack, t } = useI18n();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signUp, signInWithApple, resetPassword } = useAuth();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const modeScreen = mode === 'signin' ? 'login' : mode === 'signup' ? 'signup' : 'forgotPassword';

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(authPack('validation', 'allFieldsRequired'));
      return;
    }
    if (!validateEmail(email)) {
      setError(authPack('validation', 'emailInvalid'));
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      haptic.success();
      // Navigation handled by auth state change
    } catch (err: any) {
      haptic.error();
      if (err.code === 'auth/user-not-found') {
        setError(authPack('forgotPassword', 'emailNotFound'));
      } else if (err.code === 'auth/wrong-password') {
        setError(authPack('common', 'error'));
      } else if (err.code === 'auth/invalid-email') {
        setError(authPack('validation', 'emailInvalid'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(authPack('common', 'error'));
      } else {
        setError(authPack('common', 'error'));
      }
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError(authPack('validation', 'allFieldsRequired'));
      return;
    }
    if (!validateEmail(email)) {
      setError(authPack('validation', 'emailInvalid'));
      return;
    }
    if (password.length < 6) {
      setError(authPack('validation', 'passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(authPack('validation', 'passwordsDontMatch'));
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, name.trim());
      haptic.success();
      // Navigation handled by auth state change
    } catch (err: any) {
      haptic.error();
      if (err.code === 'auth/email-already-in-use') {
        setError(authPack('common', 'error'));
      } else if (err.code === 'auth/weak-password') {
        setError(authPack('validation', 'passwordTooShort'));
      } else {
        setError(authPack('common', 'error'));
      }
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(authPack('validation', 'emailRequired'));
      return;
    }
    if (!validateEmail(email)) {
      setError(authPack('validation', 'emailInvalid'));
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      haptic.success();
      Alert.alert(authPack('common', 'success'), authPack('forgotPassword', 'emailSent'));
      setMode('signin');
    } catch (err: any) {
      haptic.error();
      if (err.code === 'auth/user-not-found') {
        setError(authPack('forgotPassword', 'emailNotFound'));
      } else {
        setError(authPack('common', 'error'));
      }
    }
    setLoading(false);
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithApple();
      haptic.success();
    } catch (err: any) {
      if (err.code !== 'ERR_CANCELED') {
        haptic.error();
        setError(authPack('common', 'error'));
      }
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={[themeColors.background.primary, themeColors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScrollContent}>
            <View style={styles.authHeader}>
              <Text style={styles.authLogo}>🌸</Text>
              <Text style={[styles.authTitle, { color: themeColors.text.primary }]}>
                {authPack(modeScreen, 'title')}
              </Text>
              <Text style={[styles.authSubtitle, { color: themeColors.text.muted }]}>
                {authPack(modeScreen, 'subtitle')}
              </Text>
            </View>

            {error ? (
              <View style={styles.authErrorContainer}>
                <Text style={styles.authErrorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {mode === 'signup' && (
              <View style={styles.authInputContainer}>
                <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{t('auth.name')}</Text>
                <TextInput
                  style={[styles.authInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={uiPack('onboarding.name.placeholder')}
                  placeholderTextColor={themeColors.text.muted}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.authInputContainer}>
              <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{authPack(modeScreen, 'email')}</Text>
              <TextInput
                style={[styles.authInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                value={email}
                onChangeText={setEmail}
                placeholder={authPack(modeScreen, 'emailPlaceholder')}
                placeholderTextColor={themeColors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {mode !== 'reset' && (
              <View style={styles.authInputContainer}>
                <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{authPack(modeScreen, 'password')}</Text>
                <View style={styles.authPasswordContainer}>
                  <TextInput
                    style={[styles.authInput, styles.authPasswordInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={authPack(modeScreen, 'passwordPlaceholder')}
                    placeholderTextColor={themeColors.text.muted}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.authPasswordToggle} onPress={() => setShowPassword(!showPassword)}>
                    <Text style={{ color: themeColors.text.muted }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === 'signup' && (
              <View style={styles.authInputContainer}>
                <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{authPack('signup', 'confirmPassword')}</Text>
                <TextInput
                  style={[styles.authInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={authPack('signup', 'confirmPasswordPlaceholder')}
                  placeholderTextColor={themeColors.text.muted}
                  secureTextEntry={!showPassword}
                />
              </View>
            )}

            {mode === 'signin' && (
              <TouchableOpacity onPress={() => { setMode('reset'); setError(''); }} style={styles.authForgotPassword}>
                <Text style={[styles.authForgotPasswordText, { color: themeColors.primary[400] }]}>{authPack('login', 'forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleResetPassword}
              disabled={loading}
            >
              <LinearGradient
                colors={[themeColors.primary[500], themeColors.primary[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.authButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.authButtonText}>
                    {mode === 'signin' ? authPack('login', 'signIn') : mode === 'signup' ? authPack('signup', 'createAccount') : authPack('forgotPassword', 'sendLink')}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {mode !== 'reset' && Platform.OS === 'ios' && (
              <>
                <View style={styles.authDivider}>
                  <View style={[styles.authDividerLine, { backgroundColor: themeColors.card }]} />
                  <Text style={[styles.authDividerText, { color: themeColors.text.muted }]}>{authPack('signup', 'orContinueWith')}</Text>
                  <View style={[styles.authDividerLine, { backgroundColor: themeColors.card }]} />
                </View>

                <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={loading}>
                  <Text style={styles.appleButtonText}> {authPack('signup', 'apple')}</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.authSwitchContainer}>
              {mode === 'reset' ? (
                <TouchableOpacity onPress={() => { setMode('signin'); setError(''); }}>
                  <Text style={[styles.authSwitchText, { color: themeColors.text.muted }]}>
                    {authPack('forgotPassword', 'backToLogin')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
                  <Text style={[styles.authSwitchText, { color: themeColors.text.muted }]}>
                    {mode === 'signin' ? `${authPack('login', 'noAccount')} ` : `${authPack('welcome', 'alreadyHaveAccount')} `}
                    <Text style={{ color: themeColors.primary[400] }}>{mode === 'signin' ? authPack('login', 'signUp') : authPack('welcome', 'signIn')}</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SignInScreen({ navigation }: any) {
  // Redirect to new auth screen - kept for backwards compatibility
  return <AuthScreen navigation={navigation} />;
}
// ============================================
// FEATURE MODALS
// ============================================
function SpinnerModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ type: string; item: any } | null>(null);
  const [spinType, setSpinType] = useState<'all' | 'position' | 'foreplay' | 'oral'>('all');
  const spinAnim = useState(new Animated.Value(0))[0];

  const spin = () => {
    haptic.medium();
    setSpinning(true);
    setResult(null);
    spinAnim.setValue(0);
    Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start(() => {
      let pool: { type: string; item: any }[] = [];
      if (spinType === 'all' || spinType === 'position') pool = [...pool, ...positions.map(p => ({ type: 'position', item: p }))];
      if (spinType === 'all' || spinType === 'foreplay') pool = [...pool, ...foreplayIdeas.map(f => ({ type: 'foreplay', item: f }))];
      if (spinType === 'all' || spinType === 'oral') pool = [...pool, ...oralPlayIdeas.map(o => ({ type: 'oral', item: o }))];
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      setSpinning(false);
      haptic.success();
    });
  };

  const spinRotation = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1080deg'] });

  const handleViewResult = () => {
    if (result) {
      onClose();
      if (result.type === 'position') navigation.navigate('PositionDetail', { position: result.item });
      else if (result.type === 'foreplay') navigation.navigate('ForeplayDetail', { item: result.item });
      else navigation.navigate('OralDetail', { item: result.item });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('spinner.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('spinner.subtitle')}</Text>
          <View style={styles.spinTypeContainer}>
            {(['all', 'position', 'foreplay', 'oral'] as const).map((type) => (
              <TouchableOpacity key={type} style={[styles.spinTypeButton, spinType === type && styles.spinTypeButtonActive]} onPress={() => { haptic.light(); setSpinType(type); }}>
                <Text style={[styles.spinTypeText, spinType === type && styles.spinTypeTextActive]}>
                  {type === 'all' ? '🎲' : type === 'position' ? '💑' : type === 'foreplay' ? '💕' : '👄'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.spinnerContainer}>
            <Animated.View style={[styles.spinnerWheel, { transform: [{ rotate: spinRotation }] }]}>
              <Text style={styles.spinnerEmoji}>{spinning ? '🌀' : result ? '✨' : '🎯'}</Text>
            </Animated.View>
          </View>
          {result && !spinning && (
            <View style={styles.spinnerResult}>
              <Text style={styles.spinnerResultType}>
                {result.type === 'position' ? t('spinner.type.position') : result.type === 'foreplay' ? t('spinner.type.foreplay') : t('spinner.type.oral')}
              </Text>
              <Text style={styles.spinnerResultName}>{result.item.name}</Text>
              <Text style={styles.spinnerResultVibe}>{result.item.vibe}</Text>
              <TouchableOpacity style={styles.viewResultButton} onPress={handleViewResult}>
                <Text style={styles.viewResultButtonText}>{t('spinner.view_details')}</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={[styles.spinButton, spinning && styles.spinButtonDisabled]} onPress={spin} disabled={spinning}>
            <LinearGradient colors={spinning ? ['#4a4a4a', '#3a3a3a'] : ['#f59e0b', '#ef4444']} style={styles.spinButtonGradient}>
              <Text style={styles.spinButtonText}>{spinning ? t('spinner.spinning') : t('spinner.cta')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DateNightModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const store = useStore();
  const [dateNight, setDateNight] = useState<{ foreplay: ForeplayIdea | null; oral: OralPlayIdea | null; position: Position | null } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });

  const generateDateNight = () => {
    haptic.light();
    const mood = store.currentMood;
    const foreplayPool = mood ? foreplayIdeas.filter(f => f.mood === mood) : foreplayIdeas;
    const oralPool = mood ? oralPlayIdeas.filter(o => o.mood === mood) : oralPlayIdeas;
    const positionPool = mood ? positions.filter(p => p.mood === mood) : positions;
    const pickRandom = <T extends { id: number }>(pool: T[], triedIds: number[]): T => {
      const untried = pool.filter(item => !triedIds.includes(item.id));
      const pickFrom = untried.length > 0 ? untried : pool;
      return pickFrom[Math.floor(Math.random() * pickFrom.length)];
    };
    setDateNight({
      foreplay: pickRandom(foreplayPool.length > 0 ? foreplayPool : foreplayIdeas, store.triedForeplay),
      oral: pickRandom(oralPool.length > 0 ? oralPool : oralPlayIdeas, store.triedOral),
      position: pickRandom(positionPool.length > 0 ? positionPool : positions, store.tried),
    });
  };

  const handleCompleteDateNight = () => {
    if (dateNight) {
      // Mark all items as tried
      if (dateNight.foreplay) store.markForeplayTried(dateNight.foreplay.id);
      if (dateNight.oral) store.markOralTried(dateNight.oral.id);
      if (dateNight.position) store.markTried(dateNight.position.id);
      
      // Award stars and check achievements
      const result = store.completeDateNight();
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- generate once when modal opens unless cleared.
  useEffect(() => { if (visible && !dateNight) generateDateNight(); }, [visible, dateNight]);
  const handleClose = () => { setDateNight(null); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('date_night.title')}</Text>
            <TouchableOpacity onPress={handleClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('date_night.subtitle')}</Text>
          {dateNight && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.dateNightStep}>
                <View style={styles.dateNightStepHeader}><Text style={styles.dateNightStepNumber}>1</Text><Text style={styles.dateNightStepLabel}>{t('date_night.step.start')}</Text></View>
                <TouchableOpacity style={styles.dateNightCard} onPress={() => { handleClose(); navigation.navigate('ForeplayDetail', { item: dateNight.foreplay }); }}>
                  <Text style={styles.dateNightCardEmoji}>💕</Text>
                  <View style={styles.dateNightCardContent}><Text style={styles.dateNightCardName}>{dateNight.foreplay?.name}</Text><Text style={styles.dateNightCardVibe}>{dateNight.foreplay?.vibe}</Text></View>
                  <Text style={styles.dateNightCardArrow}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateNightStep}>
                <View style={styles.dateNightStepHeader}><Text style={styles.dateNightStepNumber}>2</Text><Text style={styles.dateNightStepLabel}>{t('date_night.step.then')}</Text></View>
                <TouchableOpacity style={styles.dateNightCard} onPress={() => { handleClose(); navigation.navigate('OralDetail', { item: dateNight.oral }); }}>
                  <Text style={styles.dateNightCardEmoji}>👄</Text>
                  <View style={styles.dateNightCardContent}><Text style={styles.dateNightCardName}>{dateNight.oral?.name}</Text><Text style={styles.dateNightCardVibe}>{dateNight.oral?.vibe}</Text></View>
                  <Text style={styles.dateNightCardArrow}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateNightStep}>
                <View style={styles.dateNightStepHeader}><Text style={styles.dateNightStepNumber}>3</Text><Text style={styles.dateNightStepLabel}>{t('date_night.step.finish')}</Text></View>
                <TouchableOpacity style={styles.dateNightCard} onPress={() => { handleClose(); navigation.navigate('PositionDetail', { position: dateNight.position }); }}>
                  <Text style={styles.dateNightCardEmoji}>💑</Text>
                  <View style={styles.dateNightCardContent}><Text style={styles.dateNightCardName}>{dateNight.position?.name}</Text><Text style={styles.dateNightCardVibe}>{dateNight.position?.vibe}</Text></View>
                  <Text style={styles.dateNightCardArrow}>→</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.completeDateNightButton} onPress={handleCompleteDateNight}>
                <LinearGradient colors={['#84cc16', '#22c55e']} style={styles.completeDateNightGradient}>
                  <Text style={styles.completeDateNightText}>{t('date_night.complete')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.regenerateButton} onPress={generateDateNight}>
                <Text style={styles.regenerateButtonText}>{t('date_night.regenerate')}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
      <StarCelebrationModal 
        visible={showCelebration} 
        onClose={() => { setShowCelebration(false); handleClose(); }} 
        stars={celebrationData.stars} 
        achievements={celebrationData.achievements} 
      />
    </Modal>
  );
}

function ChallengeModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const store = useStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });

  const generateChallenge = () => {
    haptic.light();
    const types: ('position' | 'foreplay' | 'oral')[] = ['position', 'foreplay', 'oral'];
    const type = types[Math.floor(Math.random() * types.length)];
    let pool: { id: number }[];
    let triedList: number[];
    if (type === 'position') { pool = positions; triedList = store.tried; }
    else if (type === 'foreplay') { pool = foreplayIdeas; triedList = store.triedForeplay; }
    else { pool = oralPlayIdeas; triedList = store.triedOral; }
    const untried = pool.filter(item => !triedList.includes(item.id));
    const pickFrom = untried.length > 0 ? untried : pool;
    const itemId = pickFrom[Math.floor(Math.random() * pickFrom.length)].id;
    store.setChallenge({ id: Date.now().toString(), type, itemId, startDate: new Date().toISOString(), completed: false });
  };

  const getChallengeItem = () => {
    if (!store.currentChallenge) return null;
    const { type, itemId } = store.currentChallenge;
    if (type === 'position') return { ...positions.find(p => p.id === itemId), itemType: 'position' };
    if (type === 'foreplay') return { ...foreplayIdeas.find(f => f.id === itemId), itemType: 'foreplay' };
    return { ...oralPlayIdeas.find(o => o.id === itemId), itemType: 'oral' };
  };

  const challengeItem = getChallengeItem();
  
  const handleComplete = () => {
    if (store.currentChallenge) {
      let result: { stars: number; newAchievements: string[] };
      if (store.currentChallenge.type === 'position') {
        result = store.logActivity('position', store.currentChallenge.itemId);
        store.markTried(store.currentChallenge.itemId);
      } else if (store.currentChallenge.type === 'foreplay') {
        result = store.logActivity('foreplay', store.currentChallenge.itemId);
        store.markForeplayTried(store.currentChallenge.itemId);
      } else {
        result = store.logActivity('oral', store.currentChallenge.itemId);
        store.markOralTried(store.currentChallenge.itemId);
      }
      store.completeChallenge();
      
      // Add bonus stars for completing a challenge
      const bonusStars = 3;
      setCelebrationData({ stars: result.stars + bonusStars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleViewChallenge = () => {
    if (!store.currentChallenge || !challengeItem) return;
    onClose();
    if (store.currentChallenge.type === 'position') navigation.navigate('PositionDetail', { position: challengeItem });
    else if (store.currentChallenge.type === 'foreplay') navigation.navigate('ForeplayDetail', { item: challengeItem });
    else navigation.navigate('OralDetail', { item: challengeItem });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('challenge.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          {store.currentChallenge && challengeItem ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>{t('challenge.subtitle')}</Text>
              <View style={styles.challengeCard}>
                <Text style={styles.challengeType}>{store.currentChallenge.type === 'position' ? t('challenge.type.position') : store.currentChallenge.type === 'foreplay' ? t('challenge.type.foreplay') : t('challenge.type.oral')}</Text>
                <Text style={styles.challengeName}>{challengeItem.name}</Text>
                <Text style={styles.challengeVibe}>{challengeItem.vibe}</Text>
                <View style={styles.challengeReward}>
                  <Text style={styles.challengeRewardText}>{t('challenge.reward')}</Text>
                </View>
                <TouchableOpacity style={styles.challengeViewButton} onPress={handleViewChallenge}>
                  <Text style={styles.challengeViewButtonText}>{t('challenge.view_details')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <LinearGradient colors={['#84cc16', '#22c55e']} style={styles.completeButtonGradient}>
                  <Text style={styles.completeButtonText}>{t('challenge.complete')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={generateChallenge}>
                <Text style={styles.skipButtonText}>{t('challenge.skip')}</Text>
              </TouchableOpacity>
              <View style={styles.challengeStats}>
                <Text style={styles.challengeStatsText}>{t('challenge.completed_count', { count: store.completedChallenges.length })}</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noChallengeContainer}>
              <Text style={styles.noChallengeEmoji}>🎯</Text>
              <Text style={styles.noChallengeTitle}>{t('challenge.none_title')}</Text>
              <Text style={styles.noChallengeSubtitle}>{t('challenge.none_subtitle')}</Text>
              <TouchableOpacity style={styles.generateChallengeButton} onPress={generateChallenge}>
                <LinearGradient colors={['#a855f7', '#ec4899']} style={styles.generateChallengeGradient}>
                  <Text style={styles.generateChallengeText}>{t('challenge.generate')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              {store.completedChallenges.length > 0 && (
                <View style={styles.challengeStats}><Text style={styles.challengeStatsText}>{t('challenge.completed_count', { count: store.completedChallenges.length })}</Text></View>
              )}
            </View>
          )}
        </View>
      </View>
      <StarCelebrationModal 
        visible={showCelebration} 
        onClose={() => { setShowCelebration(false); onClose(); }} 
        stars={celebrationData.stars} 
        achievements={celebrationData.achievements} 
      />
    </Modal>
  );
}

function NotesModal({ visible, onClose, itemId, itemType, itemName }: { visible: boolean; onClose: () => void; itemId: number; itemType: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay'; itemName: string }) {
  const { t } = useI18n();
  const store = useStore();
  const existingNote = store.notes.find(n => n.itemId === itemId && n.type === itemType);
  const [noteText, setNoteText] = useState(existingNote?.text || '');
  const [rating, setRating] = useState(existingNote?.rating || 0);

  useEffect(() => {
    if (visible) {
      const note = store.notes.find(n => n.itemId === itemId && n.type === itemType);
      setNoteText(note?.text || '');
      setRating(note?.rating || 0);
    }
  }, [visible, itemId, itemType, store.notes]);

  const handleSave = () => {
    haptic.success();
    if (existingNote) store.updateNote(existingNote.id, noteText, rating);
    else if (noteText.trim() || rating > 0) store.addNote({ type: itemType, itemId, text: noteText, rating });
    onClose();
  };

  const handleDelete = () => {
    haptic.light();
    if (existingNote) store.deleteNote(existingNote.id);
    setNoteText('');
    setRating(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('notes.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.notesItemName}>{itemName}</Text>
            <Text style={styles.notesLabel}>{t('notes.rating')}</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => { haptic.light(); setRating(star); }}>
                  <Text style={styles.ratingStar}>{star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.notesLabel}>{t('notes.personal')}</Text>
            <TextInput style={styles.notesInput} multiline numberOfLines={4} placeholder={t('notes.placeholder')} placeholderTextColor={colors.text.muted} value={noteText} onChangeText={setNoteText} />
            <View style={styles.notesButtons}>
              {existingNote && (
                <TouchableOpacity style={styles.deleteNoteButton} onPress={handleDelete}>
                  <Text style={styles.deleteNoteButtonText}>🗑️ {t('common.delete')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.saveNoteButton} onPress={handleSave}>
                <LinearGradient colors={['#a855f7', '#ec4899']} style={styles.saveNoteGradient}>
                  <Text style={styles.saveNoteText}>{t('notes.save')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AchievementsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const store = useStore();
  
  const groupedAchievements = {
    milestone: ACHIEVEMENTS.filter(a => a.category === 'milestone'),
    adventure: ACHIEVEMENTS.filter(a => a.category === 'adventure'),
    consistency: ACHIEVEMENTS.filter(a => a.category === 'consistency'),
    exploration: ACHIEVEMENTS.filter(a => a.category === 'exploration'),
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏆 {t('profile.achievements')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.achievementProgress}>{t('achievements.progress', { earned: store.earnedAchievements.length, total: ACHIEVEMENTS.length })}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(groupedAchievements).map(([category, achievements]) => (
              <View key={category} style={styles.achievementCategory}>
                <Text style={styles.achievementCategoryTitle}>
                  {category === 'milestone' ? '🎯 Milestones' : category === 'adventure' ? '🎪 Adventure' : category === 'consistency' ? '🔥 Consistency' : '🗺️ Exploration'}
                </Text>
                {achievements.map((achievement) => {
                  const isEarned = store.earnedAchievements.includes(achievement.id);
                  return (
                    <View key={achievement.id} style={[styles.achievementItem, !isEarned && styles.achievementItemLocked]}>
                      <Text style={[styles.achievementEmoji, !isEarned && styles.achievementEmojiLocked]}>
                        {isEarned ? achievement.emoji : '🔒'}
                      </Text>
                      <View style={styles.achievementInfo}>
                        <Text style={[styles.achievementName, !isEarned && styles.achievementNameLocked]}>{achievement.name}</Text>
                        <Text style={[styles.achievementDesc, !isEarned && styles.achievementDescLocked]}>{achievement.description}</Text>
                      </View>
                      {isEarned && <Text style={styles.achievementCheck}>✓</Text>}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InsightsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { language, t } = useI18n();
  const store = useStore();
  const currentMonth = getCurrentMonth();
  const currentMonthStats = store.monthlyStats.find(m => m.month === currentMonth);
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);
  const lastMonthStats = store.monthlyStats.find(m => m.month === lastMonth);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const locale = language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 {t('profile.insights')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Month */}
            <View style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>{formatMonth(currentMonth)}</Text>
              <View style={styles.insightStatsRow}>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{currentMonthStats?.totalSessions || 0}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.sessions')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>⭐ {currentMonthStats?.starsEarned || 0}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.stars_earned')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{currentMonthStats?.newThingsTried || 0}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.new_things')}</Text>
                </View>
              </View>
            </View>

            {/* Comparison */}
            {lastMonthStats && (
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonTitle}>{t('insights.vs_last_month')}</Text>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{t('insights.sessions')}:</Text>
                  <Text style={[styles.comparisonValue, (currentMonthStats?.totalSessions || 0) > lastMonthStats.totalSessions ? styles.comparisonUp : styles.comparisonDown]}>
                    {(currentMonthStats?.totalSessions || 0) >= lastMonthStats.totalSessions ? '↑' : '↓'} {Math.abs((currentMonthStats?.totalSessions || 0) - lastMonthStats.totalSessions)}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{t('insights.stars_short')}:</Text>
                  <Text style={[styles.comparisonValue, (currentMonthStats?.starsEarned || 0) > lastMonthStats.starsEarned ? styles.comparisonUp : styles.comparisonDown]}>
                    {(currentMonthStats?.starsEarned || 0) >= lastMonthStats.starsEarned ? '↑' : '↓'} {Math.abs((currentMonthStats?.starsEarned || 0) - lastMonthStats.starsEarned)}
                  </Text>
                </View>
              </View>
            )}

            {/* Streak */}
            <View style={styles.streakCard}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNumber}>{store.currentStreak}</Text>
              <Text style={styles.streakLabel}>{t('insights.week_streak')}</Text>
              {store.currentStreak >= 2 && <Text style={styles.streakMessage}>{t('insights.keep_going')}</Text>}
            </View>

            {/* All Time Stats */}
            <View style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>{t('insights.all_time')}</Text>
              <View style={styles.insightStatsRow}>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>⭐ {store.totalStars}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.total_stars')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{store.tried.length + store.triedForeplay.length + store.triedOral.length}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.things_tried')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{store.completedChallenges.length}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.challenges')}</Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            {store.activityLog.length > 0 && (
              <View style={styles.recentActivityCard}>
                <Text style={styles.insightCardTitle}>{t('insights.recent_activity')}</Text>
                {store.activityLog.slice(-5).reverse().map((activity) => {
                  const item = activity.type === 'position' 
                    ? positions.find(p => p.id === activity.itemId)
                    : activity.type === 'foreplay'
                    ? foreplayIdeas.find(f => f.id === activity.itemId)
                    : oralPlayIdeas.find(o => o.id === activity.itemId);
                  return (
                    <View key={activity.id} style={styles.activityItem}>
                      <Text style={styles.activityEmoji}>
                        {activity.type === 'position' ? '💑' : activity.type === 'foreplay' ? '💕' : activity.type === 'oral' ? '👄' : '🌙'}
                      </Text>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{item?.name || t('insights.session_fallback')}</Text>
                        <Text style={styles.activityDate}>{new Date(activity.date).toLocaleDateString()}</Text>
                      </View>
                      <Text style={styles.activityStars}>+{activity.starsEarned} ⭐</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// WEEKLY GOALS MODAL
// ============================================
function WeeklyGoalsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const store = useStore();
  
  useEffect(() => {
    if (visible) {
      store.refreshWeeklyGoals();
    }
  }, [visible, store]);

  const completedCount = store.weeklyGoals.filter(g => g.completed).length;
  const totalGoals = store.weeklyGoals.length;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎯 {t('home.weekly_goals')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('weekly_goals.subtitle')}</Text>
          
          {/* Progress Bar */}
          <View style={styles.weeklyProgressContainer}>
            <View style={styles.weeklyProgressBar}>
              <View style={[styles.weeklyProgressFill, { width: `${(completedCount / Math.max(totalGoals, 1)) * 100}%` }]} />
            </View>
            <Text style={styles.weeklyProgressText}>{t('weekly_goals.progress', { completed: completedCount, total: totalGoals })}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {store.weeklyGoals.map((goal) => (
              <View key={goal.id} style={[styles.goalCard, goal.completed && styles.goalCardCompleted]}>
                <Text style={styles.goalEmoji}>{goal.completed ? '✅' : goal.emoji}</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                  <View style={styles.goalProgressRow}>
                    <View style={styles.goalMiniProgress}>
                      <View style={[styles.goalMiniProgressFill, { width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }]} />
                    </View>
                    <Text style={styles.goalProgressText}>{goal.current}/{goal.target}</Text>
                  </View>
                </View>
                <View style={styles.goalReward}>
                  <Text style={styles.goalRewardText}>+{goal.reward} ⭐</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {completedCount === totalGoals && totalGoals > 0 && (
            <View style={styles.allGoalsComplete}>
              <Text style={styles.allGoalsCompleteEmoji}>🎉</Text>
              <Text style={styles.allGoalsCompleteText}>{t('weekly_goals.all_completed')}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// DAILY BONUS MODAL
// ============================================
function DailyBonusModal({ visible, onClose: _onClose, onClaim }: { visible: boolean; onClose: () => void; onClaim: () => void }) {
  const { t } = useI18n();
  const store = useStore();
  const [claimed, setClaimed] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);

  const handleClaim = () => {
    const bonus = store.claimDailyBonus();
    setBonusAmount(bonus);
    setClaimed(true);
    haptic.celebration();
    sounds.playBonus(); // Play coin/bonus sound
    setTimeout(() => {
      onClaim();
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.celebrationOverlay}>
        <View style={styles.dailyBonusContent}>
          {!claimed ? (
            <>
              <Text style={styles.dailyBonusEmoji}>🎁</Text>
              <Text style={styles.dailyBonusTitle}>{t('daily_bonus.title')}</Text>
              <Text style={styles.dailyBonusSubtitle}>
                {store.loginStreak > 1 ? t('daily_bonus.streak', { count: store.loginStreak }) : t('daily_bonus.welcome_back')}
              </Text>
              <TouchableOpacity style={styles.dailyBonusButton} onPress={handleClaim}>
                <LinearGradient colors={[colors.gold, '#f59e0b']} style={styles.dailyBonusButtonGradient}>
                  <Text style={styles.dailyBonusButtonText}>{t('daily_bonus.claim')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.dailyBonusEmoji}>🌟</Text>
              <Text style={styles.dailyBonusTitle}>{t('daily_bonus.stars', { count: bonusAmount })}</Text>
              <Text style={styles.dailyBonusSubtitle}>{t('daily_bonus.come_back')}</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// LEVEL UP MODAL
// ============================================
function LevelUpModal({ visible, onClose, newLevel }: { visible: boolean; onClose: () => void; newLevel: Level | null }) {
  const { t } = useI18n();
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (visible && newLevel) {
      haptic.celebration();
      sounds.playLevelUp();
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [visible, newLevel]);

  if (!newLevel) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.celebrationOverlay}>
        <ConfettiCelebration visible={showConfetti} />
        <View style={styles.levelUpContent}>
          <Text style={styles.levelUpEmoji}>{newLevel.emoji}</Text>
          <Text style={styles.levelUpTitle}>{t('level_up.title')}</Text>
          <Text style={[styles.levelUpNewLevel, { color: newLevel.color }]}>{newLevel.title}</Text>
          <Text style={styles.levelUpSubtitle}>{t('level_up.subtitle', { level: newLevel.level })}</Text>
          <TouchableOpacity style={styles.celebrationButton} onPress={onClose}>
            <Text style={styles.celebrationButtonText}>{t('level_up.button')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// MOOD PLAYLISTS MODAL
// ============================================
function MoodPlaylistsModal({ visible, onClose, navigation: _navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const store = useStore();

  const handleSelectPlaylist = (playlist: MoodPlaylist) => {
    store.setCurrentMood(playlist.mood);
    haptic.medium();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('mood_playlists.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('mood_playlists.subtitle')}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {MOOD_PLAYLISTS.map((playlist) => (
              <TouchableOpacity 
                key={playlist.id} 
                style={[styles.playlistCard, store.currentMood === playlist.mood && styles.playlistCardActive]}
                onPress={() => handleSelectPlaylist(playlist)}
              >
                <View style={[styles.playlistEmojiBg, { backgroundColor: playlist.color + '30' }]}>
                  <Text style={styles.playlistEmoji}>{playlist.emoji}</Text>
                </View>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.playlistDescription}>{playlist.description}</Text>
                </View>
                {store.currentMood === playlist.mood && <Text style={styles.playlistCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            
            {/* Clear Mood Option */}
            <TouchableOpacity 
              style={[styles.playlistCard, !store.currentMood && styles.playlistCardActive]}
              onPress={() => { store.setCurrentMood(null); onClose(); }}
            >
              <View style={[styles.playlistEmojiBg, { backgroundColor: colors.card }]}>
                <Text style={styles.playlistEmoji}>🎲</Text>
              </View>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{t('mood_playlists.surprise')}</Text>
                <Text style={styles.playlistDescription}>{t('mood_playlists.surprise_desc')}</Text>
              </View>
              {!store.currentMood && <Text style={styles.playlistCheck}>✓</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// RECOMMENDATIONS MODAL
// ============================================
function RecommendationsModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const store = useStore();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  // Get smart recommendations from the learning system
  const smartRecs = useMemo(() => {
    return store.getSmartRecommendations(10);
  }, [store]);
  
  // Get user's preference summary
  const prefSummary = useMemo(() => {
    return store.getUserPreferenceSummary();
  }, [store]);
  
  // Group recommendations by type for better display
  const groupedRecs = useMemo(() => {
    const groups: { [key: string]: typeof smartRecs } = {};
    smartRecs.forEach(rec => {
      if (!groups[rec.type]) groups[rec.type] = [];
      groups[rec.type].push(rec);
    });
    return groups;
  }, [smartRecs]);

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'position': return '💑';
      case 'foreplay': return '🔥';
      case 'oral': return '💋';
      case 'massage': return '💆';
      case 'roleplay': return '🎭';
      default: return '✨';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'position': return t('recommendations.type.position');
      case 'foreplay': return t('recommendations.type.foreplay');
      case 'oral': return t('recommendations.type.oral');
      case 'massage': return t('recommendations.type.massage');
      case 'roleplay': return t('recommendations.type.roleplay');
      default: return type;
    }
  };

  const handleSelectItem = (type: string, item: any) => {
    // Track this interaction for learning
    store.trackInteraction({
      type: 'view',
      contentType: type as InteractionEvent['contentType'],
      itemId: item.id,
      category: item.category,
      mood: item.mood,
    });
    
    onClose();
    switch (type) {
      case 'position':
        navigation.navigate('PositionDetail', { position: item });
        break;
      case 'foreplay':
        navigation.navigate('ForeplayDetail', { item });
        break;
      case 'oral':
        navigation.navigate('OralDetail', { item });
        break;
      case 'massage':
        navigation.navigate('MassageDetail', { item });
        break;
      case 'roleplay':
        navigation.navigate('RolePlayDetail', { item });
        break;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💡 {t('home.feature.for_you')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('recommendations.subtitle')}</Text>
          
          {/* Preference summary */}
          {prefSummary.categories.length > 0 && (
            <View style={[styles.prefSummaryContainer, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.prefSummaryTitle, { color: themeColors.text.secondary }]}>{t('recommendations.preferences_title')}</Text>
              <View style={styles.prefTagsRow}>
                {prefSummary.categories.slice(0, 3).map((cat, i) => (
                  <View key={`cat-${i}`} style={[styles.prefTag, { backgroundColor: themeColors.primary[500] + '30' }]}>
                    <Text style={[styles.prefTagText, { color: themeColors.primary[400] }]}>{cat}</Text>
                  </View>
                ))}
                {prefSummary.moods.slice(0, 2).map((mood, i) => (
                  <View key={`mood-${i}`} style={[styles.prefTag, { backgroundColor: themeColors.cardLight }]}>
                    <Text style={[styles.prefTagText, { color: themeColors.text.secondary }]}>{mood}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(groupedRecs).map(([type, recs]) => (
              <View key={type} style={styles.recSection}>
                <View style={styles.recHeader}>
                  <Text style={styles.recEmoji}>{getTypeEmoji(type)}</Text>
                  <Text style={styles.recTitle}>{getTypeLabel(type)}</Text>
                </View>
                {recs.slice(0, 3).map((rec) => (
                  <TouchableOpacity 
                    key={`${type}-${rec.item.id}`} 
                    style={[styles.recCard, { backgroundColor: themeColors.card }]}
                    onPress={() => handleSelectItem(type, rec.item)}
                  >
                    <View style={styles.recCardContent}>
                      <Text style={[styles.recItemName, { color: themeColors.text.primary }]}>{rec.item.name}</Text>
                      <Text style={[styles.recItemReason, { color: themeColors.primary[400] }]}>{rec.reason}</Text>
                    </View>
                    <View style={styles.recScoreBadge}>
                      <Text style={styles.recScoreText}>{Math.round(rec.score)}%</Text>
                    </View>
                    <Text style={[styles.recItemArrow, { color: themeColors.text.muted }]}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            
            {smartRecs.length === 0 && (
              <View style={styles.noRecsContainer}>
                <Text style={styles.noRecsEmoji}>🔮</Text>
                <Text style={[styles.noRecsText, { color: themeColors.text.muted }]}>
                  {t('recommendations.empty_title')}
                </Text>
                <Text style={[styles.noRecsSubtext, { color: themeColors.text.muted }]}>
                  {t('recommendations.empty_subtitle')}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// TRUTH OR DARE MODAL
// ============================================
function TruthOrDareModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [intensity, setIntensity] = useState<'mild' | 'medium' | 'spicy' | 'wild'>('mild');
  const [currentItem, setCurrentItem] = useState<TruthOrDareItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinAnim = useState(new Animated.Value(0))[0];

  const spin = (type: 'truth' | 'dare' | 'random') => {
    haptic.medium();
    setIsSpinning(true);
    
    Animated.sequence([
      Animated.timing(spinAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(spinAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      const filtered = TRUTH_OR_DARE.filter(item => 
        item.intensity === intensity && 
        (type === 'random' ? true : item.type === type)
      );
      const randomItem = filtered[Math.floor(Math.random() * filtered.length)];
      setCurrentItem(randomItem);
      setIsSpinning(false);
      haptic.success();
    });
  };

  const intensityColors = { mild: '#84cc16', medium: '#f59e0b', spicy: '#ef4444', wild: '#a855f7' };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('truth_dare.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('truth_dare.subtitle')}</Text>
          
          {/* Intensity Selector */}
          <View style={styles.intensitySelector}>
            {(['mild', 'medium', 'spicy', 'wild'] as const).map((level) => (
              <TouchableOpacity 
                key={level} 
                style={[styles.intensityOption, intensity === level && { backgroundColor: intensityColors[level] + '40', borderColor: intensityColors[level] }]}
                onPress={() => { haptic.light(); setIntensity(level); }}
              >
                <Text style={[styles.intensityOptionText, intensity === level && { color: intensityColors[level] }]}>
                  {level === 'mild' ? '😊' : level === 'medium' ? '😏' : level === 'spicy' ? '🔥' : '🌶️'} {t(`truth_dare.intensity.${level}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Card */}
          {currentItem ? (
            <Animated.View style={[styles.todCard, { backgroundColor: intensityColors[currentItem.intensity] + '20', borderColor: intensityColors[currentItem.intensity], transform: [{ scale: spinAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] }) }] }]}>
              <Text style={styles.todCardType}>{currentItem.type === 'truth' ? t('truth_dare.card.truth') : t('truth_dare.card.dare')}</Text>
              <Text style={styles.todCardText}>{currentItem.text}</Text>
            </Animated.View>
          ) : (
            <View style={styles.todPlaceholder}>
              <Text style={styles.todPlaceholderEmoji}>🎲</Text>
              <Text style={styles.todPlaceholderText}>{t('truth_dare.placeholder')}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.todButtonsRow}>
            <TouchableOpacity style={[styles.todButton, { backgroundColor: '#06b6d4' }]} onPress={() => spin('truth')} disabled={isSpinning}>
              <Text style={styles.todButtonText}>🤔 {t('truth_dare.truth')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.todButton, { backgroundColor: '#ec4899' }]} onPress={() => spin('dare')} disabled={isSpinning}>
              <Text style={styles.todButtonText}>😈 {t('truth_dare.dare')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.todRandomButton]} onPress={() => spin('random')} disabled={isSpinning}>
            <LinearGradient colors={['#8b5cf6', '#ec4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.todRandomGradient}>
              <Text style={styles.todRandomText}>🎲 {t('truth_dare.random')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// MUSIC PLAYLISTS MODAL (Enhanced)
// ============================================
function MusicPlaylistsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const openPlaylist = (url: string) => {
    haptic.light();
    Linking.openURL(url).catch(() => {
      Alert.alert(t('music.error_title'), t('music.error_message'));
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('music.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('music.subtitle')}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {CURATED_PLAYLISTS.map((playlist, index) => (
              <View key={index} style={styles.musicPlaylistCard}>
                <Text style={styles.musicPlaylistName}>{playlist.name}</Text>
                <Text style={styles.musicPlaylistDesc}>{playlist.description}</Text>
                <View style={styles.musicButtonsRow}>
                  <TouchableOpacity style={[styles.musicButton, { backgroundColor: '#1DB954' }]} onPress={() => openPlaylist(playlist.spotifyUrl)}>
                    <Text style={styles.musicButtonText}>{t('music.spotify')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.musicButton, { backgroundColor: '#FA243C' }]} onPress={() => openPlaylist(playlist.appleMusicUrl)}>
                    <Text style={styles.musicButtonText}>{t('music.apple_music')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// SETTINGS MODAL
// ============================================
// ============================================
// THEME SELECTOR COMPONENT
// ============================================
function ThemeSelector() {
  const { t } = useI18n();
  const themeStore = useThemeStore();
  const currentColors = getThemeColors(themeStore.currentTheme);
  
  return (
    <View style={styles.themeSelectorContainer}>
      <Text style={[styles.themeSelectorLabel, { color: currentColors.text.primary }]}>{t('settings.appearance.color_theme')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelectorScroll}>
        {THEMES.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeOption,
              { 
                backgroundColor: theme.colors.card,
                borderColor: themeStore.currentTheme === theme.id ? theme.colors.primary[500] : 'transparent',
                borderWidth: 2,
              }
            ]}
            onPress={() => {
              haptic.light();
              themeStore.setTheme(theme.id);
            }}
          >
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.primary[500] }]} />
            <Text style={styles.themeEmoji}>{theme.emoji}</Text>
            <Text style={[styles.themeName, { color: theme.colors.text.primary }]}>{theme.name}</Text>
            {themeStore.currentTheme === theme.id && (
              <View style={[styles.themeSelectedBadge, { backgroundColor: theme.colors.primary[500] }]}>
                <Text style={styles.themeSelectedText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================
// FONT SIZE SELECTOR COMPONENT
// ============================================
function FontSizeSelector() {
  const { t } = useI18n();
  const themeStore = useThemeStore();
  const currentColors = getThemeColors(themeStore.currentTheme);
  
  const sizes: { id: FontSizePreset; label: string; preview: string }[] = [
    { id: 'small', label: t('settings.font.small'), preview: 'Aa' },
    { id: 'medium', label: t('settings.font.medium'), preview: 'Aa' },
    { id: 'large', label: t('settings.font.large'), preview: 'Aa' },
  ];
  
  return (
    <View style={styles.fontSelectorContainer}>
      <Text style={[styles.themeSelectorLabel, { color: currentColors.text.primary }]}>{t('settings.appearance.font_size')}</Text>
      <View style={styles.fontSizeOptions}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size.id}
            style={[
              styles.fontSizeOption,
              { 
                backgroundColor: themeStore.fontSize === size.id ? currentColors.primary[500] + '30' : currentColors.card,
                borderColor: themeStore.fontSize === size.id ? currentColors.primary[500] : 'transparent',
              }
            ]}
            onPress={() => {
              haptic.light();
              themeStore.setFontSize(size.id);
            }}
          >
            <Text style={[
              styles.fontSizePreview,
              { 
                fontSize: FONT_SIZES[size.id].large,
                color: themeStore.fontSize === size.id ? currentColors.primary[500] : currentColors.text.primary,
              }
            ]}>
              {size.preview}
            </Text>
            <Text style={[
              styles.fontSizeLabel,
              { color: themeStore.fontSize === size.id ? currentColors.primary[500] : currentColors.text.muted }
            ]}>
              {size.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// SETTINGS MODAL
// ============================================
function SettingsModal({ visible, onClose, navigation: _navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const store = useStore();
  const { languageLabel, t } = useI18n();
  const { user, logout } = useAuth();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [showAboutBlisse, setShowAboutBlisse] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      setPinError(t('settings.pin.error_length'));
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(t('settings.pin.error_match'));
      return;
    }
    store.setPinCode(newPin);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    haptic.success();
    Alert.alert(t('settings.pin.set_success_title'), t('settings.pin.set_success_message'));
  };

  const handleRemovePin = () => {
    Alert.alert(t('settings.pin.remove_title'), t('settings.pin.remove_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.pin.remove_action'), style: 'destructive', onPress: () => { store.setPinCode(null); haptic.light(); } }
    ]);
  };

  const handleToggleBiometrics = async () => {
    if (!store.useBiometrics) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        Alert.alert(t('settings.biometrics.not_available_title'), t('settings.biometrics.not_available_message'));
        return;
      }
    }
    store.setUseBiometrics(!store.useBiometrics);
    haptic.light();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.account.delete_confirm_title'),
      t('settings.account.delete_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) {
                Alert.alert(t('common.error'), t('settings.account.no_user'));
                return;
              }
              await deleteUser(user);
              store.resetOnboarding();
              await logout();
              onClose();
              haptic.success();
              Alert.alert(t('settings.account.deleted_title'), t('settings.account.deleted_message'));
            } catch (error: any) {
              if (error?.code === 'auth/requires-recent-login') {
                try {
                  await logout();
                } catch (_) {
                  // Ignore logout failure and still show re-auth guidance.
                }
                onClose();
                Alert.alert(t('settings.account.reauth_title'), t('settings.account.reauth_message'));
              } else {
                Alert.alert(t('common.error'), t('settings.account.delete_failed'));
              }
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚙️ {t('settings.title')}</Text>
              <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
            {/* Security Section */}
            <Text style={styles.settingsSectionTitle}>🔒 {t('settings.section.security')}</Text>
            
            {!showPinSetup ? (
              <>
                <TouchableOpacity style={styles.settingsItem} onPress={() => store.pinCode ? handleRemovePin() : setShowPinSetup(true)}>
                  <Text style={styles.settingsItemText}>{store.pinCode ? `🔐 ${t('settings.pin.change')}` : `🔓 ${t('settings.pin.set')}`}</Text>
                  <Text style={styles.settingsItemValue}>{store.pinCode ? `${t('settings.pin.enabled')} ✓` : t('settings.pin.off')}</Text>
                </TouchableOpacity>
                
                {store.pinCode && (
                  <TouchableOpacity style={styles.settingsItem} onPress={handleToggleBiometrics}>
                    <Text style={styles.settingsItemText}>👆 {t('settings.biometrics')}</Text>
                    <Text style={styles.settingsItemValue}>{store.useBiometrics ? `${t('settings.on')} ✓` : t('settings.pin.off')}</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.pinSetupContainer}>
                <Text style={styles.pinSetupTitle}>{t('settings.pin.setup_title')}</Text>
                <TextInput
                  style={styles.pinInput}
                  value={newPin}
                  onChangeText={setNewPin}
                  placeholder={t('settings.pin.enter')}
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                <TextInput
                  style={styles.pinInput}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder={t('settings.pin.confirm')}
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
                <View style={styles.pinButtonsRow}>
                  <TouchableOpacity style={styles.pinCancelButton} onPress={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); setPinError(''); }}>
                    <Text style={styles.pinCancelText}>{t('settings.pin.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pinSaveButton} onPress={handleSetPin}>
                    <Text style={styles.pinSaveText}>{t('settings.pin.save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Language Section */}
            <Text style={styles.settingsSectionTitle}>🌐 {t('settings.section.language')}</Text>
            <TouchableOpacity style={styles.settingsItem} onPress={() => setShowLanguageOptions((prev) => !prev)}>
              <Text style={styles.settingsItemText}>{t('settings.language')}</Text>
              <Text style={styles.settingsItemValue}>{languageLabel} ▾</Text>
            </TouchableOpacity>
            {showLanguageOptions && (
              <View style={styles.languageDropdown}>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageOption,
                      store.language === item.code && styles.languageOptionActive,
                    ]}
                    onPress={() => {
                      store.setLanguage(item.code);
                      setShowLanguageOptions(false);
                      haptic.light();
                    }}
                  >
                    <Text
                      style={[
                        styles.languageOptionText,
                        store.language === item.code && styles.languageOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {store.language === item.code ? <Text style={styles.languageOptionCheck}>✓</Text> : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Appearance Section */}
            <Text style={styles.settingsSectionTitle}>🎨 {t('settings.section.appearance')}</Text>
            <ThemeSelector />
            <FontSizeSelector />

            {/* Account Section */}
            <Text style={styles.settingsSectionTitle}>👤 {t('settings.section.account')}</Text>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.account.name')}</Text>
              <Text style={styles.settingsItemValue}>{store.name || t('common.not_set')}</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.account.experience')}</Text>
              <Text style={styles.settingsItemValue}>{store.experience || t('common.not_set')}</Text>
            </View>
            <TouchableOpacity style={styles.settingsItem} onPress={() => setShowAboutBlisse(true)}>
              <Text style={styles.settingsItemText}>💞 {t('settings.account.about')}</Text>
              <Text style={styles.settingsItemValue}>{t('common.open')}</Text>
            </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, { borderColor: colors.error }]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.settingsItemText, { color: colors.error }]}>❌ {t('settings.account.delete')}</Text>
          </TouchableOpacity>

            {/* Data Section */}
            <Text style={styles.settingsSectionTitle}>📊 {t('settings.section.data')}</Text>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.data.total_stars')}</Text>
              <Text style={styles.settingsItemValue}>⭐ {store.totalStars}</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.data.items_tried')}</Text>
              <Text style={styles.settingsItemValue}>{store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length}</Text>
            </View>
            
            <TouchableOpacity style={[styles.settingsItem, { borderColor: colors.error }]} onPress={() => {
              Alert.alert(t('settings.data.reset_confirm_title'), t('settings.data.reset_confirm_message'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('settings.data.reset_confirm_action'), style: 'destructive', onPress: () => { store.resetOnboarding(); onClose(); } }
              ]);
            }}>
              <Text style={[styles.settingsItemText, { color: colors.error }]}>🗑️ {t('settings.data.reset')}</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <AboutBlisseModal visible={showAboutBlisse} onClose={() => setShowAboutBlisse(false)} />
    </>
  );
}

// ============================================
// TERMS OF USE MODAL
// ============================================
function TermsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📜 Terms of Service</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.legalTitle}>Terms of Service</Text>
            <Text style={styles.legalDate}>Last Updated: February 2026</Text>
            
            <Text style={styles.legalSection}>1. Acceptance of Terms</Text>
            <Text style={styles.legalText}>By using Blisse ("the App"), you agree to these Terms of Service. If you do not agree, please do not use the App.</Text>
            
            <Text style={styles.legalSection}>2. Age Requirement</Text>
            <Text style={styles.legalText}>You must be at least 18 years old to use Blisse. By using the App, you confirm that you are of legal age in your jurisdiction.</Text>
            
            <Text style={styles.legalSection}>3. Intended Use</Text>
            <Text style={styles.legalText}>Blisse is designed for consenting adult couples to enhance their intimate relationships. The App provides suggestions and ideas that should only be explored with full consent from all parties involved.</Text>
            
            <Text style={styles.legalSection}>4. Consent is Essential</Text>
            <Text style={styles.legalText}>All activities suggested by Blisse require enthusiastic consent from both partners. Never pressure a partner into any activity. Communication and respect are fundamental.</Text>
            
            <Text style={styles.legalSection}>5. Health & Safety</Text>
            <Text style={styles.legalText}>Some positions or activities may not be suitable for everyone. Consider physical limitations, health conditions, and comfort levels. Consult a healthcare provider if you have concerns.</Text>
            
            <Text style={styles.legalSection}>6. Privacy</Text>
            <Text style={styles.legalText}>Your data is stored locally on your device. We do not collect, transmit, or sell your personal information. See our Privacy Policy for details.</Text>
            
            <Text style={styles.legalSection}>7. Content</Text>
            <Text style={styles.legalText}>All content is for educational and entertainment purposes. We do not guarantee any specific outcomes from using the App.</Text>
            
            <Text style={styles.legalSection}>8. Limitation of Liability</Text>
            <Text style={styles.legalText}>Blisse and its creators are not liable for any physical, emotional, or other harm that may result from using the App. Use at your own risk and discretion.</Text>
            
            <Text style={styles.legalSection}>9. Changes to Terms</Text>
            <Text style={styles.legalText}>We may update these Terms. Continued use of the App after changes constitutes acceptance of the new Terms.</Text>
            
            <Text style={styles.legalSection}>10. Governing Law and Jurisdiction</Text>
            <Text style={styles.legalText}>These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the App shall be subject to the exclusive jurisdiction of the competent courts in Tel Aviv, Israel.</Text>

            <Text style={styles.legalSection}>11. Contact</Text>
            <Text style={styles.legalText}>Questions? Use the Contact form in the app to reach us.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// PRIVACY POLICY MODAL
// ============================================
function PrivacyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔐 Privacy Policy</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.legalTitle}>Privacy Policy</Text>
            <Text style={styles.legalDate}>Last Updated: February 2026</Text>

            <Text style={styles.legalSection}>Our Commitment to Privacy</Text>
            <Text style={styles.legalText}>Blisse is designed with privacy as our highest priority. We understand the sensitive nature of this App and have built it to protect your information.</Text>

            <Text style={styles.legalSection}>Data Stored Locally</Text>
            <Text style={styles.legalText}>✓ Your favorites, notes, and progress are stored locally on your device{'\n'}✓ Authentication is handled by Firebase only for sign-in{'\n'}✓ Contact and idea messages are sent only when you press submit{'\n'}✓ Deleting the App removes local app data from your device</Text>

            <Text style={styles.legalSection}>Authentication Services</Text>
            <Text style={styles.legalText}>Sign-in is handled by Apple Sign-In and Firebase Authentication (Google). We never store passwords or credentials directly.</Text>

            <Text style={styles.legalSection}>Anonymous Analytics</Text>
            <Text style={styles.legalText}>We use PostHog for anonymous, aggregated analytics:{'\n'}• Which features are most popular{'\n'}• General usage patterns{'\n'}• App performance metrics{'\n\n'}This data is:{'\n'}✓ Sent with person profiling disabled{'\n'}✓ Limited to sanitized event metadata{'\n'}✓ Used solely to improve the App</Text>

            <Text style={styles.legalSection}>What We NEVER Collect</Text>
            <Text style={styles.legalText}>• Your biometric data (handled by your device){'\n'}• Your photos, contacts, or personal files{'\n'}• Your precise location{'\n'}• Free-text notes or support messages in analytics{'\n'}• Any sale of your personal information</Text>

            <Text style={styles.legalSection}>Third-Party Services</Text>
            <Text style={styles.legalText}>• Firebase Authentication (Google){'\n'}• Apple Sign-In{'\n'}• PostHog (anonymous analytics){'\n'}• Formspree (support messages you submit){'\n\n'}Each has their own privacy policy.</Text>

            <Text style={styles.legalSection}>PIN Lock & Biometrics</Text>
            <Text style={styles.legalText}>The optional PIN is stored securely on your device only. Face ID/Touch ID is handled entirely by your device's secure enclave - we never access biometric data.</Text>

            <Text style={styles.legalSection}>Children's Privacy</Text>
            <Text style={styles.legalText}>Blisse is strictly for adults 18+. We do not knowingly collect data from minors.</Text>

            <Text style={styles.legalSection}>Your Rights (GDPR/CCPA)</Text>
            <Text style={styles.legalText}>Your data is on your device - you have complete control:{'\n'}• Access: View your data anytime{'\n'}• Deletion: Settings → Reset Data{'\n'}• Portability: Data exists only locally</Text>

            <Text style={styles.legalSection}>Governing Law and Jurisdiction</Text>
            <Text style={styles.legalText}>This Privacy Policy shall be governed by and construed in accordance with the laws of the State of Israel, without regard to conflict of law principles. Any dispute arising out of or relating to this Privacy Policy or the App shall be subject to the exclusive jurisdiction of the competent courts in Tel Aviv, Israel.</Text>

            <Text style={styles.legalSection}>Contact</Text>
            <Text style={styles.legalText}>Questions? Contact us at: privacy@blisse.online</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AboutBlisseModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💞 About Blisse</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.legalTitle}>Why We Built Blisse</Text>
            <Text style={styles.legalDate}>Made by a real couple, for real couples</Text>

            <Text style={styles.legalText}>
              Blisse started from a simple realization: once real life gets busy, connection can drift into autopilot.
              We wanted a playful way to bring back intention, excitement, and emotional closeness without pressure.
            </Text>

            <Text style={styles.legalText}>
              So we built the app we wished we had: a relationship playground with suggestions, games, and rituals
              that help couples talk more, laugh more, and explore together at their own pace.
            </Text>

            <Text style={styles.legalSection}>What Blisse helps you do</Text>
            <Text style={styles.legalText}>
              • Turn “What should we do tonight?” into easy, fun options{'\n'}
              • Build trust and chemistry with playful prompts and dares{'\n'}
              • Keep momentum with weekly goals and shared milestones{'\n'}
              • Personalize ideas based on your mood and feedback loop
            </Text>

            <Text style={styles.legalSection}>Our vibe</Text>
            <Text style={styles.legalText}>
              No judgment. No performance pressure. Just meaningful connection with a little mischief and a lot of heart.
            </Text>

            <Text style={styles.legalSection}>Our promise</Text>
            <Text style={styles.legalText}>
              We design Blisse to feel emotionally warm, playful, and private by default, so you can focus on each other.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// CONTACT FORM MODAL (In-App Submission)
// ============================================
function ContactModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<'general' | 'bug' | 'feedback'>('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t('contact.empty_message'));
      return;
    }
    
    setIsSubmitting(true);

    try {
      await submitFormspreeMessage({
        type: 'contact',
        category,
        message,
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
      haptic.success();
    } catch (error) {
      haptic.error();
      Alert.alert(t('contact.error_title'), t('contact.error_message'));
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setMessage('');
    setCategory('general');
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={styles.successTitle}>{t('contact.success_title')}</Text>
              <Text style={styles.successText}>{t('contact.success_message')}</Text>
              <TouchableOpacity style={styles.successButton} onPress={handleClose}>
                <Text style={styles.successButtonText}>{t('common.done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📧 {t('profile.menu.contact')}</Text>
            <TouchableOpacity onPress={handleClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>{t('contact.subtitle')}</Text>
            
            {/* Category Selector */}
            <View style={styles.contactCategoryRow}>
              {[
                { type: 'general' as const, emoji: '💬', label: t('contact.category.general') },
                { type: 'bug' as const, emoji: '🐛', label: t('contact.category.bug') },
                { type: 'feedback' as const, emoji: '💝', label: t('contact.category.feedback') },
              ].map((item) => (
                <TouchableOpacity 
                  key={item.type}
                  style={[styles.contactCategoryButton, category === item.type && styles.contactCategoryButtonActive]}
                  onPress={() => { haptic.light(); setCategory(item.type); }}
                >
                  <Text style={styles.contactCategoryEmoji}>{item.emoji}</Text>
                  <Text style={[styles.contactCategoryText, category === item.type && styles.contactCategoryTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.contactInput, styles.contactTextarea]}
              value={message}
              onChangeText={setMessage}
              placeholder={t('contact.placeholder')}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              style={[styles.contactSendButton, isSubmitting && { opacity: 0.6 }]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#8b5cf6', '#ec4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.contactSendGradient}>
                <Text style={styles.contactSendText}>{isSubmitting ? t('contact.sending') : t('contact.send')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.contactPrivacyNote}>{t('contact.privacy_note')}</Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================
// IDEAS/FEEDBACK FORM MODAL (In-App Submission)
// ============================================
function IdeasModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [ideaType, setIdeaType] = useState<'position' | 'feature' | 'other'>('position');
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!idea.trim()) {
      Alert.alert(t('ideas.empty_message'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitFormspreeMessage({
        type: 'idea',
        ideaType,
        message: idea,
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
      haptic.success();
    } catch (error) {
      haptic.error();
      Alert.alert(t('ideas.error_title'), t('ideas.error_message'));
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIdea('');
    setIdeaType('position');
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>{t('ideas.success_title')}</Text>
              <Text style={styles.successText}>{t('ideas.success_message')}</Text>
              <TouchableOpacity style={styles.successButton} onPress={handleClose}>
                <Text style={styles.successButtonText}>{t('celebration.awesome')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💡 {t('ideas.title')}</Text>
            <TouchableOpacity onPress={handleClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>{t('ideas.subtitle')}</Text>
            
            {/* Idea Type Selector */}
            <View style={styles.ideaTypeRow}>
              {[
                { type: 'position' as const, emoji: '💑', label: t('ideas.type.position') },
                { type: 'feature' as const, emoji: '✨', label: t('ideas.type.feature') },
                { type: 'other' as const, emoji: '💬', label: t('ideas.type.other') },
              ].map((item) => (
                <TouchableOpacity 
                  key={item.type}
                  style={[styles.ideaTypeButton, ideaType === item.type && styles.ideaTypeButtonActive]}
                  onPress={() => { haptic.light(); setIdeaType(item.type); }}
                >
                  <Text style={styles.ideaTypeEmoji}>{item.emoji}</Text>
                  <Text style={[styles.ideaTypeText, ideaType === item.type && styles.ideaTypeTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.contactInput, styles.contactTextarea]}
              value={idea}
              onChangeText={setIdea}
              placeholder={ideaType === 'position' ? t('ideas.placeholder.position') : ideaType === 'feature' ? t('ideas.placeholder.feature') : t('ideas.placeholder.other')}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              style={[styles.contactSendButton, isSubmitting && { opacity: 0.6 }]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#06b6d4', '#22c55e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.contactSendGradient}>
                <Text style={styles.contactSendText}>{isSubmitting ? t('ideas.sending') : t('ideas.send')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.contactPrivacyNote}>{t('ideas.privacy_note')}</Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================
// APP LOCK SCREEN
// ============================================
function AppLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n();
  const store = useStore();
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  const tryBiometrics = useCallback(async () => {
    if (store.useBiometrics) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t('lock.unlock_prompt'),
          fallbackLabel: t('lock.use_pin'),
        });
        if (result.success) {
          haptic.success();
          onUnlock();
        }
      } catch (e) {
        // Biometrics failed, fall back to PIN
      }
    }
  }, [store.useBiometrics, onUnlock, t]);

  useEffect(() => {
    void tryBiometrics();
  }, [tryBiometrics]);

  useEffect(() => {
    if (!lockoutUntil) return;

    const tick = () => {
      const seconds = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutSecondsLeft(seconds);
      if (seconds === 0) {
        setLockoutUntil(null);
        setAttempts(0);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handlePinEntry = (digit: string) => {
    if (lockoutUntil) return;

    haptic.light();
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setError('');
    
    if (newPin.length === 4) {
      if (newPin === store.pinCode) {
        haptic.success();
        setAttempts(0);
        onUnlock();
      } else {
        haptic.error();
        const nextAttempts = attempts + 1;
        if (nextAttempts >= MAX_PIN_ATTEMPTS) {
          setLockoutUntil(Date.now() + PIN_LOCKOUT_MS);
          setError(t('lock.too_many'));
        } else {
          setError(t('lock.incorrect_pin'));
        }
        setEnteredPin('');
        setAttempts(nextAttempts);
      }
    }
  };

  const handleDelete = () => {
    haptic.light();
    setEnteredPin(p => p.slice(0, -1));
    setError('');
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.lockScreenContainer}>
      <SafeAreaView style={styles.lockScreenContent}>
        <Text style={styles.lockScreenTitle}>🔐 Blisse</Text>
        <Text style={styles.lockScreenSubtitle}>{t('lock.enter_pin')}</Text>
        
        {/* PIN Dots */}
        <View style={styles.pinDotsRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.pinDot, enteredPin.length > i && styles.pinDotFilled]} />
          ))}
        </View>
        
        {lockoutUntil ? (
          <Text style={styles.lockScreenError}>{t('lock.too_many_wait', { seconds: lockoutSecondsLeft })}</Text>
        ) : error ? (
          <Text style={styles.lockScreenError}>{error}</Text>
        ) : null}
        
        {/* Number Pad */}
        <View style={styles.numPad}>
          {[[1,2,3], [4,5,6], [7,8,9], ['bio',0,'del']].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.numPadRow}>
              {row.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[styles.numPadButton, lockoutUntil && item !== 'bio' ? { opacity: 0.5 } : null]}
                  disabled={!!lockoutUntil && item !== 'bio'}
                  onPress={() => {
                    if (lockoutUntil && item !== 'bio') return;
                    if (item === 'del') handleDelete();
                    else if (item === 'bio') tryBiometrics();
                    else handlePinEntry(String(item));
                  }}
                >
                  <Text style={styles.numPadText}>
                    {item === 'del' ? '⌫' : item === 'bio' ? (store.useBiometrics ? '👆' : '') : item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// MAIN APP SCREENS
// ============================================
function HomeScreen({ navigation }: any) {
  const store = useStore();
  const { language, t, localizeTerm } = useI18n();
  const introAnim = useRef(new Animated.Value(0)).current;
  const suggestionsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const [showSpinner, setShowSpinner] = useState(false);
  const [showDateNight, setShowDateNight] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showWeeklyGoals, setShowWeeklyGoals] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelData, _setNewLevelData] = useState<Level | null>(null);
  const [showSeasonal, setShowSeasonal] = useState(false);
  const [showTruthOrDare, setShowTruthOrDare] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [dailyJokeDateKey, setDailyJokeDateKey] = useState(getDateKey(new Date()));
  const [dailyJokeBank, setDailyJokeBank] = useState<DailyJokeBank | null>(null);
  const [showDailyPunchline, setShowDailyPunchline] = useState(false);
  
  const greeting =
    new Date().getHours() < 12
      ? t('home.greeting.morning')
      : new Date().getHours() < 18
        ? t('home.greeting.afternoon')
        : t('home.greeting.evening');
  
  // Level system
  const currentLevel = getLevel(store.totalStars);
  const nextLevel = getNextLevel(store.totalStars);
  const progressToNext = nextLevel 
    ? ((store.totalStars - currentLevel.minStars) / (nextLevel.minStars - currentLevel.minStars)) * 100 
    : 100;

  // Current seasonal theme
  const currentSeason = getCurrentSeason();
  const homeCopyDayIndex = useMemo(
    () => Math.max(0, getDayOfYear(new Date(`${dailyJokeDateKey}T12:00:00`)) - 1),
    [dailyJokeDateKey]
  );
  const sparkMessage = useMemo(() => {
    const seasonalMessages = currentSeason ? SEASONAL_HOME_SPARK_MESSAGES[currentSeason.id] : null;
    const source = seasonalMessages?.length ? seasonalMessages : HOME_SPARK_MESSAGES;
    return source[homeCopyDayIndex % source.length];
  }, [currentSeason, homeCopyDayIndex]);
  const tonightTeaser = useMemo(() => {
    const seasonalTeasers = currentSeason ? SEASONAL_TONIGHT_TEASERS[currentSeason.id] : null;
    const source = seasonalTeasers?.length ? seasonalTeasers : TONIGHT_SUGGESTION_TEASERS;
    return source[homeCopyDayIndex % source.length];
  }, [currentSeason, homeCopyDayIndex]);
  const seasonalHook = useMemo(() => {
    const hooks = currentSeason ? SEASONAL_HOOK_LINES[currentSeason.id] : null;
    if (!hooks?.length) return null;
    return hooks[homeCopyDayIndex % hooks.length];
  }, [currentSeason, homeCopyDayIndex]);
  const levelMotivator = LEVEL_MOTIVATOR_LINES[homeCopyDayIndex % LEVEL_MOTIVATOR_LINES.length];
  const dailyJoke = useMemo(
    () => getDailyJokeForDate(new Date(`${dailyJokeDateKey}T12:00:00`), dailyJokeBank),
    [dailyJokeDateKey, dailyJokeBank]
  );

  // Check for daily bonus on mount
  useEffect(() => {
    store.checkLoginStreak();
    store.refreshWeeklyGoals();
    
    // Show daily bonus if not claimed today
    if (!store.dailyBonusClaimed) {
      setTimeout(() => setShowDailyBonus(true), 500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setInterval(() => {
      const nextDateKey = getDateKey(new Date());
      setDailyJokeDateKey((prev) => (prev === nextDateKey ? prev : nextDateKey));
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const hydrateDailyJokeBank = async () => {
      const bank = await getDailyJokeBank(false);
      if (isMounted && bank) {
        setDailyJokeBank(bank);
      }
    };
    void hydrateDailyJokeBank();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const refreshDailyJokeBank = async () => {
      const bank = await getDailyJokeBank(true);
      if (isMounted && bank) {
        setDailyJokeBank(bank);
      }
    };
    void refreshDailyJokeBank();
    return () => {
      isMounted = false;
    };
  }, [dailyJokeDateKey]);

  useEffect(() => {
    setShowDailyPunchline(false);
  }, [dailyJokeDateKey]);

  useEffect(() => {
    introAnim.setValue(0);
    suggestionsAnim.setValue(0);
    actionsAnim.setValue(0);
    Animated.sequence([
      Animated.timing(introAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(suggestionsAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(actionsAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [actionsAnim, introAnim, suggestionsAnim]);

  const introTranslateY = introAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const suggestionsTranslateY = suggestionsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const actionsTranslateY = actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  const tonightPosition = useMemo(() => {
    void language;
    if (store.currentMood) {
      const moodPositions = positions.filter((p) => p.mood === store.currentMood);
      const untried = moodPositions.filter((p) => !store.tried.includes(p.id));
      if (untried.length > 0) return untried[Math.floor(Math.random() * untried.length)];
      if (moodPositions.length > 0) return moodPositions[Math.floor(Math.random() * moodPositions.length)];
    }
    const untried = positions.filter((p) => !store.tried.includes(p.id));
    if (untried.length > 0) return untried[Math.floor(Math.random() * untried.length)];
    return positions[Math.floor(Math.random() * positions.length)];
  }, [language, store.currentMood, store.tried]);

  return (
    <ScreenWrapper scroll>
      <View style={styles.homeHeader}>
        <View style={styles.homeHeaderTop}>
          <View>
            <Text style={styles.greeting}>{greeting} ✨</Text>
            <Text style={styles.title}>{t('home.hey_name', { name: store.name || t('home.there') })}</Text>
          </View>
          <TouchableOpacity style={styles.starCounter} onPress={() => setShowInsights(true)}>
            <Text style={styles.starCounterText}>⭐ {store.totalStars}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={{ opacity: introAnim, transform: [{ translateY: introTranslateY }] }}>
        <View style={styles.homeSparkBanner}>
          <Text style={styles.homeSparkBannerHeadline}>{sparkMessage.headline}</Text>
          <Text style={styles.homeSparkBannerBody}>{sparkMessage.body}</Text>
        </View>

        {/* Level Progress Card */}
        <TouchableOpacity style={styles.levelCard} onPress={() => setShowInsights(true)} activeOpacity={0.8}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelEmoji}>{currentLevel.emoji}</Text>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelTitle, { color: currentLevel.color }]}>{currentLevel.title}</Text>
              <Text style={styles.levelSubtitle}>{t('home.level', { level: currentLevel.level })}</Text>
            </View>
            {nextLevel && (
              <View style={styles.levelNextBadge}>
                <Text style={styles.levelNextText}>{t('home.next', { emoji: nextLevel.emoji })}</Text>
              </View>
            )}
          </View>
          <View style={styles.levelProgressBar}>
            <Animated.View style={[styles.levelProgressFill, { width: `${progressToNext}%`, backgroundColor: currentLevel.color }]} />
          </View>
          {nextLevel && (
            <Text style={styles.levelProgressText}>{t('home.stars_to_level', { count: nextLevel.minStars - store.totalStars, title: nextLevel.title })}</Text>
          )}
          <Text style={styles.levelMotivatorText}>{levelMotivator}</Text>
        </TouchableOpacity>

        {/* Streak Banner */}
        {store.currentStreak >= 2 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakBannerText}>🔥 {t('home.week_streak', { count: store.currentStreak })}</Text>
          </View>
        )}

        {/* Login Streak Banner */}
        {store.loginStreak >= 3 && (
          <View style={[styles.streakBanner, { backgroundColor: colors.gold + '20' }]}>
            <Text style={[styles.streakBannerText, { color: colors.gold }]}>📅 {t('home.day_login_streak', { count: store.loginStreak })}</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={{ opacity: suggestionsAnim, transform: [{ translateY: suggestionsTranslateY }] }}>
        {/* Daily Joke Tease */}
        <View style={styles.dailyJokeCard}>
          <View style={styles.dailyJokeHeaderRow}>
            <Text style={styles.dailyJokeTitle}>😏 {t('home.daily_tease')}</Text>
            <Text style={styles.dailyJokeDate}>{dailyJokeDateKey}</Text>
          </View>
          <Text style={styles.dailyJokeSetup}>{dailyJoke.setup}</Text>
          {!showDailyPunchline ? (
            <TouchableOpacity
              style={styles.dailyJokeRevealButton}
              onPress={() => {
                setShowDailyPunchline(true);
                Analytics.trackFeatureUsed('daily_joke_punchline_revealed');
              }}
            >
              <Text style={styles.dailyJokeRevealText}>{t('home.reveal_punchline')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.dailyJokePunchlineBox}>
              <Text style={styles.dailyJokePunchlineLabel}>{t('home.punchline')}</Text>
              <Text style={styles.dailyJokePunchline}>{dailyJoke.punchline}</Text>
            </View>
          )}
        </View>

        {/* Seasonal Card */}
        {currentSeason && (
          <TouchableOpacity style={[styles.seasonalCard, { borderColor: currentSeason.color }]} onPress={() => setShowSeasonal(true)} activeOpacity={0.8}>
            <Text style={styles.seasonalCardEmoji}>{currentSeason.emoji}</Text>
            <View style={styles.seasonalCardInfo}>
              <Text style={[styles.seasonalCardTitle, { color: currentSeason.color }]}>{currentSeason.name}</Text>
              <Text style={styles.seasonalCardSubtitle}>{currentSeason.description}</Text>
              {seasonalHook ? <Text style={styles.seasonalCardHook}>{seasonalHook}</Text> : null}
            </View>
            <Text style={styles.seasonalCardArrow}>→</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => { haptic.light(); navigation.navigate('PositionDetail', { position: tonightPosition }); }} activeOpacity={0.9}>
          <View style={styles.tonightCard}>
            <LinearGradient colors={['#7c3aed', '#db2777']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tonightGradient}>
              <Text style={styles.tonightLabel}>{t('home.tonight_suggestion')}</Text>
              <Text style={styles.tonightTitle}>{tonightPosition.name}</Text>
              <Text style={styles.tonightSubtitle}>{tonightPosition.vibe}</Text>
              <Text style={styles.tonightTeaser}>{tonightTeaser}</Text>
              {!store.tried.includes(tonightPosition.id) && (
                <View style={styles.newBadge}><Text style={styles.newBadgeText}>✨ {t('home.new_badge', { count: 3 })}</Text></View>
              )}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Feature Buttons Row 1 */}
      <Animated.View style={{ opacity: actionsAnim, transform: [{ translateY: actionsTranslateY }] }}>
      <View style={styles.featureButtonsRow}>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowSpinner(true)}>
          <LinearGradient colors={['#f59e0b', '#ef4444']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>🎰</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.spin')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.playful')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowDateNight(true)}>
          <LinearGradient colors={['#8b5cf6', '#ec4899']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>🌙</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.date_night')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.romance')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowTruthOrDare(true)}>
          <LinearGradient colors={['#ef4444', '#ec4899']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>🎲</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.truth_dare')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.truth_dare')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Feature Buttons Row 2 */}
      <View style={styles.featureButtonsRow}>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowChallenge(true)}>
          <LinearGradient colors={['#06b6d4', '#22c55e']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>🎯</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.challenge')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.challenge')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowMusic(true)}>
          <LinearGradient colors={['#1DB954', '#22c55e']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>🎵</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.music')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.music')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowRecommendations(true)}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>💡</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.for_you')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.for_you')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Feature Buttons Row 3 */}
      <View style={styles.featureButtonsRow}>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowPlaylists(true)}>
          <LinearGradient colors={['#ec4899', '#f43f5e']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>🎭</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.moods')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.moods')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowWeeklyGoals(true)}>
          <LinearGradient colors={['#84cc16', '#22c55e']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>📋</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.goals')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.goals')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton} onPress={() => setShowAchievements(true)}>
          <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.featureButtonGradient}>
            <Text style={styles.featureButtonEmoji}>🏆</Text>
            <Text style={styles.featureButtonText}>{t('home.feature.trophies')}</Text>
            <Text style={styles.featureButtonSubtext}>{t('home.quality.trophies')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </Animated.View>

      {/* Weekly Goals Preview */}
      {store.weeklyGoals.length > 0 && (
        <TouchableOpacity style={styles.weeklyGoalsPreview} onPress={() => setShowWeeklyGoals(true)}>
          <Text style={styles.weeklyGoalsPreviewTitle}>📋 {t('home.weekly_goals')}</Text>
          <View style={styles.weeklyGoalsPreviewProgress}>
            {store.weeklyGoals.map((goal, index) => (
              <View key={index} style={[styles.weeklyGoalDot, goal.completed && styles.weeklyGoalDotComplete]} />
            ))}
          </View>
          <Text style={styles.weeklyGoalsPreviewText}>
            {store.weeklyGoals.filter(g => g.completed).length}/{store.weeklyGoals.length} {t('common.done')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Stats Row */}
      <View style={styles.quickStatsRow}>
        <TouchableOpacity style={styles.quickStatCard} onPress={() => setShowAchievements(true)}>
          <Text style={styles.quickStatEmoji}>🏆</Text>
          <Text style={styles.quickStatNumber}>{store.earnedAchievements.length}/{ACHIEVEMENTS.length}</Text>
          <Text style={styles.quickStatLabel}>{t('home.quick_stats.achievements')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickStatCard} onPress={() => setShowInsights(true)}>
          <Text style={styles.quickStatEmoji}>📊</Text>
          <Text style={styles.quickStatNumber}>{store.activityLog.length}</Text>
          <Text style={styles.quickStatLabel}>{t('home.quick_stats.activities')}</Text>
        </TouchableOpacity>
      </View>

      {/* Current Challenge Preview */}
      {store.currentChallenge && (
        <TouchableOpacity style={styles.challengePreview} onPress={() => setShowChallenge(true)}>
          <View style={styles.challengePreviewHeader}>
            <Text style={styles.challengePreviewLabel}>🎯 {t('home.challenge.active')}</Text>
            <Text style={styles.challengePreviewReward}>+3 ⭐</Text>
          </View>
          <Text style={styles.challengePreviewName}>
            {store.currentChallenge.type === 'position' 
              ? positions.find(p => p.id === store.currentChallenge?.itemId)?.name
              : store.currentChallenge.type === 'foreplay'
              ? foreplayIdeas.find(f => f.id === store.currentChallenge?.itemId)?.name
              : oralPlayIdeas.find(o => o.id === store.currentChallenge?.itemId)?.name}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>{t('home.how_feeling')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll} contentContainerStyle={styles.horizontalScrollContent}>
        {moods.map((mood) => (
          <TouchableOpacity key={mood.id} style={[styles.moodChip, store.currentMood === mood.id && { backgroundColor: mood.color }]} onPress={() => { haptic.light(); store.setCurrentMood(store.currentMood === mood.id ? null : mood.id); }}>
            <Text style={styles.moodChipText}>{mood.emoji} {localizeTerm(mood.label)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statNumber}>{store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length}</Text><Text style={styles.statLabel}>{t('stats.tried')}</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{store.favorites.length + store.favoriteForeplay.length + store.favoriteOral.length + store.favoriteMassage.length + store.favoriteRoleplay.length}</Text><Text style={styles.statLabel}>{t('stats.favorites')}</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{positions.length + foreplayIdeas.length + oralPlayIdeas.length + massageTechniques.length + rolePlayScenarios.length}</Text><Text style={styles.statLabel}>{t('stats.total')}</Text></View>
      </View>

      <SpinnerModal visible={showSpinner} onClose={() => setShowSpinner(false)} navigation={navigation} />
      <DateNightModal visible={showDateNight} onClose={() => setShowDateNight(false)} navigation={navigation} />
      <ChallengeModal visible={showChallenge} onClose={() => setShowChallenge(false)} navigation={navigation} />
      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      <InsightsModal visible={showInsights} onClose={() => setShowInsights(false)} />
      <WeeklyGoalsModal visible={showWeeklyGoals} onClose={() => setShowWeeklyGoals(false)} />
      <DailyBonusModal visible={showDailyBonus} onClose={() => setShowDailyBonus(false)} onClaim={() => setShowDailyBonus(false)} />
      <MoodPlaylistsModal visible={showPlaylists} onClose={() => setShowPlaylists(false)} navigation={navigation} />
      <RecommendationsModal visible={showRecommendations} onClose={() => setShowRecommendations(false)} navigation={navigation} />
      <LevelUpModal visible={showLevelUp} onClose={() => setShowLevelUp(false)} newLevel={newLevelData} />
      <SeasonalModal
        visible={showSeasonal}
        onClose={() => setShowSeasonal(false)}
        navigation={navigation}
        onOpenTruthOrDare={() => setShowTruthOrDare(true)}
        onOpenDateNight={() => setShowDateNight(true)}
        onOpenChallenge={() => setShowChallenge(true)}
        onOpenSpinner={() => setShowSpinner(true)}
      />
      <TruthOrDareModal visible={showTruthOrDare} onClose={() => setShowTruthOrDare(false)} />
      <MusicPlaylistsModal visible={showMusic} onClose={() => setShowMusic(false)} />
    </ScreenWrapper>
  );
}

function ExploreScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'positions' | 'foreplay' | 'oral' | 'massage' | 'roleplay'>('positions');
  const [sortBy, setSortBy] = useState<'all' | 'untried' | 'tried'>('all');
  const store = useStore();
  const { language, t, localizeTerm } = useI18n();
  const currentCategories = contentType === 'positions' ? categories : contentType === 'foreplay' ? foreplayCategories : contentType === 'oral' ? oralCategories : contentType === 'massage' ? massageCategories : rolePlayCategories;

  const filteredPositions = useMemo(() => {
    let result = positions;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const moodLabel = moods.find((m) => m.id === p.mood)?.label || p.mood;
        return (
          p.name.toLowerCase().includes(query) ||
          p.vibe.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          localizeTerm(p.category).toLowerCase().includes(query) ||
          p.mood.toLowerCase().includes(query) ||
          localizeTerm(moodLabel).toLowerCase().includes(query)
        );
      });
    }
    if (sortBy === 'untried') result = result.filter(p => !store.tried.includes(p.id));
    if (sortBy === 'tried') result = result.filter(p => store.tried.includes(p.id));
    return result;
  }, [localizeTerm, searchQuery, selectedCategory, sortBy, store.tried]);

  const filteredForeplay = useMemo(() => {
    let result = foreplayIdeas;
    if (selectedCategory) result = result.filter((f) => f.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((f) => (
        f.name.toLowerCase().includes(query) ||
        f.vibe.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query) ||
        localizeTerm(f.category).toLowerCase().includes(query)
      ));
    }
    if (sortBy === 'untried') result = result.filter(f => !store.triedForeplay.includes(f.id));
    if (sortBy === 'tried') result = result.filter(f => store.triedForeplay.includes(f.id));
    return result;
  }, [localizeTerm, searchQuery, selectedCategory, sortBy, store.triedForeplay]);

  const filteredOral = useMemo(() => {
    let result = oralPlayIdeas;
    if (selectedCategory) result = result.filter((o) => o.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((o) => (
        o.name.toLowerCase().includes(query) ||
        o.vibe.toLowerCase().includes(query) ||
        o.category.toLowerCase().includes(query) ||
        localizeTerm(o.category).toLowerCase().includes(query)
      ));
    }
    if (sortBy === 'untried') result = result.filter(o => !store.triedOral.includes(o.id));
    if (sortBy === 'tried') result = result.filter(o => store.triedOral.includes(o.id));
    return result;
  }, [localizeTerm, searchQuery, selectedCategory, sortBy, store.triedOral]);

  const filteredMassage = useMemo(() => {
    let result = massageTechniques;
    if (selectedCategory) result = result.filter((m) => m.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) => (
        m.name.toLowerCase().includes(query) ||
        m.vibe.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        localizeTerm(m.category).toLowerCase().includes(query) ||
        m.bodyArea.toLowerCase().includes(query)
      ));
    }
    if (sortBy === 'untried') result = result.filter(m => !store.triedMassage.includes(m.id));
    if (sortBy === 'tried') result = result.filter(m => store.triedMassage.includes(m.id));
    return result;
  }, [localizeTerm, searchQuery, selectedCategory, sortBy, store.triedMassage]);

  const filteredRoleplay = useMemo(() => {
    let result = rolePlayScenarios;
    if (selectedCategory) result = result.filter((r) => r.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) => (
        r.name.toLowerCase().includes(query) ||
        r.vibe.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        localizeTerm(r.category).toLowerCase().includes(query)
      ));
    }
    if (sortBy === 'untried') result = result.filter(r => !store.triedRoleplay.includes(r.id));
    if (sortBy === 'tried') result = result.filter(r => store.triedRoleplay.includes(r.id));
    return result;
  }, [localizeTerm, searchQuery, selectedCategory, sortBy, store.triedRoleplay]);

  const handleContentTypeChange = (type: 'positions' | 'foreplay' | 'oral' | 'massage' | 'roleplay') => { haptic.light(); setContentType(type); setSelectedCategory(null); };

  return (
    <ScreenWrapper>
      <View style={styles.exploreHeader}><Text style={styles.title}>{t('explore.title')}</Text></View>
      
      {/* Content Type Tabs - Scrollable for 5 options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentTypeScroll} contentContainerStyle={styles.contentTypeScrollContent}>
        <TouchableOpacity style={[styles.contentTypeTab, contentType === 'positions' && styles.contentTypeTabActive]} onPress={() => handleContentTypeChange('positions')}>
          <Text style={[styles.contentTypeTabText, contentType === 'positions' && styles.contentTypeTabTextActive]}>💑 {t('explore.type.positions')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contentTypeTab, contentType === 'foreplay' && styles.contentTypeTabActive]} onPress={() => handleContentTypeChange('foreplay')}>
          <Text style={[styles.contentTypeTabText, contentType === 'foreplay' && styles.contentTypeTabTextActive]}>💕 {t('explore.type.foreplay')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contentTypeTab, contentType === 'oral' && styles.contentTypeTabActive]} onPress={() => handleContentTypeChange('oral')}>
          <Text style={[styles.contentTypeTabText, contentType === 'oral' && styles.contentTypeTabTextActive]}>👄 {t('explore.type.oral')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contentTypeTab, contentType === 'massage' && styles.contentTypeTabActive]} onPress={() => handleContentTypeChange('massage')}>
          <Text style={[styles.contentTypeTabText, contentType === 'massage' && styles.contentTypeTabTextActive]}>💆 {t('explore.type.massage')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contentTypeTab, contentType === 'roleplay' && styles.contentTypeTabActive]} onPress={() => handleContentTypeChange('roleplay')}>
          <Text style={[styles.contentTypeTabText, contentType === 'roleplay' && styles.contentTypeTabTextActive]}>🎭 {t('explore.type.roleplay')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder={t('explore.search_placeholder', {
          type: translateUi(language, getContentTypeKey(contentType)).toLowerCase(),
        })}
      />
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {(['all', 'untried', 'tried'] as const).map((option) => (
          <TouchableOpacity key={option} style={[styles.sortButton, sortBy === option && styles.sortButtonActive]} onPress={() => { haptic.light(); setSortBy(option); }}>
            <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>
              {option === 'all' ? t('explore.sort.all') : option === 'untried' ? `✨ ${t('explore.sort.new')}` : `✓ ${t('explore.sort.tried')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
          <TouchableOpacity style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]} onPress={() => { haptic.light(); setSelectedCategory(null); }}>
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextSelected]}>{t('common.all')}</Text>
          </TouchableOpacity>
          {currentCategories.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]} onPress={() => { haptic.light(); setSelectedCategory(cat); }}>
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>{localizeTerm(cat)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {contentType === 'positions' && (
        <FlatList data={filteredPositions} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PositionCard position={item} onPress={() => navigation.navigate('PositionDetail', { position: item })} />}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyEmoji}>🔍</Text><Text style={styles.emptyTitle}>{t('explore.empty')}</Text></View>}
        />
      )}
      {contentType === 'foreplay' && (
        <FlatList data={filteredForeplay} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ForeplayCard item={item} onPress={() => navigation.navigate('ForeplayDetail', { item })} />}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyEmoji}>🔍</Text><Text style={styles.emptyTitle}>{t('explore.empty')}</Text></View>}
        />
      )}
      {contentType === 'oral' && (
        <FlatList data={filteredOral} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <OralPlayCard item={item} onPress={() => navigation.navigate('OralDetail', { item })} />}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyEmoji}>🔍</Text><Text style={styles.emptyTitle}>{t('explore.empty')}</Text></View>}
        />
      )}
      {contentType === 'massage' && (
        <FlatList data={filteredMassage} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MassageCard item={item} onPress={() => navigation.navigate('MassageDetail', { item })} />}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyEmoji}>🔍</Text><Text style={styles.emptyTitle}>{t('explore.empty')}</Text></View>}
        />
      )}
      {contentType === 'roleplay' && (
        <FlatList data={filteredRoleplay} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RolePlayCard item={item} onPress={() => navigation.navigate('RolePlayDetail', { item })} />}
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyEmoji}>🔍</Text><Text style={styles.emptyTitle}>{t('explore.empty')}</Text></View>}
        />
      )}
    </ScreenWrapper>
  );
}

function FavoritesScreen({ navigation }: any) {
  const store = useStore();
  const { language, t } = useI18n();
  const [contentType, setContentType] = useState<'positions' | 'foreplay' | 'oral'>('positions');
  const [showRecentlyTried, setShowRecentlyTried] = useState(false);
  const favoritePositions = positions.filter((p) => store.favorites.includes(p.id));
  const favoriteForeplayItems = foreplayIdeas.filter((f) => store.favoriteForeplay.includes(f.id));
  const favoriteOralItems = oralPlayIdeas.filter((o) => store.favoriteOral.includes(o.id));

  // Recently tried items (last 10)
  const recentlyTried = useMemo(() => {
    void language;
    return store.activityLog
      .slice(-10)
      .reverse()
      .map(activity => {
        if (activity.type === 'position') return { type: 'position', item: positions.find(p => p.id === activity.itemId) };
        if (activity.type === 'foreplay') return { type: 'foreplay', item: foreplayIdeas.find(f => f.id === activity.itemId) };
        if (activity.type === 'oral') return { type: 'oral', item: oralPlayIdeas.find(o => o.id === activity.itemId) };
        return null;
      })
      .filter(Boolean);
  }, [language, store.activityLog]);

  return (
    <ScreenWrapper>
      <View style={styles.exploreHeader}><Text style={styles.title}>{t('favorites.title')}</Text></View>
      
      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity style={[styles.viewToggleButton, !showRecentlyTried && styles.viewToggleButtonActive]} onPress={() => { haptic.light(); setShowRecentlyTried(false); }}>
          <Text style={[styles.viewToggleText, !showRecentlyTried && styles.viewToggleTextActive]}>❤️ {t('favorites.favorites_toggle')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.viewToggleButton, showRecentlyTried && styles.viewToggleButtonActive]} onPress={() => { haptic.light(); setShowRecentlyTried(true); }}>
          <Text style={[styles.viewToggleText, showRecentlyTried && styles.viewToggleTextActive]}>🕐 {t('favorites.recent_toggle')}</Text>
        </TouchableOpacity>
      </View>

      {!showRecentlyTried ? (
        <>
          <View style={styles.tripleToggleContainer}>
            <TouchableOpacity style={[styles.tripleToggleButton, contentType === 'positions' && styles.tripleToggleButtonActive]} onPress={() => { haptic.light(); setContentType('positions'); }}>
              <Text style={[styles.tripleToggleButtonText, contentType === 'positions' && styles.tripleToggleButtonTextActive]}>{t('favorites.positions_count', { count: favoritePositions.length })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tripleToggleButton, contentType === 'foreplay' && styles.tripleToggleButtonActive]} onPress={() => { haptic.light(); setContentType('foreplay'); }}>
              <Text style={[styles.tripleToggleButtonText, contentType === 'foreplay' && styles.tripleToggleButtonTextActive]}>{t('favorites.foreplay_count', { count: favoriteForeplayItems.length })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tripleToggleButton, contentType === 'oral' && styles.tripleToggleButtonActive]} onPress={() => { haptic.light(); setContentType('oral'); }}>
              <Text style={[styles.tripleToggleButtonText, contentType === 'oral' && styles.tripleToggleButtonTextActive]}>{t('favorites.oral_count', { count: favoriteOralItems.length })}</Text>
            </TouchableOpacity>
          </View>
          {contentType === 'positions' && (favoritePositions.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>💜</Text><Text style={styles.emptyTitle}>{t('favorites.empty.positions.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.positions.subtitle')}</Text></View>
          ) : (
            <FlatList data={favoritePositions} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <PositionCard position={item} onPress={() => navigation.navigate('PositionDetail', { position: item })} />}
            />
          ))}
          {contentType === 'foreplay' && (favoriteForeplayItems.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>💜</Text><Text style={styles.emptyTitle}>{t('favorites.empty.foreplay.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.foreplay.subtitle')}</Text></View>
          ) : (
            <FlatList data={favoriteForeplayItems} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <ForeplayCard item={item} onPress={() => navigation.navigate('ForeplayDetail', { item })} />}
            />
          ))}
          {contentType === 'oral' && (favoriteOralItems.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>💜</Text><Text style={styles.emptyTitle}>{t('favorites.empty.oral.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.oral.subtitle')}</Text></View>
          ) : (
            <FlatList data={favoriteOralItems} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <OralPlayCard item={item} onPress={() => navigation.navigate('OralDetail', { item })} />}
            />
          ))}
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {recentlyTried.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🕐</Text><Text style={styles.emptyTitle}>{t('favorites.empty.recent.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.recent.subtitle')}</Text></View>
          ) : (
            recentlyTried.map((entry: any, index) => (
              <TouchableOpacity key={index} style={styles.recentlyTriedItem} onPress={() => {
                haptic.light();
                if (entry.type === 'position') navigation.navigate('PositionDetail', { position: entry.item });
                else if (entry.type === 'foreplay') navigation.navigate('ForeplayDetail', { item: entry.item });
                else navigation.navigate('OralDetail', { item: entry.item });
              }}>
                <Text style={styles.recentlyTriedEmoji}>{entry.type === 'position' ? '💑' : entry.type === 'foreplay' ? '💕' : '👄'}</Text>
                <View style={styles.recentlyTriedContent}>
                  <Text style={styles.recentlyTriedName}>{entry.item?.name}</Text>
                  <Text style={styles.recentlyTriedVibe}>{entry.item?.vibe}</Text>
                </View>
                <Text style={styles.recentlyTriedArrow}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

function ProfileScreen({ navigation }: any) {
  const store = useStore();
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [showAchievements, setShowAchievements] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const totalTried = store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length;
  const totalContent = positions.length + foreplayIdeas.length + oralPlayIdeas.length + massageTechniques.length + rolePlayScenarios.length;
  const currentLevel = getLevel(store.totalStars);
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);

  const handleLogout = () => {
    Alert.alert(
      t('profile.signout.title'),
      t('profile.signout.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.menu.signout'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              haptic.light();
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.signout.error'));
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenWrapper scroll>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { borderColor: currentLevel.color }]}><Text style={styles.avatarText}>{store.name?.charAt(0)?.toUpperCase() || user?.displayName?.charAt(0)?.toUpperCase() || '?'}</Text></View>
        <Text style={styles.profileName}>{store.name || user?.displayName || t('profile.friend')}</Text>
        <Text style={[styles.profileEmail, { color: themeColors.text.muted }]}>{user?.email}</Text>
        <Text style={[styles.profileLevel, { color: currentLevel.color }]}>{currentLevel.emoji} {currentLevel.title}</Text>
        <View style={styles.profileStarBadge}>
          <Text style={styles.profileStarText}>⭐ {t('profile.stars_earned', { count: store.totalStars })}</Text>
        </View>
        {store.pinCode && <Text style={styles.pinProtectedBadge}>🔐 {t('profile.protected')}</Text>}
      </View>

      {/* Streak Banner */}
      {store.currentStreak >= 1 && (
        <View style={styles.profileStreakBanner}>
          <Text style={styles.profileStreakText}>🔥 {t('profile.week_streak', { count: store.currentStreak })}</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statNumber}>{totalTried}</Text><Text style={styles.statLabel}>{t('stats.tried')}</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{store.favorites.length + store.favoriteForeplay.length + store.favoriteOral.length + store.favoriteMassage.length + store.favoriteRoleplay.length}</Text><Text style={styles.statLabel}>{t('stats.favorites')}</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{store.completedChallenges.length}</Text><Text style={styles.statLabel}>{t('stats.challenges')}</Text></View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>{t('profile.progress')}</Text>
        <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${(totalTried / totalContent) * 100}%` }]} /></View>
        <Text style={styles.progressText}>{t('profile.progress_text', { tried: totalTried, total: totalContent, percent: Math.round((totalTried / totalContent) * 100) })}</Text>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.profileActionsRow}>
        <TouchableOpacity style={styles.profileActionButton} onPress={() => setShowAchievements(true)}>
          <LinearGradient colors={['#f59e0b', '#ef4444']} style={styles.profileActionGradient}>
            <Text style={styles.profileActionEmoji}>🏆</Text>
            <Text style={styles.profileActionText}>{t('profile.achievements')}</Text>
            <Text style={styles.profileActionCount}>{store.earnedAchievements.length}/{ACHIEVEMENTS.length}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileActionButton} onPress={() => setShowInsights(true)}>
          <LinearGradient colors={['#06b6d4', '#8b5cf6']} style={styles.profileActionGradient}>
            <Text style={styles.profileActionEmoji}>📊</Text>
            <Text style={styles.profileActionText}>{t('profile.insights')}</Text>
            <Text style={styles.profileActionCount}>{t('profile.view_stats')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Recent Achievements */}
      {store.earnedAchievements.length > 0 && (
        <View style={styles.recentAchievementsSection}>
          <Text style={styles.sectionTitle}>{t('profile.recent_achievements')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {store.earnedAchievements.slice(-5).reverse().map(id => {
              const achievement = ACHIEVEMENTS.find(a => a.id === id);
              return achievement ? (
                <View key={id} style={styles.recentAchievementItem}>
                  <Text style={styles.recentAchievementEmoji}>{achievement.emoji}</Text>
                  <Text style={styles.recentAchievementName}>{achievement.name}</Text>
                </View>
              ) : null;
            })}
          </ScrollView>
        </View>
      )}

      {store.notes.length > 0 && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>{t('profile.notes', { count: store.notes.length })}</Text>
          {store.notes.slice(-3).reverse().map((note) => {
            const item = note.type === 'position' ? positions.find(p => p.id === note.itemId) : note.type === 'foreplay' ? foreplayIdeas.find(f => f.id === note.itemId) : note.type === 'massage' ? massageTechniques.find(m => m.id === note.itemId) : note.type === 'roleplay' ? rolePlayScenarios.find(r => r.id === note.itemId) : oralPlayIdeas.find(o => o.id === note.itemId);
            return (
              <View key={note.id} style={styles.notePreview}>
                <Text style={styles.notePreviewName}>{item?.name || t('profile.unknown')}</Text>
                <Text style={styles.notePreviewRating}>{'⭐'.repeat(note.rating)}</Text>
                <Text style={styles.notePreviewText} numberOfLines={1}>{note.text || t('profile.no_notes')}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowSettings(true)}>
          <Text style={styles.menuItemText}>⚙️  {t('profile.menu.settings')}</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowIdeas(true)}>
          <Text style={styles.menuItemText}>💡  {t('profile.menu.ideas')}</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowContact(true)}>
          <Text style={styles.menuItemText}>📧  {t('profile.menu.contact')}</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowTerms(true)}>
          <Text style={styles.menuItemText}>📜  {t('profile.menu.terms')}</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowPrivacy(true)}>
          <Text style={styles.menuItemText}>🔐  {t('profile.menu.privacy')}</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.logoutMenuItem]} onPress={handleLogout}>
          <Text style={[styles.menuItemText, { color: themeColors.error }]}>🚪  {t('profile.menu.signout')}</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>{t('profile.version')}</Text>

      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      <InsightsModal visible={showInsights} onClose={() => setShowInsights(false)} />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} navigation={navigation} />
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ContactModal visible={showContact} onClose={() => setShowContact(false)} />
      <IdeasModal visible={showIdeas} onClose={() => setShowIdeas(false)} />
    </ScreenWrapper>
  );
}
// ============================================
// DETAIL SCREENS
// ============================================
function PositionDetailScreen({ route, navigation }: any) {
  const { position }: { position: Position } = route.params;
  const { t, localizeTerm } = useI18n();
  const store = useStore();
  const isFavorite = store.favorites.includes(position.id);
  const isTried = store.tried.includes(position.id);
  const mood = moods.find((m) => m.id === position.mood);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === position.id && n.type === 'position');

  const handleMarkTried = () => {
    if (!isTried) {
      const result = store.logActivity('position', position.id);
      store.markTried(position.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    haptic.light();
    try {
      await Share.share({
        message: `💑 Check this out: "${position.name}"\n\n"${position.vibe}"\n\n${position.description}\n\n🔥 Found on Blisse - let's try it tonight!`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.detailHeader}>
            <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color }]}>
              <Text style={styles.detailMoodEmoji}>{mood?.emoji}</Text>
              <Text style={styles.detailMoodLabel}>{localizeTerm(mood?.label || '')}</Text>
            </View>
            <Text style={styles.detailTitle}>{position.name}</Text>
            <Text style={styles.detailCategory}>{localizeTerm(position.category)} • {localizeTerm(position.difficulty)}</Text>
            {!isTried && (
              <View style={styles.detailStarHint}>
                <Text style={styles.detailStarHintText}>
                  {position.difficulty === 'Advanced' ? t('detail.try_for_stars', { count: 5 }) : t('detail.try_for_stars', { count: 3 })}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{position.vibe}"</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
              <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
              <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptic.light(); store.toggleFavorite(position.id); }}>
              <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
              <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
              <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
            </TouchableOpacity>
          </View>
          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
          </TouchableOpacity>
          {existingNote && (
            <View style={styles.notePreviewDetail}>
              <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
              <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
            </View>
          )}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
            <Text style={styles.detailText}>{position.description}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
            <Text style={styles.detailText}>{position.howTo}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.why_it_works')}</Text>
            <Text style={styles.detailText}>{position.whyItWorks}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
            {position.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}><Text style={styles.tipBullet}>💡</Text><Text style={styles.tipText}>{tip}</Text></View>
            ))}
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.good_for')}</Text>
            <View style={styles.tagsContainer}>{position.goodFor.map((tag, index) => (<View key={index} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>))}</View>
          </View>
          <View style={[styles.detailSection, { marginBottom: 40 }]}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
            <View style={styles.tagsContainer}>{position.pairsWellWith.map((item, index) => (<View key={index} style={[styles.tag, styles.tagOutline]}><Text style={styles.tagTextOutline}>{item}</Text></View>))}</View>
          </View>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={position.id} itemType="position" itemName={position.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

function ForeplayDetailScreen({ route, navigation }: any) {
  const { item }: { item: ForeplayIdea } = route.params;
  const { t, localizeTerm } = useI18n();
  const store = useStore();
  const isFavorite = store.favoriteForeplay.includes(item.id);
  const isTried = store.triedForeplay.includes(item.id);
  const mood = moods.find((m) => m.id === item.mood);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'foreplay');

  const handleMarkTried = () => {
    if (!isTried) {
      const result = store.logActivity('foreplay', item.id);
      store.markForeplayTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    haptic.light();
    try {
      await Share.share({
        message: `💕 Check this out: "${item.name}"\n\n"${item.vibe}"\n\n${item.description}\n\n🔥 Found on Blisse - let's try it!`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.detailHeader}>
            <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color }]}>
              <Text style={styles.detailMoodEmoji}>{mood?.emoji}</Text>
              <Text style={styles.detailMoodLabel}>{localizeTerm(mood?.label || '')}</Text>
            </View>
            <Text style={styles.detailTitle}>{item.name}</Text>
            <Text style={styles.detailCategory}>{localizeTerm(item.category)} • {localizeTerm(item.duration)}</Text>
            {!isTried && (
              <View style={styles.detailStarHint}>
                <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 2 })}</Text>
              </View>
            )}
          </View>
          <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
              <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
              <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptic.light(); store.toggleForeplayFavorite(item.id); }}>
              <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
              <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
              <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
            </TouchableOpacity>
          </View>
          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
          </TouchableOpacity>
          {existingNote && (
            <View style={styles.notePreviewDetail}>
              <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
              <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
            </View>
          )}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
            <Text style={styles.detailText}>{item.description}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
            <Text style={styles.detailText}>{item.howTo}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
            {item.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}><Text style={styles.tipBullet}>💡</Text><Text style={styles.tipText}>{tip}</Text></View>
            ))}
          </View>
          <View style={[styles.detailSection, { marginBottom: 40 }]}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
            <View style={styles.tagsContainer}>
              {item.pairsWellWith.map((pos, index) => (
                <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => { const position = positions.find(p => p.name === pos); if (position) navigation.push('PositionDetail', { position }); }}>
                  <Text style={styles.tagTextOutline}>{pos}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="foreplay" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

function OralDetailScreen({ route, navigation }: any) {
  const { item }: { item: OralPlayIdea } = route.params;
  const { t, localizeTerm } = useI18n();
  const store = useStore();
  const isFavorite = store.favoriteOral?.includes(item.id) || false;
  const isTried = store.triedOral?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'oral');

  const handleMarkTried = () => {
    if (!isTried) {
      const result = store.logActivity('oral', item.id);
      store.markOralTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    haptic.light();
    try {
      await Share.share({
        message: `👄 Check this out: "${item.name}"\n\n"${item.vibe}"\n\n${item.description}\n\n🔥 Found on Blisse - interested?`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.detailHeader}>
            <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color }]}>
              <Text style={styles.detailMoodEmoji}>{mood?.emoji}</Text>
              <Text style={styles.detailMoodLabel}>{localizeTerm(mood?.label || '')}</Text>
            </View>
            <Text style={styles.detailTitle}>{item.name}</Text>
            <Text style={styles.detailCategory}>{localizeTerm(item.category)} • {item.giver === 'him' ? localizeTerm('He gives') : item.giver === 'her' ? localizeTerm('She gives') : localizeTerm('Mutual')}</Text>
            {!isTried && (
              <View style={styles.detailStarHint}>
                <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 2 })}</Text>
              </View>
            )}
          </View>
          <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
              <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
              <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptic.light(); store.toggleOralFavorite(item.id); }}>
              <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
              <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
              <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
            </TouchableOpacity>
          </View>
          {/* Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
          </TouchableOpacity>
          {existingNote && (
            <View style={styles.notePreviewDetail}>
              <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
              <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
            </View>
          )}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
            <Text style={styles.detailText}>{item.description}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
            <Text style={styles.detailText}>{item.howTo}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
            {item.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}><Text style={styles.tipBullet}>💡</Text><Text style={styles.tipText}>{tip}</Text></View>
            ))}
          </View>
          <View style={[styles.detailSection, { marginBottom: 40 }]}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
            <View style={styles.tagsContainer}>
              {item.pairsWellWith.map((pos, index) => (
                <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => { const position = positions.find(p => p.name === pos); if (position) navigation.push('PositionDetail', { position }); }}>
                  <Text style={styles.tagTextOutline}>{pos}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="oral" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// MASSAGE DETAIL SCREEN
// ============================================
function MassageDetailScreen({ route, navigation }: any) {
  const { item } = route.params as { item: MassageTechnique };
  const { t, localizeTerm } = useI18n();
  const store = useStore();
  const mood = moods.find((m) => m.id === item.mood);
  const isFavorite = store.favoriteMassage.includes(item.id);
  const isTried = store.triedMassage.includes(item.id);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'massage');

  const handleMarkTried = () => {
    if (!isTried) {
      const result = store.logActivity('massage', item.id);
      store.markMassageTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    haptic.light();
    try {
      await Share.share({
        message: `💆 Let's try this massage: "${item.name}"\n\n"${item.vibe}"\n\n${item.description}\n\n🔥 Found on Blisse`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.detailHeader}>
            <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
              <Text style={styles.detailMoodEmoji}>💆</Text>
              <Text style={styles.detailMoodLabel}>{localizeTerm(item.category)}</Text>
            </View>
            <Text style={styles.detailTitle}>{item.name}</Text>
            <Text style={styles.detailCategory}>{item.bodyArea} • {localizeTerm(item.duration)}</Text>
            {!isTried && (
              <View style={styles.detailStarHint}>
                <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 3 })}</Text>
              </View>
            )}
          </View>
          <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
              <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
              <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptic.light(); store.toggleMassageFavorite(item.id); }}>
              <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
              <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
              <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
          </TouchableOpacity>
          {existingNote && (
            <View style={styles.notePreviewDetail}>
              <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
              <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
            </View>
          )}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
            <Text style={styles.detailText}>{item.description}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
            <Text style={styles.detailText}>{item.howTo}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
            {item.tips.map((tip, index) => (
              <Text key={index} style={styles.detailTip}>• {tip}</Text>
            ))}
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
            <View style={styles.tagRow}>
              {item.pairsWellWith.map((pos, index) => (
                <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => { const position = positions.find(p => p.name === pos); if (position) navigation.push('PositionDetail', { position }); }}>
                  <Text style={styles.tagTextOutline}>{pos}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="massage" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// ROLEPLAY DETAIL SCREEN
// ============================================
function RolePlayDetailScreen({ route, navigation }: any) {
  const { item } = route.params as { item: RolePlayScenario };
  const { t, localizeTerm } = useI18n();
  const store = useStore();
  const mood = moods.find((m) => m.id === item.mood);
  const isFavorite = store.favoriteRoleplay.includes(item.id);
  const isTried = store.triedRoleplay.includes(item.id);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'roleplay');

  const handleMarkTried = () => {
    if (!isTried) {
      const result = store.logActivity('roleplay', item.id);
      store.markRoleplayTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    haptic.light();
    try {
      await Share.share({
        message: `🎭 Want to try this with me? "${item.name}"\n\n"${item.vibe}"\n\n${item.description}\n\n🔥 Found on Blisse`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const intensityColor = item.intensity === 'Light' ? colors.success : item.intensity === 'Medium' ? colors.warning : colors.error;

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.detailHeader}>
            <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
              <Text style={styles.detailMoodEmoji}>🎭</Text>
              <Text style={styles.detailMoodLabel}>{localizeTerm(item.category)}</Text>
            </View>
            <Text style={styles.detailTitle}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={styles.detailCategory}>{localizeTerm(item.category)} • </Text>
              <View style={[styles.intensityBadge, { backgroundColor: intensityColor + '30' }]}>
                <Text style={[styles.intensityText, { color: intensityColor }]}>{localizeTerm(item.intensity)}</Text>
              </View>
            </View>
            {!isTried && (
              <View style={styles.detailStarHint}>
                <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 4 })}</Text>
              </View>
            )}
          </View>
          <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
              <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
              <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptic.light(); store.toggleRoleplayFavorite(item.id); }}>
              <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
              <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
              <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
          </TouchableOpacity>
          {existingNote && (
            <View style={styles.notePreviewDetail}>
              <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
              <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
            </View>
          )}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.scenario')}</Text>
            <Text style={styles.detailText}>{item.description}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.setup')}</Text>
            <Text style={styles.detailText}>{item.setup}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to_play')}</Text>
            <Text style={styles.detailText}>{item.howToPlay}</Text>
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.tips_for_success')}</Text>
            {item.tips.map((tip, index) => (
              <Text key={index} style={styles.detailTip}>• {tip}</Text>
            ))}
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
            <View style={styles.tagRow}>
              {item.pairsWellWith.map((pos, index) => (
                <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => { const position = positions.find(p => p.name === pos); if (position) navigation.push('PositionDetail', { position }); }}>
                  <Text style={styles.tagTextOutline}>{pos}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="roleplay" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// SEASONAL CONTENT MODAL
// ============================================
function SeasonalModal({
  visible,
  onClose,
  navigation,
  onOpenTruthOrDare,
  onOpenDateNight,
  onOpenChallenge,
  onOpenSpinner,
}: {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  onOpenTruthOrDare?: () => void;
  onOpenDateNight?: () => void;
  onOpenChallenge?: () => void;
  onOpenSpinner?: () => void;
}) {
  const { language, t } = useI18n();
  const currentSeason = getCurrentSeason();
  const store = useStore();

  type SeasonalContentType = 'position' | 'foreplay' | 'oral' | 'roleplay';

  const seasonalRecommendations = useMemo(() => {
    void language;
    const season = currentSeason;
    if (!season) {
      return { positions: [], foreplay: [], oral: [], roleplay: [] };
    }

    const scoreSeasonalItem = (
      type: SeasonalContentType,
      item: { id: number; category?: string; mood?: string; difficulty?: string },
      isSeasonalSeed: boolean
    ): number => {
      const categoryScore = item.category ? (store.learningPreferences.categoryScores[item.category] || 50) : 50;
      const moodScore = item.mood ? (store.learningPreferences.moodScores[item.mood] || 50) : 50;
      const difficultyScore = item.difficulty ? (store.learningPreferences.difficultyScores[item.difficulty] || 50) : 50;
      const typeScore = store.learningPreferences.contentTypeScores[type] || 50;

      const triedSet = type === 'position'
        ? store.tried
        : type === 'foreplay'
          ? store.triedForeplay
          : type === 'oral'
            ? store.triedOral
            : store.triedRoleplay;

      const favoriteSet = type === 'position'
        ? store.favorites
        : type === 'foreplay'
          ? store.favoriteForeplay
          : type === 'oral'
            ? store.favoriteOral
            : store.favoriteRoleplay;

      const isTried = triedSet.includes(item.id);
      const isFavorite = favoriteSet.includes(item.id);
      const moodMatchBoost = store.currentMood && item.mood === store.currentMood ? 12 : 0;
      const noveltyBoost = isTried ? -3 : 8;
      const favoriteBoost = isFavorite ? 10 : 0;
      const seasonalBoost = isSeasonalSeed ? 18 : 0;

      return (
        50 +
        (categoryScore - 50) * 0.35 +
        (moodScore - 50) * 0.25 +
        (difficultyScore - 50) * 0.15 +
        (typeScore - 50) * 0.2 +
        moodMatchBoost +
        noveltyBoost +
        favoriteBoost +
        seasonalBoost
      );
    };

    const build = <T extends { id: number; category?: string; mood?: string; difficulty?: string }>(
      type: SeasonalContentType,
      items: T[],
      seasonalSeedIds: number[],
      limit: number
    ): T[] => {
      return [...items]
        .map(item => ({
          item,
          score: scoreSeasonalItem(type, item, seasonalSeedIds.includes(item.id)),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(entry => entry.item);
    };

    return {
      positions: build('position', positions, season.positions, 3),
      foreplay: build('foreplay', foreplayIdeas, season.foreplay, 3),
      oral: build('oral', oralPlayIdeas, season.oral, 3),
      roleplay: build('roleplay', rolePlayScenarios, season.roleplay, 2),
    };
  }, [
    language,
    currentSeason,
    store.currentMood,
    store.learningPreferences,
    store.tried,
    store.triedForeplay,
    store.triedOral,
    store.triedRoleplay,
    store.favorites,
    store.favoriteForeplay,
    store.favoriteOral,
    store.favoriteRoleplay,
  ]);

  const seasonalGameRecommendations = useMemo(() => {
    const season = currentSeason;
    if (!season) return [] as SeasonalGameOption[];

    const totalTried = store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length;

    const scoreGame = (gameId: SeasonalGameAction): number => {
      let score = 50;

      if (season.games.includes(gameId)) score += 28;
      if (store.currentMood === 'playful' && (gameId === 'truth_or_dare' || gameId === 'spin')) score += 12;
      if (store.currentMood === 'passionate' && gameId === 'date_night') score += 10;
      if (store.currentMood === 'commanding' && gameId === 'challenge') score += 10;

      if (gameId === 'challenge') score += store.currentChallenge ? -8 : 10;
      if (gameId === 'spin') score += totalTried < 20 ? 8 : 2;
      if (gameId === 'date_night') score += store.dateNightsCompleted < 3 ? 8 : 3;

      return score;
    };

    return (Object.keys(SEASONAL_GAME_OPTIONS) as SeasonalGameAction[])
      .map((gameId) => ({
        ...SEASONAL_GAME_OPTIONS[gameId],
        score: scoreGame(gameId),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score: _score, ...game }) => game);
  }, [
    currentSeason,
    store.currentMood,
    store.currentChallenge,
    store.dateNightsCompleted,
    store.tried.length,
    store.triedForeplay.length,
    store.triedOral.length,
    store.triedMassage.length,
    store.triedRoleplay.length,
  ]);

  if (!currentSeason) return null;

  const openSeasonalItem = (type: SeasonalContentType, item: any) => {
    store.trackInteraction({
      type: 'view',
      contentType: type,
      itemId: item.id,
      category: item.category,
      mood: item.mood,
      difficulty: type === 'position' ? item.difficulty : undefined,
    });

    onClose();
    if (type === 'position') navigation.navigate('PositionDetail', { position: item });
    if (type === 'foreplay') navigation.navigate('ForeplayDetail', { item });
    if (type === 'oral') navigation.navigate('OralDetail', { item });
    if (type === 'roleplay') navigation.navigate('RolePlayDetail', { item });
  };

  const openSeasonalGame = (gameId: SeasonalGameAction) => {
    onClose();

    if (gameId === 'truth_or_dare') {
      if (onOpenTruthOrDare) onOpenTruthOrDare();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.truth_or_dare'));
      return;
    }
    if (gameId === 'date_night') {
      if (onOpenDateNight) onOpenDateNight();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.date_night'));
      return;
    }
    if (gameId === 'challenge') {
      if (onOpenChallenge) onOpenChallenge();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.challenge'));
      return;
    }
    if (gameId === 'spin') {
      if (onOpenSpinner) onOpenSpinner();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.spin'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{currentSeason.emoji} {currentSeason.name}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{currentSeason.description}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tips Section */}
            <View style={[styles.seasonalTipsCard, { backgroundColor: currentSeason.color + '20' }]}>
              <Text style={styles.seasonalTipsTitle}>{t('seasonal.tips_title')}</Text>
              {currentSeason.tips.map((tip, index) => (
                <Text key={index} style={styles.seasonalTip}>• {tip}</Text>
              ))}
            </View>

            {/* Seasonal Games */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.games')}</Text>
            {seasonalGameRecommendations.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalGame(game.id)}
              >
                <Text style={styles.seasonalItemEmoji}>{game.emoji}</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{game.title}</Text>
                  <Text style={styles.seasonalItemVibe}>{game.description}</Text>
                </View>
                <View style={styles.seasonalGamePill}>
                  <Text style={styles.seasonalGamePillText}>{t('seasonal.play')}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Recommended Positions */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.positions')}</Text>
            {seasonalRecommendations.positions.map((pos) => (
              <TouchableOpacity 
                key={pos.id} 
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalItem('position', pos)}
              >
                <Text style={styles.seasonalItemEmoji}>💑</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{pos.name}</Text>
                  <Text style={styles.seasonalItemVibe}>{pos.vibe}</Text>
                </View>
                <Text style={styles.seasonalItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {seasonalRecommendations.positions.length === 0 && (
              <Text style={styles.seasonalEmptyText}>{t('seasonal.empty.positions')}</Text>
            )}

            {/* Recommended Foreplay */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.foreplay')}</Text>
            {seasonalRecommendations.foreplay.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalItem('foreplay', item)}
              >
                <Text style={styles.seasonalItemEmoji}>💕</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{item.name}</Text>
                  <Text style={styles.seasonalItemVibe}>{item.vibe}</Text>
                </View>
                <Text style={styles.seasonalItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {seasonalRecommendations.foreplay.length === 0 && (
              <Text style={styles.seasonalEmptyText}>{t('seasonal.empty.foreplay')}</Text>
            )}

            {/* Recommended Oral Play */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.oral')}</Text>
            {seasonalRecommendations.oral.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalItem('oral', item)}
              >
                <Text style={styles.seasonalItemEmoji}>👄</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{item.name}</Text>
                  <Text style={styles.seasonalItemVibe}>{item.vibe}</Text>
                </View>
                <Text style={styles.seasonalItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {seasonalRecommendations.oral.length === 0 && (
              <Text style={styles.seasonalEmptyText}>{t('seasonal.empty.oral')}</Text>
            )}

            {/* Recommended Role Play */}
            {seasonalRecommendations.roleplay.length > 0 && (
              <>
                <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.roleplay')}</Text>
                {seasonalRecommendations.roleplay.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.seasonalItemCard}
                    onPress={() => openSeasonalItem('roleplay', item)}
                  >
                    <Text style={styles.seasonalItemEmoji}>🎭</Text>
                    <View style={styles.seasonalItemInfo}>
                      <Text style={styles.seasonalItemName}>{item.name}</Text>
                      <Text style={styles.seasonalItemVibe}>{item.vibe}</Text>
                    </View>
                    <Text style={styles.seasonalItemArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// NAVIGATION
// ============================================
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { t } = useI18n();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: colors.background.primary, borderTopColor: colors.card, borderTopWidth: 1, height: 85, paddingBottom: 25, paddingTop: 10 }, tabBarActiveTintColor: colors.primary[400], tabBarInactiveTintColor: colors.text.muted }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabs.home'), tabBarIcon: ({ color: _color }) => <Text style={{ fontSize: 24 }}>🏠</Text> }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: t('tabs.explore'), tabBarIcon: ({ color: _color }) => <Text style={{ fontSize: 24 }}>🔍</Text> }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: t('tabs.favorites'), tabBarIcon: ({ color: _color }) => <Text style={{ fontSize: 24 }}>❤️</Text> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile'), tabBarIcon: ({ color: _color }) => <Text style={{ fontSize: 24 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="NameInput" component={NameInputScreen} />
      <Stack.Screen name="RelationshipType" component={RelationshipTypeScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { t } = useI18n();
  const store = useStore();
  const { user, loading: authLoading, initError } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  useEffect(() => { const timer = setTimeout(() => setIsReady(true), 100); return () => clearTimeout(timer); }, []);
  
  if (!isReady || authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌸</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 28, fontWeight: '700' }}>Blisse</Text>
        <Text style={{ color: themeColors.text.secondary, fontSize: 14, marginTop: 8 }}>{t('common.loading')}</Text>
        <ActivityIndicator color={themeColors.primary[500]} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 44, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>{t('app.auth_unavailable')}</Text>
        <Text style={{ color: themeColors.text.secondary, fontSize: 14, textAlign: 'center' }}>{initError}</Text>
      </View>
    );
  }
  
  // If not authenticated, show auth screen
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }
  
  // If authenticated but not onboarded, show onboarding
  if (!store.hasCompletedOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      </Stack.Navigator>
    );
  }
  
  // Authenticated and onboarded - show main app
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="PositionDetail" component={PositionDetailScreen} />
      <Stack.Screen name="ForeplayDetail" component={ForeplayDetailScreen} />
      <Stack.Screen name="OralDetail" component={OralDetailScreen} />
      <Stack.Screen name="MassageDetail" component={MassageDetailScreen} />
      <Stack.Screen name="RolePlayDetail" component={RolePlayDetailScreen} />
    </Stack.Navigator>
  );
}

// ============================================
// ANALYTICS FLUSHER COMPONENT
// ============================================
// This component sits inside PostHogProvider and flushes queued events
function AnalyticsFlusher() {
  const posthog = usePostHog();
  
  useEffect(() => {
    // Flush any pending events on mount and periodically
    const flushEvents = () => {
      const events = Analytics.getPendingEvents();
      events.forEach(({ event, properties }) => {
        posthog.capture(event, {
          ...ANALYTICS_BASE_PROPERTIES,
          ...sanitizeAnalyticsProperties(properties),
        }, { disableGeoip: true });
      });
    };
    
    flushEvents();
    const interval = setInterval(flushEvents, 10000); // Flush every 10 seconds
    
    return () => clearInterval(interval);
  }, [posthog]);
  
  return null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const language = useStore.getState().language;
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A0F24', padding: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>😔</Text>
          <Text style={{ fontSize: 20, color: '#FFF', textAlign: 'center', marginBottom: 10 }}>{translateUi(language, 'app.error.title')}</Text>
          <Text style={{ fontSize: 14, color: '#AAA', textAlign: 'center' }}>{translateUi(language, 'app.error.restart')}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Inner App Component that uses the store
function AppContent({ enableAnalytics = false }: { enableAnalytics?: boolean }) {
  const store = useStore();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAppState = async () => {
      // Wait for persisted store hydration first.
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Migrate existing PIN from legacy AsyncStorage state into secure storage once.
      const currentPin = useStore.getState().pinCode;
      const securePin = await loadPinFromSecureStorage();
      if (currentPin && !securePin) {
        await savePinToSecureStorage(currentPin);
      } else if (!currentPin && securePin) {
        useStore.getState().setPinCode(securePin);
      } else if (currentPin && securePin && currentPin !== securePin) {
        useStore.getState().setPinCode(securePin);
      }

      if (isMounted) {
        setIsReady(true);
      }
    };

    void initializeAppState();

    const appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        setIsUnlocked(false);
        return;
      }

      if (useStore.getState().hasAgreedToTerms) {
        void ensureDailyJokeTeaserNotifications();
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isReady || !store.hasAgreedToTerms) return;
    void ensureDailyJokeTeaserNotifications();
  }, [isReady, store.hasAgreedToTerms]);

  // Show loading while store hydrates
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A0F24' }}>
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  // If PIN is set and not unlocked, show lock screen
  if (store.pinCode && !isUnlocked) {
    return (
      <SafeAreaProvider>
        <AppLockScreen onUnlock={() => setIsUnlocked(true)} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {enableAnalytics ? <AnalyticsFlusher /> : null}
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

export default function App() {
  // PostHog configuration
  const posthogOptions: PostHogOptions = {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    personProfiles: 'never',
    setDefaultPersonProperties: false,
    captureAppLifecycleEvents: false,
    enableSessionReplay: false,
    sendFeatureFlagEvent: false,
    preloadFeatureFlags: false,
    disableGeoip: true,
    disableRemoteConfig: true,
    disableSurveys: true,
    persistence: 'memory',
  };
  const posthogConfig = {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
    options: posthogOptions,
  };

  // Firebase now initializes lazily inside AuthProvider
  // No need to check here - AuthProvider handles initialization errors gracefully

  return (
    <ErrorBoundary>
      <AuthProvider>
        {posthogConfig.apiKey ? (
          <PostHogProvider apiKey={posthogConfig.apiKey} options={posthogConfig.options} autocapture={false}>
            <AppContent enableAnalytics />
          </PostHogProvider>
        ) : (
          <AppContent />
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContainer: { paddingBottom: 40 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenContent: { flex: 1, paddingTop: 20 },
  logoContainer: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
  bloom: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center' },
  bloomCore: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFAF0' },
  titleLarge: { fontSize: 48, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.text.secondary, textAlign: 'center', lineHeight: 24 },
  buttons: { paddingBottom: 40 },
  primaryButton: { paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  secondaryButton: { marginTop: 16, alignItems: 'center' },
  secondaryButtonText: { color: colors.text.muted, fontSize: 14 },
  linkText: { color: colors.primary[400] },
  backButton: { paddingVertical: 10 },
  backButtonText: { color: colors.text.secondary, fontSize: 16 },
  textInput: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 18, color: colors.text.primary, marginTop: 30 },
  optionsContainer: { marginTop: 30 },
  optionCard: { backgroundColor: colors.card, borderRadius: 12, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  optionCardSelected: { borderColor: colors.primary[500], backgroundColor: colors.cardLight },
  optionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary },
  optionTitleSelected: { color: colors.primary[400] },
  optionSubtitle: { fontSize: 14, color: colors.text.muted, marginTop: 4 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  chip: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  chipSelected: { backgroundColor: colors.primary[500], borderColor: colors.primary[400] },
  chipText: { color: colors.text.primary, fontSize: 14 },
  chipTextSelected: { color: '#FFF', fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginTop: 30, borderWidth: 2, borderColor: 'transparent' },
  checkboxRowSelected: { borderColor: colors.primary[500] },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.text.muted, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  checkboxText: { flex: 1, color: colors.text.primary, fontSize: 14, lineHeight: 20 },
  homeHeader: { paddingTop: 10, marginBottom: 16 },
  homeHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 14, color: colors.text.secondary },
  homeSparkBanner: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.cardLight, padding: 14, marginBottom: 16 },
  homeSparkBannerHeadline: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  homeSparkBannerBody: { color: colors.text.secondary, fontSize: 13, lineHeight: 18 },
  starCounter: { backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  starCounterText: { color: '#1a1a1a', fontWeight: '700', fontSize: 14 },
  streakBanner: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  streakBannerText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },
  dailyJokeCard: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.cardLight },
  dailyJokeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dailyJokeTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  dailyJokeDate: { fontSize: 11, color: colors.text.muted },
  dailyJokeSetup: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  dailyJokeRevealButton: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.primary[500] + '25' },
  dailyJokeRevealText: { color: colors.primary[400], fontSize: 13, fontWeight: '600' },
  dailyJokePunchlineBox: { marginTop: 10, backgroundColor: colors.cardLight, borderRadius: 12, padding: 10 },
  dailyJokePunchlineLabel: { color: colors.text.muted, fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  dailyJokePunchline: { color: colors.text.primary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  tonightCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  tonightGradient: { padding: 24 },
  tonightLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  tonightTitle: { color: '#FFF', fontSize: 26, fontWeight: '700', marginBottom: 4 },
  tonightSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  tonightTeaser: { color: 'rgba(255,255,255,0.88)', fontSize: 13, marginTop: 10, lineHeight: 18 },
  newBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 12 },
  newBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  featureButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  featureButton: { flex: 1, marginHorizontal: 4, borderRadius: 16, overflow: 'hidden' },
  featureButtonGradient: { paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', minHeight: 118 },
  featureButtonEmoji: { fontSize: 24, marginBottom: 4 },
  featureButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginBottom: 3 },
  featureButtonSubtext: { color: 'rgba(255,255,255,0.88)', fontSize: 10, textAlign: 'center', lineHeight: 13 },
  quickStatsRow: { flexDirection: 'row', marginBottom: 16 },
  quickStatCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  quickStatEmoji: { fontSize: 20, marginBottom: 4 },
  quickStatNumber: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  quickStatLabel: { fontSize: 11, color: colors.text.muted },
  challengePreview: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#22c55e' },
  challengePreviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  challengePreviewLabel: { color: colors.text.secondary, fontSize: 12 },
  challengePreviewReward: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  challengePreviewName: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 12, marginTop: 10 },
  moodScroll: { marginBottom: 16 },
  horizontalScrollContent: { paddingRight: 20 },
  moodChip: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  moodChipText: { color: colors.text.primary, fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.muted, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text.primary },
  clearButton: { padding: 4 },
  clearButtonText: { color: colors.text.muted, fontSize: 16 },
  exploreHeader: { paddingTop: 10, marginBottom: 16 },
  tripleToggleContainer: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 4, marginBottom: 12 },
  tripleToggleButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tripleToggleButtonActive: { backgroundColor: colors.primary[500] },
  tripleToggleButtonText: { color: colors.text.muted, fontSize: 12 },
  tripleToggleButtonTextActive: { color: '#FFF', fontWeight: '600' },
  sortContainer: { flexDirection: 'row', marginBottom: 12 },
  sortButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8, backgroundColor: colors.card },
  sortButtonActive: { backgroundColor: colors.primary[500] },
  sortButtonText: { fontSize: 12, color: colors.text.muted },
  sortButtonTextActive: { color: '#FFF', fontWeight: '600' },
  categoryWrapper: { marginBottom: 12 },
  categoryScrollContent: { paddingRight: 20 },
  categoryChip: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryChipSelected: { backgroundColor: colors.primary[500] },
  categoryChipText: { color: colors.text.muted, fontSize: 14 },
  categoryChipTextSelected: { color: '#FFF', fontWeight: '600' },
  positionGrid: { paddingBottom: 20 },
  positionRow: { justifyContent: 'space-between' },
  positionCard: { width: CARD_WIDTH, backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  triedBadge: { color: colors.success, fontSize: 14, marginRight: 8, fontWeight: '700' },
  positionMoodBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  positionMoodEmoji: { fontSize: 16 },
  favoriteIcon: { fontSize: 18 },
  positionName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  positionCategory: { fontSize: 12, color: colors.text.secondary, marginBottom: 6 },
  positionVibe: { fontSize: 12, color: colors.text.muted, fontStyle: 'italic', marginBottom: 10 },
  positionFooter: { flexDirection: 'row' },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  difficultyBeginner: { backgroundColor: 'rgba(132, 204, 22, 0.2)' },
  difficultyIntermediate: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  difficultyAdvanced: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  difficultyText: { fontSize: 10, color: colors.text.secondary, fontWeight: '600' },
  durationBadge: { backgroundColor: 'rgba(6, 182, 212, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  durationText: { fontSize: 10, color: '#06b6d4', fontWeight: '600' },
  giverBadge: { backgroundColor: 'rgba(168, 85, 247, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  giverText: { fontSize: 10, color: colors.text.secondary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.text.muted },
  viewToggleContainer: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 4, marginBottom: 12 },
  viewToggleButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  viewToggleButtonActive: { backgroundColor: colors.primary[500] },
  viewToggleText: { color: colors.text.muted, fontSize: 13 },
  viewToggleTextActive: { color: '#FFF', fontWeight: '600' },
  recentlyTriedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  recentlyTriedEmoji: { fontSize: 24, marginRight: 12 },
  recentlyTriedContent: { flex: 1 },
  recentlyTriedName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  recentlyTriedVibe: { fontSize: 12, color: colors.text.muted },
  recentlyTriedArrow: { fontSize: 18, color: colors.text.muted },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary[500], justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  profileName: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  profileStarBadge: { backgroundColor: colors.gold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  profileStarText: { color: '#1a1a1a', fontWeight: '700', fontSize: 14 },
  profileStreakBanner: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  profileStreakText: { color: '#ef4444', fontWeight: '600' },
  progressSection: { marginBottom: 20 },
  progressBar: { height: 8, backgroundColor: colors.card, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  progressText: { fontSize: 12, color: colors.text.muted },
  profileActionsRow: { flexDirection: 'row', marginBottom: 20 },
  profileActionButton: { flex: 1, marginHorizontal: 4, borderRadius: 16, overflow: 'hidden' },
  profileActionGradient: { padding: 16, alignItems: 'center' },
  profileActionEmoji: { fontSize: 28, marginBottom: 4 },
  profileActionText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  profileActionCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  recentAchievementsSection: { marginBottom: 20 },
  recentAchievementItem: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginRight: 10, alignItems: 'center', width: 80 },
  recentAchievementEmoji: { fontSize: 28, marginBottom: 4 },
  recentAchievementName: { fontSize: 10, color: colors.text.primary, textAlign: 'center' },
  notesSection: { marginBottom: 20 },
  notePreview: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  notePreviewName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  notePreviewRating: { fontSize: 12, marginVertical: 4 },
  notePreviewText: { fontSize: 12, color: colors.text.muted },
  notePreviewDetail: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 16 },
  menuSection: { marginTop: 10 },
  menuItem: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  menuItemText: { fontSize: 16, color: colors.text.primary },
  detailScrollContent: { paddingBottom: 40 },
  detailHeader: { alignItems: 'center', paddingVertical: 20 },
  detailMoodBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  detailMoodEmoji: { fontSize: 20, marginRight: 8 },
  detailMoodLabel: { fontSize: 14, color: '#FFF', fontWeight: '600' },
  detailTitle: { fontSize: 32, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  detailCategory: { fontSize: 14, color: colors.text.secondary },
  detailStarHint: { backgroundColor: 'rgba(251, 191, 36, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  detailStarHintText: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  detailVibe: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 20 },
  detailVibeText: { fontSize: 16, color: colors.text.primary, fontStyle: 'italic', textAlign: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginHorizontal: 4, marginBottom: 8 },
  actionBtnActive: { backgroundColor: 'rgba(132, 204, 22, 0.2)' },
  actionBtnFavorite: { backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  actionBtnNotes: { backgroundColor: 'rgba(168, 85, 247, 0.2)' },
  actionBtnIcon: { fontSize: 16, marginRight: 6 },
  actionBtnText: { fontSize: 13, color: colors.text.primary },
  detailSection: { marginBottom: 24 },
  detailSectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 12 },
  detailText: { fontSize: 15, color: colors.text.secondary, lineHeight: 24 },
  detailTip: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 8, paddingLeft: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tipRow: { flexDirection: 'row', marginBottom: 10 },
  tipBullet: { fontSize: 14, marginRight: 10 },
  tipText: { flex: 1, fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(168, 85, 247, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 12, color: colors.primary[400] },
  tagOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary[400] },
  tagTextOutline: { fontSize: 12, color: colors.primary[400] },
  starBadge: { backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  starBadgeText: { color: '#1a1a1a', fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  modalClose: { fontSize: 24, color: colors.text.muted, padding: 4 },
  modalSubtitle: { fontSize: 14, color: colors.text.secondary, marginBottom: 20 },
  spinTypeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  spinTypeButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  spinTypeButtonActive: { backgroundColor: colors.primary[500] },
  spinTypeText: { fontSize: 20 },
  spinTypeTextActive: { fontSize: 20 },
  spinnerContainer: { alignItems: 'center', marginVertical: 30 },
  spinnerWheel: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: colors.primary[500] },
  spinnerEmoji: { fontSize: 48 },
  spinnerResult: { alignItems: 'center', marginBottom: 20 },
  spinnerResultType: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  spinnerResultName: { fontSize: 24, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  spinnerResultVibe: { fontSize: 14, color: colors.text.muted, textAlign: 'center', fontStyle: 'italic', marginBottom: 16 },
  viewResultButton: { backgroundColor: colors.card, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  viewResultButtonText: { color: colors.primary[400], fontSize: 14, fontWeight: '600' },
  spinButton: { borderRadius: 30, overflow: 'hidden', marginTop: 10 },
  spinButtonDisabled: { opacity: 0.6 },
  spinButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  spinButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  dateNightStep: { marginBottom: 16 },
  dateNightStepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dateNightStepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary[500], color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center', lineHeight: 28, marginRight: 10, overflow: 'hidden' },
  dateNightStepLabel: { fontSize: 14, color: colors.text.secondary },
  dateNightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  dateNightCardEmoji: { fontSize: 28, marginRight: 12 },
  dateNightCardContent: { flex: 1 },
  dateNightCardName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  dateNightCardVibe: { fontSize: 12, color: colors.text.muted },
  dateNightCardArrow: { fontSize: 18, color: colors.text.muted },
  completeDateNightButton: { borderRadius: 30, overflow: 'hidden', marginTop: 16 },
  completeDateNightGradient: { paddingVertical: 16, alignItems: 'center' },
  completeDateNightText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  regenerateButton: { backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  regenerateButtonText: { color: colors.text.primary, fontSize: 16 },
  challengeCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  challengeType: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  challengeName: { fontSize: 22, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  challengeVibe: { fontSize: 14, color: colors.text.muted, textAlign: 'center', fontStyle: 'italic', marginBottom: 12 },
  challengeReward: { backgroundColor: 'rgba(251, 191, 36, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 16 },
  challengeRewardText: { color: colors.gold, fontWeight: '600' },
  challengeViewButton: { backgroundColor: colors.cardLight, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  challengeViewButtonText: { color: colors.primary[400], fontSize: 14, fontWeight: '600' },
  completeButton: { borderRadius: 30, overflow: 'hidden', marginBottom: 12 },
  completeButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  completeButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  skipButton: { alignItems: 'center', paddingVertical: 12 },
  skipButtonText: { color: colors.text.muted, fontSize: 14 },
  challengeStats: { alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.card },
  challengeStatsText: { fontSize: 14, color: colors.text.secondary },
  noChallengeContainer: { alignItems: 'center', paddingVertical: 30 },
  noChallengeEmoji: { fontSize: 64, marginBottom: 16 },
  noChallengeTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  noChallengeSubtitle: { fontSize: 14, color: colors.text.muted, textAlign: 'center', marginBottom: 24 },
  generateChallengeButton: { borderRadius: 30, overflow: 'hidden' },
  generateChallengeGradient: { paddingVertical: 16, paddingHorizontal: 32 },
  generateChallengeText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  notesItemName: { fontSize: 18, fontWeight: '600', color: colors.text.primary, textAlign: 'center', marginBottom: 20 },
  notesLabel: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  ratingStar: { fontSize: 32, marginHorizontal: 4 },
  notesInput: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text.primary, minHeight: 120, textAlignVertical: 'top', marginBottom: 20 },
  notesButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  deleteNoteButton: { paddingVertical: 12, paddingHorizontal: 20, marginRight: 12 },
  deleteNoteButtonText: { color: colors.error, fontSize: 14 },
  saveNoteButton: { borderRadius: 20, overflow: 'hidden' },
  saveNoteGradient: { paddingVertical: 12, paddingHorizontal: 24 },
  saveNoteText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  celebrationOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  celebrationContent: { backgroundColor: colors.background.primary, borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', maxWidth: 320 },
  celebrationEmoji: { fontSize: 72, marginBottom: 16 },
  celebrationTitle: { fontSize: 36, fontWeight: '700', color: colors.gold, marginBottom: 8 },
  celebrationSubtitle: { fontSize: 16, color: colors.text.secondary, marginBottom: 24 },
  achievementEarnedContainer: { backgroundColor: colors.card, borderRadius: 16, padding: 16, width: '100%', marginBottom: 24 },
  achievementEarnedTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 12, textAlign: 'center' },
  achievementEarnedItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  achievementEarnedEmoji: { fontSize: 28, marginRight: 12 },
  achievementEarnedName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  achievementEarnedDesc: { fontSize: 12, color: colors.text.muted },
  celebrationButton: { backgroundColor: colors.primary[500], paddingHorizontal: 32, paddingVertical: 14, borderRadius: 25 },
  celebrationButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  achievementProgress: { color: colors.text.secondary, fontSize: 14, marginBottom: 20 },
  achievementCategory: { marginBottom: 24 },
  achievementCategoryTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 12 },
  achievementItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  achievementItemLocked: { opacity: 0.5 },
  achievementEmoji: { fontSize: 28, marginRight: 12 },
  achievementEmojiLocked: { opacity: 0.5 },
  achievementInfo: { flex: 1 },
  achievementName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  achievementNameLocked: { color: colors.text.muted },
  achievementDesc: { fontSize: 12, color: colors.text.muted },
  achievementDescLocked: { color: colors.text.muted },
  achievementCheck: { color: colors.success, fontSize: 18, fontWeight: '700' },
  insightCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  insightCardTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 16, textAlign: 'center' },
  insightStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  insightStat: { alignItems: 'center' },
  insightStatNumber: { fontSize: 24, fontWeight: '700', color: colors.text.primary },
  insightStatLabel: { fontSize: 12, color: colors.text.muted, marginTop: 4 },
  comparisonCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  comparisonTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12 },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  comparisonLabel: { fontSize: 14, color: colors.text.muted },
  comparisonValue: { fontSize: 14, fontWeight: '600' },
  comparisonUp: { color: colors.success },
  comparisonDown: { color: colors.error },
  streakCard: { backgroundColor: colors.card, borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  streakEmoji: { fontSize: 40, marginBottom: 8 },
  streakNumber: { fontSize: 48, fontWeight: '700', color: colors.text.primary },
  streakLabel: { fontSize: 14, color: colors.text.muted },
  streakMessage: { fontSize: 14, color: colors.success, marginTop: 8 },
  recentActivityCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 20 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.cardLight },
  activityEmoji: { fontSize: 20, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, color: colors.text.primary },
  activityDate: { fontSize: 11, color: colors.text.muted },
  activityStars: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  // Share Button Styles
  shareButton: { backgroundColor: colors.card, borderRadius: 12, padding: 14, alignItems: 'center', marginVertical: 12, borderWidth: 1, borderColor: colors.primary[400] },
  shareButtonText: { color: colors.primary[400], fontSize: 15, fontWeight: '600' },
  
  // ============================================
  // LEVEL SYSTEM STYLES
  // ============================================
  levelCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelEmoji: { fontSize: 36, marginRight: 12 },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 20, fontWeight: '700' },
  levelSubtitle: { fontSize: 12, color: colors.text.muted },
  levelNextBadge: { backgroundColor: colors.cardLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelNextText: { fontSize: 12, color: colors.text.secondary },
  levelProgressBar: { height: 8, backgroundColor: colors.cardLight, borderRadius: 4, overflow: 'hidden' },
  levelProgressFill: { height: '100%', borderRadius: 4 },
  levelProgressText: { fontSize: 11, color: colors.text.muted, marginTop: 6, textAlign: 'center' },
  levelMotivatorText: { fontSize: 12, color: colors.text.secondary, marginTop: 8, textAlign: 'center' },

  // ============================================
  // WEEKLY GOALS STYLES
  // ============================================
  weeklyProgressContainer: { alignItems: 'center', marginBottom: 20 },
  weeklyProgressBar: { width: '100%', height: 10, backgroundColor: colors.cardLight, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  weeklyProgressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 5 },
  weeklyProgressText: { fontSize: 14, color: colors.text.secondary },
  goalCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  goalCardCompleted: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  goalEmoji: { fontSize: 28, marginRight: 12 },
  goalInfo: { flex: 1 },
  goalDescription: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 6 },
  goalProgressRow: { flexDirection: 'row', alignItems: 'center' },
  goalMiniProgress: { flex: 1, height: 6, backgroundColor: colors.cardLight, borderRadius: 3, overflow: 'hidden', marginRight: 8 },
  goalMiniProgressFill: { height: '100%', backgroundColor: colors.primary[500], borderRadius: 3 },
  goalProgressText: { fontSize: 12, color: colors.text.muted, minWidth: 40 },
  goalReward: { backgroundColor: colors.gold + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  goalRewardText: { fontSize: 12, color: colors.gold, fontWeight: '600' },
  allGoalsComplete: { alignItems: 'center', paddingVertical: 20 },
  allGoalsCompleteEmoji: { fontSize: 48, marginBottom: 8 },
  allGoalsCompleteText: { fontSize: 16, color: colors.success, fontWeight: '600' },
  weeklyGoalsPreview: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  weeklyGoalsPreviewTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary, flex: 1 },
  weeklyGoalsPreviewProgress: { flexDirection: 'row', marginRight: 10 },
  weeklyGoalDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cardLight, marginHorizontal: 2 },
  weeklyGoalDotComplete: { backgroundColor: colors.success },
  weeklyGoalsPreviewText: { fontSize: 12, color: colors.text.muted },

  // ============================================
  // DAILY BONUS STYLES
  // ============================================
  dailyBonusContent: { backgroundColor: colors.background.primary, borderRadius: 24, padding: 32, alignItems: 'center', width: '85%', maxWidth: 320 },
  dailyBonusEmoji: { fontSize: 72, marginBottom: 16 },
  dailyBonusTitle: { fontSize: 28, fontWeight: '700', color: colors.gold, marginBottom: 8 },
  dailyBonusSubtitle: { fontSize: 16, color: colors.text.secondary, marginBottom: 24, textAlign: 'center' },
  dailyBonusButton: { borderRadius: 25, overflow: 'hidden', width: '100%' },
  dailyBonusButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  dailyBonusButtonText: { color: '#1a1a1a', fontSize: 16, fontWeight: '700' },

  // ============================================
  // LEVEL UP STYLES
  // ============================================
  levelUpContent: { backgroundColor: colors.background.primary, borderRadius: 24, padding: 32, alignItems: 'center', width: '85%', maxWidth: 320 },
  levelUpEmoji: { fontSize: 80, marginBottom: 16 },
  levelUpTitle: { fontSize: 32, fontWeight: '700', color: colors.gold, marginBottom: 8 },
  levelUpNewLevel: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  levelUpSubtitle: { fontSize: 16, color: colors.text.secondary, marginBottom: 24 },

  // ============================================
  // MOOD PLAYLISTS STYLES
  // ============================================
  playlistCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  playlistCardActive: { borderWidth: 2, borderColor: colors.primary[500] },
  playlistEmojiBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  playlistEmoji: { fontSize: 24 },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
  playlistDescription: { fontSize: 13, color: colors.text.muted },
  playlistCheck: { fontSize: 20, color: colors.success, fontWeight: '700' },

  // ============================================
  // RECOMMENDATIONS STYLES
  // ============================================
  recSection: { marginBottom: 20 },
  recHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  recEmoji: { fontSize: 20, marginRight: 8 },
  recTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  recCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  recCardContent: { flex: 1 },
  recItemName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  recItemReason: { fontSize: 12, marginTop: 2 },
  recItemVibe: { fontSize: 12, color: colors.text.muted, flex: 2, marginHorizontal: 10 },
  recItemArrow: { fontSize: 16, color: colors.text.muted, marginLeft: 8 },
  recScoreBadge: { backgroundColor: colors.primary[500] + '30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  recScoreText: { fontSize: 11, fontWeight: '600', color: colors.primary[400] },
  noRecsContainer: { alignItems: 'center', paddingVertical: 40 },
  noRecsEmoji: { fontSize: 48, marginBottom: 16 },
  noRecsText: { fontSize: 14, color: colors.text.muted, textAlign: 'center' },
  noRecsSubtext: { fontSize: 12, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  
  // Smart Learning Preference Summary
  prefSummaryContainer: { padding: 12, borderRadius: 12, marginBottom: 16 },
  prefSummaryTitle: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  prefTagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  prefTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, marginBottom: 4 },
  prefTagText: { fontSize: 11, fontWeight: '500' },

  // ============================================
  // CONTENT TYPE TABS (5 tabs)
  // ============================================
  contentTypeScroll: { marginBottom: 14 },
  contentTypeScrollContent: { paddingHorizontal: 4, paddingRight: 8 },
  contentTypeTab: { minWidth: 118, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, marginRight: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLight, alignItems: 'center', justifyContent: 'center' },
  contentTypeTabActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[400] },
  contentTypeTabText: { fontSize: 13, color: colors.text.secondary, fontWeight: '600' },
  contentTypeTabTextActive: { color: '#FFF', fontWeight: '600' },

  // ============================================
  // INTENSITY BADGE (for roleplay cards)
  // ============================================
  intensityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  intensityText: { fontSize: 10, fontWeight: '600' },

  // ============================================
  // SEASONAL STYLES
  // ============================================
  seasonalTipsCard: { borderRadius: 12, padding: 16, marginBottom: 20 },
  seasonalTipsTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 10 },
  seasonalTip: { fontSize: 14, color: colors.text.secondary, marginBottom: 6, paddingLeft: 4 },
  seasonalSectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 10, marginTop: 10 },
  seasonalItemCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  seasonalItemEmoji: { fontSize: 24, marginRight: 12 },
  seasonalItemInfo: { flex: 1 },
  seasonalItemName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  seasonalItemVibe: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  seasonalItemArrow: { fontSize: 16, color: colors.text.muted },
  seasonalGamePill: { backgroundColor: colors.primary[500] + '35', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  seasonalGamePillText: { color: colors.primary[400], fontSize: 12, fontWeight: '700' },
  seasonalEmptyText: { fontSize: 13, color: colors.text.muted, marginBottom: 8 },

  // ============================================
  // SEASONAL CARD (Home Screen)
  // ============================================
  seasonalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2 },
  seasonalCardEmoji: { fontSize: 36, marginRight: 14 },
  seasonalCardInfo: { flex: 1 },
  seasonalCardTitle: { fontSize: 18, fontWeight: '700' },
  seasonalCardSubtitle: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  seasonalCardHook: { fontSize: 12, color: colors.text.secondary, marginTop: 4, lineHeight: 16 },
  seasonalCardArrow: { fontSize: 20, color: colors.text.muted },

  // ============================================
  // TRUTH OR DARE STYLES
  // ============================================
  intensitySelector: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  intensityOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: colors.card, margin: 4, backgroundColor: colors.card },
  intensityOptionText: { fontSize: 13, color: colors.text.secondary },
  todCard: { borderRadius: 16, padding: 24, borderWidth: 2, marginBottom: 24, minHeight: 150, justifyContent: 'center' },
  todCardType: { fontSize: 14, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  todCardText: { fontSize: 18, color: colors.text.primary, textAlign: 'center', lineHeight: 26 },
  todPlaceholder: { backgroundColor: colors.card, borderRadius: 16, padding: 40, alignItems: 'center', marginBottom: 24 },
  todPlaceholderEmoji: { fontSize: 48, marginBottom: 12 },
  todPlaceholderText: { fontSize: 14, color: colors.text.muted, textAlign: 'center' },
  todButtonsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  todButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 25, marginHorizontal: 8 },
  todButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  todRandomButton: { borderRadius: 25, overflow: 'hidden' },
  todRandomGradient: { paddingHorizontal: 40, paddingVertical: 14, alignItems: 'center' },
  todRandomText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  // ============================================
  // MUSIC PLAYLISTS STYLES
  // ============================================
  musicPlaylistCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 12 },
  musicPlaylistName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  musicPlaylistDesc: { fontSize: 13, color: colors.text.muted, marginBottom: 12 },
  musicButtonsRow: { flexDirection: 'row' },
  musicButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  musicButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // ============================================
  // SETTINGS STYLES
  // ============================================
  settingsSectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text.muted, marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 8 },
  settingsItemText: { fontSize: 15, color: colors.text.primary },
  settingsItemValue: { fontSize: 14, color: colors.text.muted },
  languageDropdown: { backgroundColor: colors.card, borderRadius: 12, padding: 8, marginBottom: 12 },
  languageOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  languageOptionActive: { backgroundColor: colors.primary[500] + '25' },
  languageOptionText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  languageOptionTextActive: { color: colors.primary[400], fontWeight: '700' },
  languageOptionCheck: { color: colors.primary[400], fontSize: 14, fontWeight: '700' },
  pinSetupContainer: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  pinSetupTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 16, textAlign: 'center' },
  pinInput: { backgroundColor: colors.cardLight, borderRadius: 8, padding: 14, fontSize: 18, color: colors.text.primary, textAlign: 'center', marginBottom: 12, letterSpacing: 8 },
  pinError: { color: colors.error, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  pinButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pinCancelButton: { flex: 1, padding: 12, marginRight: 8, borderRadius: 8, backgroundColor: colors.cardLight, alignItems: 'center' },
  pinCancelText: { color: colors.text.muted, fontSize: 14 },
  pinSaveButton: { flex: 1, padding: 12, marginLeft: 8, borderRadius: 8, backgroundColor: colors.primary[500], alignItems: 'center' },
  pinSaveText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  // ============================================
  // LEGAL/TERMS STYLES
  // ============================================
  legalTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  legalDate: { fontSize: 12, color: colors.text.muted, marginBottom: 20 },
  legalSection: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 16, marginBottom: 8 },
  legalText: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 8 },

  // ============================================
  // CONTACT/IDEAS STYLES
  // ============================================
  contactInput: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 15, color: colors.text.primary, marginBottom: 12 },
  contactTextarea: { minHeight: 120, textAlignVertical: 'top' },
  contactSendButton: { borderRadius: 25, overflow: 'hidden', marginTop: 8 },
  contactSendGradient: { paddingVertical: 16, alignItems: 'center' },
  contactSendText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  contactPrivacyNote: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 16 },
  contactCategoryRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  contactCategoryButton: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.card, marginHorizontal: 6 },
  contactCategoryButtonActive: { backgroundColor: colors.primary[500] + '30', borderWidth: 1, borderColor: colors.primary[500] },
  contactCategoryEmoji: { fontSize: 20, marginBottom: 2 },
  contactCategoryText: { fontSize: 11, color: colors.text.muted },
  contactCategoryTextActive: { color: colors.primary[400] },
  ideaTypeRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  ideaTypeButton: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.card, marginHorizontal: 6 },
  ideaTypeButtonActive: { backgroundColor: colors.primary[500] + '30', borderWidth: 1, borderColor: colors.primary[500] },
  ideaTypeEmoji: { fontSize: 24, marginBottom: 4 },
  ideaTypeText: { fontSize: 12, color: colors.text.muted },
  ideaTypeTextActive: { color: colors.primary[400] },
  
  // Success state
  successContainer: { alignItems: 'center', paddingVertical: 40 },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  successText: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  successButton: { backgroundColor: colors.primary[500], paddingHorizontal: 40, paddingVertical: 14, borderRadius: 25 },
  successButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  // ============================================
  // APP LOCK SCREEN STYLES
  // ============================================
  lockScreenContainer: { flex: 1 },
  lockScreenContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  lockScreenTitle: { fontSize: 32, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  lockScreenSubtitle: { fontSize: 16, color: colors.text.muted, marginBottom: 40 },
  pinDotsRow: { flexDirection: 'row', marginBottom: 20 },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.text.muted, marginHorizontal: 8 },
  pinDotFilled: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  lockScreenError: { color: colors.error, fontSize: 14, marginBottom: 20 },
  numPad: { width: '100%', maxWidth: 280 },
  numPadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  numPadButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
  numPadText: { fontSize: 28, color: colors.text.primary },

  // ============================================
  // PROFILE EXTRAS
  // ============================================
  profileLevel: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  profileEmail: { fontSize: 12, marginTop: 2 },
  pinProtectedBadge: { fontSize: 12, color: colors.success, marginTop: 8 },
  menuItemArrow: { fontSize: 16, color: colors.text.muted },
  logoutMenuItem: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.card, paddingTop: 16 },
  versionText: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 20, marginBottom: 40 },

  // ============================================
  // AUTH SCREEN STYLES
  // ============================================
  authScrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  authHeader: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  authLogo: { fontSize: 64, marginBottom: 16 },
  authTitle: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  authSubtitle: { fontSize: 15, textAlign: 'center' },
  authErrorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 12, borderRadius: 12, marginBottom: 16 },
  authErrorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  authInputContainer: { marginBottom: 16 },
  authInputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  authInput: { borderRadius: 12, padding: 16, fontSize: 16 },
  authPasswordContainer: { position: 'relative' },
  authPasswordInput: { paddingRight: 50 },
  authPasswordToggle: { position: 'absolute', right: 16, top: 16 },
  authForgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  authForgotPasswordText: { fontSize: 14 },
  authButton: { borderRadius: 25, overflow: 'hidden', marginBottom: 16 },
  authButtonDisabled: { opacity: 0.7 },
  authButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  authButtonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  authDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  authDividerLine: { flex: 1, height: 1 },
  authDividerText: { paddingHorizontal: 16, fontSize: 14 },
  appleButton: { backgroundColor: '#000', borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  appleButtonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  authSwitchContainer: { alignItems: 'center', marginTop: 16 },
  authSwitchText: { fontSize: 15 },

  // ============================================
  // THEME SELECTOR STYLES
  // ============================================
  themeSelectorContainer: { marginBottom: 16 },
  themeSelectorLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12, color: colors.text.primary },
  themeSelectorScroll: { marginHorizontal: -8 },
  themeOption: { width: 100, padding: 12, borderRadius: 12, marginHorizontal: 6, alignItems: 'center' },
  themeColorPreview: { width: 40, height: 40, borderRadius: 20, marginBottom: 8 },
  themeEmoji: { fontSize: 20, marginBottom: 4 },
  themeName: { fontSize: 11, textAlign: 'center' },
  themeSelectedBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  themeSelectedText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  // ============================================
  // FONT SIZE SELECTOR STYLES
  // ============================================
  fontSelectorContainer: { marginBottom: 16 },
  fontSizeOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  fontSizeOption: { flex: 1, padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center', borderWidth: 2 },
  fontSizePreview: { fontWeight: '600', marginBottom: 4 },
  fontSizeLabel: { fontSize: 12 },

  // ============================================
  // ANIMATION STYLES
  // ============================================
  confettiContainer: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  pulseHeartContainer: { alignItems: 'center', justifyContent: 'center' },

  // ============================================
  // ENHANCED LEGAL SCREEN STYLES
  // ============================================
  legalCheckSection: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  legalCheckHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  legalCheckTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  legalCheckSummary: { fontSize: 13, color: colors.text.muted, lineHeight: 20, marginBottom: 12 },
  readButton: { backgroundColor: colors.primary[500] + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  readButtonText: { fontSize: 12, color: colors.primary[400], fontWeight: '600' },
  legalHint: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 8 },
  legalHighlightBox: { backgroundColor: colors.primary[500] + '15', borderLeftWidth: 4, borderLeftColor: colors.primary[500], borderRadius: 8, padding: 16 },
  legalHighlightTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  legalHighlightTextSmall: { fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
  scrollHint: { alignItems: 'center', paddingVertical: 16 },
  scrollHintText: { fontSize: 13, color: colors.primary[400] },
  legalConfirmButton: { backgroundColor: colors.primary[500], paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginTop: 12 },
  legalConfirmButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
