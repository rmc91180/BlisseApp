import type { AnalyticsEventName } from '@/types/app';
import { getFirebaseAuth } from '@/services/firebase';
import { FIREBASE_FUNCTIONS_BASE_URL } from '@/constants/appConfig';

const normalize = (value: unknown, max = 80): string => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
};

export const sendAggregateAnalyticsEvent = async (
  event: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): Promise<boolean> => {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return false;
  const idempotencyKey = `${event}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/ingestAnonymousEvent`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          eventType: event,
          contentType: normalize(properties.contentType),
          category: normalize(properties.category),
          mood: normalize(properties.mood),
          feature: normalize(properties.feature),
          level: typeof properties.level === 'number' ? Math.floor(properties.level) : null,
          idempotencyKey,
        },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
