import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MOOD_PLAYLISTS } from '@/constants/gamification';
import type { MoodPlaylist } from '@/types/app';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';
import { useStore } from '@/store/useStore';
import { sound } from '@/services/audio';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy } from '@/copy';

interface MoodCheckScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack?: () => void;
  };
  route?: {
    params?: {
      mood?: MoodPlaylist;
    };
  };
}

export function MoodCheckScreen({ navigation, route }: MoodCheckScreenProps) {
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const { language } = useI18n();
  const store = useStore();
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(route?.params?.mood?.id || null);
  const [energy, setEnergy] = useState<'soft' | 'bright' | null>(null);
  const [pace, setPace] = useState<'short' | 'unfold' | null>(null);
  const voice = getVoiceCopy(language);

  const selectedMood = MOOD_PLAYLISTS.find((mood) => mood.id === selectedMoodId) || null;

  const handleSelectMood = (mood: MoodPlaylist) => {
    setSelectedMoodId(mood.id);
    store.setCurrentMood(mood.mood);
    sound.light();
  };

  const handleContinue = () => {
    if (!selectedMood) return;
    navigation.navigate('TonightSessionScreen', {
      mood: selectedMood,
      moodId: selectedMood.id,
      refinement: {
        energy: energy || undefined,
        pace: pace || undefined,
      },
    });
  };

  return (
    <LinearGradient
      colors={[themeColors.background.primary, themeColors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {navigation.goBack ? (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack?.()} accessibilityRole="button">
            <Text style={[styles.backText, { color: themeColors.text.secondary }]}>←</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerBlock}>
          <Text style={[styles.header, { color: themeColors.text.primary }]}>
            {voice.moodCheck.header}
          </Text>
          <Text style={[styles.subheader, { color: themeColors.text.secondary }]}>
            {voice.moodCheck.helper}
          </Text>
        </View>

        <View style={styles.grid}>
          {MOOD_PLAYLISTS.map((mood) => {
            const selected = mood.id === selectedMoodId;
            return (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: selected ? mood.color : themeColors.cardLight,
                  },
                  selected ? styles.cardSelected : null,
                ]}
                onPress={() => handleSelectMood(mood)}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={mood.name}
                accessibilityState={{ selected }}
              >
                <Text style={styles.cardEmoji}>{mood.emoji}</Text>
                <Text style={[styles.cardTitle, { color: themeColors.text.primary }]}>{mood.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedMood ? (
          <View style={styles.refineBlock}>
            <Text style={[styles.refineTitle, { color: themeColors.text.primary }]}>{voice.moodCheck.refineTitle}</Text>
            <View style={styles.refineRow}>
              <TouchableOpacity
                style={[styles.refineChip, { borderColor: energy === 'soft' ? selectedMood.color : themeColors.cardLight }]}
                onPress={() => setEnergy((value) => (value === 'soft' ? null : 'soft'))}
              >
                <Text style={[styles.refineChipText, { color: themeColors.text.secondary }]}>{voice.moodCheck.energySoft}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.refineChip, { borderColor: energy === 'bright' ? selectedMood.color : themeColors.cardLight }]}
                onPress={() => setEnergy((value) => (value === 'bright' ? null : 'bright'))}
              >
                <Text style={[styles.refineChipText, { color: themeColors.text.secondary }]}>{voice.moodCheck.energyPlayful}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.refineRow}>
              <TouchableOpacity
                style={[styles.refineChip, { borderColor: pace === 'short' ? selectedMood.color : themeColors.cardLight }]}
                onPress={() => setPace((value) => (value === 'short' ? null : 'short'))}
              >
                <Text style={[styles.refineChipText, { color: themeColors.text.secondary }]}>{voice.moodCheck.paceShort}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.refineChip, { borderColor: pace === 'unfold' ? selectedMood.color : themeColors.cardLight }]}
                onPress={() => setPace((value) => (value === 'unfold' ? null : 'unfold'))}
              >
                <Text style={[styles.refineChipText, { color: themeColors.text.secondary }]}>{voice.moodCheck.paceUnfold}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.ctaWrapper,
            !selectedMood ? styles.ctaDisabled : null,
          ]}
          onPress={handleContinue}
          disabled={!selectedMood}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedMood }}
          accessibilityLabel={voice.moodCheck.ctaA11y}
        >
          <LinearGradient
            colors={
              selectedMood
                ? [themeColors.primary[400], themeColors.primary[500]]
                : ['#4a4a4a', '#3a3a3a']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>{voice.moodCheck.cta}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerBlock: {
    flex: 0.28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginLeft: -8,
  },
  backText: {
    fontSize: 28,
    fontWeight: '700',
  },
  header: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  subheader: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  grid: {
    flex: 0.42,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  refineBlock: {
    marginTop: 6,
    marginBottom: 10,
  },
  refineTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  refineRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  refineChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  refineChipText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    width: '48%',
    minHeight: 132,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    shadowColor: '#ffffff',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  ctaWrapper: {
    marginTop: 'auto',
    borderRadius: 28,
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.65,
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
