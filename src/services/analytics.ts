/**
 * Anonymous analytics system (PostHog) and Formspree contact helpers.
 *
 * Tracks aggregated usage events only.
 * We explicitly disable person profiling and only send sanitized, non-PII properties.
 */

import type { AnalyticsEventName, AnalyticsProperties } from '@/types/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import {
  FORMSPREE_ENDPOINT,
  ANALYTICS_STRING_LIMIT,
  FORMSPREE_MESSAGE_LIMIT,
  FORMSPREE_SUBMIT_COOLDOWN_MS,
  FORMSPREE_LAST_SUBMIT_KEY,
  FORMSPREE_QUEUE_KEY,
  FORMSPREE_QUEUE_LIMIT,
  FORMSPREE_HONEYPOT_FIELD,
  FORMSPREE_MIN_MESSAGE_LENGTH,
} from '@/constants/appConfig';

// PostHog Analytics Helper - uses the PostHog hook inside components
// For use outside components, we queue events and send them when possible
export const pendingEvents: Array<{ event: AnalyticsEventName; properties?: Record<string, unknown> }> = [];

export const ANALYTICS_BASE_PROPERTIES = {
  anonymous: true,
  analytics_mode: 'anonymous_aggregate',
  $process_person_profile: false,
};

export const ALLOWED_ANALYTICS_PROPERTY_KEYS = new Set([
  'contentType',
  'itemId',
  'category',
  'mood',
  'feature',
  'level',
  'step',
  'trigger',
  'planType',
  'isFirstSession',
  'durationSeconds',
  'daysSinceInstall',
  'totalActivities',
]);

/**
 * Retention-focused instrumentation map.
 * Documents what each event answers so product decisions remain explicit.
 */
export const RETENTION_EVENTS = {
  onboarding_step: {
    decision: 'Locate onboarding drop-off and friction by step.',
  },
  paywall_shown: {
    decision: 'Compare paywall entry triggers and visibility patterns.',
  },
  paywall_converted: {
    decision: 'Measure conversion by plan and acquisition context.',
  },
  session_started: {
    decision: 'Track first-session completion versus returning usage.',
  },
  content_completed: {
    decision: 'Understand completion behavior and time-to-complete by content type.',
  },
  retention_signal: {
    decision: 'Monitor returning engagement by lifecycle day and activity depth.',
  },
} as const;

export const FORMSPREE_ALLOWED_FIELDS = new Set([
  'type',
  'category',
  'ideaType',
  'message',
  'submittedAt',
]);

export interface FormspreeSubmitResult {
  delivered: boolean;
  queued: boolean;
}

interface QueuedFormspreeItem {
  id: string;
  payload: Record<string, string>;
  queuedAt: string;
}

export const sanitizeAnalyticsProperties = (properties?: Record<string, unknown>): AnalyticsProperties => {
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

export const sanitizeFormspreePayload = (payload: Record<string, string>): Record<string, string> => {
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

const loadFormspreeQueue = async (): Promise<QueuedFormspreeItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(FORMSPREE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === 'string' && item.payload && typeof item.payload === 'object');
  } catch {
    return [];
  }
};

const saveFormspreeQueue = async (items: QueuedFormspreeItem[]): Promise<void> => {
  await AsyncStorage.setItem(FORMSPREE_QUEUE_KEY, JSON.stringify(items.slice(-FORMSPREE_QUEUE_LIMIT)));
};

const getCooldownRemainingMs = async (): Promise<number> => {
  const raw = await AsyncStorage.getItem(FORMSPREE_LAST_SUBMIT_KEY);
  if (!raw) return 0;
  const last = Number(raw);
  if (!Number.isFinite(last)) return 0;
  const remaining = FORMSPREE_SUBMIT_COOLDOWN_MS - (Date.now() - last);
  return Math.max(0, remaining);
};

const enqueueFormspreePayload = async (payload: Record<string, string>): Promise<void> => {
  const queue = await loadFormspreeQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    queuedAt: new Date().toISOString(),
  });
  await saveFormspreeQueue(queue);
};

const sendFormspreePayload = async (payload: Record<string, string>): Promise<void> => {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = new Error(`Formspree request failed (${response.status})`) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
};

export const flushQueuedFormspreeMessages = async (): Promise<number> => {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected || state.isInternetReachable === false) return 0;

  const queue = await loadFormspreeQueue();
  if (!queue.length) return 0;

  const remaining: QueuedFormspreeItem[] = [];
  let delivered = 0;

  for (const item of queue) {
    try {
      await sendFormspreePayload(item.payload);
      delivered += 1;
    } catch {
      remaining.push(item);
    }
  }

  await saveFormspreeQueue(remaining);
  if (delivered > 0) {
    await AsyncStorage.setItem(FORMSPREE_LAST_SUBMIT_KEY, `${Date.now()}`);
  }
  return delivered;
};

export const submitFormspreeMessage = async (payload: Record<string, string>): Promise<FormspreeSubmitResult> => {
  const honeypotValue = payload?.[FORMSPREE_HONEYPOT_FIELD];
  if (honeypotValue && honeypotValue.trim().length > 0) {
    throw new Error('Spam blocked');
  }

  const sanitizedPayload = sanitizeFormspreePayload(payload);
  if (!sanitizedPayload.message || sanitizedPayload.message.length < FORMSPREE_MIN_MESSAGE_LENGTH) {
    throw new Error('Formspree payload is missing a message');
  }

  const cooldownRemaining = await getCooldownRemainingMs();
  if (cooldownRemaining > 0) {
    const seconds = Math.ceil(cooldownRemaining / 1000);
    throw new Error(`Please wait ${seconds} seconds before sending another message.`);
  }

  const state = await Network.getNetworkStateAsync();
  const online = state.isConnected && state.isInternetReachable !== false;

  if (!online) {
    await enqueueFormspreePayload(sanitizedPayload);
    return { delivered: false, queued: true };
  }

  try {
    await sendFormspreePayload(sanitizedPayload);
    await AsyncStorage.setItem(FORMSPREE_LAST_SUBMIT_KEY, `${Date.now()}`);
    return { delivered: true, queued: false };
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status?: number }).status) : null;
    if (!status || status >= 500) {
      await enqueueFormspreePayload(sanitizedPayload);
      return { delivered: false, queued: true };
    }
    throw error;
  }
};

/**
 * Analytics facade for queueing events from anywhere in the app.
 * Events are flushed by the AnalyticsFlusher component which has PostHog access.
 */
export const Analytics = {
  trackOnboardingStep: (step: 'name' | 'relationship' | 'preferences' | 'experience' | 'legal' | 'payoff') => {
    pendingEvents.push({
      event: 'onboarding_step',
      properties: { step },
    });
  },
  trackPaywallShown: (trigger: 'trial_expired' | 'manual' | 'banner') => {
    pendingEvents.push({
      event: 'paywall_shown',
      properties: { trigger },
    });
  },
  trackPaywallConverted: (planType: string) => {
    pendingEvents.push({
      event: 'paywall_converted',
      properties: { planType },
    });
  },
  trackSessionStart: (isFirstSession: boolean) => {
    pendingEvents.push({
      event: 'session_started',
      properties: { isFirstSession },
    });
  },
  trackContentCompleted: (contentType: string, itemId: number, durationSeconds: number) => {
    pendingEvents.push({
      event: 'content_completed',
      properties: { contentType, itemId, durationSeconds },
    });
  },
  trackRetentionSignal: (daysSinceInstall: number, totalActivities: number) => {
    pendingEvents.push({
      event: 'retention_signal',
      properties: { daysSinceInstall, totalActivities },
    });
  },
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
  /** Flush pending events (called from components with PostHog access). */
  getPendingEvents: () => {
    const events = [...pendingEvents];
    pendingEvents.length = 0;
    return events;
  },
};
