/**
 * Localized content arrays that auto-resolve to the current language.
 * Uses Proxy pattern so content arrays always reflect the active language.
 */
import { Dimensions } from 'react-native';
import { ContentCatalog, getLocalizedContentCatalog } from '@/i18n/localizedContent';
import {
  getCurrentLanguage,
  setLanguageGetter,
} from '@/i18n/languageGetter';
import { positions as basePositions, Position } from '@/content/positions';
import { foreplayIdeas as baseForeplayIdeas, foreplayCategories, ForeplayIdea } from '@/content/foreplay';
import { oralPlayIdeas as baseOralPlayIdeas, oralCategories, OralPlayIdea } from '@/content/oralplay';
import { massageTechniques as baseMassageTechniques, MassageTechnique } from '@/content/massage';
import { rolePlayScenarios as baseRolePlayScenarios, RolePlayScenario } from '@/content/roleplay';

// Re-export for convenience
export type { Position, ForeplayIdea, OralPlayIdea, MassageTechnique, RolePlayScenario };
export { foreplayCategories, oralCategories };
// Re-export setLanguageGetter so App.tsx import stays unchanged
export { setLanguageGetter };

// Layout constants
const { width } = Dimensions.get('window');
export const CARD_WIDTH = (width - 52) / 2;

// Category lists
export const massageCategories = ['Relaxation', 'Sensual', 'Therapeutic'];
export const rolePlayCategories = ['Romantic', 'Fantasy', 'Playful', 'Adventurous'];

// Base content catalog (unlocalized)
const BASE_CONTENT_CATALOG: ContentCatalog = {
  positions: basePositions,
  foreplay: baseForeplayIdeas,
  oral: baseOralPlayIdeas,
  massage: baseMassageTechniques,
  roleplay: baseRolePlayScenarios,
};

const getLocalizedCatalogForCurrentLanguage = (): ContentCatalog => {
  return getLocalizedContentCatalog(getCurrentLanguage(), BASE_CONTENT_CATALOG);
};

/**
 * Creates a Proxy that lazily resolves to the current language's content
 * every time it's accessed. This ensures content always matches the active language.
 */
const createLocalizedArrayProxy = <T,>(resolver: () => T[]): T[] => {
  return new Proxy([] as unknown as T[], {
    get(_target, property) {
      const resolved = resolver();
      if (property === Symbol.iterator) return resolved[Symbol.iterator].bind(resolved);
      if (property === 'length') return resolved.length;
      const value = (resolved as unknown as Record<PropertyKey, unknown>)[property];
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(resolved) : value;
    },
    ownKeys() {
      return Reflect.ownKeys(resolver());
    },
    getOwnPropertyDescriptor(_target, property) {
      const resolved = resolver() as unknown as object;
      const descriptor = Object.getOwnPropertyDescriptor(resolved, property);
      if (descriptor) return descriptor;
      return undefined;
    },
  });
};

export const positions: Position[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().positions);
export const foreplayIdeas: ForeplayIdea[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().foreplay);
export const oralPlayIdeas: OralPlayIdea[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().oral);
export const massageTechniques: MassageTechnique[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().massage);
export const rolePlayScenarios: RolePlayScenario[] = createLocalizedArrayProxy(() => getLocalizedCatalogForCurrentLanguage().roleplay);
