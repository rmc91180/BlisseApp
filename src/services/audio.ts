type SoundKey = 'light' | 'medium' | 'success' | 'celebration' | 'error';

export const SOUND_FILES: Record<SoundKey, string> = {
  light: '',
  medium: '',
  success: '',
  celebration: '',
  error: '',
};

const noop = (): void => undefined;

export const sound = {
  light: noop,
  medium: noop,
  success: noop,
  celebration: noop,
  error: noop,
  preload: noop,
  setEnabled: noop,
};
