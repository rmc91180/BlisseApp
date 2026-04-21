import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  positions,
  foreplayIdeas,
  oralPlayIdeas,
  massageTechniques,
  rolePlayScenarios,
} from '@/content/localizedContent';
import { sound } from '@/services/audio';
import { Analytics } from '@/services/analytics';
import { useStore } from '@/store/useStore';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy } from '@/copy';

type PreviewKey = 'foreplay' | 'position' | 'roleplay';

const EXPERIENCE_PREVIEW_IDS: Record<string, { foreplay: number; position: number; roleplay: number }> = {
  beginner: { foreplay: 101, position: 9, roleplay: 401 },
  intermediate: { foreplay: 103, position: 3, roleplay: 402 },
  advanced: { foreplay: 106, position: 5, roleplay: 410 },
};

const RELATIONSHIP_ORDER: Record<string, PreviewKey[]> = {
  hetero: ['foreplay', 'position', 'roleplay'],
  mm: ['roleplay', 'position', 'foreplay'],
  ff: ['foreplay', 'roleplay', 'position'],
  other: ['foreplay', 'position', 'roleplay'],
};

const PREVIEW_EMOJI: Record<PreviewKey, string> = {
  foreplay: '🌸',
  position: '💞',
  roleplay: '🎭',
};

export function OnboardingPayoffScreen() {
  const store = useStore();
  const { language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const subheaderOpacity = useRef(new Animated.Value(0)).current;
  const valueRowOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;
  const cardAnims = useRef(
    Array.from({ length: 3 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(22),
    }))
  ).current;

  const totalIdeas = useMemo(
    () =>
      positions.length +
      foreplayIdeas.length +
      oralPlayIdeas.length +
      massageTechniques.length +
      rolePlayScenarios.length,
    []
  );

  const payoffLine = useMemo(() => {
    if (store.interests.includes('deepConnection')) return voice.onboarding.payoffSubline.deepConnection;
    if (store.interests.includes('spiceThingsUp')) return voice.onboarding.payoffSubline.spiceThingsUp;
    if (store.interests.includes('adventurous')) return voice.onboarding.payoffSubline.adventurous;
    if (store.interests.includes('quickies')) return voice.onboarding.payoffSubline.quickies;
    return voice.onboarding.payoffSubline.default;
  }, [store.interests, voice.onboarding.payoffSubline]);

  const previewCards = useMemo(() => {
    const experienceKey = (store.experience || 'beginner').toLowerCase();
    const experienceSet = EXPERIENCE_PREVIEW_IDS[experienceKey] || EXPERIENCE_PREVIEW_IDS.beginner;
    const orderedTypes = RELATIONSHIP_ORDER[store.relationshipType || 'other'] || RELATIONSHIP_ORDER.other;
    const previewMap = {
      foreplay: foreplayIdeas.find((item) => item.id === experienceSet.foreplay),
      position: positions.find((item) => item.id === experienceSet.position),
      roleplay: rolePlayScenarios.find((item) => item.id === experienceSet.roleplay),
    } as const;

    return orderedTypes
      .map((type) => {
        const item = previewMap[type];
        if (!item) return null;
        return {
          type,
          emoji: PREVIEW_EMOJI[type],
          name: item.name,
          category: item.category,
        };
      })
      .filter(Boolean) as Array<{ type: PreviewKey; emoji: string; name: string; category: string }>;
  }, [store.experience, store.relationshipType]);

  useEffect(() => {
    Analytics.trackOnboardingStep('payoff');
  }, []);

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 320,
      delay: 0,
      useNativeDriver: true,
    }).start();

    Animated.timing(subheaderOpacity, {
      toValue: 1,
      duration: 320,
      delay: 200,
      useNativeDriver: true,
    }).start();

    cardAnims.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 360,
          delay: 400 + index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 360,
          delay: 400 + index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    });

    Animated.timing(valueRowOpacity, {
      toValue: 1,
      duration: 320,
      delay: 700,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 320,
        delay: 900,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 0,
        duration: 320,
        delay: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonOpacity, buttonTranslateY, cardAnims, headerOpacity, subheaderOpacity, valueRowOpacity]);

  const handleBegin = () => {
    sound.success();
    store.completeOnboarding();
  };

  return (
    <LinearGradient
      colors={[themeColors.background.primary, themeColors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: headerOpacity }}>
            <Text style={[styles.header, { color: themeColors.text.primary }]}>
              {voice.onboarding.payoffHeader(store.name || '')}
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: subheaderOpacity }}>
            <Text style={[styles.subheader, { color: themeColors.text.secondary }]}>{payoffLine}</Text>
          </Animated.View>

          <View style={styles.cardStack}>
            {previewCards.map((preview, index) => (
              <Animated.View
                key={`${preview.type}-${preview.name}`}
                style={{
                  opacity: cardAnims[index]?.opacity ?? 1,
                  transform: [{ translateY: cardAnims[index]?.translateY ?? 0 }],
                }}
              >
                <View
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.cardLight,
                    },
                  ]}
                >
                  <Text style={styles.previewEmoji}>{preview.emoji}</Text>
                  <View style={styles.previewContent}>
                    <Text style={[styles.previewName, { color: themeColors.text.primary }]}>{preview.name}</Text>
                    <Text style={[styles.previewCategory, { color: themeColors.text.muted }]}>{preview.category}</Text>
                  </View>
                  <View style={styles.frostedOverlay}>
                    <Text style={styles.lockCopy}>{voice.onboarding.payoffUnlock}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View style={[styles.valueRow, { opacity: valueRowOpacity }]}>
            <View style={styles.valueColumn}>
              <Text style={styles.valueEmoji}>📚</Text>
              <Text style={[styles.valueText, { color: themeColors.text.primary }]}>{voice.onboarding.payoffValueIdeas(totalIdeas)}</Text>
            </View>
            <View style={styles.valueColumn}>
              <Text style={styles.valueEmoji}>🎯</Text>
              <Text style={[styles.valueText, { color: themeColors.text.primary }]}>{voice.onboarding.payoffValueChallenges}</Text>
            </View>
            <View style={styles.valueColumn}>
              <Text style={styles.valueEmoji}>🌙</Text>
              <Text style={[styles.valueText, { color: themeColors.text.primary }]}>{voice.onboarding.payoffValueDateNights}</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }}
          >
            <TouchableOpacity style={styles.ctaButton} onPress={handleBegin} activeOpacity={0.9}>
              <LinearGradient
                colors={[themeColors.primary[400], themeColors.primary[500]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>{voice.onboarding.payoffCta}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.cancelText, { color: themeColors.text.muted }]}>
              {voice.onboarding.payoffCancel}
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  header: {
    fontSize: 29,
    fontWeight: '700',
    lineHeight: 36,
  },
  subheader: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
  cardStack: {
    marginTop: 24,
    gap: 12,
  },
  previewCard: {
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
    opacity: 0.6,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewCategory: {
    marginTop: 5,
    fontSize: 13,
  },
  frostedOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 15, 24, 0.38)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockCopy: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  valueRow: {
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  valueColumn: {
    flex: 1,
    alignItems: 'center',
  },
  valueEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: 28,
    borderRadius: 26,
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
    fontSize: 18,
    fontWeight: '700',
  },
  cancelText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
});
