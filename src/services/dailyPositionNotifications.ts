import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const DAILY_POSITION_NOTIFICATION_IDS_KEY = 'blisse:daily_position_notification_ids';
const DAILY_POSITION_NOTIFICATION_REFRESH_AT_KEY = 'blisse:daily_position_notification_refresh_at';
const DAILY_POSITION_NOTIFICATION_HOUR = 18;
const DAILY_POSITION_NOTIFICATION_MINUTE = 30;
const DAILY_POSITION_NOTIFICATION_DAYS_AHEAD = 7;
const DAILY_POSITION_NOTIFICATION_REFRESH_WINDOW_DAYS = 3;
const DAILY_POSITION_QUIET_HOURS_START = 22;
const DAILY_POSITION_QUIET_HOURS_END = 8;

let schedulingPromise: Promise<void> | null = null;

const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseStoredIds = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
      : [];
  } catch {
    return [];
  }
};

const extractTypeFromNotificationData = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null;
  const maybeType = (data as { type?: unknown }).type;
  return typeof maybeType === 'string' ? maybeType : null;
};

const isWithinQuietHours = (hour: number): boolean => {
  if (DAILY_POSITION_QUIET_HOURS_START < DAILY_POSITION_QUIET_HOURS_END) {
    return hour >= DAILY_POSITION_QUIET_HOURS_START && hour < DAILY_POSITION_QUIET_HOURS_END;
  }
  return hour >= DAILY_POSITION_QUIET_HOURS_START || hour < DAILY_POSITION_QUIET_HOURS_END;
};

const applyQuietHours = (date: Date): Date => {
  const adjusted = new Date(date);
  if (isWithinQuietHours(adjusted.getHours())) {
    adjusted.setHours(DAILY_POSITION_QUIET_HOURS_END, DAILY_POSITION_NOTIFICATION_MINUTE, 0, 0);
  }
  return adjusted;
};

const getScheduledDailyPositionNotificationIds = async (): Promise<string[]> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled
    .filter((request) => extractTypeFromNotificationData(request.content.data) === 'daily_position')
    .map((request) => request.identifier);
};

export const clearDailyPositionNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  const existingIdsRaw = await AsyncStorage.getItem(DAILY_POSITION_NOTIFICATION_IDS_KEY);
  const existingIds = parseStoredIds(existingIdsRaw);
  const pendingIds = await getScheduledDailyPositionNotificationIds();
  const idsToCancel = Array.from(new Set([...existingIds, ...pendingIds]));

  if (idsToCancel.length > 0) {
    await Promise.all(idsToCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  }

  await AsyncStorage.multiRemove([
    DAILY_POSITION_NOTIFICATION_IDS_KEY,
    DAILY_POSITION_NOTIFICATION_REFRESH_AT_KEY,
  ]);
};

export const ensureDailyPositionNotifications = async ({
  enabled = true,
  forceRefresh = false,
}: {
  enabled?: boolean;
  forceRefresh?: boolean;
} = {}): Promise<void> => {
  if (Platform.OS === 'web') return;

  if (schedulingPromise) {
    await schedulingPromise;
    return;
  }

  schedulingPromise = (async () => {
    if (!enabled) {
      await clearDailyPositionNotifications();
      return;
    }

    const now = new Date();
    const refreshAtRaw = await AsyncStorage.getItem(DAILY_POSITION_NOTIFICATION_REFRESH_AT_KEY);
    const pendingIds = await getScheduledDailyPositionNotificationIds();
    if (!forceRefresh && refreshAtRaw && new Date(refreshAtRaw) > now && pendingIds.length > 0) {
      return;
    }

    const permission = await Notifications.getPermissionsAsync();
    let finalStatus = permission.status;
    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }
    if (finalStatus !== 'granted') return;

    const existingIdsRaw = await AsyncStorage.getItem(DAILY_POSITION_NOTIFICATION_IDS_KEY);
    const existingIds = parseStoredIds(existingIdsRaw);
    const idsToCancel = Array.from(new Set([...existingIds, ...pendingIds]));
    if (idsToCancel.length > 0) {
      await Promise.all(idsToCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    }

    const scheduledIds: string[] = [];
    for (let offset = 0; offset < DAILY_POSITION_NOTIFICATION_DAYS_AHEAD; offset += 1) {
      const fireDate = new Date();
      fireDate.setDate(fireDate.getDate() + offset);
      fireDate.setHours(DAILY_POSITION_NOTIFICATION_HOUR, DAILY_POSITION_NOTIFICATION_MINUTE, 0, 0);

      const adjustedFireDate = applyQuietHours(fireDate);
      if (adjustedFireDate <= now) continue;

      const dateKey = getDateKey(adjustedFireDate);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Position of the Day 🔥',
          body: 'Try it now. Or save for later.',
          sound: false,
          data: { type: 'daily_position', dateKey },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: adjustedFireDate,
        },
      });
      scheduledIds.push(id);
    }

    const refreshAt = new Date(now);
    refreshAt.setDate(refreshAt.getDate() + DAILY_POSITION_NOTIFICATION_REFRESH_WINDOW_DAYS);
    await AsyncStorage.setItem(DAILY_POSITION_NOTIFICATION_IDS_KEY, JSON.stringify(scheduledIds));
    await AsyncStorage.setItem(DAILY_POSITION_NOTIFICATION_REFRESH_AT_KEY, refreshAt.toISOString());
  })().catch((error) => {
    console.warn('Daily position notification scheduling failed:', error);
  });

  try {
    await schedulingPromise;
  } finally {
    schedulingPromise = null;
  }
};
