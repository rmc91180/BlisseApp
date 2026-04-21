import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

type SoundKey = 'light' | 'medium' | 'success' | 'celebration' | 'error';

/**
 * Public sound paths so assets can be replaced without changing call sites.
 */
export const SOUND_FILES: Record<SoundKey, string> = {
  light: 'assets/sounds/light-soft-chime.wav',
  medium: 'assets/sounds/medium-warm-chime.wav',
  success: 'assets/sounds/success-warm-rise.wav',
  celebration: 'assets/sounds/celebration-soft-sparkle.wav',
  error: 'assets/sounds/error-gentle-low-tone.wav',
};

const SOUND_MODULES: Record<SoundKey, number> = {
  light: require('../../assets/sounds/light-soft-chime.wav'),
  medium: require('../../assets/sounds/medium-warm-chime.wav'),
  success: require('../../assets/sounds/success-warm-rise.wav'),
  celebration: require('../../assets/sounds/celebration-soft-sparkle.wav'),
  error: require('../../assets/sounds/error-gentle-low-tone.wav'),
};

let enabled = true;
let audioModeReady = false;

const loadedSounds = new Map<SoundKey, Audio.Sound>();
const loadPromises = new Map<SoundKey, Promise<Audio.Sound | null>>();

const ensureAudioMode = async (): Promise<void> => {
  if (audioModeReady) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioModeReady = true;
  } catch {
    // Keep silent: audio feedback is optional UX sugar.
  }
};

const loadSound = async (key: SoundKey): Promise<Audio.Sound | null> => {
  const cached = loadedSounds.get(key);
  if (cached) return cached;

  const pending = loadPromises.get(key);
  if (pending) return pending;

  const next = (async () => {
    await ensureAudioMode();

    try {
      const result = await Audio.Sound.createAsync(SOUND_MODULES[key], {
        shouldPlay: false,
        isLooping: false,
        volume: 1,
      });

      loadedSounds.set(key, result.sound);
      return result.sound;
    } catch {
      return null;
    }
  })();

  loadPromises.set(key, next);
  try {
    return await next;
  } finally {
    loadPromises.delete(key);
  }
};

const play = async (key: SoundKey): Promise<void> => {
  if (!enabled) return;

  const clip = await loadSound(key);
  if (!clip) return;

  try {
    await clip.replayAsync();
  } catch {
    // Fail silently; never break UI interactions.
  }
};

const preloadInternal = async (): Promise<void> => {
  await Promise.all((Object.keys(SOUND_FILES) as SoundKey[]).map((key) => loadSound(key)));
};

export const sound = {
  light: (): void => {
    void play('light');
  },
  medium: (): void => {
    void play('medium');
  },
  success: (): void => {
    void play('success');
  },
  celebration: (): void => {
    void play('celebration');
  },
  error: (): void => {
    void play('error');
  },
  preload: (): void => {
    void preloadInternal();
  },
  setEnabled: (nextEnabled: boolean): void => {
    enabled = nextEnabled;
  },
};
