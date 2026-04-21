import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/useStore';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';
import { sound } from '@/services/audio';
import { ACHIEVEMENTS, MOOD_PLAYLISTS } from '@/constants/gamification';
import {
  foreplayIdeas,
  massageTechniques,
  positions,
  rolePlayScenarios,
} from '@/content/localizedContent';
import type { MoodPlaylist } from '@/types/app';

type SessionStepType = 'foreplay' | 'position' | 'massage' | 'roleplay';

interface SessionStep {
  number: 1 | 2 | 3;
  label: 'Start with...' | 'Move into...' | 'Finish with...';
  type: SessionStepType;
  item: {
    id: number;
    name?: string;
    vibe?: string;
    mood?: string;
  };
}

type CompletionAction = 'tried' | 'favorites' | 'rate_only';

interface SessionRatingScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    popToTop?: () => void;
  };
  route?: {
    params?: {
      mood?: MoodPlaylist;
      steps?: SessionStep[];
    };
  };
  ConfettiComponent?: React.ComponentType<{ visible: boolean; onComplete?: () => void }>;
}

const COACH_CLOSER: Record<string, string> = {
  romantic: 'You chose warmth tonight. Keep that feeling close.',
  passionate: 'That fire matters most when it stays connected.',
  playful: 'You made space for fun, and that builds trust.',
  adventurous: 'You explored with care. That is real progress.',
  relaxed: 'You honored comfort tonight. That is a beautiful choice.',
  quickie: 'You made a small window count. That still matters.',
};

const AFTER_MOOD_OPTIONS = ['😊', '😍', '🔥'] as const;

const EmptyConfetti = () => null;

const fallbackSteps: SessionStep[] = [
  { number: 1, label: 'Start with...', type: 'foreplay', item: foreplayIdeas[0] },
  { number: 2, label: 'Move into...', type: 'position', item: positions[0] },
  { number: 3, label: 'Finish with...', type: 'massage', item: massageTechniques[0] || rolePlayScenarios[0] },
];

export function SessionRatingScreen({
  navigation,
  route,
  ConfettiComponent = EmptyConfetti,
}: SessionRatingScreenProps) {
  const store = useStore();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const pulse = useRef(new Animated.Value(1)).current;

  const selectedMood = route?.params?.mood || MOOD_PLAYLISTS[0];
  const sessionSteps = useMemo(() => {
    const incoming = route?.params?.steps || [];
    return incoming.length >= 3 ? incoming.slice(0, 3) : fallbackSteps;
  }, [route?.params?.steps]);

  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [afterMood, setAfterMood] = useState<(typeof AFTER_MOOD_OPTIONS)[number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const markAsTriedIfNeeded = (type: SessionStepType, itemId: number, triedSet: Record<SessionStepType, Set<number>>) => {
    if (triedSet[type].has(itemId)) return;
    if (type === 'position') store.markTried(itemId);
    if (type === 'foreplay') store.markForeplayTried(itemId);
    if (type === 'massage') store.markMassageTried(itemId);
    if (type === 'roleplay') store.markRoleplayTried(itemId);
    triedSet[type].add(itemId);
  };

  const markAsFavoriteIfNeeded = (type: SessionStepType, itemId: number, favoriteSet: Record<SessionStepType, Set<number>>) => {
    if (favoriteSet[type].has(itemId)) return;
    if (type === 'position') store.toggleFavorite(itemId);
    if (type === 'foreplay') store.toggleForeplayFavorite(itemId);
    if (type === 'massage') store.toggleMassageFavorite(itemId);
    if (type === 'roleplay') store.toggleRoleplayFavorite(itemId);
    favoriteSet[type].add(itemId);
  };

  const handleComplete = (action: CompletionAction) => {
    if (rating <= 0 || isSubmitting) return;
    setIsSubmitting(true);

    const state = useStore.getState();
    const triedSet: Record<SessionStepType, Set<number>> = {
      position: new Set(state.tried),
      foreplay: new Set(state.triedForeplay),
      massage: new Set(state.triedMassage),
      roleplay: new Set(state.triedRoleplay),
    };
    const favoriteSet: Record<SessionStepType, Set<number>> = {
      position: new Set(state.favorites),
      foreplay: new Set(state.favoriteForeplay),
      massage: new Set(state.favoriteMassage),
      roleplay: new Set(state.favoriteRoleplay),
    };

    let earned = 0;
    const achievementIds = new Set<string>();
    const noteTextParts = [note.trim(), afterMood ? `Post-session mood: ${afterMood}` : ''].filter(Boolean);
    const noteText = noteTextParts.join('\n').trim() || `Session rating: ${rating}/5`;

    sessionSteps.forEach((step) => {
      const itemId = Number(step.item?.id || 0);
      if (!itemId) return;

      const activityResult = store.logActivity(step.type, itemId);
      earned += activityResult.stars;
      activityResult.newAchievements.forEach((id) => achievementIds.add(id));

      store.addNote({
        type: step.type,
        itemId,
        text: noteText,
        rating,
      });

      if (action === 'tried') {
        markAsTriedIfNeeded(step.type, itemId, triedSet);
      }

      if (action === 'favorites') {
        markAsFavoriteIfNeeded(step.type, itemId, favoriteSet);
      }
    });

    store.checkAndAwardAchievements().forEach((id) => achievementIds.add(id));

    setStarsEarned(earned);
    setNewAchievements(Array.from(achievementIds));
    setShowConfetti(true);
    sound.celebration();
    setIsComplete(true);
    setIsSubmitting(false);
  };

  const handleDone = () => {
    sound.medium();
    if (navigation.popToTop) {
      navigation.popToTop();
      return;
    }
    navigation.navigate('MainTabs');
  };

  const coachCloser = COACH_CLOSER[selectedMood.id] || 'You showed up for each other tonight. That is the real win.';

  return (
    <LinearGradient
      colors={[themeColors.background.primary, themeColors.background.secondary]}
      style={styles.gradient}
    >
      <View style={[styles.glow, styles.glowTop, { backgroundColor: themeColors.primary[500] + '20' }]} />
      <View style={[styles.glow, styles.glowBottom, { backgroundColor: themeColors.primary[400] + '16' }]} />
      <ConfettiComponent visible={showConfetti} onComplete={() => setShowConfetti(false)} />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {!isComplete ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.progress, { color: themeColors.text.muted }]}>Step 3 of 3</Text>
            <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: pulse }] }]}>🌸</Animated.Text>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>How was tonight?</Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Be honest — it helps us get better at this
            </Text>

            <View style={[styles.coachCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}>
              <Text style={[styles.coachLabel, { color: themeColors.primary[400] }]}>Coach note</Text>
              <Text style={[styles.coachText, { color: themeColors.text.secondary }]}>
                Share what felt right. We tune to your rhythm.
              </Text>
            </View>

            <View style={[styles.ratingCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      sound.light();
                      setRating(value);
                    }}
                    style={styles.starButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Rate ${value} stars`}
                  >
                    <Text style={[styles.star, { color: value <= rating ? themeColors.gold : themeColors.text.muted }]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: themeColors.text.secondary }]}>Anything to remember?</Text>
              <TextInput
                style={[styles.noteInput, { color: themeColors.text.primary, backgroundColor: themeColors.cardLight }]}
                placeholder="Optional"
                placeholderTextColor={themeColors.text.muted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                value={note}
                onChangeText={setNote}
                maxLength={180}
              />

              <Text style={[styles.inputLabel, { color: themeColors.text.secondary }]}>How do you feel now?</Text>
              <View style={styles.moodRow}>
                {AFTER_MOOD_OPTIONS.map((emoji) => {
                  const selected = afterMood === emoji;
                  return (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.moodOption,
                        { backgroundColor: themeColors.cardLight, borderColor: themeColors.cardLight },
                        selected ? { borderColor: themeColors.primary[500], backgroundColor: themeColors.primary[500] + '26' } : null,
                      ]}
                      onPress={() => {
                        sound.light();
                        setAfterMood(emoji);
                      }}
                    >
                      <Text style={styles.moodEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {rating > 0 ? (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.primary[500] + '28', borderColor: themeColors.primary[500] }]}
                  onPress={() => handleComplete('tried')}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.actionText, { color: themeColors.primary[400] }]}>Mark all as tried ✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}
                  onPress={() => handleComplete('favorites')}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.actionText, { color: themeColors.text.primary }]}>Save favorites ❤️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}
                  onPress={() => handleComplete('rate_only')}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.actionText, { color: themeColors.text.secondary }]}>Just rate & close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.rateHint, { color: themeColors.text.muted }]}>Choose a rating to continue</Text>
            )}
          </ScrollView>
        ) : (
          <View style={styles.doneContainer}>
            <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: pulse }] }]}>🌸</Animated.Text>
            <Text style={[styles.doneTitle, { color: themeColors.text.primary }]}>You earned {starsEarned} ⭐</Text>
            <Text style={[styles.doneSubtitle, { color: themeColors.text.secondary }]}>Stars earned this session</Text>

            <View style={[styles.achievementCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}>
              <Text style={[styles.achievementHeader, { color: themeColors.text.primary }]}>New achievements</Text>
              {newAchievements.length === 0 ? (
                <Text style={[styles.achievementEmpty, { color: themeColors.text.muted }]}>
                  No new badge tonight, but your momentum is growing.
                </Text>
              ) : (
                newAchievements.map((achievementId) => {
                  const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
                  if (!achievement) return null;
                  return (
                    <View key={achievementId} style={styles.achievementRow}>
                      <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                      <View style={styles.achievementTextWrap}>
                        <Text style={[styles.achievementName, { color: themeColors.text.primary }]}>{achievement.name}</Text>
                        <Text style={[styles.achievementDescription, { color: themeColors.text.secondary }]}>
                          {achievement.description}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <Text style={[styles.coachCloser, { color: themeColors.primary[400] }]}>{coachCloser}</Text>

            <TouchableOpacity style={styles.doneCta} onPress={handleDone} activeOpacity={0.9}>
              <LinearGradient
                colors={[themeColors.primary[400], themeColors.primary[500]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneCtaGradient}
              >
                <Text style={styles.doneCtaText}>Done for tonight →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  scrollContent: { paddingBottom: 28 },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.35,
  },
  glowTop: { top: -80, right: -60 },
  glowBottom: { bottom: -100, left: -50 },
  progress: {
    alignSelf: 'center',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  heroEmoji: {
    marginTop: 14,
    fontSize: 62,
    textAlign: 'center',
  },
  title: {
    marginTop: 8,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  coachCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  coachLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  coachText: {
    fontSize: 13,
    lineHeight: 18,
  },
  ratingCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  star: {
    fontSize: 40,
    lineHeight: 44,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteInput: {
    borderRadius: 12,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  moodOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 26,
  },
  actionsContainer: {
    marginTop: 14,
    gap: 10,
  },
  actionButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  rateHint: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  doneContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  doneTitle: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  doneSubtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  achievementCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    maxHeight: 220,
  },
  achievementHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  achievementEmpty: {
    fontSize: 13,
    lineHeight: 18,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementEmoji: {
    fontSize: 22,
    marginRight: 8,
    marginTop: 1,
  },
  achievementTextWrap: {
    flex: 1,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  coachCloser: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  doneCta: {
    marginTop: 18,
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

