/**
 * Daily joke system.
 *
 * Provides a deterministic joke-of-the-day drawn from a local fallback bank
 * or a remote Firestore bank (cached with a configurable TTL).  Also handles
 * scheduling daily teaser notifications.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase';
import { createLocalizedArrayProxy, getCurrentLanguage } from '@/i18n/languageGetter';
import type { AppLanguage } from '@/i18n/translations';
import {
  DAILY_JOKE_SETUPS_ES, DAILY_JOKE_SETUPS_PT,
  DAILY_JOKE_PUNCHLINES_ES, DAILY_JOKE_PUNCHLINES_PT,
} from '@/i18n/translatedJokes';
import {
  DAILY_JOKE_BANK_CACHE_KEY,
  DAILY_JOKE_BANK_CACHE_TTL_MS,
  DAILY_JOKE_BANK_DOC_PATH,
  getDailyJokeNotificationTitle,
  DAILY_JOKE_NOTIFICATION_HOUR,
  DAILY_JOKE_NOTIFICATION_MINUTE,
  DAILY_JOKE_QUIET_HOURS_START,
  DAILY_JOKE_QUIET_HOURS_END,
  DAILY_JOKE_NOTIFICATION_FREQUENCY_CAP_PER_DAY,
  DAILY_JOKE_NOTIFICATION_DAYS_AHEAD,
  DAILY_JOKE_NOTIFICATION_REFRESH_WINDOW_DAYS,
  DAILY_JOKE_NOTIFICATION_IDS_KEY,
  DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY,
} from '@/constants/appConfig';

// ============================================
// LOCAL FALLBACK JOKE BANKS
// ============================================

const _DAILY_JOKE_SETUPS_EN: string[] = [
  'Why did the candle blush on date night?',
  'What did one silk sheet say to the other?',
  'Why was the bedroom playlist smiling?',
  'What is the flirtiest way to burn calories?',
  'Why did the mirror ask for a front-row seat?',
  'What did the rose whisper at sunset?',
  'Why did the zipper start laughing?',
  "What's a couple's favorite cardio?",
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
  "What's tonight's quickest confidence boost?",
  'Why did the kiss ask for round two?',
  'What did the playful challenge card say?',
  'Why did the silk ribbon tie up the evening?',
  'What did the midnight message tease?',
];

export const DAILY_JOKE_SETUPS = createLocalizedArrayProxy<string>({
  en: _DAILY_JOKE_SETUPS_EN, es: DAILY_JOKE_SETUPS_ES, pt: DAILY_JOKE_SETUPS_PT,
});

const _DAILY_JOKE_PUNCHLINES_EN: string[] = [
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

export const DAILY_JOKE_PUNCHLINES = createLocalizedArrayProxy<string>({
  en: _DAILY_JOKE_PUNCHLINES_EN, es: DAILY_JOKE_PUNCHLINES_ES, pt: DAILY_JOKE_PUNCHLINES_PT,
});

// ============================================
// INTERFACES
// ============================================

export interface DailyJoke {
  id: string;
  setup: string;
  punchline: string;
}

export interface DailyJokeBank {
  setups: string[];
  punchlines: string[];
  version?: string;
  localized?: Partial<Record<AppLanguage, { setups: string[]; punchlines: string[] }>>;
}

export interface DailyJokeBankCache {
  fetchedAt: number;
  bank: DailyJokeBank;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const isWithinQuietHours = (hour: number): boolean => {
  if (DAILY_JOKE_QUIET_HOURS_START < DAILY_JOKE_QUIET_HOURS_END) {
    return hour >= DAILY_JOKE_QUIET_HOURS_START && hour < DAILY_JOKE_QUIET_HOURS_END;
  }
  return hour >= DAILY_JOKE_QUIET_HOURS_START || hour < DAILY_JOKE_QUIET_HOURS_END;
};

const applyQuietHours = (date: Date): Date => {
  const adjusted = new Date(date);
  if (isWithinQuietHours(adjusted.getHours())) {
    adjusted.setHours(DAILY_JOKE_QUIET_HOURS_END, DAILY_JOKE_NOTIFICATION_MINUTE, 0, 0);
  }
  return adjusted;
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

export const normalizeDailyJokeBank = (raw: unknown): DailyJokeBank | null => {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as {
    setups?: unknown;
    punchlines?: unknown;
    version?: unknown;
    localized?: unknown;
  };
  const setups = sanitizeJokePartList(candidate.setups);
  const punchlines = sanitizeJokePartList(candidate.punchlines);
  if (setups.length < 10 || punchlines.length < 10) return null;

  const punchlinePeriod = punchlines.length / gcd(punchlines.length, 13);
  const yearlyCycle = lcm(setups.length, punchlinePeriod);
  if (yearlyCycle < 366) {
    console.warn('Remote daily joke bank rejected: cycle must cover at least 366 unique days.');
    return null;
  }

  const localized: Partial<Record<AppLanguage, { setups: string[]; punchlines: string[] }>> = {};
  if (candidate.localized && typeof candidate.localized === 'object') {
    const localizedRaw = candidate.localized as Record<string, unknown>;
    (['en', 'es', 'pt'] as AppLanguage[]).forEach((language) => {
      const node = localizedRaw[language];
      if (!node || typeof node !== 'object') return;
      const languageNode = node as { setups?: unknown; punchlines?: unknown };
      const localizedSetups = sanitizeJokePartList(languageNode.setups);
      const localizedPunchlines = sanitizeJokePartList(languageNode.punchlines);
      if (localizedSetups.length >= 10 && localizedPunchlines.length >= 10) {
        localized[language] = { setups: localizedSetups, punchlines: localizedPunchlines };
      }
    });
  }

  return {
    setups,
    punchlines,
    version: typeof candidate.version === 'string' ? candidate.version.trim() : undefined,
    localized,
  };
};

// ============================================
// CACHE OPERATIONS
// ============================================

export const readCachedDailyJokeBank = async (allowStale = false): Promise<DailyJokeBank | null> => {
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

export const writeCachedDailyJokeBank = async (bank: DailyJokeBank): Promise<void> => {
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

// ============================================
// REMOTE FETCHING
// ============================================

export const fetchRemoteDailyJokeBank = async (): Promise<DailyJokeBank | null> => {
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

export const getDailyJokeBank = async (forceRemote = false): Promise<DailyJokeBank | null> => {
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

// ============================================
// JOKE-OF-THE-DAY SELECTION
// ============================================

const getLocalizedFallbackSetups = (language: AppLanguage): string[] => {
  if (language === 'es') return DAILY_JOKE_SETUPS_ES;
  if (language === 'pt') return DAILY_JOKE_SETUPS_PT;
  return _DAILY_JOKE_SETUPS_EN;
};

const getLocalizedFallbackPunchlines = (language: AppLanguage): string[] => {
  if (language === 'es') return DAILY_JOKE_PUNCHLINES_ES;
  if (language === 'pt') return DAILY_JOKE_PUNCHLINES_PT;
  return _DAILY_JOKE_PUNCHLINES_EN;
};

const getJokeNotificationSuffix = (language: AppLanguage): string => {
  if (language === 'es') return 'Abre Blisse para ver el remate.';
  if (language === 'pt') return 'Abra o Blisse para ver a piada completa.';
  return 'Open Blisse for the punchline.';
};

export const getDailyJokeForDate = (
  date: Date,
  bank?: DailyJokeBank | null,
  language: AppLanguage = getCurrentLanguage(),
): DailyJoke => {
  const localizedRemote = bank?.localized?.[language];
  const useRemoteDefault = language === 'en' && bank?.setups?.length && bank?.punchlines?.length;
  const setups = localizedRemote?.setups?.length
    ? localizedRemote.setups
    : useRemoteDefault
      ? bank!.setups
      : getLocalizedFallbackSetups(language);
  const punchlines = localizedRemote?.punchlines?.length
    ? localizedRemote.punchlines
    : useRemoteDefault
      ? bank!.punchlines
      : getLocalizedFallbackPunchlines(language);
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

// ============================================
// DAILY JOKE TEASER NOTIFICATIONS
// ============================================

export const ensureDailyJokeTeaserNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  try {
    const now = new Date();
    const language = getCurrentLanguage();
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
    const scheduledCountByDate = new Map<string, number>();
    for (let offset = 0; offset < DAILY_JOKE_NOTIFICATION_DAYS_AHEAD; offset += 1) {
      const fireDate = new Date();
      fireDate.setDate(fireDate.getDate() + offset);
      fireDate.setHours(DAILY_JOKE_NOTIFICATION_HOUR, DAILY_JOKE_NOTIFICATION_MINUTE, 0, 0);

      const adjustedFireDate = applyQuietHours(fireDate);
      const dateKey = getDateKey(adjustedFireDate);
      const currentCount = scheduledCountByDate.get(dateKey) || 0;
      if (currentCount >= DAILY_JOKE_NOTIFICATION_FREQUENCY_CAP_PER_DAY) continue;
      if (adjustedFireDate <= now) continue;

      const joke = getDailyJokeForDate(adjustedFireDate, jokeBank, language);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: getDailyJokeNotificationTitle(),
          body: `${joke.setup} ${getJokeNotificationSuffix(language)}`,
          sound: false,
          data: { type: 'daily_joke_tease', jokeId: joke.id, dateKey },
        },
        trigger: adjustedFireDate as any,
      });
      scheduledIds.push(id);
      scheduledCountByDate.set(dateKey, currentCount + 1);
    }

    const refreshAt = new Date(now);
    refreshAt.setDate(refreshAt.getDate() + DAILY_JOKE_NOTIFICATION_REFRESH_WINDOW_DAYS);

    await AsyncStorage.setItem(DAILY_JOKE_NOTIFICATION_IDS_KEY, JSON.stringify(scheduledIds));
    await AsyncStorage.setItem(DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY, refreshAt.toISOString());
  } catch (error) {
    console.warn('Daily joke notification scheduling failed:', error);
  }
};
