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
import type { AppLanguage } from '@/i18n/translations';

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
};

const resolveMoodIdFromCatalog = (
  recommendation: Recommendation
): string | undefined => {
  const itemId = recommendation.item?.id;
  if (!itemId) return undefined;

  if (recommendation.type === 'position') {
    return positions.find((e) => e.id === itemId)?.mood;
  }
  if (recommendation.type === 'foreplay') {
    return foreplayIdeas.find((e) => e.id === itemId)?.mood;
  }
  if (recommendation.type === 'oral') {
    return oralPlayIdeas.find((e) => e.id === itemId)?.mood;
  }
  if (recommendation.type === 'massage') {
    return massageTechniques.find((e) => e.id === itemId)?.mood;
  }
  return rolePlayScenarios.find((e) => e.id === itemId)?.mood;
};

const SUGGESTION_WHY: Record<AppLanguage, Record<ContentType, string[]>> = {
  en: {
    foreplay: ['A good way to ease into things.', 'Soft, close, and easy to start.', 'Nice and unhurried.'],
    oral: ['This one usually lands really well.', 'Comfortable, familiar, and fun.', 'A good rhythm builder.'],
    massage: ['Perfect for slowing things down.', 'Helps you both settle in.', 'Very grounding tonight.'],
    position: ['Fits the energy you picked.', 'Easy to slip into.', 'Feels natural here.'],
    roleplay: ['A little playful, a little bold.', 'Light fun with a spark.', 'Just enough edge.'],
  },
  es: {
    foreplay: ['Una forma linda de entrar en clima.', 'Suave, cerca y fácil de empezar.', 'Rico y sin apuro.'],
    oral: ['Esto suele sentirse muy bien.', 'Cómodo, familiar y divertido.', 'Buen ritmo para encenderse.'],
    massage: ['Perfecto para bajar el ritmo.', 'Los ayuda a acomodarse juntos.', 'Muy aterrizado para esta noche.'],
    position: ['Va con la energía que eligieron.', 'Fácil de entrar.', 'Se siente natural acá.'],
    roleplay: ['Un poco juguetón, un poco atrevido.', 'Diversión ligera con chispa.', 'El borde justo.'],
  },
  pt: {
    foreplay: ['Um jeito gostoso de entrar no clima.', 'Suave, perto e fácil de começar.', 'Bom e sem pressa.'],
    oral: ['Esse costuma bater muito bem.', 'Confortável, familiar e divertido.', 'Um bom ritmo pra aquecer.'],
    massage: ['Perfeito pra desacelerar.', 'Ajuda vocês a chegarem juntos.', 'Bem gostoso pra hoje.'],
    position: ['Combina com a energia que vocês escolheram.', 'Fácil de entrar.', 'Fica natural aqui.'],
    roleplay: ['Um pouco brincalhão, um pouco ousado.', 'Diversão leve com faísca.', 'Na medida certa.'],
  },
  hi: {
    foreplay: ['मूड में आने का अच्छा तरीका।', 'नरम, करीब और आसान शुरुआत।', 'आराम से, बिना जल्दी।'],
    oral: ['ये अक्सर अच्छा लगता है।', 'Comfortable, familiar और fun।', 'गर्मी बनाने की अच्छी लय।'],
    massage: ['धीमा होने के लिए perfect।', 'आप दोनों को साथ settle होने देता है।', 'आज रात के लिए बहुत grounded।'],
    position: ['आपने जो energy चुनी, उससे match करता है।', 'इसमें आना आसान है।', 'यहां natural लगता है।'],
    roleplay: ['थोड़ा playful, थोड़ा bold।', 'हल्का मज़ा, थोड़ी spark।', 'बस सही edge।'],
  },
};

const resolveSuggestionWhy = (recommendation: Recommendation, language: AppLanguage): string => {
  const lines = SUGGESTION_WHY[language]?.[recommendation.type] || SUGGESTION_WHY.en[recommendation.type];

  const index =
    typeof recommendation.item?.id === 'number'
      ? recommendation.item.id % lines.length
      : 0;

  return lines[index];
};

export function SmartSuggestionCard({
  recommendation,
  onPress,
  index,
}: SmartSuggestionCardProps) {
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

  const moodId =
    recommendation.item?.mood ?? resolveMoodIdFromCatalog(recommendation);

  const moodColor = useMemo(
    () =>
      moods.find((m) => m.id === moodId)?.color ??
      themeColors.primary[500],
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
            <Text
              style={[styles.name, { color: themeColors.text.primary }]}
              numberOfLines={1}
            >
              {recommendation.item.name}
            </Text>

            <View
              style={[
                styles.badge,
                { backgroundColor: `${themeColors.primary[500]}30` },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: themeColors.primary[400] },
                ]}
              >
                {voice.suggestion.badge[recommendation.type]}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.vibe, { color: themeColors.text.muted }]}
            numberOfLines={2}
          >
            {recommendation.item.vibe ?? voice.suggestion.fallbackVibe}
          </Text>

          <Text
            style={[styles.reason, { color: themeColors.primary[400] }]}
            numberOfLines={2}
          >
            🌸 {resolveSuggestionWhy(recommendation, language)}
          </Text>
        </View>

        <Text style={[styles.arrow, { color: themeColors.text.secondary }]}>
          →
        </Text>
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
