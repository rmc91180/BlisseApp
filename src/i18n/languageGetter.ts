/**
 * Shared language resolution utility.
 * Provides non-hook access to the current app language for use
 * in modules outside of React component trees (services, constants, etc.).
 *
 * Call `setLanguageGetter` once during app bootstrap (see App.tsx) to wire
 * up the Zustand store.  After that, any module can call `getCurrentLanguage()`
 * to obtain the active language synchronously.
 */
import type { AppLanguage } from './translations';

let _getLanguage: (() => AppLanguage) | null = null;

/** Wire up the language getter (called once from App.tsx at module scope). */
export const setLanguageGetter = (getter: () => AppLanguage) => {
  _getLanguage = getter;
};

/** Get current language safely (defaults to 'en' if not initialized). */
export const getCurrentLanguage = (): AppLanguage => {
  if (_getLanguage) {
    try {
      return _getLanguage() || 'en';
    } catch {
      return 'en';
    }
  }
  return 'en';
};

/**
 * Create a Proxy-backed array that auto-resolves to the current language's
 * content every time it is accessed.  Consumer code treats the result as a
 * regular array (indexing, iteration, .length, .map, etc.) without needing
 * any hooks or explicit language argument.
 */
export function createLocalizedArrayProxy<T>(
  contentByLang: Record<AppLanguage, T[]>,
): T[] {
  return new Proxy([] as unknown as T[], {
    get(_target, property) {
      const lang = getCurrentLanguage();
      const resolved = contentByLang[lang] || contentByLang.en;
      if (property === Symbol.iterator) return resolved[Symbol.iterator].bind(resolved);
      if (property === 'length') return resolved.length;
      const value = (resolved as unknown as Record<PropertyKey, unknown>)[property];
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(resolved) : value;
    },
    ownKeys() {
      const lang = getCurrentLanguage();
      return Reflect.ownKeys(contentByLang[lang] || contentByLang.en);
    },
    getOwnPropertyDescriptor(_target, property) {
      const lang = getCurrentLanguage();
      const resolved = contentByLang[lang] || contentByLang.en;
      return Object.getOwnPropertyDescriptor(resolved, property);
    },
  });
}

/**
 * Create a Proxy-backed record (object) that auto-resolves to the current
 * language's version.  Works the same as the array variant but for keyed
 * objects like `Record<string, SomeType>`.
 */
export function createLocalizedRecordProxy<T extends Record<string, unknown>>(
  contentByLang: Record<AppLanguage, T>,
): T {
  return new Proxy({} as T, {
    get(_target, property) {
      const lang = getCurrentLanguage();
      const resolved = contentByLang[lang] || contentByLang.en;
      return (resolved as Record<PropertyKey, unknown>)[property];
    },
    ownKeys() {
      const lang = getCurrentLanguage();
      return Reflect.ownKeys(contentByLang[lang] || contentByLang.en);
    },
    getOwnPropertyDescriptor(_target, property) {
      const lang = getCurrentLanguage();
      const resolved = contentByLang[lang] || contentByLang.en;
      return Object.getOwnPropertyDescriptor(resolved, property);
    },
    has(_target, property) {
      const lang = getCurrentLanguage();
      const resolved = contentByLang[lang] || contentByLang.en;
      return property in resolved;
    },
  });
}

/**
 * Simple helper to pick content by language — useful for one-off lookups
 * where a full Proxy is overkill.
 */
export function pickByLanguage<T>(contentByLang: Record<AppLanguage, T>): T {
  const lang = getCurrentLanguage();
  return contentByLang[lang] || contentByLang.en;
}
