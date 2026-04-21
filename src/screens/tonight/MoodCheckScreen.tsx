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
import { sound } from '@/services/audio';

interface MoodCheckScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export function MoodCheckScreen({ navigation }: MoodCheckScreenProps) {
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const selectedMood = MOOD_PLAYLISTS.find((mood) => mood.id === selectedMoodId) || null;

  const handleSelectMood = (mood: MoodPlaylist) => {
    setSelectedMoodId(mood.id);
    sound.light();
  };

  const handleContinue = () => {
    if (!selectedMood) return;
    navigation.navigate('TonightSessionScreen', {
      mood: selectedMood,
      moodId: selectedMood.id,
    });
  };

  return (
    <LinearGradient
      colors={[themeColors.background.primary, themeColors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerBlock}>
          <Text style={[styles.header, { color: themeColors.text.primary }]}>
            How are you feeling tonight?
          </Text>
          <Text style={[styles.subheader, { color: themeColors.text.muted }]}>
            Be honest — we'll match you perfectly
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
                accessibilityLabel={`${mood.name}. ${mood.description}`}
                accessibilityState={{ selected }}
              >
                <Text style={styles.cardEmoji}>{mood.emoji}</Text>
                <Text style={[styles.cardTitle, { color: themeColors.text.primary }]}>{mood.name}</Text>
                <Text style={[styles.cardDescription, { color: themeColors.text.muted }]}>{mood.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
          accessibilityLabel="Build our session"
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
            <Text style={styles.ctaText}>Build our session →</Text>
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
    flex: 0.34,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    flex: 0.5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
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
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
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

