import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '@/services/haptics';
import { FEATURE_UNLOCK_LABELS, type UnlockableFeature } from '@/constants/gamification';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy } from '@/copy';
import type { Level } from '@/types/app';

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
  newLevel: Level | null;
  unlockedFeatures: UnlockableFeature[];
  unlockMessage?: string;
  ConfettiComponent: React.ComponentType<{ visible: boolean; onComplete?: () => void }>;
}

export function LevelUpModal({
  visible,
  onClose,
  newLevel,
  unlockedFeatures,
  unlockMessage,
  ConfettiComponent,
}: LevelUpModalProps) {
  const { language } = useI18n();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const voice = getVoiceCopy(language);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowConfetti(false);
      return;
    }
    setShowConfetti(true);
    haptics.celebrate();
  }, [visible]);

  if (!newLevel) return null;

  const featureLines = unlockedFeatures.map((feature) => FEATURE_UNLOCK_LABELS[feature]).filter(Boolean);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <ConfettiComponent visible={showConfetti} onComplete={() => setShowConfetti(false)} />

        <LinearGradient
          colors={[themeColors.background.primary, themeColors.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, { borderColor: themeColors.cardLight }]}
        >
          <Text style={styles.emoji}>{newLevel.emoji}</Text>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>{voice.labels.levelUpTitle}</Text>
          <Text style={[styles.levelName, { color: newLevel.color }]}>{newLevel.title}</Text>
          <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
            You reached Level {newLevel.level}
          </Text>
          {unlockMessage ? (
            <Text style={[styles.unlockMessage, { color: themeColors.primary[400] }]}>{unlockMessage}</Text>
          ) : null}

          <View style={[styles.unlockList, { backgroundColor: themeColors.cardLight }]}>
            <Text style={[styles.unlockHeader, { color: themeColors.text.primary }]}>{voice.labels.levelUpUnlockedNow}</Text>
            {featureLines.length > 0 ? (
              featureLines.map((line) => (
                <Text key={line} style={[styles.unlockItem, { color: themeColors.text.secondary }]}>
                  • {line}
                </Text>
              ))
            ) : (
              <Text style={[styles.unlockItem, { color: themeColors.text.secondary }]}>
                • {voice.labels.levelUpUnlockedNow}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.ctaWrapper}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={voice.labels.levelUpClaim}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[themeColors.primary[400], themeColors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>{voice.labels.levelUpClaim}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  levelName: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  unlockMessage: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  unlockList: {
    marginTop: 14,
    width: '100%',
    borderRadius: 14,
    padding: 12,
  },
  unlockHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  unlockItem: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  ctaWrapper: {
    marginTop: 16,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cta: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
