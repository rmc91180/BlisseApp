import type { ContentType, ExperienceProfile } from '@/types/app';

type ExperienceSource = {
  id: number;
  category?: string;
  mood?: string;
  difficulty?: string;
  duration?: string;
};

const EXPERIENCE_FALLBACK: ExperienceProfile = {
  effort: 'low',
  energy: 'calm',
  connection: 'emotional',
  novelty: 'familiar',
  controlBalance: 'shared',
};

const moodToEnergy: Record<string, ExperienceProfile['energy']> = {
  flowing: 'calm',
  grounded: 'calm',
  unified: 'calm',
  blossoming: 'building',
  playful: 'building',
  dynamic: 'building',
  passionate: 'intense',
  commanding: 'intense',
};

const moodToConnection: Record<string, ExperienceProfile['connection']> = {
  unified: 'emotional',
  blossoming: 'emotional',
  grounded: 'emotional',
  flowing: 'mixed',
  playful: 'mixed',
  dynamic: 'physical',
  passionate: 'physical',
  commanding: 'physical',
};

const categoryKeywords: Array<[RegExp, Partial<ExperienceProfile>]> = [
  [/connection|romantic|mental/i, { connection: 'emotional', effort: 'low' }],
  [/setting|relax|massage|touch/i, { effort: 'low', novelty: 'familiar' }],
  [/sensation|adventure|fantasy|roleplay/i, { novelty: 'adventurous', energy: 'building' }],
  [/quick|tease|play/i, { energy: 'building', novelty: 'varied' }],
  [/command|dominant|control/i, { controlBalance: 'one-led', energy: 'intense' }],
];

const contentDefaults: Record<ContentType, ExperienceProfile> = {
  position: { ...EXPERIENCE_FALLBACK, connection: 'mixed', effort: 'medium' },
  foreplay: { ...EXPERIENCE_FALLBACK, connection: 'emotional' },
  oral: { ...EXPERIENCE_FALLBACK, connection: 'physical', energy: 'building' },
  massage: { ...EXPERIENCE_FALLBACK, effort: 'low', energy: 'calm', connection: 'emotional' },
  roleplay: { ...EXPERIENCE_FALLBACK, novelty: 'adventurous', energy: 'building' },
};

const difficultyToEffort: Record<string, ExperienceProfile['effort']> = {
  Beginner: 'low',
  Intermediate: 'medium',
  Advanced: 'high',
};

const durationToEffort: Record<string, ExperienceProfile['effort']> = {
  Quick: 'low',
  Medium: 'medium',
  Extended: 'high',
};

const idVariation = (id: number): Pick<ExperienceProfile, 'novelty' | 'controlBalance'> => {
  const noveltyCycle: ExperienceProfile['novelty'][] = ['familiar', 'varied', 'adventurous'];
  const controlCycle: ExperienceProfile['controlBalance'][] = ['shared', 'one-led'];
  return {
    novelty: noveltyCycle[id % noveltyCycle.length],
    controlBalance: controlCycle[id % controlCycle.length],
  };
};

export const buildExperienceClusterKey = (profile: ExperienceProfile): string => (
  `${profile.effort}:${profile.energy}:${profile.connection}:${profile.novelty}:${profile.controlBalance}`
);

export const resolveExperienceProfile = (
  contentType: ContentType,
  source: ExperienceSource
): ExperienceProfile => {
  const fromMood: Partial<ExperienceProfile> = {};
  if (source.mood && moodToEnergy[source.mood]) fromMood.energy = moodToEnergy[source.mood];
  if (source.mood && moodToConnection[source.mood]) fromMood.connection = moodToConnection[source.mood];

  const fromCategory: Partial<ExperienceProfile> = {};
  const category = source.category || '';
  categoryKeywords.forEach(([matcher, profilePatch]) => {
    if (matcher.test(category)) {
      Object.assign(fromCategory, profilePatch);
    }
  });

  const profile: ExperienceProfile = {
    ...contentDefaults[contentType],
    ...idVariation(source.id),
    ...fromCategory,
    ...fromMood,
    effort: source.difficulty
      ? (difficultyToEffort[source.difficulty] || contentDefaults[contentType].effort)
      : source.duration
        ? (durationToEffort[source.duration] || contentDefaults[contentType].effort)
        : contentDefaults[contentType].effort,
  };

  return profile;
};

