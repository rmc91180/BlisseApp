import { Platform, Vibration } from 'react-native';

export const HAPTIC = {
  REVEAL: 'reveal',
  COMPLETE: 'complete',
  CELEBRATE: 'celebrate',
} as const;

type HapticIntent = typeof HAPTIC[keyof typeof HAPTIC];

const MIN_GLOBAL_GAP_MS = 160;
const INTENT_COOLDOWN_MS: Record<HapticIntent, number> = {
  [HAPTIC.REVEAL]: 700,
  [HAPTIC.COMPLETE]: 900,
  [HAPTIC.CELEBRATE]: 900,
};

const CARD_REVEAL_KEY_LIMIT = 2500;

let enabled = true;
let lastGlobalFireAt = 0;
const lastIntentFireAt = new Map<HapticIntent, number>();
const revealedCardKeys = new Set<string>();

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
    if (intent === HAPTIC.REVEAL) {
      Vibration.vibrate(14);
      return;
    }
    if (intent === HAPTIC.COMPLETE) {
      Vibration.vibrate([0, 18, 42, 22]);
      return;
    }
    Vibration.vibrate([0, 20, 48, 26]);
  } catch {
    // Haptics are optional enhancement; never break UI flow.
  }
};

const trimRevealCache = () => {
  if (revealedCardKeys.size <= CARD_REVEAL_KEY_LIMIT) return;
  const keys = Array.from(revealedCardKeys);
  revealedCardKeys.clear();
  keys.slice(-CARD_REVEAL_KEY_LIMIT).forEach((key) => revealedCardKeys.add(key));
};

export const haptics = {
  openCard: (key?: string): void => {
    if (!key) return;
    if (revealedCardKeys.has(key)) return;

    revealedCardKeys.add(key);
    trimRevealCache();
    triggerIntent(HAPTIC.REVEAL);
  },
  confirmAction: (): void => {
    // Basic taps and saves should stay quiet.
  },
  reveal: (): void => {
    triggerIntent(HAPTIC.REVEAL);
  },
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
