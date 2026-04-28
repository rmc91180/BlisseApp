import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/store/useStore';
import { haptics } from '@/services/haptics';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy, pickVoiceLine } from '@/copy';

interface DailyBonusModalProps {
  visible: boolean;
  onClose: () => void;
  ConfettiComponent: React.ComponentType<{ visible: boolean; onComplete?: () => void }>;
}

export function DailyBonusModal({ visible, onClose, ConfettiComponent }: DailyBonusModalProps) {
  const store = useStore();
  const { language } = useI18n();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const pulseScale = useRef(new Animated.Value(1)).current;
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const previewBonus = useMemo(
    () => Math.min(5, 1 + Math.floor(store.loginStreak / 3)),
    [store.loginStreak]
  );

  useEffect(() => {
    if (!visible) return;

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnim.start();
    return () => {
      pulseAnim.stop();
      pulseScale.setValue(1);
    };
  }, [pulseScale, visible]);

  useEffect(() => {
    if (!visible) {
      setIsClaiming(false);
      setClaimedAmount(0);
      setShowConfetti(false);
    }
  }, [visible]);

  const handleClaim = () => {
    if (isClaiming) return;
    const claimed = store.claimDailyBonus();
    setClaimedAmount(claimed);
    setIsClaiming(true);
    setShowConfetti(true);
    haptics.celebrate();

    setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 2000);
  };

  const starsToRender = isClaiming ? claimedAmount : previewBonus;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => undefined} style={[styles.sheet, { backgroundColor: themeColors.card }]}>
          <ConfettiComponent visible={showConfetti} />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={pickVoiceLine(voice.generic.close, `daily-bonus-close-${language}`)}
          >
            <Text style={[styles.closeText, { color: themeColors.text.muted }]}>×</Text>
          </TouchableOpacity>

          <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: pulseScale }] }]}>⭐</Animated.Text>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>{voice.dailyBonus.title}</Text>
          {store.loginStreak > 1 ? (
            <Text style={[styles.streakText, { color: themeColors.text.secondary }]}>
              {voice.dailyBonus.dayStreak(store.loginStreak)}
            </Text>
          ) : null}

          <View style={styles.starsRow}>
            {Array.from({ length: Math.max(0, starsToRender) }).map((_, index) => (
              <Text key={index} style={[styles.star, { color: themeColors.gold }]}>⭐</Text>
            ))}
          </View>

          <TouchableOpacity disabled={isClaiming} onPress={handleClaim} style={[styles.claimButton, isClaiming && { opacity: 0.7 }]}>
            <LinearGradient
              colors={[themeColors.primary[400], themeColors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.claimGradient}
            >
              <Text style={styles.claimText}>
                {isClaiming ? voice.dailyBonus.collected(claimedAmount) : voice.dailyBonus.collect(previewBonus)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.caption, { color: themeColors.text.muted }]}>{voice.dailyBonus.caption}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 26,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  closeText: {
    fontSize: 24,
    lineHeight: 24,
  },
  heroEmoji: {
    fontSize: 52,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 14,
    minHeight: 26,
  },
  star: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  claimButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 16,
  },
  claimGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  caption: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
  },
});
