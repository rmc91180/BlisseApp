import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getCurrentLanguage } from '@/i18n/languageGetter';
import { getVoiceCopy } from '@/copy';
import {
  STREAK_NOTIFICATION_HOUR,
  STREAK_NOTIFICATION_ID_KEY,
  STREAK_NOTIFICATION_MINUTE,
} from '@/constants/appConfig';

interface StreakReminderOptions {
  enabled?: boolean;
}

const getStreakReminderTitle = (): string => {
  const language = getCurrentLanguage();
  return getVoiceCopy(language).notifications.streakTitle;
};

const getStreakReminderBody = (): string => {
  const language = getCurrentLanguage();
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayIndex = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const bodies = getVoiceCopy(language).notifications.streakBodies;
  return bodies[Math.max(0, dayIndex) % bodies.length];
};

export const clearDailyStreakReminder = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  const id = await AsyncStorage.getItem(STREAK_NOTIFICATION_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  }

  await AsyncStorage.removeItem(STREAK_NOTIFICATION_ID_KEY);
};

export const scheduleDailyStreakReminder = async (
  options: StreakReminderOptions = {}
): Promise<void> => {
  if (Platform.OS === 'web') return;

  const { enabled = true } = options;
  if (!enabled) {
    await clearDailyStreakReminder();
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;
  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }
  if (finalStatus !== 'granted') return;

  await clearDailyStreakReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: getStreakReminderTitle(),
      body: getStreakReminderBody(),
      sound: false,
      data: { type: 'daily_streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: STREAK_NOTIFICATION_HOUR,
      minute: STREAK_NOTIFICATION_MINUTE,
    },
  });

  await AsyncStorage.setItem(STREAK_NOTIFICATION_ID_KEY, id);
};
