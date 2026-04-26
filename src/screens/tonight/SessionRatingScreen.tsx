import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
import { haptics } from '@/services/haptics';
import { resolveExperienceProfile } from '@/content/experienceProfiles';
import {
  foreplayIdeas,
  massageTechniques,
  oralPlayIdeas,
  positions,
  rolePlayScenarios,
} from '@/content/localizedContent';
import type { MoodPlaylist, SessionLearningFeedback, SessionReactionEmoji } from '@/types/app';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy, pickVoiceLine } from '@/copy';

type SessionStepType = 'foreplay' | 'oral' | 'position' | 'massage' | 'roleplay';
type ReactionKey = 'hot' | 'warm' | 'neutral';

interface SessionStep {
  number: 1 | 2 | 3 | 4;
  label: string;
  type: SessionStepType;
  item: {
    id: number;
    name?: string;
    vibe?: string;
    mood?: string;
    category?: string;
    difficulty?: string;
    duration?: string;
  };
}

interface SessionRatingScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    popToTop?: () => void;
  };
  route?: {
    params?: {
      mood?: MoodPlaylist;
      steps?: SessionStep[];
      sessionFeedback?: SessionLearningFeedback;
    };
  };
  ConfettiComponent?: React.ComponentType<{ visible: boolean; onComplete?: () => void }>;
}

const REACTIONS: Array<{ key: ReactionKey; emoji: string; rating: number }> = [
  { key: 'hot', emoji: '🔥', rating: 5 },
  { key: 'warm', emoji: '💜', rating: 4 },
  { key: 'neutral', emoji: '😐', rating: 3 },
];

export function SessionRatingScreen({ navigation, route }: SessionRatingScreenProps) {
  const { language } = useI18n();
  const store = useStore();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const copy = voice.sessionRating;
  const pulse = useRef(new Animated.Value(1)).current;

  const fallbackSteps = useMemo<SessionStep[]>(() => [
    { number: 1, label: copy.fallbackStartLabel, type: 'foreplay', item: foreplayIdeas[0] },
    { number: 2, label: copy.fallbackMoveLabel, type: 'position', item: positions[0] },
    { number: 3, label: copy.fallbackFinishLabel, type: 'oral', item: oralPlayIdeas[0] },
    { number: 4, label: copy.fallbackFinishLabel, type: 'massage', item: massageTechniques[0] || rolePlayScenarios[0] },
  ], [copy.fallbackFinishLabel, copy.fallbackMoveLabel, copy.fallbackStartLabel]);

  const sessionSteps = useMemo(() => {
    const incoming = route?.params?.steps || [];
    return incoming.length >= 3 ? incoming.slice(0, 4) : fallbackSteps;
  }, [fallbackSteps, route?.params?.steps]);

  const [selectedReaction, setSelectedReaction] = useState<ReactionKey | null>(null);
  const [saveWorked, setSaveWorked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const didSubmitRef = useRef(false);
  const feedbackRef = useRef<SessionLearningFeedback | null>(null);
  const reactionEmojiRef = useRef<SessionReactionEmoji | undefined>(undefined);

  const selectedReactionConfig = useMemo(
    () => REACTIONS.find((reaction) => reaction.key === selectedReaction) || null,
    [selectedReaction]
  );

  const baseSessionFeedback = useMemo<SessionLearningFeedback>(() => {
    const incoming = route?.params?.sessionFeedback;
    if (incoming) {
      return {
        ...incoming,
        steps: incoming.steps.filter((step) => Number(step.itemId) > 0),
      };
    }

    return {
      moodId: route?.params?.mood?.id,
      mood: route?.params?.mood?.mood,
      regenerateCount: 0,
      exitedEarly: false,
      saved: false,
      steps: sessionSteps.reduce<SessionLearningFeedback['steps']>((acc, step) => {
          const itemId = Number(step.item?.id || 0);
          if (!itemId) return acc;
          const difficulty = step.item?.difficulty;

          acc.push({
            sequencePosition: step.number,
            contentType: step.type,
            itemId,
            category: step.item?.category,
            mood: step.item?.mood,
            difficulty,
            opened: true,
            skipped: false,
            timeSpentSeconds: 20,
            experienceProfile: resolveExperienceProfile(step.type, {
              id: itemId,
              category: step.item?.category,
              mood: step.item?.mood,
              difficulty,
              duration: step.item?.duration,
            }),
          });
          return acc;
        }, []),
    };
  }, [route?.params?.mood?.id, route?.params?.mood?.mood, route?.params?.sessionFeedback, sessionSteps]);

  const reactionCopy = useMemo(() => {
    if (!selectedReaction) return '';
    return pickVoiceLine(copy.microcopy[selectedReaction], `afterglow-${selectedReaction}-${language}`);
  }, [copy.microcopy, language, selectedReaction]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    feedbackRef.current = baseSessionFeedback;
  }, [baseSessionFeedback]);

  useEffect(() => {
    reactionEmojiRef.current = selectedReactionConfig?.emoji as SessionReactionEmoji | undefined;
  }, [selectedReactionConfig]);

  useEffect(() => () => {
    if (didSubmitRef.current || !feedbackRef.current) return;
    useStore.getState().trackSessionFeedback({
      ...feedbackRef.current,
      reaction: reactionEmojiRef.current,
      saved: false,
      exitedEarly: true,
    });
  }, []);

  const markAsTriedIfNeeded = (type: SessionStepType, itemId: number, triedSet: Record<SessionStepType, Set<number>>) => {
    if (triedSet[type].has(itemId)) return;
    if (type === 'position') store.markTried(itemId);
    if (type === 'foreplay') store.markForeplayTried(itemId);
    if (type === 'oral') store.markOralTried(itemId);
    if (type === 'massage') store.markMassageTried(itemId);
    if (type === 'roleplay') store.markRoleplayTried(itemId);
    triedSet[type].add(itemId);
  };

  const markAsFavoriteIfNeeded = (type: SessionStepType, itemId: number, favoriteSet: Record<SessionStepType, Set<number>>) => {
    if (favoriteSet[type].has(itemId)) return;
    if (type === 'position') store.toggleFavorite(itemId);
    if (type === 'foreplay') store.toggleForeplayFavorite(itemId);
    if (type === 'oral') store.toggleOralFavorite(itemId);
    if (type === 'massage') store.toggleMassageFavorite(itemId);
    if (type === 'roleplay') store.toggleRoleplayFavorite(itemId);
    favoriteSet[type].add(itemId);
  };

  const handleDone = () => {
    if (isSubmitting || !selectedReactionConfig) return;
    didSubmitRef.current = true;
    setIsSubmitting(true);
    haptics.complete();

    const state = useStore.getState();
    const triedSet: Record<SessionStepType, Set<number>> = {
      position: new Set(state.tried),
      foreplay: new Set(state.triedForeplay),
      massage: new Set(state.triedMassage),
      oral: new Set(state.triedOral),
      roleplay: new Set(state.triedRoleplay),
    };
    const favoriteSet: Record<SessionStepType, Set<number>> = {
      position: new Set(state.favorites),
      foreplay: new Set(state.favoriteForeplay),
      massage: new Set(state.favoriteMassage),
      oral: new Set(state.favoriteOral),
      roleplay: new Set(state.favoriteRoleplay),
    };

    sessionSteps.forEach((step) => {
      const itemId = Number(step.item?.id || 0);
      if (!itemId) return;

      store.logActivity(step.type, itemId);
      markAsTriedIfNeeded(step.type, itemId, triedSet);
      if (saveWorked) {
        markAsFavoriteIfNeeded(step.type, itemId, favoriteSet);
      }
      store.addNote({
        type: step.type,
        itemId,
        text: `Afterglow ${selectedReactionConfig.emoji}`,
        rating: selectedReactionConfig.rating,
      });
    });

    store.trackSessionFeedback({
      ...baseSessionFeedback,
      reaction: selectedReactionConfig.emoji as SessionReactionEmoji,
      saved: saveWorked,
      exitedEarly: false,
    });

    store.checkAndAwardAchievements();
    sound.celebration();

    if (navigation.popToTop) {
      navigation.popToTop();
      return;
    }
    navigation.navigate('MainTabs');
  };

  return (
    <LinearGradient
      colors={[themeColors.background.primary, themeColors.background.secondary]}
      style={styles.gradient}
    >
      <View style={[styles.glow, styles.glowTop, { backgroundColor: themeColors.primary[500] + '1f' }]} />
      <View style={[styles.glow, styles.glowBottom, { backgroundColor: themeColors.primary[400] + '16' }]} />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('TonightSessionScreen', route?.params || {})} accessibilityRole="button">
          <Text style={[styles.backText, { color: themeColors.text.secondary }]}>←</Text>
        </TouchableOpacity>
        <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: pulse }] }]}>🌸</Animated.Text>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>{copy.title}</Text>
        <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>{copy.emojiPrompt}</Text>

        <View style={styles.reactionRow}>
          {REACTIONS.map((reaction) => {
            const selected = selectedReaction === reaction.key;
            return (
              <TouchableOpacity
                key={reaction.key}
                style={[
                  styles.reactionButton,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: selected ? themeColors.primary[500] : themeColors.cardLight,
                  },
                ]}
                onPress={() => {
                  sound.light();
                  setSelectedReaction(reaction.key);
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={copy.reactionA11y[reaction.key]}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedReaction ? (
          <>
            <Text style={[styles.microCopy, { color: themeColors.primary[400] }]}>{reactionCopy}</Text>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: themeColors.cardLight, backgroundColor: themeColors.card }]}
              onPress={() => {
                sound.light();
                setSaveWorked((value) => !value);
              }}
              activeOpacity={0.9}
            >
              <Text style={[styles.secondaryButtonText, { color: saveWorked ? themeColors.primary[400] : themeColors.text.secondary }]}>
                {copy.saveWorked}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.doneCta, isSubmitting && { opacity: 0.7 }]}
              onPress={handleDone}
              activeOpacity={0.9}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={[themeColors.primary[400], themeColors.primary[500]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneCtaGradient}
              >
                <Text style={styles.doneCtaText}>{copy.doneSimple}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : null}
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
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backText: {
    fontSize: 28,
    fontWeight: '700',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.34,
  },
  glowTop: { top: -80, right: -60 },
  glowBottom: { bottom: -100, left: -50 },
  heroEmoji: {
    fontSize: 66,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  reactionButton: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 42,
  },
  microCopy: {
    marginTop: 20,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 14,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  doneCta: {
    marginTop: 12,
    borderRadius: 26,
    overflow: 'hidden',
  },
  doneCtaGradient: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCtaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
