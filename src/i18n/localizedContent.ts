import type { ForeplayIdea } from '@/content/foreplay';
import type { MassageTechnique } from '@/content/massage';
import type { OralPlayIdea } from '@/content/oralplay';
import type { Position } from '@/content/positions';
import type { RolePlayScenario } from '@/content/roleplay';
import type { AppLanguage } from '@/i18n/translations';
import esGenerated from '@/i18n/content/es.generated.json';
import ptGenerated from '@/i18n/content/pt.generated.json';

type PositionOverlay = Partial<Pick<Position, 'name' | 'vibe' | 'description' | 'howTo' | 'whyItWorks' | 'tips' | 'pairsWellWith' | 'goodFor'>>;
type ForeplayOverlay = Partial<Pick<ForeplayIdea, 'name' | 'vibe' | 'description' | 'howTo' | 'tips' | 'pairsWellWith'>>;
type OralOverlay = Partial<Pick<OralPlayIdea, 'name' | 'vibe' | 'description' | 'howTo' | 'tips' | 'pairsWellWith'>>;
type MassageOverlay = Partial<Pick<MassageTechnique, 'name' | 'vibe' | 'description' | 'howTo' | 'tips' | 'pairsWellWith' | 'bodyArea'>>;
type RoleplayOverlay = Partial<Pick<RolePlayScenario, 'name' | 'vibe' | 'description' | 'setup' | 'howToPlay' | 'tips' | 'pairsWellWith'>>;

interface GeneratedOverlay {
  positions: Record<string, PositionOverlay>;
  foreplay: Record<string, ForeplayOverlay>;
  oral: Record<string, OralOverlay>;
  massage: Record<string, MassageOverlay>;
  roleplay: Record<string, RoleplayOverlay>;
}

export interface ContentCatalog {
  positions: Position[];
  foreplay: ForeplayIdea[];
  oral: OralPlayIdea[];
  massage: MassageTechnique[];
  roleplay: RolePlayScenario[];
}

const OVERLAY_BY_LANGUAGE: Record<AppLanguage, GeneratedOverlay | null> = {
  en: null,
  es: esGenerated as GeneratedOverlay,
  pt: ptGenerated as GeneratedOverlay,
};

const localizedCatalogCache = new Map<AppLanguage, ContentCatalog>();

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const rows = value
    .map((entry) => asNonEmptyString(entry))
    .filter((entry): entry is string => Boolean(entry));
  return rows.length > 0 ? rows : null;
};

const localizePosition = (item: Position, overlay: PositionOverlay | undefined): Position => {
  if (!overlay) return item;
  return {
    ...item,
    name: asNonEmptyString(overlay.name) || item.name,
    vibe: asNonEmptyString(overlay.vibe) || item.vibe,
    description: asNonEmptyString(overlay.description) || item.description,
    howTo: asNonEmptyString(overlay.howTo) || item.howTo,
    whyItWorks: asNonEmptyString(overlay.whyItWorks) || item.whyItWorks,
    tips: asStringArray(overlay.tips) || item.tips,
    pairsWellWith: asStringArray(overlay.pairsWellWith) || item.pairsWellWith,
    goodFor: asStringArray(overlay.goodFor) || item.goodFor,
  };
};

const localizeForeplay = (item: ForeplayIdea, overlay: ForeplayOverlay | undefined): ForeplayIdea => {
  if (!overlay) return item;
  return {
    ...item,
    name: asNonEmptyString(overlay.name) || item.name,
    vibe: asNonEmptyString(overlay.vibe) || item.vibe,
    description: asNonEmptyString(overlay.description) || item.description,
    howTo: asNonEmptyString(overlay.howTo) || item.howTo,
    tips: asStringArray(overlay.tips) || item.tips,
    pairsWellWith: asStringArray(overlay.pairsWellWith) || item.pairsWellWith,
  };
};

const localizeOral = (item: OralPlayIdea, overlay: OralOverlay | undefined): OralPlayIdea => {
  if (!overlay) return item;
  return {
    ...item,
    name: asNonEmptyString(overlay.name) || item.name,
    vibe: asNonEmptyString(overlay.vibe) || item.vibe,
    description: asNonEmptyString(overlay.description) || item.description,
    howTo: asNonEmptyString(overlay.howTo) || item.howTo,
    tips: asStringArray(overlay.tips) || item.tips,
    pairsWellWith: asStringArray(overlay.pairsWellWith) || item.pairsWellWith,
  };
};

const localizeMassage = (item: MassageTechnique, overlay: MassageOverlay | undefined): MassageTechnique => {
  if (!overlay) return item;
  return {
    ...item,
    name: asNonEmptyString(overlay.name) || item.name,
    vibe: asNonEmptyString(overlay.vibe) || item.vibe,
    description: asNonEmptyString(overlay.description) || item.description,
    howTo: asNonEmptyString(overlay.howTo) || item.howTo,
    tips: asStringArray(overlay.tips) || item.tips,
    pairsWellWith: asStringArray(overlay.pairsWellWith) || item.pairsWellWith,
    bodyArea: asNonEmptyString(overlay.bodyArea) || item.bodyArea,
  };
};

const localizeRoleplay = (item: RolePlayScenario, overlay: RoleplayOverlay | undefined): RolePlayScenario => {
  if (!overlay) return item;
  return {
    ...item,
    name: asNonEmptyString(overlay.name) || item.name,
    vibe: asNonEmptyString(overlay.vibe) || item.vibe,
    description: asNonEmptyString(overlay.description) || item.description,
    setup: asNonEmptyString(overlay.setup) || item.setup,
    howToPlay: asNonEmptyString(overlay.howToPlay) || item.howToPlay,
    tips: asStringArray(overlay.tips) || item.tips,
    pairsWellWith: asStringArray(overlay.pairsWellWith) || item.pairsWellWith,
  };
};

export const getLocalizedContentCatalog = (language: AppLanguage, source: ContentCatalog): ContentCatalog => {
  if (language === 'en') return source;

  const cached = localizedCatalogCache.get(language);
  if (cached) return cached;

  const overlay = OVERLAY_BY_LANGUAGE[language];
  if (!overlay) return source;

  const localized: ContentCatalog = {
    positions: source.positions.map((item) => localizePosition(item, overlay.positions[String(item.id)])),
    foreplay: source.foreplay.map((item) => localizeForeplay(item, overlay.foreplay[String(item.id)])),
    oral: source.oral.map((item) => localizeOral(item, overlay.oral[String(item.id)])),
    massage: source.massage.map((item) => localizeMassage(item, overlay.massage[String(item.id)])),
    roleplay: source.roleplay.map((item) => localizeRoleplay(item, overlay.roleplay[String(item.id)])),
  };

  localizedCatalogCache.set(language, localized);
  return localized;
};
