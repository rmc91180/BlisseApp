import { Platform, Vibration } from 'react-native';

export const HAPTIC = {
  COMPLETE: 'complete',
  CELEBRATE: 'celebrate',
} as const;

type HapticIntent = typeof HAPTIC[keyof typeof HAPTIC];

const MIN_GLOBAL_GAP_MS = 160;
const INTENT_COOLDOWN_MS: Record<HapticIntent, number> = {
  [HAPTIC.COMPLETE]: 900,
  [HAPTIC.CELEBRATE]: 900,
};

let enabled = true;
let lastGlobalFireAt = 0;
const lastIntentFireAt = new Map<HapticIntent, number>();

const now = () => Date.now();

const canTrigger = (intent: HapticIntent): boolean => {
  if (!enabled) return false;
  if (Platform.OS === 'web') return false;

  const current = now();
  const lastByIntent = lastIntentFireAt.get(intent) || 0;

  if (current - lastGlobalFireAt < MIN_GLOBAL_GAP_MS) return false;
  if (current - lastByIntent < INTENT_COOLDOWN_MS[intent]) return false;

  lastGlobalFireAt = current;
  lastIntentFireAt.set(intent, current);
  return true;
};

const triggerIntent = (intent: HapticIntent): void => {
  if (!canTrigger(intent)) return;

  try {
    if (intent === HAPTIC.COMPLETE) {
      Vibration.vibrate([0, 18, 42, 22]);
      return;
    }
    Vibration.vibrate([0, 20, 48, 26]);
  } catch {
    // Haptics are optional enhancement; never break UI flow.
  }
};

export const haptics = {
  openCard: (_key?: string): void => undefined,
  confirmAction: (): void => {
    // Basic taps and saves should stay quiet.
  },
  reveal: (): void => undefined,
  complete: (): void => {
    triggerIntent(HAPTIC.COMPLETE);
  },
  celebrate: (): void => {
    triggerIntent(HAPTIC.CELEBRATE);
  },
  setEnabled: (nextEnabled: boolean): void => {
    enabled = nextEnabled;
  },
  resetSession: (): void => {
    lastGlobalFireAt = 0;
    lastIntentFireAt.clear();
  },
};
