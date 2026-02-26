import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  REACTIVATION_NOTIFICATION_ID_KEY,
  REACTIVATION_NOTIFICATION_SCHEDULED_FOR_KEY,
  REACTIVATION_DAYS_INACTIVE,
  REACTIVATION_NOTIFICATION_HOUR,
  REACTIVATION_NOTIFICATION_MINUTE,
  DAILY_JOKE_QUIET_HOURS_START,
  DAILY_JOKE_QUIET_HOURS_END,
} from '@/constants/appConfig';

const REACTIVATION_TITLE = 'We miss your spark ✨';
const REACTIVATION_BODY = 'Open Blisse for today\'s tease, tailored ideas, and a quick connection win.';

const isWithinQuietHours = (hour: number): boolean => {
  if (DAILY_JOKE_QUIET_HOURS_START < DAILY_JOKE_QUIET_HOURS_END) {
    return hour >= DAILY_JOKE_QUIET_HOURS_START && hour < DAILY_JOKE_QUIET_HOURS_END;
  }
  return hour >= DAILY_JOKE_QUIET_HOURS_START || hour < DAILY_JOKE_QUIET_HOURS_END;
};

const applyQuietHours = (date: Date): Date => {
  const adjusted = new Date(date);
  if (isWithinQuietHours(adjusted.getHours())) {
    adjusted.setHours(DAILY_JOKE_QUIET_HOURS_END, 0, 0, 0);
  }
  return adjusted;
};

export const clearReactivationReminder = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  const id = await AsyncStorage.getItem(REACTIVATION_NOTIFICATION_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  }
  await AsyncStorage.multiRemove([REACTIVATION_NOTIFICATION_ID_KEY, REACTIVATION_NOTIFICATION_SCHEDULED_FOR_KEY]);
};

export const scheduleReactivationReminder = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  const permission = await Notifications.getPermissionsAsync();
  let finalStatus = permission.status;
  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }
  if (finalStatus !== 'granted') return;

  await clearReactivationReminder();

  const fireDate = new Date();
  fireDate.setDate(fireDate.getDate() + REACTIVATION_DAYS_INACTIVE);
  fireDate.setHours(REACTIVATION_NOTIFICATION_HOUR, REACTIVATION_NOTIFICATION_MINUTE, 0, 0);
  const adjustedDate = applyQuietHours(fireDate);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: REACTIVATION_TITLE,
      body: REACTIVATION_BODY,
      sound: false,
      data: { type: 'reactivation_reminder' },
    },
    trigger: adjustedDate as never,
  });

  await AsyncStorage.multiSet([
    [REACTIVATION_NOTIFICATION_ID_KEY, id],
    [REACTIVATION_NOTIFICATION_SCHEDULED_FOR_KEY, adjustedDate.toISOString()],
  ]);
};
