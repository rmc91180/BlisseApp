import { useMemo } from 'react';
import { CURATED_PLAYLISTS } from '@/content/seasonal';
import { useI18n } from '@/hooks/useI18n';
import { useRecommendations } from '@/hooks/useRecommendations';
import { getMoodContext } from '@/services/moodSuggestions';
import { useStore } from '@/store/useStore';
import type { UnlockableFeature } from '@/constants/gamification';

export type TonightGameSuggestion = {
  kind: 'date_night' | 'truth_dare' | 'challenge' | 'spinner';
  emoji: string;
  title: string;
  body: string;
};

export type TonightContentSuggestion = ReturnType<typeof useRecommendations>['recommendations'][number];

export function useTonightExperience(): {
  musicSuggestion: (typeof CURATED_PLAYLISTS)[number] | null;
  gameSuggestion: TonightGameSuggestion | null;
  contentSuggestions: TonightContentSuggestion[];
} {
  const store = useStore();
  const { t } = useI18n();
  const { recommendations } = useRecommendations();
  const selectedMoodContext = useMemo(() => getMoodContext(store.currentMood), [store.currentMood]);
  const unlockedFeatureSet = useMemo(
    () => new Set<UnlockableFeature>(store.unlockedFeatures || []),
    [store.unlockedFeatures]
  );

  const musicSuggestion = useMemo(() => {
    if (!selectedMoodContext) return null;
    const playlistMoodByMoodId: Record<string, string> = {
      romantic: 'romantic',
      passionate: 'passionate',
      playful: 'playful',
      adventurous: 'dynamic',
      relaxed: 'relaxed',
      quickie: 'passionate',
    };
    const targetMood = playlistMoodByMoodId[selectedMoodContext.id] || selectedMoodContext.mood;
    return CURATED_PLAYLISTS.find((playlist) => playlist.mood === targetMood) || null;
  }, [selectedMoodContext]);

  const gameSuggestion = useMemo<TonightGameSuggestion | null>(() => {
    if (!selectedMoodContext) return null;
    const dateNightUnlocked = unlockedFeatureSet.has('date_night_generator');
    const truthOrDareUnlocked = unlockedFeatureSet.has('truth_or_dare');

    if (selectedMoodContext.id === 'romantic' || selectedMoodContext.id === 'relaxed') {
      return dateNightUnlocked
        ? { kind: 'date_night', emoji: '🌙', title: t('date_night.title'), body: t('home.quality.romance') }
        : { kind: 'spinner', emoji: '🎰', title: t('home.feature.spin'), body: t('home.quality.playful') };
    }

    if (selectedMoodContext.id === 'playful' || selectedMoodContext.id === 'adventurous') {
      return truthOrDareUnlocked
        ? { kind: 'truth_dare', emoji: '🎲', title: t('truth_dare.title'), body: t('truth_dare.subtitle') }
        : { kind: 'spinner', emoji: '🎰', title: t('home.feature.spin'), body: t('home.quality.playful') };
    }

    return { kind: 'challenge', emoji: '🎯', title: t('challenge.title'), body: t('home.quality.challenge') };
  }, [selectedMoodContext, t, unlockedFeatureSet]);

  return {
    musicSuggestion,
    gameSuggestion,
    contentSuggestions: recommendations,
  };
}
