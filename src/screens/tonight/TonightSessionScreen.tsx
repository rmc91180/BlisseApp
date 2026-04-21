import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { resolveExperienceProfile } from '@/content/experienceProfiles';
import type { MoodPlaylist, SessionLearningFeedback } from '@/types/app';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy } from '@/copy';
import {
  foreplayIdeas,
  massageTechniques,
  positions,
  rolePlayScenarios,
} from '@/content/localizedContent';

type SessionStepType = 'foreplay' | 'position' | 'massage' | 'roleplay';

interface SessionStep {
  number: 1 | 2 | 3;
  label: string;
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
  const { language } = useI18n();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const experience = useStore((state) => state.experience);
  const learningPreferences = useStore((state) => state.learningPreferences);
  const getSmartRecommendations = useStore((state) => state.getSmartRecommendations);
  const trackSessionFeedback = useStore((state) => state.trackSessionFeedback);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [steps, setSteps] = useState<SessionStep[]>([]);
  const openedStepKeysRef = useRef<Set<string>>(new Set());
  const flowStartedAtRef = useRef(Date.now());
  const didAdvanceRef = useRef(false);
  const latestStepsRef = useRef<SessionStep[]>([]);
  const latestRegenerateCountRef = useRef(0);

  const selectedMood = useMemo(() => {
    const fromRoute = route?.params?.mood;
    if (fromRoute) return fromRoute;
    if (moodProp) return moodProp;
    return MOOD_PLAYLISTS[0];
  }, [moodProp, route?.params?.mood]);
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const copy = voice.sessionPlan;
  const vibeLine = copy.coachIntro[selectedMood.id] || copy.coachIntro.romantic || '';
  const targetDifficulty = normalizeExperience(experience);
  const step3SequenceScores = learningPreferences.sequenceScores.step3;

  const getStepKey = useCallback((step: SessionStep) => (
    `${step.type}:${Number(step.item?.id || step.number)}`
  ), []);

  const buildStepSignals = useCallback((sessionSteps: SessionStep[]): SessionLearningFeedback['steps'] => {
    if (sessionSteps.length === 0) return [];

    const totalSeconds = Math.max(8, Math.round((Date.now() - flowStartedAtRef.current) / 1000));
    const openedCount = sessionSteps.filter((step) => openedStepKeysRef.current.has(getStepKey(step))).length;
    const unopenedCount = Math.max(1, sessionSteps.length - openedCount);
    const openedShare = openedCount > 0 ? 0.75 : 0;
    const unopenedShare = 1 - openedShare;
    const signals: SessionLearningFeedback['steps'] = [];

    sessionSteps.forEach((step) => {
      const itemId = Number(step.item?.id || 0);
      if (!itemId) return;

      const opened = openedStepKeysRef.current.has(getStepKey(step));
      const share = openedCount === 0
        ? 1 / sessionSteps.length
        : opened
          ? openedShare / openedCount
          : unopenedShare / unopenedCount;
      const timeSpentSeconds = Math.max(opened ? 8 : 4, Math.round(totalSeconds * share));
      const difficulty = step.item?.difficulty;

      signals.push({
        sequencePosition: step.number,
        contentType: step.type,
        itemId,
        category: step.item?.category,
        mood: step.item?.mood,
        difficulty,
        experienceProfile: resolveExperienceProfile(step.type, {
          id: itemId,
          category: step.item?.category,
          mood: step.item?.mood,
          difficulty,
          duration: step.item?.duration,
        }),
        opened,
        skipped: !opened,
        timeSpentSeconds,
      });
    });

    return signals;
  }, [getStepKey]);

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
          : ((step3SequenceScores.foreplay || 50) >= (step3SequenceScores.position || 50) ? 'foreplay' : 'position');

    const stepThreeItem =
      stepThreeType === 'massage'
        ? pickItem('massage', massageTechniques)
        : stepThreeType === 'roleplay'
          ? pickItem('roleplay', rolePlayScenarios)
          : stepThreeType === 'foreplay'
            ? pickItem('foreplay', foreplayIdeas)
            : pickItem('position', positions);

    return [
      { number: 1, label: copy.start, type: 'foreplay', item: stepOneItem },
      { number: 2, label: copy.move, type: 'position', item: stepTwoItem },
      { number: 3, label: copy.finish, type: stepThreeType, item: stepThreeItem },
    ];
  }, [
    copy.finish,
    copy.move,
    copy.start,
    getSmartRecommendations,
    selectedMood.id,
    selectedMood.mood,
    step3SequenceScores.foreplay,
    step3SequenceScores.position,
    targetDifficulty,
  ]);

  useEffect(() => {
    setSteps(generateSession());
  }, [generateSession, regenerateCount]);

  useEffect(() => {
    latestStepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    latestRegenerateCountRef.current = regenerateCount;
  }, [regenerateCount]);

  useEffect(() => () => {
    if (didAdvanceRef.current) return;
    const sessionSignals = buildStepSignals(latestStepsRef.current);
    trackSessionFeedback({
      moodId: selectedMood.id,
      mood: selectedMood.mood,
      regenerateCount: latestRegenerateCountRef.current,
      exitedEarly: true,
      saved: false,
      steps: sessionSignals,
    });
  }, [buildStepSignals, selectedMood.id, selectedMood.mood, trackSessionFeedback]);

  const handleViewDetails = (step: SessionStep) => {
    openedStepKeysRef.current.add(getStepKey(step));
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
        <Text style={[styles.vibeLine, { color: themeColors.text.secondary }]}>{vibeLine}</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.flowList} showsVerticalScrollIndicator={false}>
          {steps.map((step, index) => (
            <View key={`${step.number}-${step.type}-${step.item?.id || index}`} style={[styles.flowCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}>
              <Text style={[styles.itemName, { color: themeColors.text.primary }]}>{step.item?.name || copy.fallbackName}</Text>
              <Text style={[styles.vibeText, { color: themeColors.text.muted }]} numberOfLines={2}>
                {step.item?.vibe || copy.fallbackVibe}
              </Text>

              <View style={styles.cardFooter}>
                <View style={[styles.badge, { backgroundColor: themeColors.primary[500] + '22' }]}>
                  <Text style={[styles.badgeText, { color: themeColors.primary[400] }]}>
                    {getBadgeText(step)}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => handleViewDetails(step)} accessibilityRole="button">
                  <Text style={[styles.detailsLink, { color: themeColors.primary[400] }]}>
                    {index === steps.length - 1 ? copy.tryAction : copy.openAction}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.regenerateButton, { borderColor: themeColors.cardLight, backgroundColor: themeColors.card }]}
            onPress={() => {
              sound.light();
              openedStepKeysRef.current = new Set();
              setRegenerateCount((value) => value + 1);
            }}
            accessibilityRole="button"
            accessibilityLabel={copy.regenerateA11y}
          >
            <Text style={[styles.regenerateText, { color: themeColors.text.secondary }]}>{copy.regenerate}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaWrapper}
            onPress={() => {
              didAdvanceRef.current = true;
              sound.medium();
              navigation.navigate('SessionRatingScreen', {
                mood: selectedMood,
                steps,
                sessionFeedback: {
                  moodId: selectedMood.id,
                  mood: selectedMood.mood,
                  regenerateCount,
                  exitedEarly: false,
                  saved: false,
                  steps: buildStepSignals(steps),
                } satisfies SessionLearningFeedback,
              });
            }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={copy.ctaA11y}
          >
            <LinearGradient
              colors={[themeColors.primary[400], themeColors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>{copy.cta}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  vibeLine: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  flowList: {
    paddingBottom: 6,
  },
  flowCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  vibeText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomActions: {
    marginTop: 8,
    gap: 10,
  },
  regenerateButton: {
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
