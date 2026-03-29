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
  DAILY_JOKE_SETUPS_ES, DAILY_JOKE_SETUPS_PT, DAILY_JOKE_SETUPS_HI,
  DAILY_JOKE_PUNCHLINES_ES, DAILY_JOKE_PUNCHLINES_PT, DAILY_JOKE_PUNCHLINES_HI,
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
  'Why did the naughty grin refuse to clock out?',
  'What\'s the best way to start a rematch?',
  'Why did the dim lights suddenly get brighter?',
  'Why did the blush spread faster than planned?',
  'What\'s tonight\'s quickest way to feel unstoppable?',
  'What did the little challenge card whisper?',
  'Why did the silk tie decide tonight was non-negotiable?',
  'What did the 2 a.m. notification really mean?',
  'Why did the single candle look so smug?',
  'What did one satin sheet say to the other at 11:45 pm?',
  'What\'s the most flirtatious way to burn 300 calories?',
  'Why did the full-length mirror demand better lighting?',
  'What did the red rose say right before sunset?',
  'Why did the zipper suddenly find everything hilarious?',
  'What\'s a couple\'s favorite form of cardio that needs no gym?',
  'Why did both pillows file for overtime pay?',
  'What did the lace slip say when the clock struck midnight?',
  'What\'s the fastest legal way to raise core body temperature?',
  'Why did moonlight apply for permanent resident status?',
  'What did the sneaky wink send at exactly 9:14 pm?',
  'Why did the living-room couch start feeling seriously neglected?',
  'What\'s the one invisible ingredient that turns good chemistry nuclear?',
  'Why did the favorite lipstick re-apply twice in three minutes?',
  'What did that long, slow, dangerous glance actually promise?',
  'Why did the champagne cork pop 40 minutes early?',
  'What\'s the only homework assignment neither person ever complains about?',
  'Why did the neck kiss receive instant standing ovation?',
  'What did the slowest slow-dance of the night quietly swear?',
  'Why did that one blanket declare tonight official destiny?',
  'What\'s the most mischievous way adults say \'hello\' after 10 pm?',
  'What did the signature perfume announce as it entered the room?',
  'Why did the ten-second countdown feel more like foreplay?',
  'What\'s the warmest possible winter indoor sport for two?',
  'Why did the date-night kitchen timer file for divorce?',
  'What did the after-dinner look actually say?',
  'Why did the first kiss immediately text for a sequel?',
  'Why did the candle look extra smug tonight?',
  'What did one silk sheet whisper to the other?',
  'Why was the bedroom playlist smirking before play?',
  'What\'s secretly the sexiest way to torch calories?',
  'Why did the robe suddenly feel underdressed?',
  'What did the kitchen counter brag about after midnight?',
  'Why did the second kiss arrive with so much confidence?',
  'What did the slow exhale promise before anything even started?',
  'Why did the hallway suddenly become the main event?',
  'What\'s the flirtiest way to say “five more minutes”?',
  'Why did the playful dare refuse to stay hypothetical?',
  'What did the half-buttoned shirt do to raise suspicion?',
  'Why did the teasing text earn a gold medal?',
  'What did the locked door quietly agree to?',
  'Why did the bath steam start acting smug?',
  'What did one ankle brush say to the other?',
  'Why did the dessert spoon never make it back to the sink?',
  'What did the whispered “come here” actually mean?',
  'Why did the oversized hoodie lose its innocence?',
  'What\'s the coziest way to ruin a perfectly good bedtime?',
  'Why did the back-of-the-neck kiss deserve a sequel?',
  'What did the countdown app accidentally turn into?',
  'Why did the soft lamp choose such flattering timing?',
  'What\'s the fastest route from cuddling to trouble?',
  'Why did the “goodnight” message sound suspiciously ambitious?',
  'What did the bare shoulder dare the room to do?',
  'Why did the edge of the bed become everyone’s favorite stage?',
  'What did the velvet voice leave lingering in the air?',
  'Why did the shared laugh suddenly become dangerous?',
  'What did the hand at the small of the back quietly announce?',
  'Why did the champagne flute feel completely unnecessary?',
  'What\'s the boldest thing a soft blanket has ever covered for?',
  'Why did the almost-kiss hold the room hostage?',
  'What did the rain outside know that we didn’t?',
  'Why did the lamp switch get pressed like it meant something?',
  'What did the tiny pause between songs make possible?',
  'Why did the after-dinner walk never reach the front door?',
  'What did the playful eyebrow raise sign off on?',
  'Why did the midnight snack turn into a full detour?',
  'What did the mirror catch before anyone else did?',
  'Why did the countdown to bedtime feel wildly optimistic?',
  'What\'s the sweetest way to lose an entire evening?',
  'Why did the warm towel suddenly feel like foreplay?',
  'What did the couch armrest learn the hard way?',
];

export const DAILY_JOKE_SETUPS = createLocalizedArrayProxy<string>({
  en: _DAILY_JOKE_SETUPS_EN, es: DAILY_JOKE_SETUPS_ES, pt: DAILY_JOKE_SETUPS_PT, hi: DAILY_JOKE_SETUPS_HI,
});

const _DAILY_JOKE_PUNCHLINES_EN: string[] = [
  'Because this vibe deserves overtime… and the best bonuses come after hours.',
  'You\'re about to remember this scent… and forget every excuse you ever had.',
  'They heard tonight\'s playlist was about to drop the beat… and our clothes right after.',
  'Because tonight is about rhythm, not rushing… but the cheeks didn\'t get the memo.',
  'One well-timed plot twist that turned out ridiculously cute.',
  '"Meet me halfway… and let\'s lose track of time together."',
  'It still has unfinished business with your lower lip.',
  'Things are officially catching fire… and we\'re out of marshmallows.',
  '"Bring your best look… because I already brought mine."',
  '"Anticipation has been doing push-ups all week for this."',
  'I\'m not being dramatic… I\'m just very efficient.',
  'It knew cozy was only one tiny step away from spicy.',
  'One killer compliment + one very bold first move.',
  '"Come closer… the petals are just the trailer."',
  'It heard someone opened the flirt tab five minutes ago.',
  'Winner gets bragging rights… and an extra-long victory kiss.',
  '"Stick with me… tonight just got a lot smoother."',
  'Blankets + body heat = certified happy chaos.',
  'Because flirting turned out to be the ultimate foreplay.',
  'Tension? What tension? It disappears on skin contact.',
  'Because a smile + a kiss = no further questions needed.',
  'The first round was just the warm-up lap.',
  'Every outfit tonight has a dangerously short runtime.',
  'Partner squats… with bonus giggles included.',
  'The mood was already too good to keep waiting.',
  'Two songs in and the to-do list officially no longer exists.',
  'Confidence… served with a generous side of playful chaos.',
  'No one is agreeing to stop after just one round.',
  'Because the punchline is you wearing exactly that look.',
  'One whispered line + one dangerously daring smile.',
  'Truth, dare, or kiss — pick any, we\'re doing all three anyway.',
  'Longer kisses, shorter excuses — new official ratio.',
  'The audience demanded an encore performance.',
  'It was clearly trying to say: save room for dessert round two.',
  'It wanted to be fully appreciated before it inevitably gets smudged.',
  'Same heartbeat, same delicious kind of trouble.',
  'Tonight\'s forecast: 100% chance of sparks, no umbrella needed.',
  'This vibe officially deserves overtime pay.',
  'You\'re about to remember this exact perfume… forever.',
  'It tied the whole evening to your favorite smile.',
  'It knew cuddling could easily upgrade to full-contact sport.',
  'Tonight runs on rhythm… zero rush allowed.',
  'Because the plot twist ended up being unfairly adorable.',
  'Because it knew modesty was only making a guest appearance.',
  'It was absolutely certain it deserved front-row access.',
  'Because round two showed up dressed like it owned the place.',
  'That tonight had no interest in staying hypothetical.',
  'Because chemistry refuses to respect room boundaries.',
  '“Stay close… I’m not done making this difficult.”',
  'It was tired of being treated like a suggestion.',
  'It stopped pretending this was still a casual evening.',
  'Because suspense is hotter when it arrives in writing.',
  'That privacy was about to become a team sport.',
  'Because warm water and bad intentions are a dangerous mix.',
  '“We are definitely not behaving ourselves tonight.”',
  'Because it found a better use for our attention span.',
  'That self-control officially clocked out first.',
  'Because oversized comfort sometimes comes with undersized patience.',
  'One soft kiss too many and bedtime lost all authority.',
  'Because one perfect spot deserves repeat business.',
  'A harmless timer… with wildly unharmless consequences.',
  'Because soft lighting loves a confident decision.',
  'One cuddle too deep and the map changed completely.',
  'Because “goodnight” was clearly just opening remarks.',
  'That the room had officially joined the flirting.',
  'Because balance is overrated when the view is this good.',
  'A voice like that should come with a warning label.',
  'Because playful turns serious the second breathing changes.',
  'That trouble had excellent posture and great timing.',
  'Because bubbles are charming until focus disappears.',
  'It was hiding evidence of very good decisions.',
  'Because unfinished kisses are cruel and unusual.',
  'That weather had absolutely nothing to do with the heat in here.',
  'Because ambiance is just foreplay with electricity.',
  'A two-second pause… and suddenly no one remembered the lyrics.',
  'Because some walks are just long routes back to temptation.',
  'That consent can still look dangerously confident.',
  'Because nobody really wanted the snack.',
  'A reflection of two people pretending they still had restraint.',
  'Because bedtime was an adorable little lie.',
  'One soft start and the whole night changed genre.',
  'Because comfort got promoted to chemistry.',
  'That boundaries are very flexible when the towel is warm.',
];

export const DAILY_JOKE_PUNCHLINES = createLocalizedArrayProxy<string>({
  en: _DAILY_JOKE_PUNCHLINES_EN, es: DAILY_JOKE_PUNCHLINES_ES, pt: DAILY_JOKE_PUNCHLINES_PT, hi: DAILY_JOKE_PUNCHLINES_HI,
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

interface DailyJokeNotificationOptions {
  enabled?: boolean;
  forceRefresh?: boolean;
}

let dailyJokeSchedulingPromise: Promise<void> | null = null;

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
    (['en', 'es', 'pt', 'hi'] as AppLanguage[]).forEach((language) => {
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

const parseStoredIds = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  } catch {
    return [];
  }
};

const extractTypeFromNotificationData = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null;
  const maybeType = (data as { type?: unknown }).type;
  return typeof maybeType === 'string' ? maybeType : null;
};

const getScheduledDailyJokeNotificationIds = async (): Promise<string[]> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled
    .filter((request) => extractTypeFromNotificationData(request.content.data) === 'daily_joke_tease')
    .map((request) => request.identifier);
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
  if (language === 'es') return 'Toca para ver la respuesta.';
  if (language === 'pt') return 'Toque para ver a resposta.';
  if (language === 'hi') return 'जवाब देखने के लिए टैप करें।';
  return 'Tap to see the answer.';
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

export const clearDailyJokeTeaserNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  const existingIdsRaw = await AsyncStorage.getItem(DAILY_JOKE_NOTIFICATION_IDS_KEY);
  const existingIds = parseStoredIds(existingIdsRaw);
  const pendingDailyIds = await getScheduledDailyJokeNotificationIds();
  const idsToCancel = Array.from(new Set([...existingIds, ...pendingDailyIds]));

  if (idsToCancel.length > 0) {
    await Promise.all(
      idsToCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined))
    );
  }

  await AsyncStorage.multiRemove([
    DAILY_JOKE_NOTIFICATION_IDS_KEY,
    DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY,
  ]);
};

export const ensureDailyJokeTeaserNotifications = async (
  options: DailyJokeNotificationOptions = {}
): Promise<void> => {
  if (Platform.OS === 'web') return;

  if (dailyJokeSchedulingPromise) {
    await dailyJokeSchedulingPromise;
    return;
  }

  dailyJokeSchedulingPromise = (async () => {
    const { enabled = true, forceRefresh = false } = options;
    if (!enabled) {
      await clearDailyJokeTeaserNotifications();
      return;
    }

    const now = new Date();
    const language = getCurrentLanguage();
    const jokeBank = await getDailyJokeBank();
    const refreshAtRaw = await AsyncStorage.getItem(DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY);
    const pendingDailyIds = await getScheduledDailyJokeNotificationIds();
    const hasFutureDailyTeasers = pendingDailyIds.length > 0;
    if (!forceRefresh && refreshAtRaw && new Date(refreshAtRaw) > now && hasFutureDailyTeasers) {
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
    const existingIds = parseStoredIds(existingIdsRaw);
    const idsToCancel = Array.from(new Set([...existingIds, ...pendingDailyIds]));
    if (idsToCancel.length > 0) {
      await Promise.all(
        idsToCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined))
      );
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
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: adjustedFireDate,
        },
      });
      scheduledIds.push(id);
      scheduledCountByDate.set(dateKey, currentCount + 1);
    }

    const refreshAt = new Date(now);
    refreshAt.setDate(refreshAt.getDate() + DAILY_JOKE_NOTIFICATION_REFRESH_WINDOW_DAYS);

    await AsyncStorage.setItem(DAILY_JOKE_NOTIFICATION_IDS_KEY, JSON.stringify(scheduledIds));
    await AsyncStorage.setItem(DAILY_JOKE_NOTIFICATION_REFRESH_AT_KEY, refreshAt.toISOString());
  })().catch((error) => {
    console.warn('Daily joke notification scheduling failed:', error);
  });

  try {
    await dailyJokeSchedulingPromise;
  } finally {
    dailyJokeSchedulingPromise = null;
  }
};
