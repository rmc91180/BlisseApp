import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { buildMoodBalancedSuggestions } from '@/services/moodSuggestions';
import type { ContentType } from '@/types/app';

type Recommendation = {
  type: ContentType;
  item: {
    id: number;
    name: string;
    vibe?: string;
    mood?: string;
    category?: string;
    difficulty?: string;
    [key: string]: unknown;
  };
  reason: string;
};

const STARTER_RECOMMENDATIONS: Recommendation[] = [
  {
    type: 'foreplay',
    item: {
      id: 101,
      name: 'The Slow Melt',
      vibe: 'Relaxation that slowly turns irresistible',
    },
    reason: 'A perfect place to start — gentle and connecting.',
  },
  {
    type: 'position',
    item: {
      id: 9,
      name: 'The Cradle',
      vibe: 'Intimate chest-to-chest on top',
    },
    reason: 'Close, slow, and easy. A great first explore.',
  },
  {
    type: 'roleplay',
    item: {
      id: 401,
      name: 'First Date Redux',
      vibe: 'Recapturing that early spark',
    },
    reason: 'Playful and low-pressure. Perfect for tonight.',
  },
];

export function useRecommendations(): { recommendations: Recommendation[]; isFirstTime: boolean } {
  const learningPreferences = useStore((state) => state.learningPreferences);
  const interactionCount = useStore((state) => state.interactionHistory.length);
  const currentMood = useStore((state) => state.currentMood);
  const isFirstTime = interactionCount < 3;

  const recommendations = useMemo<Recommendation[]>(() => {
    if (!currentMood) return [];

    const source = useStore.getState().getSmartRecommendations(80);
    const next = buildMoodBalancedSuggestions(currentMood, source, 4);
    if (next.length > 0) {
      return next.map((entry) => ({
        type: entry.type as ContentType,
        item: entry.item,
        reason: entry.reason,
      }));
    }

    return STARTER_RECOMMENDATIONS.filter((entry) => entry.item.mood === currentMood).map((entry) => ({
      type: entry.type as ContentType,
      item: entry.item,
      reason: entry.reason,
    }));
  }, [currentMood, learningPreferences]);

  return { recommendations, isFirstTime };
}
