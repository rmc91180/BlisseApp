import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/useStore';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';
import { sound } from '@/services/audio';
import { MOOD_PLAYLISTS } from '@/constants/gamification';
import type { MoodPlaylist } from '@/types/app';
import {
  foreplayIdeas,
  massageTechniques,
  positions,
  rolePlayScenarios,
} from '@/content/localizedContent';

type SessionStepType = 'foreplay' | 'position' | 'massage' | 'roleplay';

interface SessionStep {
  number: 1 | 2 | 3;
  label: 'Start with...' | 'Move into...' | 'Finish with...';
  type: SessionStepType;
  item: any;
}

interface TonightSessionScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
  route?: {
    params?: {
      mood?: MoodPlaylist;
    };
  };
  mood?: MoodPlaylist;
}

const COACH_COPY: Record<string, string> = {
  romantic: 'Start slow tonight. Let the warmth build before anything else.',
  passionate: 'Skip the slow burn. Go right for what you want.',
  playful: "Keep it light. If you laugh, you're doing it right.",
  adventurous: "Pick one thing you've never done. That's the whole point.",
  relaxed: 'No performance tonight. Just be together.',
  quickie: "You've got 20 minutes. Make them count.",
};

const normalizeExperience = (experience: string | null): 'Beginner' | 'Intermediate' | 'Advanced' => {
  const key = (experience || 'beginner').toLowerCase();
  if (key === 'advanced') return 'Advanced';
  if (key === 'intermediate') return 'Intermediate';
  return 'Beginner';
};

const shuffle = <T,>(input: T[]): T[] => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getBadgeText = (step: SessionStep): string => {
  if (step.type === 'foreplay') return step.item.duration || 'Quick';
  if (step.type === 'position') return step.item.difficulty || 'Beginner';
  if (step.type === 'massage') return step.item.duration || step.item.category || 'Relaxed';
  return step.item.intensity || 'Roleplay';
};

export function TonightSessionScreen({
  navigation,
  route,
  mood: moodProp,
}: TonightSessionScreenProps) {
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const experience = useStore((state) => state.experience);
  const getSmartRecommendations = useStore((state) => state.getSmartRecommendations);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [steps, setSteps] = useState<SessionStep[]>([]);

  const selectedMood = useMemo(() => {
    const fromRoute = route?.params?.mood;
    if (fromRoute) return fromRoute;
    if (moodProp) return moodProp;
    return MOOD_PLAYLISTS[0];
  }, [moodProp, route?.params?.mood]);

  const coachIntro = COACH_COPY[selectedMood.id] || COACH_COPY.romantic;
  const targetDifficulty = normalizeExperience(experience);

  const generateSession = useCallback((): SessionStep[] => {
    const recommendations = getSmartRecommendations(5);
    const moodMatchedRecommendations = recommendations.filter(
      (recommendation) => recommendation.item?.mood === selectedMood.mood
    );
    const recommendationPool =
      moodMatchedRecommendations.length > 0 ? moodMatchedRecommendations : recommendations;

    const used = new Set<string>();
    const reserve = (type: SessionStepType, item: any) => {
      if (!item?.id) return;
      used.add(`${type}:${item.id}`);
    };
    const isUnused = (type: SessionStepType, item: any) => !used.has(`${type}:${item.id}`);

    const pickRecommended = (
      type: SessionStepType,
      predicate?: (item: any) => boolean
    ) => {
      const matches = shuffle(
        recommendationPool
          .filter((recommendation) => recommendation.type === type)
          .map((recommendation) => recommendation.item)
      );
      return matches.find((item) => isUnused(type, item) && (!predicate || predicate(item))) || null;
    };

    const pickFallback = (
      type: SessionStepType,
      source: any[],
      predicate?: (item: any) => boolean
    ) => {
      const moodFiltered = source.filter((item) => item.mood === selectedMood.mood);
      const pool = moodFiltered.length > 0 ? moodFiltered : source;
      const shuffled = shuffle(pool);
      return shuffled.find((item) => isUnused(type, item) && (!predicate || predicate(item))) || null;
    };

    const pickItem = (
      type: SessionStepType,
      source: any[],
      predicate?: (item: any) => boolean
    ) => {
      const recommended = pickRecommended(type, predicate);
      if (recommended) return recommended;

      const fallback = pickFallback(type, source, predicate);
      if (fallback) return fallback;

      const nonDuplicate = source.find((item) => isUnused(type, item) && (!predicate || predicate(item)));
      if (nonDuplicate) return nonDuplicate;

      return source.find((item) => isUnused(type, item)) || source[0];
    };

    const stepOneItem = pickItem(
      'foreplay',
      foreplayIdeas,
      (item) => item.duration === 'Quick' || item.duration === 'Medium'
    );
    reserve('foreplay', stepOneItem);

    const stepTwoItem = pickItem(
      'position',
      positions,
      (item) => (item.difficulty || '').toLowerCase() === targetDifficulty.toLowerCase()
    );
    reserve('position', stepTwoItem);

    const stepThreeType: SessionStepType =
      selectedMood.id === 'romantic'
        ? 'massage'
        : selectedMood.id === 'adventurous' || selectedMood.id === 'passionate'
          ? 'roleplay'
          : (Math.random() > 0.5 ? 'foreplay' : 'position');

    const stepThreeItem =
      stepThreeType === 'massage'
        ? pickItem('massage', massageTechniques)
        : stepThreeType === 'roleplay'
          ? pickItem('roleplay', rolePlayScenarios)
          : stepThreeType === 'foreplay'
            ? pickItem('foreplay', foreplayIdeas)
            : pickItem('position', positions);

    return [
      { number: 1, label: 'Start with...', type: 'foreplay', item: stepOneItem },
      { number: 2, label: 'Move into...', type: 'position', item: stepTwoItem },
      { number: 3, label: 'Finish with...', type: stepThreeType, item: stepThreeItem },
    ];
  }, [getSmartRecommendations, selectedMood.id, selectedMood.mood, targetDifficulty]);

  useEffect(() => {
    setSteps(generateSession());
  }, [generateSession, regenerateCount]);

  const handleViewDetails = (step: SessionStep) => {
    sound.light();
    if (step.type === 'position') {
      navigation.navigate('PositionDetail', { position: step.item });
      return;
    }
    if (step.type === 'foreplay') {
      navigation.navigate('ForeplayDetail', { item: step.item });
      return;
    }
    if (step.type === 'massage') {
      navigation.navigate('MassageDetail', { item: step.item });
      return;
    }
    navigation.navigate('RolePlayDetail', { item: step.item });
  };

  return (
    <LinearGradient
      colors={[themeColors.background.primary, themeColors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.progressBlock}>
          <Text style={[styles.progressText, { color: themeColors.text.secondary }]}>Step 2 of 3</Text>
          <View style={[styles.progressTrack, { backgroundColor: themeColors.cardLight }]}>
            <View style={[styles.progressFill, { backgroundColor: themeColors.primary[500], width: '66%' }]} />
          </View>
        </View>

        <View style={[styles.coachCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.coachTitle, { color: themeColors.text.primary }]}>Tonight's coach note</Text>
          <Text style={[styles.coachCopy, { color: themeColors.text.secondary }]}>{coachIntro}</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {steps.map((step, index) => (
            <View key={`${step.number}-${step.type}-${step.item?.id || index}`} style={styles.timelineRow}>
              <View style={styles.stepRail}>
                <View style={[styles.stepCircle, { borderColor: themeColors.primary[500], backgroundColor: themeColors.card }]}>
                  <Text style={[styles.stepCircleText, { color: themeColors.primary[400] }]}>{step.number}</Text>
                </View>
                {index < steps.length - 1 ? (
                  <View style={[styles.connector, { backgroundColor: themeColors.cardLight }]} />
                ) : null}
              </View>

              <View style={[styles.stepCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}>
                <Text style={[styles.stepLabel, { color: themeColors.text.muted }]}>{step.label}</Text>
                <Text style={[styles.itemName, { color: themeColors.text.primary }]}>{step.item?.name || 'Something new'}</Text>
                <Text style={[styles.vibeText, { color: themeColors.text.muted }]}>
                  {`"${step.item?.vibe || 'A curated fit for tonight.'}"`}
                </Text>

                <View style={[styles.badge, { backgroundColor: themeColors.primary[500] + '22' }]}>
                  <Text style={[styles.badgeText, { color: themeColors.primary[400] }]}>{getBadgeText(step)}</Text>
                </View>

                <TouchableOpacity onPress={() => handleViewDetails(step)} accessibilityRole="button">
                  <Text style={[styles.detailsLink, { color: themeColors.primary[400] }]}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.regenerateButton, { borderColor: themeColors.cardLight, backgroundColor: themeColors.card }]}
          onPress={() => {
            sound.light();
            setRegenerateCount((value) => value + 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Regenerate session"
        >
          <Text style={[styles.regenerateText, { color: themeColors.text.secondary }]}>Regenerate session 🎲</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={() => {
            sound.medium();
            navigation.navigate('SessionRatingScreen', { mood: selectedMood, steps });
          }}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="We're ready — let's go"
        >
          <LinearGradient
            colors={[themeColors.primary[400], themeColors.primary[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>We're ready — let's go →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBlock: {
    marginTop: 4,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  coachCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  coachTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  coachCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepRail: {
    width: 36,
    alignItems: 'center',
    marginRight: 8,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  connector: {
    width: 2,
    minHeight: 86,
    marginTop: 6,
    borderRadius: 2,
  },
  stepCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  vibeText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontStyle: 'italic',
  },
  badge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsLink: {
    marginTop: 11,
    fontSize: 13,
    fontWeight: '700',
  },
  regenerateButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  regenerateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ctaWrapper: {
    marginTop: 12,
    borderRadius: 28,
    overflow: 'hidden',
  },
  ctaGradient: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
