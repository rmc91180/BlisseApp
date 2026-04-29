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
import { MOOD_PLAYLISTS } from '@/constants/gamification';
import { resolveExperienceProfile } from '@/content/experienceProfiles';
import { buildMoodSessionSteps, type MoodRefinement } from '@/services/moodSuggestions';
import type { MoodPlaylist, SessionLearningFeedback } from '@/types/app';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy } from '@/copy';
type SessionStepType = 'foreplay' | 'oral' | 'position' | 'massage' | 'roleplay';

interface SessionStep {
  number: 1 | 2 | 3 | 4;
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
      refinement?: MoodRefinement;
    };
  };
  mood?: MoodPlaylist;
}

const getBadgeText = (step: SessionStep): string => {
  if (step.type === 'foreplay') return step.item.duration || 'Quick';
  if (step.type === 'oral') return step.item.duration || step.item.category || 'Touch';
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
  const vibeLine = copy.openingNote[selectedMood.id] || copy.openingNote.romantic || '';
  const refinement = route?.params?.refinement;

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
    const recommendations = getSmartRecommendations(80);
    const balanced = buildMoodSessionSteps(selectedMood, recommendations, refinement, language);
    return balanced.slice(0, 4).map((suggestion, index) => ({
      number: (index + 1) as SessionStep['number'],
      label: index === 0 ? copy.start : index === balanced.length - 1 ? copy.finish : copy.move,
      type: suggestion.type as SessionStepType,
      item: suggestion.item,
    }));
  }, [
    copy.finish,
    copy.move,
    copy.start,
    getSmartRecommendations,
    language,
    refinement,
    selectedMood,
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
    const itemId = Number(step.item?.id || 0);
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
    if (step.type === 'oral') {
      navigation.navigate('OralDetail', { item: step.item });
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('MainTabs')} accessibilityRole="button">
          <Text style={[styles.backText, { color: themeColors.text.secondary }]}>←</Text>
        </TouchableOpacity>
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  backText: {
    fontSize: 28,
    fontWeight: '700',
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
