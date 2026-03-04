import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getCurrentLanguage } from '@/i18n/languageGetter';
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
  if (language === 'es') return 'Mantengan la racha viva ✨';
  if (language === 'pt') return 'Mantenham a sequência viva ✨';
  return 'Keep your streak alive ✨';
};

const getStreakReminderBody = (): string => {
  const language = getCurrentLanguage();
  if (language === 'es') return 'Entren hoy a Blisse para conservar estrellas, ritmo y conexión.';
  if (language === 'pt') return 'Entrem hoje no Blisse para manter estrelas, ritmo e conexão.';
  return 'Open Blisse today to keep your stars, momentum, and connection.';
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

