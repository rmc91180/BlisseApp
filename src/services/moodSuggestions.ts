import { MOOD_PLAYLISTS } from '@/constants/gamification';
import {
  foreplayIdeas,
  massageTechniques,
  oralPlayIdeas,
  positions,
  rolePlayScenarios,
} from '@/content/localizedContent';
import type { ContentType, MoodPlaylist } from '@/types/app';

export type MoodRefinement = {
  energy?: 'soft' | 'warm' | 'bright';
  texture?: 'close' | 'playful';
  pace?: 'short' | 'unfold';
};

export type MoodSuggestion = {
  type: ContentType;
  item: any;
  score?: number;
  reason: string;
};

type SourceRecommendation = {
  type: string;
  item: any;
  score?: number;
  reason?: string;
};

const CONTENT_BY_TYPE: Record<ContentType, any[]> = {
  foreplay: foreplayIdeas,
  oral: oralPlayIdeas,
  massage: massageTechniques,
  position: positions,
  roleplay: rolePlayScenarios,
};

const HOME_BALANCE: ContentType[] = ['foreplay', 'oral', 'massage', 'position'];
const SESSION_BALANCE: ContentType[] = ['foreplay', 'oral', 'massage', 'position'];

const MOOD_LINES: Record<string, { why: string; how: string }> = {
  unified: {
    why: 'This keeps you close, warm, and in the same little world.',
    how: 'Let it be slow. Stay with the parts that make you both soften.',
  },
  passionate: {
    why: 'This fits a hotter mood without turning it into a performance.',
    how: 'Keep it simple, direct, and easy to change if the heat shifts.',
  },
  playful: {
    why: 'This gives the room a little mischief without making anything serious.',
    how: 'Laugh if it gets silly. That is part of the charm.',
  },
  dynamic: {
    why: 'This brings something fresh while keeping one foot in comfort.',
    how: 'Try the spark, then keep only what feels good tonight.',
  },
  flowing: {
    why: 'This belongs to a soft, unhurried kind of night.',
    how: 'No need to rush. Let the mood find its own pace.',
  },
  grounded: {
    why: 'This feels steady, familiar, and easy to settle into.',
    how: 'Keep it close and comfortable. Small shifts are enough.',
  },
  commanding: {
    why: 'This suits a more led, confident mood while staying warm.',
    how: 'Let one of you take the lead, and keep it playful enough to change.',
  },
  blossoming: {
    why: 'This opens the night gently, with curiosity instead of pressure.',
    how: 'Start small. Let the brave part arrive when it wants to.',
  },
};

export const getMoodContext = (moodIdOrMood?: string | null): MoodPlaylist | null => {
  if (!moodIdOrMood) return null;
  return MOOD_PLAYLISTS.find((mood) => mood.id === moodIdOrMood || mood.mood === moodIdOrMood) || null;
};

export const getMoodValue = (moodIdOrMood?: string | null): string | null => {
  const mood = getMoodContext(moodIdOrMood);
  return mood?.mood || moodIdOrMood || null;
};

export const getMoodLine = (moodValue?: string | null): { why: string; how: string } => (
  MOOD_LINES[moodValue || ''] || MOOD_LINES.unified
);

const scoreKey = (type: string, item: any) => `${type}:${Number(item?.id || 0)}`;

const stableItemScore = (type: ContentType, item: any, sourceScores: Map<string, number>): number => {
  const fromSource = sourceScores.get(scoreKey(type, item));
  if (typeof fromSource === 'number') return fromSource;
  const id = Number(item?.id || 0);
  return 40 + ((id * 17 + type.length * 11) % 30);
};

const typeLabel = (type: ContentType): string => {
  if (type === 'foreplay') return 'foreplay';
  if (type === 'oral') return 'touch';
  if (type === 'massage') return 'closeness';
  if (type === 'position') return 'position';
  return 'play';
};

export const explainMoodSuggestion = (
  moodValue: string | null | undefined,
  type: ContentType,
  refinement?: MoodRefinement
): string => {
  const line = getMoodLine(moodValue);
  const pace = refinement?.pace === 'short'
    ? 'Short and sweet is welcome here.'
    : refinement?.pace === 'unfold'
      ? 'Let it unfold if it starts to feel good.'
      : line.how;
  const texture = refinement?.texture === 'playful'
    ? 'Keep it light enough to smile through.'
    : refinement?.texture === 'close'
      ? 'Stay close enough to read each other easily.'
      : pace;

  return `${line.why}\nFor this ${typeLabel(type)}, ${texture.charAt(0).toLowerCase()}${texture.slice(1)}`;
};

export const buildMoodBalancedSuggestions = (
  moodIdOrMood: string | null | undefined,
  sourceRecommendations: SourceRecommendation[],
  count = 4,
  refinement?: MoodRefinement
): MoodSuggestion[] => {
  const moodValue = getMoodValue(moodIdOrMood);
  if (!moodValue) return [];

  const sourceScores = new Map<string, number>();
  sourceRecommendations.forEach((recommendation, index) => {
    sourceScores.set(
      scoreKey(recommendation.type, recommendation.item),
      typeof recommendation.score === 'number' ? recommendation.score : 100 - index
    );
  });

  const selected: MoodSuggestion[] = [];
  const used = new Set<string>();
  const balance: ContentType[] = count <= 4 ? HOME_BALANCE : [...HOME_BALANCE, 'roleplay'];

  balance.forEach((type) => {
    if (selected.length >= count) return;
    const pool = CONTENT_BY_TYPE[type]
      .filter((item) => item?.mood === moodValue)
      .sort((a, b) => stableItemScore(type, b, sourceScores) - stableItemScore(type, a, sourceScores));
    const item = pool.find((candidate) => !used.has(scoreKey(type, candidate)));
    if (!item) return;
    used.add(scoreKey(type, item));
    selected.push({
      type,
      item,
      score: stableItemScore(type, item, sourceScores),
      reason: explainMoodSuggestion(moodValue, type, refinement),
    });
  });

  if (selected.length < count) {
    const extras = (Object.keys(CONTENT_BY_TYPE) as ContentType[])
      .flatMap((type) => CONTENT_BY_TYPE[type].map((item) => ({ type, item })))
      .filter(({ item }) => item?.mood === moodValue)
      .sort((a, b) => stableItemScore(b.type, b.item, sourceScores) - stableItemScore(a.type, a.item, sourceScores));

    extras.forEach(({ type, item }) => {
      if (selected.length >= count) return;
      const key = scoreKey(type, item);
      if (used.has(key)) return;
      used.add(key);
      selected.push({
        type,
        item,
        score: stableItemScore(type, item, sourceScores),
        reason: explainMoodSuggestion(moodValue, type, refinement),
      });
    });
  }

  return selected;
};

export const buildMoodSessionSteps = (
  mood: MoodPlaylist,
  sourceRecommendations: SourceRecommendation[],
  refinement?: MoodRefinement
): MoodSuggestion[] => (
  buildMoodBalancedSuggestions(mood.mood, sourceRecommendations, SESSION_BALANCE.length, refinement)
);
