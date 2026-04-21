import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moods } from '@/content/positions';
import {
  positions,
  foreplayIdeas,
  oralPlayIdeas,
  massageTechniques,
  rolePlayScenarios,
} from '@/content/localizedContent';
import { sound } from '@/services/audio';
import { getThemeColors, useThemeStore } from '@/store/useThemeStore';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy } from '@/copy';
import type { ContentType } from '@/types/app';

type Recommendation = {
  type: ContentType;
  item: {
    id: number;
    name: string;
    vibe?: string;
    mood?: string;
    [key: string]: unknown;
  };
  reason: string;
};

interface SmartSuggestionCardProps {
  recommendation: Recommendation;
  onPress: () => void;
  index: number;
}

const resolveMoodIdFromCatalog = (recommendation: Recommendation): string | undefined => {
  const itemId = recommendation.item?.id;
  if (!itemId) return undefined;

  if (recommendation.type === 'position') {
    return positions.find((entry) => entry.id === itemId)?.mood;
  }
  if (recommendation.type === 'foreplay') {
    return foreplayIdeas.find((entry) => entry.id === itemId)?.mood;
  }
  if (recommendation.type === 'oral') {
    return oralPlayIdeas.find((entry) => entry.id === itemId)?.mood;
  }
  if (recommendation.type === 'massage') {
    return massageTechniques.find((entry) => entry.id === itemId)?.mood;
  }
  return rolePlayScenarios.find((entry) => entry.id === itemId)?.mood;
};

export function SmartSuggestionCard({ recommendation, onPress, index }: SmartSuggestionCardProps) {
  const themeStore = useThemeStore();
  const { language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const themeColors = getThemeColors(themeStore.currentTheme);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(26)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 280,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateX]);

  const moodId = recommendation.item?.mood || resolveMoodIdFromCatalog(recommendation);
  const moodColor = useMemo(
    () => moods.find((entry) => entry.id === moodId)?.color || themeColors.primary[500],
    [moodId, themeColors.primary]
  );

  const handlePress = () => {
    sound.light();
    onPress();
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: `${themeColors.primary[500]}55`,
          },
        ]}
      >
        <View style={[styles.accentBar, { backgroundColor: moodColor }]} />

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.name, { color: themeColors.text.primary }]} numberOfLines={1}>
              {recommendation.item.name}
            </Text>
            <View style={[styles.badge, { backgroundColor: `${themeColors.primary[500]}30` }]}>
              <Text style={[styles.badgeText, { color: themeColors.primary[400] }]}>
                {voice.suggestion.badge[recommendation.type]}
              </Text>
            </View>
          </View>

          <Text style={[styles.vibe, { color: themeColors.text.muted }]} numberOfLines={2}>
            {recommendation.item.vibe || voice.suggestion.fallbackVibe}
          </Text>

          <Text style={[styles.reason, { color: themeColors.primary[400] }]} numberOfLines={2}>
            🌸 {recommendation.reason}
          </Text>
        </View>

        <Text style={[styles.arrow, { color: themeColors.text.secondary }]}>→</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accentBar: {
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  vibe: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 8,
  },
  reason: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  arrow: {
    alignSelf: 'center',
    fontSize: 24,
    paddingHorizontal: 12,
  },
});

