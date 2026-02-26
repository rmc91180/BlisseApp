import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase';
import {
  FEATURE_FLAGS_CACHE_KEY,
  FEATURE_FLAGS_CACHE_TTL_MS,
  FEATURE_FLAGS_DOC_PATH,
} from '@/constants/appConfig';

export interface FeatureFlags {
  showSeasonalCard: boolean;
  enableDailyJokes: boolean;
  enableWeeklyRecap: boolean;
  enableReactivationReminder: boolean;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  showSeasonalCard: true,
  enableDailyJokes: true,
  enableWeeklyRecap: true,
  enableReactivationReminder: true,
};

interface FeatureFlagsCache {
  fetchedAt: number;
  flags: FeatureFlags;
}

const sanitizeFlags = (raw: unknown): FeatureFlags => {
  if (!raw || typeof raw !== 'object') return DEFAULT_FEATURE_FLAGS;
  const source = raw as Partial<FeatureFlags>;
  return {
    showSeasonalCard: typeof source.showSeasonalCard === 'boolean' ? source.showSeasonalCard : DEFAULT_FEATURE_FLAGS.showSeasonalCard,
    enableDailyJokes: typeof source.enableDailyJokes === 'boolean' ? source.enableDailyJokes : DEFAULT_FEATURE_FLAGS.enableDailyJokes,
    enableWeeklyRecap: typeof source.enableWeeklyRecap === 'boolean' ? source.enableWeeklyRecap : DEFAULT_FEATURE_FLAGS.enableWeeklyRecap,
    enableReactivationReminder:
      typeof source.enableReactivationReminder === 'boolean'
        ? source.enableReactivationReminder
        : DEFAULT_FEATURE_FLAGS.enableReactivationReminder,
  };
};

const readCachedFeatureFlags = async (allowStale = false): Promise<FeatureFlags | null> => {
  try {
    const raw = await AsyncStorage.getItem(FEATURE_FLAGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FeatureFlagsCache;
    const flags = sanitizeFlags(parsed?.flags);
    const fetchedAt = Number(parsed?.fetchedAt || 0);
    const isFresh = fetchedAt > 0 && Date.now() - fetchedAt <= FEATURE_FLAGS_CACHE_TTL_MS;
    if (!allowStale && !isFresh) return null;
    return flags;
  } catch {
    return null;
  }
};

const writeCachedFeatureFlags = async (flags: FeatureFlags): Promise<void> => {
  const payload: FeatureFlagsCache = {
    fetchedAt: Date.now(),
    flags,
  };
  await AsyncStorage.setItem(FEATURE_FLAGS_CACHE_KEY, JSON.stringify(payload));
};

export const fetchRemoteFeatureFlags = async (): Promise<FeatureFlags | null> => {
  try {
    const db = getFirebaseDb();
    if (!db) return null;
    const docSnap = await getDoc(doc(db, FEATURE_FLAGS_DOC_PATH[0], FEATURE_FLAGS_DOC_PATH[1]));
    if (!docSnap.exists()) return null;
    return sanitizeFlags(docSnap.data());
  } catch {
    return null;
  }
};

export const getFeatureFlags = async (forceRemote = false): Promise<FeatureFlags> => {
  if (!forceRemote) {
    const cached = await readCachedFeatureFlags(false);
    if (cached) return cached;
  }

  const remote = await fetchRemoteFeatureFlags();
  if (remote) {
    await writeCachedFeatureFlags(remote);
    return remote;
  }

  const stale = await readCachedFeatureFlags(true);
  return stale || DEFAULT_FEATURE_FLAGS;
};

export const getDefaultFeatureFlags = (): FeatureFlags => DEFAULT_FEATURE_FLAGS;
