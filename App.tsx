import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Dimensions,
  Animated,
  Modal,
  Share,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import { deleteUser } from 'firebase/auth';
import { PostHogProvider, usePostHog, type PostHogOptions } from 'posthog-react-native';
import { RootAppNavigator } from '@/navigation/AppNavigator';

// Extracted modules
import { moods, categories, type Position } from '@/content/positions';
import { foreplayCategories, type ForeplayIdea } from '@/content/foreplay';
import { oralCategories, type OralPlayIdea } from '@/content/oralplay';
import type { MassageTechnique } from '@/content/massage';
import type { RolePlayScenario } from '@/content/roleplay';
import {
  positions, foreplayIdeas, oralPlayIdeas, massageTechniques, rolePlayScenarios,
  massageCategories, rolePlayCategories, setLanguageGetter,
} from '@/content/localizedContent';
import { SUPPORTED_LANGUAGES, getContentTypeKey, translateUi } from '@/i18n/translations';
import { getLegalContent } from '@/i18n/legalContent';
import {
  CONFETTI_COLORS,
  LEVEL_MOTIVATOR_LINES,
  SEASONAL_HOOK_LINES,
  MAX_PIN_ATTEMPTS,
  PIN_LOCKOUT_MS,
} from '@/constants/appConfig';
import {
  SEASONAL_GAME_OPTIONS, getCurrentSeason,
  TRUTH_OR_DARE, CURATED_PLAYLISTS, PLAYLIST_MOODS,
  detectPlatform, getPlatformIcon, getPlatformName,
} from '@/content/seasonal';
import {
  getLevel, getNextLevel, getUnlockedFeaturesForLevel, getRecommendationRotationKey, MOOD_PLAYLISTS, ACHIEVEMENTS, type UnlockableFeature,
} from '@/constants/gamification';
import { savePinToSecureStorage, loadPinFromSecureStorage } from '@/services/firebase';
import {
  ANALYTICS_BASE_PROPERTIES,
  sanitizeAnalyticsProperties, submitFormspreeMessage, flushQueuedFormspreeMessages,
  Analytics,
} from '@/services/analytics';
import { sendAggregateAnalyticsEvent } from '@/services/backendEvents';
import {
  ensureDailyJokeTeaserNotifications, clearDailyJokeTeaserNotifications, getDailyJokeForDate,
  getDateKey, getDayOfYear, getDailyJokeBank,
} from '@/services/dailyJokes';
import { scheduleReactivationReminder, clearReactivationReminder } from '@/services/reactivationNotifications';
import { scheduleDailyStreakReminder, clearDailyStreakReminder } from '@/services/streakNotifications';
import { useStore } from '@/store/useStore';
import { useThemeStore, THEMES, FONT_SIZES, getThemeColors, colors, GRADIENT_PRESETS } from '@/store/useThemeStore';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy, pickVoiceLine } from '@/copy';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { AuthProvider, useAuth } from '@/services/auth';
import { haptics } from '@/services/haptics';
import { coachVoice } from '@/services/coachVoice';
import { getMoodContext } from '@/services/moodSuggestions';
import { SubscriptionProvider } from '@/services/subscription';
import { DailyBonusModal } from '@/components/DailyBonusModal';
import { LevelUpModal } from '@/components/LevelUpModal';
import { SmartSuggestionCard } from '@/components/home/SmartSuggestionCard';
import { WeeklyGoalsCard } from '@/components/home/WeeklyGoalsCard';
import { OnboardingPayoffScreen } from '@/screens/onboarding/OnboardingPayoffScreen';
import { MoodCheckScreen } from '@/screens/tonight/MoodCheckScreen';
import { TonightSessionScreen } from '@/screens/tonight/TonightSessionScreen';
import { SessionRatingScreen } from '@/screens/tonight/SessionRatingScreen';
import type {
  SeasonalGameAction, SeasonalGameOption, TruthOrDareItem,
  Level,
  UserPlaylist, MoodPlaylist, InteractionEvent,
  FontSizePreset,
} from '@/types/app';
import type { DailyJokeBank } from '@/services/dailyJokes';

// Wire up the localized content language getter to the store
setLanguageGetter(() => useStore.getState().language);

const navigationRef = createNavigationContainerRef<any>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const { width } = Dimensions.get('window');
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);
const APP_STORE_LINK = 'https://apps.apple.com/app/id0000000000';

const FEATURE_LOCK_REQUIREMENTS: Record<
  'starter_pack_collections' | 'truth_or_dare' | 'date_night_generator' | 'seasonal_content',
  { level: number; stars: number }
> = {
  starter_pack_collections: { level: 2, stars: 25 },
  truth_or_dare: { level: 3, stars: 75 },
  date_night_generator: { level: 4, stars: 150 },
  seasonal_content: { level: 5, stars: 300 },
};

// ============================================
// ANIMATION COMPONENTS
// ============================================

// Confetti Particle Component
interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
}

function ConfettiCelebration({ visible, onComplete }: { visible: boolean; onComplete?: () => void }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  
  useEffect(() => {
    if (visible) {
      // Create particles
      const newParticles: ConfettiParticle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: new Animated.Value(width / 2),
          y: new Animated.Value(-20),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(1),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          size: Math.random() * 10 + 6,
        });
      }
      setParticles(newParticles);
      
      // Animate each particle
      newParticles.forEach((particle, index) => {
        const targetX = Math.random() * width;
        const targetY = Dimensions.get('window').height + 50;
        const duration = 2000 + Math.random() * 1000;
        const delay = index * 30;
        
        Animated.parallel([
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.x, {
              toValue: targetX,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.y, {
              toValue: targetY,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.rotation, {
              toValue: Math.random() * 10 - 5,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
      
      // Cleanup after animation
      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3500);
    }
  }, [visible, onComplete]);
  
  if (!visible || particles.length === 0) return null;
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.size / 4,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { rotate: particle.rotation.interpolate({
                inputRange: [-5, 5],
                outputRange: ['-180deg', '180deg'],
              })},
              { scale: particle.scale },
            ],
          }}
        />
      ))}
    </View>
  );
}

// Pulse Heart Animation Component
function PulseHeart({ filled, onPress, size = 24, color }: { filled: boolean; onPress: () => void; size?: number; color?: string }) {
  const { t } = useI18n();
  const scaleAnim = useState(new Animated.Value(1))[0];
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const _heartColor = color || (filled ? colors.error : themeColors.text.muted);
  
  const handlePress = () => {
    // Trigger pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    haptics.confirmAction();
    onPress();
  };
  
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={filled ? t('common.remove_from_favorites') : t('common.add_to_favorites')} accessibilityState={{ selected: filled }}>
      <Animated.Text style={{ fontSize: size, transform: [{ scale: scaleAnim }] }}>
        {filled ? '❤️' : '🤍'}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// Scale In Animation Wrapper
function ScaleIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacityAnim, scaleAnim]);
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      {children}
    </Animated.View>
  );
}

// Slide Up Animation Wrapper
function SlideUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const translateY = useState(new Animated.Value(30))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacityAnim, translateY]);
  
  return (
    <Animated.View style={{ transform: [{ translateY }], opacity: opacityAnim }}>
      {children}
    </Animated.View>
  );
}

// Shimmer Loading Effect
function _ShimmerEffect({ width: w, height: h, style }: { width: number; height: number; style?: any }) {
  const shimmerAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);
  
  return (
    <View style={[{ width: w, height: h, backgroundColor: colors.card, borderRadius: 8, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors.cardLight,
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.7, 0.3],
          }),
        }}
      />
    </View>
  );
}

// ============================================
// SOUND EFFECTS SYSTEM (Lazy loaded to prevent startup crashes)
// ============================================
const sounds = {
  soundRef: null as any,
  _audioModule: null as any,

  async getAudio() {
    if (!this._audioModule) {
      try {
        const { Audio } = await import('expo-av');
        this._audioModule = Audio;
      } catch (e) {
        console.warn('Failed to load Audio module:', e);
        return null;
      }
    }
    return this._audioModule;
  },

  // Play a celebratory chime for stars
  async playStarChime() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' }, // Short success chime
        { shouldPlay: true, volume: 0.5 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },

  // Play achievement unlocked fanfare
  async playAchievement() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' }, // Achievement fanfare
        { shouldPlay: true, volume: 0.6 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },

  // Play level up celebration
  async playLevelUp() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3' }, // Level up sound
        { shouldPlay: true, volume: 0.6 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },

  // Play daily bonus coin sound
  async playBonus() {
    try {
      const Audio = await this.getAudio();
      if (!Audio) return;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3' }, // Coin/bonus sound
        { shouldPlay: true, volume: 0.5 }
      );
      this.soundRef = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    }
  },
};

// ============================================
// STAR CELEBRATION MODAL
// ============================================
function StarCelebrationModal({ visible, onClose, stars, achievements }: { visible: boolean; onClose: () => void; stars: number; achievements: string[] }) {
  const { t, localizeTerm } = useI18n();
  const scaleAnim = useState(new Animated.Value(0))[0];
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      haptics.celebrate();
      setShowConfetti(true);
      // Play sounds based on what was earned
      if (achievements.length > 0) {
        sounds.playAchievement();
      } else {
        sounds.playStarChime();
      }
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    } else {
      scaleAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [visible, achievements.length, scaleAnim]);

  const earnedAchievementDetails = achievements.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.celebrationOverlay}>
        <ConfettiCelebration visible={showConfetti} />
        <Animated.View style={[styles.celebrationContent, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.celebrationEmoji}>🌟</Text>
          <Text style={styles.celebrationTitle}>{t('celebration.stars_earned', { count: stars })}</Text>
          <Text style={styles.celebrationSubtitle}>{t('celebration.keep_exploring')}</Text>
          
          {earnedAchievementDetails.length > 0 && (
            <View style={styles.achievementEarnedContainer}>
              <Text style={styles.achievementEarnedTitle}>{t('celebration.achievement_unlocked')}</Text>
              {earnedAchievementDetails.map((achievement) => (
                <View key={achievement!.id} style={styles.achievementEarnedItem}>
                  <Text style={styles.achievementEarnedEmoji}>{achievement!.emoji}</Text>
                  <View>
                    <Text style={styles.achievementEarnedName}>{localizeTerm(achievement!.name)}</Text>
                    <Text style={styles.achievementEarnedDesc}>{localizeTerm(achievement!.description)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.celebrationButton} onPress={onClose} accessibilityRole="button" accessibilityLabel={t('celebration.awesome')}>
            <Text style={styles.celebrationButtonText}>{t('celebration.awesome')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================
// REUSABLE COMPONENTS
// ============================================
const ScreenWrapper = ({ children, scroll = false }: { children: React.ReactNode; scroll?: boolean }) => {
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  return (
    <LinearGradient colors={[themeColors.background.primary, themeColors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {scroll ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>{children}</ScrollView>
        ) : children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const KeyboardSafeModalContainer = ({
  children,
  maxHeight = '80%',
}: {
  children: React.ReactNode;
  maxHeight?: number | `${number}%`;
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      style={styles.modalOverlay}
    >
      <View
        style={[
          styles.modalContent,
          {
            maxHeight,
            marginBottom: Platform.OS === 'android' ? Math.min(140, keyboardHeight * 0.2) : 0,
            paddingBottom: keyboardHeight > 0 ? 14 : 0,
          },
        ]}
      >
        {children}
      </View>
    </KeyboardAvoidingView>
  );
};

const PrimaryButton = ({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) => {
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  return (
    <TouchableOpacity onPress={() => { onPress(); }} activeOpacity={0.8} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }}>
      <LinearGradient
        colors={disabled ? GRADIENT_PRESETS.disabled : [themeColors.primary[500], themeColors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryButton}
      >
        <Text style={[styles.primaryButtonText, disabled && { opacity: 0.5 }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const BackButton = ({ onPress }: { onPress: () => void }) => {
  const { t } = useI18n();
  return (
    <TouchableOpacity onPress={() => { onPress(); }} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('common.back')}><Text style={styles.backButtonText}>← {t('common.back')}</Text></TouchableOpacity>
  );
};

const LanguageQuickSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const store = useStore();
  return (
    <View style={[styles.quickLanguageSwitcher, compact && styles.quickLanguageSwitcherCompact]}>
      {SUPPORTED_LANGUAGES.map((item) => (
        <TouchableOpacity
          key={item.code}
          style={[styles.quickLanguageButton, store.language === item.code && styles.quickLanguageButtonActive]}
          onPress={() => {
            store.setLanguage(item.code);
          }}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <Text style={[styles.quickLanguageButtonText, store.language === item.code && styles.quickLanguageButtonTextActive]}>
            {item.code.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const OptionCard = ({ title, subtitle, selected, onPress }: { title: string; subtitle?: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[styles.optionCard, selected && styles.optionCardSelected]} onPress={() => { onPress(); }} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title} accessibilityState={{ selected }}>
    <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>
    {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

const MultiSelectChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={() => { onPress(); }} activeOpacity={0.7} accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked: selected }}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const SearchBar = ({ value, onChangeText, onClear, placeholder }: { value: string; onChangeText: (text: string) => void; onClear: () => void; placeholder?: string }) => {
  const { t } = useI18n();
  return (
    <View style={styles.searchContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput style={styles.searchInput} value={value} onChangeText={onChangeText} placeholder={placeholder || `${t('common.search')}...`} placeholderTextColor={colors.text.muted} accessibilityLabel={placeholder || t('common.search')} accessibilityRole="search" />
      {value.length > 0 && <TouchableOpacity onPress={onClear} style={styles.clearButton} accessibilityRole="button" accessibilityLabel={t('common.clear')}><Text style={styles.clearButtonText}>✕</Text></TouchableOpacity>}
    </View>
  );
};

const _StarBadge = ({ count }: { count: number }) => (
  <View style={styles.starBadge}>
    <Text style={styles.starBadgeText}>⭐ {count}</Text>
  </View>
);

function CoachNoteSection({
  contentType,
  item,
}: {
  contentType: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay';
  item: {
    id: number;
    name: string;
    vibe?: string;
    whyItWorks?: string;
    description?: string;
    category?: string;
  };
}) {
  const { language } = useI18n();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const shimmer = useRef(new Animated.Value(-1)).current;
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const coachTitle = language === 'es'
    ? 'Para ustedes 🌸'
    : language === 'pt'
      ? 'Pra vocês 🌸'
      : language === 'hi'
        ? 'आप दोनों के लिए 🌸'
        : 'For you two 🌸';

  useEffect(() => {
    let active = true;
    setLoading(true);

    void coachVoice.getNote(contentType, item).then((value) => {
      if (!active) return;
      setNote(value);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [contentType, item.id, item.name, item.vibe, item.whyItWorks, item.description, item.category]);

  useEffect(() => {
    if (!loading) return;
    shimmer.setValue(-1);

    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );

    loop.start();
    return () => loop.stop();
  }, [loading, shimmer]);

  const shimmerTranslateX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-220, 220],
  });

  return (
    <View style={[styles.coachNoteCard, { backgroundColor: themeColors.card, borderColor: themeColors.cardLight }]}>
      <Text style={[styles.coachNoteTitle, { color: themeColors.primary[400] }]}>{coachTitle}</Text>
      {loading ? (
        <View style={styles.coachSkeletonWrap}>
          <View style={[styles.coachSkeletonLine, { width: '95%', backgroundColor: themeColors.cardLight }]} />
          <View style={[styles.coachSkeletonLine, { width: '78%', backgroundColor: themeColors.cardLight }]} />
          <Animated.View style={[styles.coachShimmer, { transform: [{ translateX: shimmerTranslateX }] }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      ) : (
        <Text style={[styles.coachNoteText, { color: themeColors.text.muted }]}>{note}</Text>
      )}
    </View>
  );
}

const PositionCard = ({ position, onPress }: { position: Position; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm, t } = useI18n();
  const isFavorite = store.favorites.includes(position.id);
  const isTried = store.tried.includes(position.id);
  const mood = moods.find((m) => m.id === position.mood);
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptics.openCard(`position:${position.id}`); coachVoice.preloadNote('position', position); onPress(); }} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${position.name}, ${localizeTerm(position.category)}, ${localizeTerm(position.difficulty)}`}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>{mood?.emoji}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge} accessibilityLabel={t('stats.tried')}>✓</Text>}
          <PulseHeart
            filled={isFavorite}
            onPress={() => store.toggleFavorite(position.id)}
            size={18}
          />
        </View>
      </View>
      <Text style={styles.positionName}>{position.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(position.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{position.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={[styles.difficultyBadge, position.difficulty === 'Beginner' && styles.difficultyBeginner, position.difficulty === 'Intermediate' && styles.difficultyIntermediate, position.difficulty === 'Advanced' && styles.difficultyAdvanced]}>
          <Text style={styles.difficultyText}>{localizeTerm(position.difficulty)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ForeplayCard = ({ item, onPress }: { item: ForeplayIdea; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm, t } = useI18n();
  const isFavorite = store.favoriteForeplay.includes(item.id);
  const isTried = store.triedForeplay.includes(item.id);
  const mood = moods.find((m) => m.id === item.mood);
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptics.openCard(`foreplay:${item.id}`); coachVoice.preloadNote('foreplay', item); onPress(); }} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${item.name}, ${localizeTerm(item.category)}`}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>{mood?.emoji}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge} accessibilityLabel={t('stats.tried')}>✓</Text>}
          <PulseHeart
            filled={isFavorite}
            onPress={() => store.toggleForeplayFavorite(item.id)}
            size={18}
          />
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={styles.durationBadge}><Text style={styles.durationText}>{localizeTerm(item.duration)}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

const OralPlayCard = ({ item, onPress }: { item: OralPlayIdea; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm, t } = useI18n();
  const isFavorite = store.favoriteOral?.includes(item.id) || false;
  const isTried = store.triedOral?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  const giverLabel = item.giver === 'him' ? localizeTerm('He gives') : item.giver === 'her' ? localizeTerm('She gives') : localizeTerm('Mutual');
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptics.openCard(`oral:${item.id}`); coachVoice.preloadNote('oral', item); onPress(); }} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${item.name}, ${localizeTerm(item.category)}`}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>{mood?.emoji}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge} accessibilityLabel={t('stats.tried')}>✓</Text>}
          <PulseHeart
            filled={isFavorite}
            onPress={() => store.toggleOralFavorite(item.id)}
            size={18}
          />
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={styles.giverBadge}><Text style={styles.giverText}>{item.giver === 'him' ? '👨→👩' : item.giver === 'her' ? '👩→👨' : '🤝'} {giverLabel}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

const MassageCard = ({ item, onPress }: { item: MassageTechnique; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm, t } = useI18n();
  const isFavorite = store.favoriteMassage?.includes(item.id) || false;
  const isTried = store.triedMassage?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptics.openCard(`massage:${item.id}`); coachVoice.preloadNote('massage', item); onPress(); }} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${item.name}, ${localizeTerm(item.category)}`}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>💆</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge} accessibilityLabel={t('stats.tried')}>✓</Text>}
          <PulseHeart
            filled={isFavorite}
            onPress={() => store.toggleMassageFavorite(item.id)}
            size={18}
          />
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)} • {item.bodyArea}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={styles.durationBadge}><Text style={styles.durationText}>⏱ {localizeTerm(item.duration)}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

const RolePlayCard = ({ item, onPress }: { item: RolePlayScenario; onPress: () => void }) => {
  const store = useStore();
  const { localizeTerm, t } = useI18n();
  const isFavorite = store.favoriteRoleplay?.includes(item.id) || false;
  const isTried = store.triedRoleplay?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  const intensityColor = item.intensity === 'Light' ? colors.success : item.intensity === 'Medium' ? colors.warning : colors.error;
  return (
    <TouchableOpacity style={styles.positionCard} onPress={() => { haptics.openCard(`roleplay:${item.id}`); coachVoice.preloadNote('roleplay', item); onPress(); }} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${item.name}, ${localizeTerm(item.category)}`}>
      <View style={styles.cardHeader}>
        <View style={[styles.positionMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
          <Text style={styles.positionMoodEmoji}>🎭</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isTried && <Text style={styles.triedBadge} accessibilityLabel={t('stats.tried')}>✓</Text>}
          <PulseHeart
            filled={isFavorite}
            onPress={() => store.toggleRoleplayFavorite(item.id)}
            size={18}
          />
        </View>
      </View>
      <Text style={styles.positionName}>{item.name}</Text>
      <Text style={styles.positionCategory}>{localizeTerm(item.category)}</Text>
      <Text style={styles.positionVibe} numberOfLines={2}>{item.vibe}</Text>
      <View style={styles.positionFooter}>
        <View style={[styles.intensityBadge, { backgroundColor: intensityColor + '30' }]}><Text style={[styles.intensityText, { color: intensityColor }]}>{localizeTerm(item.intensity)}</Text></View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// ONBOARDING SCREENS
// ============================================
function OriginScreen({ navigation, route }: any) {
  const { language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const store = useStore();
  const fromSettings = Boolean(route?.params?.fromSettings);
  const handleContinue = () => {
    store.completeTutorial();
    if (fromSettings) {
      navigation.goBack?.();
      return;
    }
    navigation.navigate('Welcome');
  };

  return (
    <ScreenWrapper scroll>
      {fromSettings ? <BackButton onPress={() => navigation.goBack?.()} /> : null}
      <View style={styles.originHero}>
        <Text style={styles.originEmoji}>🌸</Text>
        <Text style={styles.titleLarge}>{voice.labels.brandName}</Text>
        <Text style={styles.originSubtitle}>A softer way to find your mood together.</Text>
      </View>
      <View style={styles.originSection}>
        <Text style={styles.originSectionTitle}>Why we built this</Text>
        <Text style={styles.originBody}>
          We wanted something couples could open without feeling studied, managed, or put on the spot.
        </Text>
      </View>
      <View style={styles.originSection}>
        <Text style={styles.originSectionTitle}>What it is for</Text>
        <Text style={styles.originBody}>
          Blisse is here for play, closeness, flirting, and those nights when you want a little spark but not a whole conversation first.
        </Text>
      </View>
      <View style={styles.originSection}>
        <Text style={styles.originSectionTitle}>How to use it</Text>
        <Text style={styles.originBody}>
          Pick the vibe that feels true. Take one idea, skip another, change your mind whenever. Your pace is the right pace.
        </Text>
      </View>
      <View style={styles.buttons}>
        <PrimaryButton title={fromSettings ? 'Back to Blisse' : 'Let us begin'} onPress={handleContinue} />
      </View>
    </ScreenWrapper>
  );
}

function WelcomeScreen({ navigation }: any) {
  const { authPack, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [showTeaserPunchline, setShowTeaserPunchline] = useState(false);
  const welcomeTagline = authPack('welcome', 'tagline');
  const welcomeTeaser = authPack('welcome', 'teaser');
  const welcomeJoke = useMemo(
    () => getDailyJokeForDate(new Date(), null, language),
    [language]
  );
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start(); }, [fadeAnim]);
  useEffect(() => { setShowTeaserPunchline(false); }, [language]);
  return (
    <ScreenWrapper>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <LinearGradient colors={['#FFFAF0', '#FFB6A3', '#D4818F', '#8B4A6B', '#4A2C5A']} style={styles.bloom}>
          <View style={styles.bloomCore} />
        </LinearGradient>
      </Animated.View>
      <LanguageQuickSwitcher />
      <View style={styles.content}>
        <Text style={styles.titleLarge}>{voice.labels.brandName}</Text>
        <Text style={styles.subtitle}>{authPack('welcome', 'subtitle')}</Text>
        {welcomeTagline ? <Text style={styles.welcomeTagline}>{welcomeTagline}</Text> : null}
        {welcomeTeaser ? <Text style={styles.welcomeTeaser}>{welcomeTeaser}</Text> : null}
        <View style={styles.welcomeJokeCard}>
          <Text style={styles.welcomeJokeLabel}>{authPack('welcome', 'teaserCardTitle')}</Text>
          <Text style={styles.welcomeJokeSetup}>{welcomeJoke.setup}</Text>
          {showTeaserPunchline ? (
            <Text style={styles.welcomeJokePunchline}>{welcomeJoke.punchline}</Text>
          ) : (
            <Text style={styles.welcomeJokeHint}>{authPack('welcome', 'teaserCardHint')}</Text>
          )}
          <TouchableOpacity
            style={styles.welcomeJokeAction}
            onPress={() => setShowTeaserPunchline((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.welcomeJokeActionText}>
              {showTeaserPunchline ? authPack('welcome', 'teaserHide') : authPack('welcome', 'teaserReveal')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttons}>
        <PrimaryButton title={authPack('welcome', 'getStarted')} onPress={() => navigation.navigate('NameInput')} />
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.secondaryButtonText}>{authPack('welcome', 'alreadyHaveAccount')} <Text style={styles.linkText}>{authPack('welcome', 'signIn')}</Text></Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

function NameInputScreen({ navigation }: any) {
  const { t, uiPack, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const [name, setName] = useState('');
  const [namePreview, setNamePreview] = useState('');
  const store = useStore();
  useEffect(() => {
    Analytics.trackOnboardingStep('name');
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setNamePreview(name.trim());
    }, 100);
    return () => clearTimeout(timer);
  }, [name]);
  const handleContinue = () => { store.setName(name); navigation.navigate('RelationshipType'); };
  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.screenContent}>
        <Text style={styles.title}>{uiPack('onboarding.name.title')}</Text>
        <Text style={styles.subtitle}>
          {namePreview ? voice.onboarding.namePreview(namePreview) : t('onboarding.name.greeting_preview')}
        </Text>
        <TextInput style={styles.textInput} placeholder={uiPack('onboarding.name.placeholder')} placeholderTextColor={colors.text.muted} value={name} onChangeText={setName} autoFocus />
      </View>
      <View style={styles.buttons}><PrimaryButton title={t('common.continue')} onPress={handleContinue} disabled={!name.trim()} /></View>
    </ScreenWrapper>
  );
}

function RelationshipTypeScreen({ navigation }: any) {
  const { authPack } = useI18n();
  const store = useStore();
  const [selected, setSelected] = useState<string | null>(store.relationshipType);
  useEffect(() => {
    Analytics.trackOnboardingStep('relationship');
  }, []);
  const options = [
    { id: 'hetero', title: authPack('onboardingRelationship', 'relationshipOptions.hetero') },
    { id: 'mm', title: authPack('onboardingRelationship', 'relationshipOptions.mm') },
    { id: 'ff', title: authPack('onboardingRelationship', 'relationshipOptions.ff') },
    { id: 'other', title: authPack('onboardingRelationship', 'relationshipOptions.other') },
  ];
  const handleContinue = () => { if (selected) store.setRelationshipType(selected); navigation.navigate('Preferences'); };
  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.screenContent}>
        <Text style={styles.title}>{store.name ? `${store.name} 👋` : authPack('onboardingRelationship', 'title')}</Text>
        <Text style={styles.subtitle}>{authPack('onboardingRelationship', 'subtitle')}</Text>
        <View style={styles.optionsContainer}>{options.map((opt) => <OptionCard key={opt.id} title={opt.title} selected={selected === opt.id} onPress={() => setSelected(opt.id)} />)}</View>
      </View>
      <View style={styles.buttons}><PrimaryButton title={authPack('onboardingRelationship', 'continue')} onPress={handleContinue} disabled={!selected} /></View>
    </ScreenWrapper>
  );
}

function PreferencesScreen({ navigation }: any) {
  const { authPack } = useI18n();
  const store = useStore();
  useEffect(() => {
    Analytics.trackOnboardingStep('preferences');
  }, []);
  const options = useMemo(() => [
    { id: 'deepConnection', label: authPack('onboardingPreferences', 'preferences.deepConnection') },
    { id: 'spiceThingsUp', label: authPack('onboardingPreferences', 'preferences.spiceThingsUp') },
    { id: 'newPositions', label: authPack('onboardingPreferences', 'preferences.newPositions') },
    { id: 'foreplayIdeas', label: authPack('onboardingPreferences', 'preferences.foreplayIdeas') },
    { id: 'quickies', label: authPack('onboardingPreferences', 'preferences.quickies') },
    { id: 'extendedSessions', label: authPack('onboardingPreferences', 'preferences.extendedSessions') },
    { id: 'communication', label: authPack('onboardingPreferences', 'preferences.communication') },
    { id: 'adventurous', label: authPack('onboardingPreferences', 'preferences.adventurous') },
  ], [authPack]);
  const [selected, setSelected] = useState<string[]>(store.interests);
  const toggleOption = (opt: string) => setSelected((prev) => prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]);
  const handleContinue = () => { store.setInterests(selected); navigation.navigate('ExperienceLevel'); };
  return (
    <ScreenWrapper scroll>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{authPack('onboardingPreferences', 'title')}</Text>
      <Text style={styles.subtitle}>{authPack('onboardingPreferences', 'subtitle')}</Text>
      <View style={styles.chipsContainer}>
        {options.map((opt) => (
          <MultiSelectChip
            key={opt.id}
            label={opt.label}
            selected={selected.includes(opt.id)}
            onPress={() => toggleOption(opt.id)}
          />
        ))}
      </View>
      <View style={[styles.buttons, { marginTop: 40 }]}><PrimaryButton title={authPack('onboardingPreferences', 'continue')} onPress={handleContinue} /></View>
    </ScreenWrapper>
  );
}

function ExperienceLevelScreen({ navigation }: any) {
  const { uiPack, authPack } = useI18n();
  const store = useStore();
  const [selected, setSelected] = useState<string | null>(store.experience);
  useEffect(() => {
    Analytics.trackOnboardingStep('experience');
  }, []);
  const options = [
    { id: 'beginner', title: `🌱 ${uiPack('onboarding.experience.beginner')}`, subtitle: authPack('onboardingPreferences', 'experienceLevels.beginner') },
    { id: 'intermediate', title: `🌿 ${uiPack('onboarding.experience.intermediate')}`, subtitle: authPack('onboardingPreferences', 'experienceLevels.intermediate') },
    { id: 'advanced', title: `🌳 ${uiPack('onboarding.experience.advanced')}`, subtitle: authPack('onboardingPreferences', 'experienceLevels.advanced') },
  ];
  const handleContinue = () => { if (selected) store.setExperience(selected); navigation.navigate('Legal'); };
  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.screenContent}>
        <Text style={styles.title}>{uiPack('onboarding.experience.title')}</Text>
        <Text style={styles.subtitle}>{authPack('onboardingPreferences', 'experienceLevel')}</Text>
        <View style={styles.optionsContainer}>{options.map((opt) => <OptionCard key={opt.id} title={opt.title} subtitle={opt.subtitle} selected={selected === opt.id} onPress={() => setSelected(opt.id)} />)}</View>
      </View>
      <View style={styles.buttons}><PrimaryButton title={authPack('onboardingPreferences', 'continue')} onPress={handleContinue} disabled={!selected} /></View>
    </ScreenWrapper>
  );
}


// ============================================
// ENHANCED LEGAL SCREEN
// ============================================
function LegalScreen({ navigation }: any) {
  const { authPack, t, language } = useI18n();
  const legalContent = useMemo(() => getLegalContent(language), [language]);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [termsScrolledToEnd, setTermsScrolledToEnd] = useState(false);
  const [privacyScrolledToEnd, setPrivacyScrolledToEnd] = useState(false);
  
  const store = useStore();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  useEffect(() => {
    Analytics.trackOnboardingStep('legal');
  }, []);
  
  const allConfirmed = hasReadTerms && hasReadPrivacy && confirmedAge;
  
  const handleEnter = () => {
    store.agreeToTerms();
    navigation.navigate('OnboardingPayoff');
  };

  const handleTermsScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50) setTermsScrolledToEnd(true);
  };

  const handlePrivacyScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50) setPrivacyScrolledToEnd(true);
  };

  return (
    <ScreenWrapper>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView style={styles.screenContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{authPack('legalConsent', 'title')}</Text>
        <Text style={styles.subtitle}>{authPack('legalConsent', 'subtitle')}</Text>
        
        <View style={[styles.legalHighlightBox, { marginTop: 20, marginBottom: 24 }]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>🔐</Text>
          <Text style={[styles.legalHighlightTitle, { color: themeColors.text.primary }]}>{t('legal.privacy_matters_title')}</Text>
          <Text style={[styles.legalHighlightTextSmall, { color: themeColors.text.secondary }]}>{t('legal.privacy_matters_subtitle')}</Text>
        </View>

        <View style={[styles.legalCheckSection, { backgroundColor: themeColors.card }]}>
          <View style={styles.legalCheckHeader}>
            <Text style={[styles.legalCheckTitle, { color: themeColors.text.primary }]}>📜 {authPack('legalConsent', 'termsOfService')}</Text>
            <TouchableOpacity style={[styles.readButton, { backgroundColor: themeColors.primary[500] + '20' }]} onPress={() => setShowTermsModal(true)}>
              <Text style={[styles.readButtonText, { color: themeColors.primary[400] }]}>{t('legal.read_terms')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.legalCheckSummary, { color: themeColors.text.muted }]}>{t('legal.terms_summary')}</Text>
          <TouchableOpacity style={[styles.checkboxRow, hasReadTerms && styles.checkboxRowSelected]} onPress={() => hasReadTerms ? setHasReadTerms(false) : setShowTermsModal(true)}>
            <View style={[styles.checkbox, hasReadTerms && styles.checkboxChecked]}>{hasReadTerms && <Text style={styles.checkmark}>✓</Text>}</View>
            <Text style={styles.checkboxText}>{authPack('legalConsent', 'termsAcceptance')} {authPack('legalConsent', 'termsOfService')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.legalCheckSection, { backgroundColor: themeColors.card }]}>
          <View style={styles.legalCheckHeader}>
            <Text style={[styles.legalCheckTitle, { color: themeColors.text.primary }]}>🔐 {authPack('legalConsent', 'privacyPolicy')}</Text>
            <TouchableOpacity style={[styles.readButton, { backgroundColor: themeColors.primary[500] + '20' }]} onPress={() => setShowPrivacyModal(true)}>
              <Text style={[styles.readButtonText, { color: themeColors.primary[400] }]}>{t('legal.read_policy')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.legalCheckSummary, { color: themeColors.text.muted }]}>{t('legal.privacy_summary')}</Text>
          <TouchableOpacity style={[styles.checkboxRow, hasReadPrivacy && styles.checkboxRowSelected]} onPress={() => hasReadPrivacy ? setHasReadPrivacy(false) : setShowPrivacyModal(true)}>
            <View style={[styles.checkbox, hasReadPrivacy && styles.checkboxChecked]}>{hasReadPrivacy && <Text style={styles.checkmark}>✓</Text>}</View>
            <Text style={styles.checkboxText}>{authPack('legalConsent', 'termsAcceptance')} {authPack('legalConsent', 'privacyPolicy')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.legalCheckSection, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.legalCheckTitle, { color: themeColors.text.primary }]}>🔞 {authPack('legalConsent', 'ageWarning')}</Text>
          <Text style={[styles.legalCheckSummary, { color: themeColors.text.muted, marginTop: 8 }]}>{t('legal.adult_content_notice')}</Text>
          <TouchableOpacity style={[styles.checkboxRow, confirmedAge && styles.checkboxRowSelected]} onPress={() => setConfirmedAge(!confirmedAge)}>
            <View style={[styles.checkbox, confirmedAge && styles.checkboxChecked]}>{confirmedAge && <Text style={styles.checkmark}>✓</Text>}</View>
            <Text style={styles.checkboxText}>{authPack('legalConsent', 'ageVerification')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.buttons}>
        <PrimaryButton title={authPack('onboardingComplete', 'enterApp')} onPress={handleEnter} disabled={!allConfirmed} />
        {!allConfirmed && <Text style={[styles.legalHint, { color: themeColors.text.muted }]}>{authPack('legalConsent', 'mustAcceptAll')}</Text>}
      </View>

      <Modal visible={showTermsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>📜 {legalContent.terms.title}</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}><Text style={[styles.modalClose, { color: themeColors.text.muted }]}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} onScroll={handleTermsScroll} scrollEventThrottle={16}>
              <Text style={[styles.legalTitle, { color: themeColors.text.primary }]}>{legalContent.terms.title}</Text>
              <Text style={[styles.legalDate, { color: themeColors.text.muted }]}>{legalContent.terms.lastUpdated}</Text>
              {legalContent.terms.intro ? <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>{legalContent.terms.intro}</Text> : null}
              {legalContent.terms.sections.map((section) => (
                <View key={section.heading}>
                  <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>{section.heading}</Text>
                  <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>{section.body}</Text>
                </View>
              ))}
              {!termsScrolledToEnd && <View style={styles.scrollHint}><Text style={[styles.scrollHintText, { color: themeColors.primary[400] }]}>↓ {legalContent.common.scrollHint}</Text></View>}
              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity style={[styles.legalConfirmButton, { backgroundColor: termsScrolledToEnd ? themeColors.primary[500] : themeColors.text.muted }, !termsScrolledToEnd && { opacity: 0.5 }]} onPress={() => { if (termsScrolledToEnd) { setHasReadTerms(true); setShowTermsModal(false); } }} disabled={!termsScrolledToEnd}>
              <Text style={styles.legalConfirmButtonText}>{termsScrolledToEnd ? legalContent.common.readAgree : legalContent.common.readAll}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPrivacyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: themeColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>🔐 {legalContent.privacy.title}</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}><Text style={[styles.modalClose, { color: themeColors.text.muted }]}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={true} onScroll={handlePrivacyScroll} scrollEventThrottle={16}>
              <Text style={[styles.legalTitle, { color: themeColors.text.primary }]}>{legalContent.privacy.title}</Text>
              <Text style={[styles.legalDate, { color: themeColors.text.muted }]}>{legalContent.privacy.lastUpdated}</Text>
              {legalContent.privacy.intro ? <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>{legalContent.privacy.intro}</Text> : null}
              {legalContent.privacy.sections.map((section) => (
                <View key={section.heading}>
                  <Text style={[styles.legalSection, { color: themeColors.text.primary }]}>{section.heading}</Text>
                  <Text style={[styles.legalText, { color: themeColors.text.secondary }]}>{section.body}</Text>
                </View>
              ))}
              {!privacyScrolledToEnd && <View style={styles.scrollHint}><Text style={[styles.scrollHintText, { color: themeColors.primary[400] }]}>↓ {legalContent.common.scrollHint}</Text></View>}
              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity style={[styles.legalConfirmButton, { backgroundColor: privacyScrolledToEnd ? themeColors.primary[500] : themeColors.text.muted }, !privacyScrolledToEnd && { opacity: 0.5 }]} onPress={() => { if (privacyScrolledToEnd) { setHasReadPrivacy(true); setShowPrivacyModal(false); } }} disabled={!privacyScrolledToEnd}>
              <Text style={styles.legalConfirmButtonText}>{privacyScrolledToEnd ? legalContent.common.readAgree : legalContent.common.readAll}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

// ============================================
// ADD PLAYLIST MODAL
// ============================================
function _AddPlaylistModal({ visible, onClose, onSave, editPlaylist }: { visible: boolean; onClose: () => void; onSave: (playlist: { name: string; url: string; mood: string }) => void; editPlaylist?: UserPlaylist | null; }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [mood, setMood] = useState('romantic');
  const [error, setError] = useState('');
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);

  useEffect(() => {
    if (editPlaylist) { setName(editPlaylist.name); setUrl(editPlaylist.url); setMood(editPlaylist.mood); } 
    else { setName(''); setUrl(''); setMood('romantic'); }
    setError('');
  }, [editPlaylist, visible]);

  const validateUrl = (testUrl: string): boolean => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(testUrl) || testUrl.includes('spotify:');

  const handleSave = () => {
    if (!name.trim()) { setError(t('playlist.error.name_required')); return; }
    if (!url.trim()) { setError(t('playlist.error.url_required')); return; }
    if (!validateUrl(url.trim())) { setError(t('playlist.error.url_invalid')); return; }
    onSave({ name: name.trim(), url: url.trim(), mood });
    setName(''); setUrl(''); setMood('romantic'); setError('');
  };

  const detectedPlatform = url ? detectPlatform(url) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardSafeModalContainer maxHeight="85%">
        <View style={{ backgroundColor: themeColors.card, borderRadius: 16 }}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>{editPlaylist ? `✏️ ${t('playlist.edit_title')}` : `➕ ${t('playlist.add_title')}`}</Text>
            <TouchableOpacity onPress={onClose}><Text style={[styles.modalClose, { color: themeColors.text.muted }]}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.legalSection, { color: themeColors.text.secondary, marginTop: 0, fontSize: 14 }]}>{t('playlist.name_label')}</Text>
            <TextInput style={[styles.contactInput, { backgroundColor: themeColors.cardLight, color: themeColors.text.primary }]} placeholder={t('playlist.name_placeholder')} placeholderTextColor={themeColors.text.muted} value={name} onChangeText={setName} maxLength={50} />
            <Text style={[styles.legalSection, { color: themeColors.text.secondary, fontSize: 14 }]}>{t('playlist.url_label')}</Text>
            <TextInput style={[styles.contactInput, { backgroundColor: themeColors.cardLight, color: themeColors.text.primary }]} placeholder={t('playlist.url_placeholder')} placeholderTextColor={themeColors.text.muted} value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" />
            {detectedPlatform && <Text style={{ color: themeColors.text.muted, fontSize: 13, marginBottom: 8 }}>{getPlatformIcon(detectedPlatform)} {getPlatformName(detectedPlatform)}</Text>}
            <Text style={[styles.legalSection, { color: themeColors.text.secondary, fontSize: 14 }]}>{t('playlist.mood_label')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PLAYLIST_MOODS.map((m) => (
                <TouchableOpacity key={m.id} style={[{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: themeColors.cardLight, alignItems: 'center' }, mood === m.id && { backgroundColor: themeColors.primary[500] + '30', borderWidth: 1, borderColor: themeColors.primary[500] }]} onPress={() => setMood(m.id)}>
                  <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                  <Text style={{ fontSize: 11, color: mood === m.id ? themeColors.primary[400] : themeColors.text.muted, marginTop: 2 }}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {error ? <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: themeColors.cardLight, alignItems: 'center' }} onPress={onClose}><Text style={{ color: themeColors.text.muted, fontSize: 15 }}>{t('common.cancel')}</Text></TouchableOpacity>
            <TouchableOpacity style={{ flex: 2, padding: 14, borderRadius: 12, backgroundColor: themeColors.primary[500], alignItems: 'center' }} onPress={handleSave}><Text style={{ color: colors.white, fontSize: 15, fontWeight: '600' }}>{editPlaylist ? t('common.update') : t('common.add')}</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardSafeModalContainer>
    </Modal>
  );
}

// ============================================
// AUTHENTICATION SCREENS
// ============================================
function AuthScreen({ navigation: _navigation }: any) {
  const { authPack, uiPack, t } = useI18n();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<TextInput | null>(null);
  const passwordInputRef = useRef<TextInput | null>(null);
  const confirmPasswordInputRef = useRef<TextInput | null>(null);
  
  const { signIn, signUp, signInWithApple, resetPassword } = useAuth();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const modeScreen = mode === 'signin' ? 'login' : mode === 'signup' ? 'signup' : 'forgotPassword';
  const authTeaser = authPack(modeScreen, 'teaser');
  const authPersonalNote = authPack(modeScreen, 'personalNote');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const hasNumber = (value: string) => /\d/.test(value);
  const normalizedEmail = normalizeEmail(email);
  const canSubmit = useMemo(() => {
    if (mode === 'signin') return validateEmail(normalizedEmail) && password.length > 0;
    if (mode === 'signup') {
      return (
        name.trim().length > 0 &&
        validateEmail(normalizedEmail) &&
        password.length >= 8 &&
        hasNumber(password) &&
        password === confirmPassword
      );
    }
    return validateEmail(normalizedEmail);
  }, [confirmPassword, mode, name, normalizedEmail, password]);

  const handleSignIn = async () => {
    if (loading) return;
    if (!normalizedEmail || !password) {
      setError(authPack('validation', 'allFieldsRequired'));
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError(authPack('validation', 'emailInvalid'));
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await signIn(normalizedEmail, password);
      // Navigation handled by auth state change
      return;
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError(authPack('validation', 'emailInvalid'));
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(authPack('login', 'invalidCredentials'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(authPack('common', 'tooManyRequests'));
      } else if (err.code === 'auth/network-request-failed') {
        setError(authPack('common', 'networkError'));
      } else if (err.code === 'auth/not-initialized' || err.code === 'auth/operation-not-allowed') {
        setError(t('app.auth_unavailable'));
      } else {
        setError(authPack('common', 'error'));
      }
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (loading) return;
    if (!normalizedEmail || !password || !confirmPassword || !name.trim()) {
      setError(authPack('validation', 'allFieldsRequired'));
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError(authPack('validation', 'emailInvalid'));
      return;
    }
    if (password.length < 8) {
      setError(authPack('validation', 'passwordTooShort'));
      return;
    }
    if (!hasNumber(password)) {
      setError(authPack('validation', 'passwordNeedsNumber'));
      return;
    }
    if (password !== confirmPassword) {
      setError(authPack('validation', 'passwordsDontMatch'));
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await signUp(normalizedEmail, password, name.trim());
      // Navigation handled by auth state change
      return;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(authPack('signup', 'emailAlreadyInUse'));
      } else if (err.code === 'auth/weak-password') {
        setError(authPack('validation', 'passwordTooShort'));
      } else if (err.code === 'auth/network-request-failed') {
        setError(authPack('common', 'networkError'));
      } else if (err.code === 'auth/not-initialized' || err.code === 'auth/operation-not-allowed') {
        setError(t('app.auth_unavailable'));
      } else {
        setError(authPack('common', 'error'));
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;
    if (!normalizedEmail) {
      setError(authPack('validation', 'emailRequired'));
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError(authPack('validation', 'emailInvalid'));
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await resetPassword(normalizedEmail);
      Alert.alert(authPack('common', 'success'), authPack('forgotPassword', 'emailSent'));
      setMode('signin');
      setLoading(false);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError(authPack('forgotPassword', 'emailNotFound'));
      } else if (err.code === 'auth/network-request-failed') {
        setError(authPack('common', 'networkError'));
      } else if (err.code === 'auth/not-initialized' || err.code === 'auth/operation-not-allowed') {
        setError(t('app.auth_unavailable'));
      } else {
        setError(authPack('common', 'error'));
      }
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await signInWithApple();
      setLoading(false);
      return;
    } catch (err: any) {
      if (err.code !== 'ERR_CANCELED' && err.code !== 'ERR_REQUEST_CANCELED') {
        setError(authPack('common', 'error'));
      }
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[themeColors.background.primary, themeColors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScrollContent}>
            <View style={styles.authHeader}>
              <Text style={styles.authLogo}>🌸</Text>
              <Text style={[styles.authTitle, { color: themeColors.text.primary }]}>
                {authPack(modeScreen, 'title')}
              </Text>
              <Text style={[styles.authSubtitle, { color: themeColors.text.muted }]}>
                {authPack(modeScreen, 'subtitle')}
              </Text>
              {authTeaser ? <Text style={[styles.authTeaser, { color: themeColors.text.secondary }]}>{authTeaser}</Text> : null}
              {authPersonalNote ? <Text style={[styles.authPersonalNote, { color: themeColors.primary[400] }]}>{authPersonalNote}</Text> : null}
              <LanguageQuickSwitcher compact />
            </View>

            {error ? (
              <View style={styles.authErrorContainer}>
                <Text style={styles.authErrorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {mode === 'signup' && (
              <View style={styles.authInputContainer}>
                <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{t('auth.name')}</Text>
                <TextInput
                  style={[styles.authInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    if (error) setError('');
                  }}
                  placeholder={uiPack('onboarding.name.placeholder')}
                  placeholderTextColor={themeColors.text.muted}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                />
              </View>
            )}

            <View style={styles.authInputContainer}>
              <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{authPack(modeScreen, 'email')}</Text>
                <TextInput
                  ref={emailInputRef}
                  style={[styles.authInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError('');
                  }}
                  placeholder={authPack(modeScreen, 'emailPlaceholder')}
                  placeholderTextColor={themeColors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="username"
                  returnKeyType={mode === 'reset' ? 'done' : 'next'}
                  onSubmitEditing={() => {
                    if (mode === 'reset') {
                      void handleResetPassword();
                      return;
                    }
                    passwordInputRef.current?.focus();
                  }}
                  blurOnSubmit={mode === 'reset'}
                />
              </View>

            {mode !== 'reset' && (
              <View style={styles.authInputContainer}>
                <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{authPack(modeScreen, 'password')}</Text>
                <View style={styles.authPasswordContainer}>
                  <TextInput
                    ref={passwordInputRef}
                    style={[styles.authInput, styles.authPasswordInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) setError('');
                    }}
                    placeholder={authPack(modeScreen, 'passwordPlaceholder')}
                    placeholderTextColor={themeColors.text.muted}
                    secureTextEntry={!showPassword}
                    autoComplete={mode === 'signin' ? 'password' : 'new-password'}
                    textContentType={mode === 'signin' ? 'password' : 'newPassword'}
                    returnKeyType={mode === 'signup' ? 'next' : 'done'}
                    onSubmitEditing={() => {
                      if (mode === 'signup') {
                        confirmPasswordInputRef.current?.focus();
                        return;
                      }
                      void handleSignIn();
                    }}
                    blurOnSubmit={mode !== 'signup'}
                  />
                  <TouchableOpacity style={styles.authPasswordToggle} onPress={() => setShowPassword(!showPassword)}>
                    <Text style={{ color: themeColors.text.muted }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === 'signup' && (
              <View style={styles.authInputContainer}>
                <Text style={[styles.authInputLabel, { color: themeColors.text.secondary }]}>{authPack('signup', 'confirmPassword')}</Text>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={[styles.authInput, { backgroundColor: themeColors.card, color: themeColors.text.primary }]}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (error) setError('');
                  }}
                  placeholder={authPack('signup', 'confirmPasswordPlaceholder')}
                  placeholderTextColor={themeColors.text.muted}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    void handleSignUp();
                  }}
                />
              </View>
            )}

            {mode === 'signin' && (
              <TouchableOpacity onPress={() => { setMode('reset'); setError(''); }} style={styles.authForgotPassword}>
                <Text style={[styles.authForgotPasswordText, { color: themeColors.primary[400] }]}>{authPack('login', 'forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleResetPassword}
              disabled={loading || !canSubmit}
            >
              <LinearGradient
                colors={[themeColors.primary[500], themeColors.primary[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.authButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.authButtonText}>
                    {mode === 'signin' ? authPack('login', 'signIn') : mode === 'signup' ? authPack('signup', 'createAccount') : authPack('forgotPassword', 'sendLink')}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {mode !== 'reset' && Platform.OS === 'ios' && (
              <>
                <View style={styles.authDivider}>
                  <View style={[styles.authDividerLine, { backgroundColor: themeColors.card }]} />
                  <Text style={[styles.authDividerText, { color: themeColors.text.muted }]}>{authPack('signup', 'orContinueWith')}</Text>
                  <View style={[styles.authDividerLine, { backgroundColor: themeColors.card }]} />
                </View>

                <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={loading}>
                  <Text style={styles.appleButtonText}> {authPack('signup', 'apple')}</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.authSwitchContainer}>
              {mode === 'reset' ? (
                <TouchableOpacity onPress={() => { setMode('signin'); setError(''); }}>
                  <Text style={[styles.authSwitchText, { color: themeColors.text.muted }]}>
                    {authPack('forgotPassword', 'backToLogin')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
                  <Text style={[styles.authSwitchText, { color: themeColors.text.muted }]}>
                    {mode === 'signin' ? `${authPack('login', 'noAccount')} ` : `${authPack('welcome', 'alreadyHaveAccount')} `}
                    <Text style={{ color: themeColors.primary[400] }}>{mode === 'signin' ? authPack('login', 'signUp') : authPack('welcome', 'signIn')}</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SignInScreen({ navigation }: any) {
  // Redirect to new auth screen - kept for backwards compatibility
  return <AuthScreen navigation={navigation} />;
}
// ============================================
// FEATURE MODALS
// ============================================
function SpinnerModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ type: string; item: any } | null>(null);
  const [spinType, setSpinType] = useState<'all' | 'position' | 'foreplay' | 'oral'>('all');
  const spinAnim = useState(new Animated.Value(0))[0];

  const spin = () => {
    setSpinning(true);
    setResult(null);
    spinAnim.setValue(0);
    Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start(() => {
      let pool: { type: string; item: any }[] = [];
      if (spinType === 'all' || spinType === 'position') pool = [...pool, ...positions.map(p => ({ type: 'position', item: p }))];
      if (spinType === 'all' || spinType === 'foreplay') pool = [...pool, ...foreplayIdeas.map(f => ({ type: 'foreplay', item: f }))];
      if (spinType === 'all' || spinType === 'oral') pool = [...pool, ...oralPlayIdeas.map(o => ({ type: 'oral', item: o }))];
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      setSpinning(false);
      });
  };

  const spinRotation = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1080deg'] });

  const handleViewResult = () => {
    if (result) {
      onClose();
      if (result.type === 'position') navigation.navigate('PositionDetail', { position: result.item });
      else if (result.type === 'foreplay') navigation.navigate('ForeplayDetail', { item: result.item });
      else navigation.navigate('OralDetail', { item: result.item });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('spinner.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('spinner.subtitle')}</Text>
          <View style={styles.spinTypeContainer}>
            {(['all', 'position', 'foreplay', 'oral'] as const).map((type) => (
              <TouchableOpacity key={type} style={[styles.spinTypeButton, spinType === type && styles.spinTypeButtonActive]} onPress={() => { setSpinType(type); }}>
                <Text style={[styles.spinTypeText, spinType === type && styles.spinTypeTextActive]}>
                  {type === 'all' ? '🎲' : type === 'position' ? '💑' : type === 'foreplay' ? '💕' : '👄'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.spinnerContainer}>
            <Animated.View style={[styles.spinnerWheel, { transform: [{ rotate: spinRotation }] }]}>
              <Text style={styles.spinnerEmoji}>{spinning ? '🌀' : result ? '✨' : '🎯'}</Text>
            </Animated.View>
          </View>
          {result && !spinning && (
            <View style={styles.spinnerResult}>
              <Text style={styles.spinnerResultType}>
                {result.type === 'position' ? t('spinner.type.position') : result.type === 'foreplay' ? t('spinner.type.foreplay') : t('spinner.type.oral')}
              </Text>
              <Text style={styles.spinnerResultName}>{result.item.name}</Text>
              <Text style={styles.spinnerResultVibe}>{result.item.vibe}</Text>
              <TouchableOpacity style={styles.viewResultButton} onPress={handleViewResult}>
                <Text style={styles.viewResultButtonText}>{t('spinner.view_details')}</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={[styles.spinButton, spinning && styles.spinButtonDisabled]} onPress={spin} disabled={spinning}>
            <LinearGradient colors={spinning ? GRADIENT_PRESETS.disabled : GRADIENT_PRESETS.warm} style={styles.spinButtonGradient}>
              <Text style={styles.spinButtonText}>{spinning ? t('spinner.spinning') : t('spinner.cta')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DateNightModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const store = useStore();
  const [dateNight, setDateNight] = useState<{ foreplay: ForeplayIdea | null; oral: OralPlayIdea | null; position: Position | null } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });

  const generateDateNight = () => {
    const mood = store.currentMood;
    const foreplayPool = mood ? foreplayIdeas.filter(f => f.mood === mood) : foreplayIdeas;
    const oralPool = mood ? oralPlayIdeas.filter(o => o.mood === mood) : oralPlayIdeas;
    const positionPool = mood ? positions.filter(p => p.mood === mood) : positions;
    const pickRandom = <T extends { id: number }>(pool: T[], triedIds: number[]): T => {
      const untried = pool.filter(item => !triedIds.includes(item.id));
      const pickFrom = untried.length > 0 ? untried : pool;
      return pickFrom[Math.floor(Math.random() * pickFrom.length)];
    };
    setDateNight({
      foreplay: pickRandom(foreplayPool.length > 0 ? foreplayPool : foreplayIdeas, store.triedForeplay),
      oral: pickRandom(oralPool.length > 0 ? oralPool : oralPlayIdeas, store.triedOral),
      position: pickRandom(positionPool.length > 0 ? positionPool : positions, store.tried),
    });
  };

  const handleCompleteDateNight = () => {
    if (dateNight) {
      // Mark all items as tried
      if (dateNight.foreplay) store.markForeplayTried(dateNight.foreplay.id);
      if (dateNight.oral) store.markOralTried(dateNight.oral.id);
      if (dateNight.position) store.markTried(dateNight.position.id);
      
      // Award stars and check achievements
      const result = store.completeDateNight();
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- generate once when modal opens unless cleared.
  useEffect(() => { if (visible && !dateNight) generateDateNight(); }, [visible, dateNight]);
  const handleClose = () => { setDateNight(null); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('date_night.title')}</Text>
            <TouchableOpacity onPress={handleClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('date_night.subtitle')}</Text>
          {dateNight && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.dateNightStep}>
                <View style={styles.dateNightStepHeader}><Text style={styles.dateNightStepNumber}>1</Text><Text style={styles.dateNightStepLabel}>{t('date_night.step.start')}</Text></View>
                <TouchableOpacity style={styles.dateNightCard} onPress={() => { handleClose(); navigation.navigate('ForeplayDetail', { item: dateNight.foreplay }); }}>
                  <Text style={styles.dateNightCardEmoji}>💕</Text>
                  <View style={styles.dateNightCardContent}><Text style={styles.dateNightCardName}>{dateNight.foreplay?.name}</Text><Text style={styles.dateNightCardVibe}>{dateNight.foreplay?.vibe}</Text></View>
                  <Text style={styles.dateNightCardArrow}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateNightStep}>
                <View style={styles.dateNightStepHeader}><Text style={styles.dateNightStepNumber}>2</Text><Text style={styles.dateNightStepLabel}>{t('date_night.step.then')}</Text></View>
                <TouchableOpacity style={styles.dateNightCard} onPress={() => { handleClose(); navigation.navigate('OralDetail', { item: dateNight.oral }); }}>
                  <Text style={styles.dateNightCardEmoji}>👄</Text>
                  <View style={styles.dateNightCardContent}><Text style={styles.dateNightCardName}>{dateNight.oral?.name}</Text><Text style={styles.dateNightCardVibe}>{dateNight.oral?.vibe}</Text></View>
                  <Text style={styles.dateNightCardArrow}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateNightStep}>
                <View style={styles.dateNightStepHeader}><Text style={styles.dateNightStepNumber}>3</Text><Text style={styles.dateNightStepLabel}>{t('date_night.step.finish')}</Text></View>
                <TouchableOpacity style={styles.dateNightCard} onPress={() => { handleClose(); navigation.navigate('PositionDetail', { position: dateNight.position }); }}>
                  <Text style={styles.dateNightCardEmoji}>💑</Text>
                  <View style={styles.dateNightCardContent}><Text style={styles.dateNightCardName}>{dateNight.position?.name}</Text><Text style={styles.dateNightCardVibe}>{dateNight.position?.vibe}</Text></View>
                  <Text style={styles.dateNightCardArrow}>→</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.completeDateNightButton} onPress={handleCompleteDateNight}>
                <LinearGradient colors={GRADIENT_PRESETS.success} style={styles.completeDateNightGradient}>
                  <Text style={styles.completeDateNightText}>{t('date_night.complete')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.regenerateButton} onPress={generateDateNight}>
                <Text style={styles.regenerateButtonText}>{t('date_night.regenerate')}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
      <StarCelebrationModal 
        visible={showCelebration} 
        onClose={() => { setShowCelebration(false); handleClose(); }} 
        stars={celebrationData.stars} 
        achievements={celebrationData.achievements} 
      />
    </Modal>
  );
}

function ChallengeModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const store = useStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });

  const generateChallenge = () => {
    const types: ('position' | 'foreplay' | 'oral')[] = ['position', 'foreplay', 'oral'];
    const type = types[Math.floor(Math.random() * types.length)];
    let pool: { id: number }[];
    let triedList: number[];
    if (type === 'position') { pool = positions; triedList = store.tried; }
    else if (type === 'foreplay') { pool = foreplayIdeas; triedList = store.triedForeplay; }
    else { pool = oralPlayIdeas; triedList = store.triedOral; }
    const untried = pool.filter(item => !triedList.includes(item.id));
    const pickFrom = untried.length > 0 ? untried : pool;
    const itemId = pickFrom[Math.floor(Math.random() * pickFrom.length)].id;
    store.setChallenge({ id: Date.now().toString(), type, itemId, startDate: new Date().toISOString(), completed: false });
  };

  const getChallengeItem = () => {
    if (!store.currentChallenge) return null;
    const { type, itemId } = store.currentChallenge;
    if (type === 'position') return { ...positions.find(p => p.id === itemId), itemType: 'position' };
    if (type === 'foreplay') return { ...foreplayIdeas.find(f => f.id === itemId), itemType: 'foreplay' };
    return { ...oralPlayIdeas.find(o => o.id === itemId), itemType: 'oral' };
  };

  const challengeItem = getChallengeItem();
  
  const handleComplete = () => {
    if (store.currentChallenge) {
      let result: { stars: number; newAchievements: string[] };
      if (store.currentChallenge.type === 'position') {
        result = store.logActivity('position', store.currentChallenge.itemId);
        store.markTried(store.currentChallenge.itemId);
      } else if (store.currentChallenge.type === 'foreplay') {
        result = store.logActivity('foreplay', store.currentChallenge.itemId);
        store.markForeplayTried(store.currentChallenge.itemId);
      } else {
        result = store.logActivity('oral', store.currentChallenge.itemId);
        store.markOralTried(store.currentChallenge.itemId);
      }
      store.completeChallenge();
      
      // Add bonus stars for completing a challenge
      const bonusStars = 3;
      setCelebrationData({ stars: result.stars + bonusStars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleViewChallenge = () => {
    if (!store.currentChallenge || !challengeItem) return;
    onClose();
    if (store.currentChallenge.type === 'position') navigation.navigate('PositionDetail', { position: challengeItem });
    else if (store.currentChallenge.type === 'foreplay') navigation.navigate('ForeplayDetail', { item: challengeItem });
    else navigation.navigate('OralDetail', { item: challengeItem });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('challenge.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          {store.currentChallenge && challengeItem ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>{t('challenge.subtitle')}</Text>
              <View style={styles.challengeCard}>
                <Text style={styles.challengeType}>{store.currentChallenge.type === 'position' ? t('challenge.type.position') : store.currentChallenge.type === 'foreplay' ? t('challenge.type.foreplay') : t('challenge.type.oral')}</Text>
                <Text style={styles.challengeName}>{challengeItem.name}</Text>
                <Text style={styles.challengeVibe}>{challengeItem.vibe}</Text>
                <View style={styles.challengeReward}>
                  <Text style={styles.challengeRewardText}>{t('challenge.reward')}</Text>
                </View>
                <TouchableOpacity style={styles.challengeViewButton} onPress={handleViewChallenge}>
                  <Text style={styles.challengeViewButtonText}>{t('challenge.view_details')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <LinearGradient colors={GRADIENT_PRESETS.success} style={styles.completeButtonGradient}>
                  <Text style={styles.completeButtonText}>{t('challenge.complete')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={generateChallenge}>
                <Text style={styles.skipButtonText}>{t('challenge.skip')}</Text>
              </TouchableOpacity>
              <View style={styles.challengeStats}>
                <Text style={styles.challengeStatsText}>{t('challenge.completed_count', { count: store.completedChallenges.length })}</Text>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noChallengeContainer}>
              <Text style={styles.noChallengeEmoji}>🎯</Text>
              <Text style={styles.noChallengeTitle}>{t('challenge.none_title')}</Text>
              <Text style={styles.noChallengeSubtitle}>{t('challenge.none_subtitle')}</Text>
              <TouchableOpacity style={styles.generateChallengeButton} onPress={generateChallenge}>
                <LinearGradient colors={GRADIENT_PRESETS.primary} style={styles.generateChallengeGradient}>
                  <Text style={styles.generateChallengeText}>{t('challenge.generate')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              {store.completedChallenges.length > 0 && (
                <View style={styles.challengeStats}><Text style={styles.challengeStatsText}>{t('challenge.completed_count', { count: store.completedChallenges.length })}</Text></View>
              )}
            </View>
          )}
        </View>
      </View>
      <StarCelebrationModal 
        visible={showCelebration} 
        onClose={() => { setShowCelebration(false); onClose(); }} 
        stars={celebrationData.stars} 
        achievements={celebrationData.achievements} 
      />
    </Modal>
  );
}

function NotesModal({ visible, onClose, itemId, itemType, itemName }: { visible: boolean; onClose: () => void; itemId: number; itemType: 'position' | 'foreplay' | 'oral' | 'massage' | 'roleplay'; itemName: string }) {
  const { t } = useI18n();
  const store = useStore();
  const existingNote = store.notes.find(n => n.itemId === itemId && n.type === itemType);
  const [noteText, setNoteText] = useState(existingNote?.text || '');
  const [rating, setRating] = useState(existingNote?.rating || 0);

  useEffect(() => {
    if (visible) {
      const note = store.notes.find(n => n.itemId === itemId && n.type === itemType);
      setNoteText(note?.text || '');
      setRating(note?.rating || 0);
    }
  }, [visible, itemId, itemType, store.notes]);

  const handleSave = () => {
    if (existingNote) store.updateNote(existingNote.id, noteText, rating);
    else if (noteText.trim() || rating > 0) store.addNote({ type: itemType, itemId, text: noteText, rating });
    onClose();
  };

  const handleDelete = () => {
    if (existingNote) store.deleteNote(existingNote.id);
    setNoteText('');
    setRating(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardSafeModalContainer maxHeight="82%">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('notes.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.notesItemName}>{itemName}</Text>
            <Text style={styles.notesLabel}>{t('notes.rating')}</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => { setRating(star); }}>
                  <Text style={styles.ratingStar}>{star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.notesLabel}>{t('notes.personal')}</Text>
            <TextInput style={styles.notesInput} multiline numberOfLines={4} placeholder={t('notes.placeholder')} placeholderTextColor={colors.text.muted} value={noteText} onChangeText={setNoteText} />
            <View style={styles.notesButtons}>
              {existingNote && (
                <TouchableOpacity style={styles.deleteNoteButton} onPress={handleDelete}>
                  <Text style={styles.deleteNoteButtonText}>🗑️ {t('common.delete')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.saveNoteButton} onPress={handleSave}>
                <LinearGradient colors={GRADIENT_PRESETS.primary} style={styles.saveNoteGradient}>
                  <Text style={styles.saveNoteText}>{t('notes.save')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </KeyboardSafeModalContainer>
    </Modal>
  );
}

function AchievementsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, localizeTerm } = useI18n();
  const store = useStore();
  
  const groupedAchievements = {
    milestone: ACHIEVEMENTS.filter(a => a.category === 'milestone'),
    adventure: ACHIEVEMENTS.filter(a => a.category === 'adventure'),
    consistency: ACHIEVEMENTS.filter(a => a.category === 'consistency'),
    exploration: ACHIEVEMENTS.filter(a => a.category === 'exploration'),
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏆 {t('profile.achievements')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.achievementProgress}>{t('achievements.progress', { earned: store.earnedAchievements.length, total: ACHIEVEMENTS.length })}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(groupedAchievements).map(([category, achievements]) => (
              <View key={category} style={styles.achievementCategory}>
                <Text style={styles.achievementCategoryTitle}>
                  {category === 'milestone'
                    ? `🎯 ${t('achievements.category.milestone')}`
                    : category === 'adventure'
                      ? `🎪 ${t('achievements.category.adventure')}`
                      : category === 'consistency'
                        ? `🔥 ${t('achievements.category.consistency')}`
                        : `🗺️ ${t('achievements.category.exploration')}`}
                </Text>
                {achievements.map((achievement) => {
                  const isEarned = store.earnedAchievements.includes(achievement.id);
                  return (
                    <View key={achievement.id} style={[styles.achievementItem, !isEarned && styles.achievementItemLocked]}>
                      <Text style={[styles.achievementEmoji, !isEarned && styles.achievementEmojiLocked]}>
                        {isEarned ? achievement.emoji : '🔒'}
                      </Text>
                      <View style={styles.achievementInfo}>
                        <Text style={[styles.achievementName, !isEarned && styles.achievementNameLocked]}>{localizeTerm(achievement.name)}</Text>
                        <Text style={[styles.achievementDesc, !isEarned && styles.achievementDescLocked]}>{localizeTerm(achievement.description)}</Text>
                      </View>
                      {isEarned && <Text style={styles.achievementCheck}>✓</Text>}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InsightsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { language, t } = useI18n();
  const store = useStore();
  const currentMonth = getCurrentMonth();
  const currentMonthStats = store.monthlyStats.find(m => m.month === currentMonth);
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);
  const lastMonthStats = store.monthlyStats.find(m => m.month === lastMonth);
  const favoritesCount = store.favorites.length
    + store.favoriteForeplay.length
    + store.favoriteOral.length
    + store.favoriteMassage.length
    + store.favoriteRoleplay.length;
  const notesCount = store.notes.length;
  const playlistsCount = store.userPlaylists.length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const activeDays7d = new Set(
    store.activityLog
      .filter((activity) => new Date(activity.date) >= sevenDaysAgo)
      .map((activity) => getDateKey(new Date(activity.date)))
  ).size;
  const lastActivityDate = store.activityLog.length
    ? new Date(store.activityLog[store.activityLog.length - 1].date)
    : null;
  const daysSinceLastActivity = lastActivityDate
    ? Math.max(0, Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const weeklyGoalsCompletion = store.weeklyGoals.length
    ? Math.round((store.weeklyGoals.filter((goal) => goal.completed).length / store.weeklyGoals.length) * 100)
    : 0;

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const locale =
      language === 'es' ? 'es-ES'
      : language === 'pt' ? 'pt-BR'
      : language === 'hi' ? 'hi-IN'
      : 'en-US';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 {t('profile.insights')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Month */}
            <View style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>{formatMonth(currentMonth)}</Text>
              <View style={styles.insightStatsRow}>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{currentMonthStats?.totalSessions || 0}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.sessions')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>⭐ {currentMonthStats?.starsEarned || 0}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.stars_earned')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{currentMonthStats?.newThingsTried || 0}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.new_things')}</Text>
                </View>
              </View>
            </View>

            {/* Comparison */}
            {lastMonthStats && (
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonTitle}>{t('insights.vs_last_month')}</Text>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{t('insights.sessions')}:</Text>
                  <Text style={[styles.comparisonValue, (currentMonthStats?.totalSessions || 0) > lastMonthStats.totalSessions ? styles.comparisonUp : styles.comparisonDown]}>
                    {(currentMonthStats?.totalSessions || 0) >= lastMonthStats.totalSessions ? '↑' : '↓'} {Math.abs((currentMonthStats?.totalSessions || 0) - lastMonthStats.totalSessions)}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>{t('insights.stars_short')}:</Text>
                  <Text style={[styles.comparisonValue, (currentMonthStats?.starsEarned || 0) > lastMonthStats.starsEarned ? styles.comparisonUp : styles.comparisonDown]}>
                    {(currentMonthStats?.starsEarned || 0) >= lastMonthStats.starsEarned ? '↑' : '↓'} {Math.abs((currentMonthStats?.starsEarned || 0) - lastMonthStats.starsEarned)}
                  </Text>
                </View>
              </View>
            )}

            {/* Streak */}
            <View style={styles.streakCard}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNumber}>{store.currentStreak}</Text>
              <Text style={styles.streakLabel}>{t('insights.week_streak')}</Text>
              {store.currentStreak >= 2 && <Text style={styles.streakMessage}>{t('insights.keep_going')}</Text>}
            </View>

            {/* All Time Stats */}
            <View style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>{t('insights.all_time')}</Text>
              <View style={styles.insightStatsRow}>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>⭐ {store.totalStars}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.total_stars')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{store.tried.length + store.triedForeplay.length + store.triedOral.length}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.things_tried')}</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightStatNumber}>{store.completedChallenges.length}</Text>
                  <Text style={styles.insightStatLabel}>{t('insights.challenges')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightCardTitle}>{t('insights.usage_snapshot')}</Text>
              <Text style={styles.comparisonTitle}>{t('insights.adoption')}</Text>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{t('insights.favorites_saved')}:</Text>
                <Text style={styles.comparisonValue}>{favoritesCount}</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{t('insights.notes_logged')}:</Text>
                <Text style={styles.comparisonValue}>{notesCount}</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{t('insights.playlists_added')}:</Text>
                <Text style={styles.comparisonValue}>{playlistsCount}</Text>
              </View>

              <Text style={[styles.comparisonTitle, { marginTop: 12 }]}>{t('insights.retention')}</Text>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{t('insights.active_days_7d')}:</Text>
                <Text style={styles.comparisonValue}>{activeDays7d}</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{t('insights.days_since_last_activity')}:</Text>
                <Text style={styles.comparisonValue}>
                  {daysSinceLastActivity === null ? t('insights.never') : daysSinceLastActivity}
                </Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{t('insights.weekly_goal_completion')}:</Text>
                <Text style={styles.comparisonValue}>{weeklyGoalsCompletion}%</Text>
              </View>
            </View>

            {/* Recent Activity */}
            {store.activityLog.length > 0 && (
              <View style={styles.recentActivityCard}>
                <Text style={styles.insightCardTitle}>{t('insights.recent_activity')}</Text>
                {store.activityLog.slice(-5).reverse().map((activity) => {
                  const item = activity.type === 'position' 
                    ? positions.find(p => p.id === activity.itemId)
                    : activity.type === 'foreplay'
                    ? foreplayIdeas.find(f => f.id === activity.itemId)
                    : oralPlayIdeas.find(o => o.id === activity.itemId);
                  return (
                    <View key={activity.id} style={styles.activityItem}>
                      <Text style={styles.activityEmoji}>
                        {activity.type === 'position' ? '💑' : activity.type === 'foreplay' ? '💕' : activity.type === 'oral' ? '👄' : '🌙'}
                      </Text>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{item?.name || t('insights.session_fallback')}</Text>
                        <Text style={styles.activityDate}>{new Date(activity.date).toLocaleDateString()}</Text>
                      </View>
                      <Text style={styles.activityStars}>+{activity.starsEarned} ⭐</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// WEEKLY GOALS MODAL
// ============================================
function WeeklyGoalsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const store = useStore();
  
  useEffect(() => {
    if (visible) {
      store.refreshWeeklyGoals();
    }
  }, [visible, store]);

  const completedCount = store.weeklyGoals.filter(g => g.completed).length;
  const totalGoals = store.weeklyGoals.length;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎯 {t('home.weekly_goals')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('weekly_goals.subtitle')}</Text>
          
          {/* Progress Bar */}
          <View style={styles.weeklyProgressContainer}>
            <View style={styles.weeklyProgressBar}>
              <View style={[styles.weeklyProgressFill, { width: `${(completedCount / Math.max(totalGoals, 1)) * 100}%` }]} />
            </View>
            <Text style={styles.weeklyProgressText}>{t('weekly_goals.progress', { completed: completedCount, total: totalGoals })}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {store.weeklyGoals.map((goal) => (
              <View key={goal.id} style={[styles.goalCard, goal.completed && styles.goalCardCompleted]}>
                <Text style={styles.goalEmoji}>{goal.completed ? '✅' : goal.emoji}</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalDescription}>{t(goal.description)}</Text>
                  <View style={styles.goalProgressRow}>
                    <View style={styles.goalMiniProgress}>
                      <View style={[styles.goalMiniProgressFill, { width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }]} />
                    </View>
                    <Text style={styles.goalProgressText}>{goal.current}/{goal.target}</Text>
                  </View>
                </View>
                <View style={styles.goalReward}>
                  <Text style={styles.goalRewardText}>+{goal.reward} ⭐</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {completedCount === totalGoals && totalGoals > 0 && (
            <View style={styles.allGoalsComplete}>
              <Text style={styles.allGoalsCompleteEmoji}>🎉</Text>
              <Text style={styles.allGoalsCompleteText}>{t('weekly_goals.all_completed')}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// MOOD PLAYLISTS MODAL
// ============================================
function MoodPlaylistsModal({ visible, onClose, navigation: _navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t } = useI18n();
  const store = useStore();

  const handleSelectPlaylist = (playlist: MoodPlaylist) => {
    store.setCurrentMood(playlist.mood);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('mood_playlists.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('mood_playlists.subtitle')}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {MOOD_PLAYLISTS.map((playlist) => (
              <TouchableOpacity 
                key={playlist.id} 
                style={[styles.playlistCard, store.currentMood === playlist.mood && styles.playlistCardActive]}
                onPress={() => handleSelectPlaylist(playlist)}
              >
                <View style={[styles.playlistEmojiBg, { backgroundColor: playlist.color + '30' }]}>
                  <Text style={styles.playlistEmoji}>{playlist.emoji}</Text>
                </View>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.playlistDescription}>{playlist.description}</Text>
                </View>
                {store.currentMood === playlist.mood && <Text style={styles.playlistCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            
            {/* Clear Mood Option */}
            <TouchableOpacity 
              style={[styles.playlistCard, !store.currentMood && styles.playlistCardActive]}
              onPress={() => { store.setCurrentMood(null); onClose(); }}
            >
              <View style={[styles.playlistEmojiBg, { backgroundColor: colors.card }]}>
                <Text style={styles.playlistEmoji}>🎲</Text>
              </View>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{t('mood_playlists.surprise')}</Text>
                <Text style={styles.playlistDescription}>{t('mood_playlists.surprise_desc')}</Text>
              </View>
              {!store.currentMood && <Text style={styles.playlistCheck}>✓</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// RECOMMENDATIONS MODAL
// ============================================
function RecommendationsModal({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const { t, localizeTerm } = useI18n();
  const store = useStore();
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  
  // Get smart recommendations from the learning system
  const smartRecs = useMemo(() => {
    return store.getSmartRecommendations(10);
  }, [store]);
  
  // Get user's preference summary
  const prefSummary = useMemo(() => {
    return store.getUserPreferenceSummary();
  }, [store]);
  
  // Group recommendations by type for better display
  const groupedRecs = useMemo(() => {
    const groups: { [key: string]: typeof smartRecs } = {};
    smartRecs.forEach(rec => {
      if (!groups[rec.type]) groups[rec.type] = [];
      groups[rec.type].push(rec);
    });
    return groups;
  }, [smartRecs]);

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'position': return '💑';
      case 'foreplay': return '🔥';
      case 'oral': return '💋';
      case 'massage': return '💆';
      case 'roleplay': return '🎭';
      default: return '✨';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'position': return t('recommendations.type.position');
      case 'foreplay': return t('recommendations.type.foreplay');
      case 'oral': return t('recommendations.type.oral');
      case 'massage': return t('recommendations.type.massage');
      case 'roleplay': return t('recommendations.type.roleplay');
      default: return type;
    }
  };

  const handleSelectItem = (type: string, item: any) => {
    // Track this interaction for learning
    store.trackInteraction({
      type: 'view',
      contentType: type as InteractionEvent['contentType'],
      itemId: item.id,
      category: item.category,
      mood: item.mood,
    });
    
    onClose();
    switch (type) {
      case 'position':
        navigation.navigate('PositionDetail', { position: item });
        break;
      case 'foreplay':
        navigation.navigate('ForeplayDetail', { item });
        break;
      case 'oral':
        navigation.navigate('OralDetail', { item });
        break;
      case 'massage':
        navigation.navigate('MassageDetail', { item });
        break;
      case 'roleplay':
        navigation.navigate('RolePlayDetail', { item });
        break;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💡 {t('home.feature.for_you')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('recommendations.subtitle')}</Text>
          
          {/* Preference summary */}
          {prefSummary.categories.length > 0 && (
            <View style={[styles.prefSummaryContainer, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.prefSummaryTitle, { color: themeColors.text.secondary }]}>{t('recommendations.preferences_title')}</Text>
              <View style={styles.prefTagsRow}>
                {prefSummary.categories.slice(0, 3).map((cat, i) => (
                  <View key={`cat-${i}`} style={[styles.prefTag, { backgroundColor: themeColors.primary[500] + '30' }]}>
                    <Text style={[styles.prefTagText, { color: themeColors.primary[400] }]}>{localizeTerm(cat)}</Text>
                  </View>
                ))}
                {prefSummary.moods.slice(0, 2).map((mood, i) => (
                  <View key={`mood-${i}`} style={[styles.prefTag, { backgroundColor: themeColors.cardLight }]}>
                    <Text style={[styles.prefTagText, { color: themeColors.text.secondary }]}>{localizeTerm(mood)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(groupedRecs).map(([type, recs]) => (
              <View key={type} style={styles.recSection}>
                <View style={styles.recHeader}>
                  <Text style={styles.recEmoji}>{getTypeEmoji(type)}</Text>
                  <Text style={styles.recTitle}>{getTypeLabel(type)}</Text>
                </View>
                {recs.slice(0, 3).map((rec) => (
                  <TouchableOpacity 
                    key={`${type}-${rec.item.id}`} 
                    style={[styles.recCard, { backgroundColor: themeColors.card }]}
                    onPress={() => handleSelectItem(type, rec.item)}
                  >
                    <View style={styles.recCardContent}>
                      <Text style={[styles.recItemName, { color: themeColors.text.primary }]}>{rec.item.name}</Text>
                      <Text style={[styles.recItemReason, { color: themeColors.primary[400] }]}>{localizeTerm(rec.reason)}</Text>
                    </View>
                    <View style={styles.recScoreBadge}>
                      <Text style={styles.recScoreText}>{Math.round(rec.score)}%</Text>
                    </View>
                    <Text style={[styles.recItemArrow, { color: themeColors.text.muted }]}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            
            {smartRecs.length === 0 && (
              <View style={styles.noRecsContainer}>
                <Text style={styles.noRecsEmoji}>🔮</Text>
                <Text style={[styles.noRecsText, { color: themeColors.text.muted }]}>
                  {t('recommendations.empty_title')}
                </Text>
                <Text style={[styles.noRecsSubtext, { color: themeColors.text.muted }]}>
                  {t('recommendations.empty_subtitle')}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// TRUTH OR DARE MODAL
// ============================================
function TruthOrDareModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [intensity, setIntensity] = useState<'mild' | 'medium' | 'spicy' | 'wild'>('mild');
  const [currentItem, setCurrentItem] = useState<TruthOrDareItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinAnim = useState(new Animated.Value(0))[0];

  const spin = (type: 'truth' | 'dare' | 'random') => {
    setIsSpinning(true);
    
    Animated.sequence([
      Animated.timing(spinAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(spinAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      const filtered = TRUTH_OR_DARE.filter(item => 
        item.intensity === intensity && 
        (type === 'random' ? true : item.type === type)
      );
      const randomItem = filtered[Math.floor(Math.random() * filtered.length)];
      setCurrentItem(randomItem);
      setIsSpinning(false);
      });
  };

  const intensityColors = { mild: colors.success, medium: colors.warning, spicy: colors.error, wild: colors.primary[500] };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('truth_dare.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('truth_dare.subtitle')}</Text>
          
          {/* Intensity Selector */}
          <View style={styles.intensitySelector}>
            {(['mild', 'medium', 'spicy', 'wild'] as const).map((level) => (
              <TouchableOpacity 
                key={level} 
                style={[styles.intensityOption, intensity === level && { backgroundColor: intensityColors[level] + '40', borderColor: intensityColors[level] }]}
                onPress={() => { setIntensity(level); }}
              >
                <Text style={[styles.intensityOptionText, intensity === level && { color: intensityColors[level] }]}>
                  {level === 'mild' ? '😊' : level === 'medium' ? '😏' : level === 'spicy' ? '🔥' : '🌶️'} {t(`truth_dare.intensity.${level}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Card */}
          {currentItem ? (
            <Animated.View style={[styles.todCard, { backgroundColor: intensityColors[currentItem.intensity] + '20', borderColor: intensityColors[currentItem.intensity], transform: [{ scale: spinAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] }) }] }]}>
              <Text style={styles.todCardType}>{currentItem.type === 'truth' ? t('truth_dare.card.truth') : t('truth_dare.card.dare')}</Text>
              <Text style={styles.todCardText}>{currentItem.text}</Text>
            </Animated.View>
          ) : (
            <View style={styles.todPlaceholder}>
              <Text style={styles.todPlaceholderEmoji}>🎲</Text>
              <Text style={styles.todPlaceholderText}>{t('truth_dare.placeholder')}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.todButtonsRow}>
            <TouchableOpacity style={[styles.todButton, { backgroundColor: colors.cyan }]} onPress={() => spin('truth')} disabled={isSpinning}>
              <Text style={styles.todButtonText}>🤔 {t('truth_dare.truth')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.todButton, { backgroundColor: colors.primary[600] }]} onPress={() => spin('dare')} disabled={isSpinning}>
              <Text style={styles.todButtonText}>😈 {t('truth_dare.dare')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.todRandomButton]} onPress={() => spin('random')} disabled={isSpinning}>
            <LinearGradient colors={GRADIENT_PRESETS.purplePink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.todRandomGradient}>
              <Text style={styles.todRandomText}>🎲 {t('truth_dare.random')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// MUSIC PLAYLISTS MODAL (Enhanced)
// ============================================
function MusicPlaylistsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const openPlaylist = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('music.error_title'), t('music.error_message'));
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('music.title')}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{t('music.subtitle')}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {CURATED_PLAYLISTS.map((playlist, index) => (
              <View key={index} style={styles.musicPlaylistCard}>
                <Text style={styles.musicPlaylistName}>{playlist.name}</Text>
                <Text style={styles.musicPlaylistDesc}>{playlist.description}</Text>
                <View style={styles.musicButtonsRow}>
                  <TouchableOpacity style={[styles.musicButton, { backgroundColor: '#1DB954' }]} onPress={() => openPlaylist(playlist.spotifyUrl)}>
                    <Text style={styles.musicButtonText}>{t('music.spotify')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.musicButton, { backgroundColor: '#FA243C' }]} onPress={() => openPlaylist(playlist.appleMusicUrl)}>
                    <Text style={styles.musicButtonText}>{t('music.apple_music')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// SETTINGS MODAL
// ============================================
// ============================================
// THEME SELECTOR COMPONENT
// ============================================
function ThemeSelector() {
  const { t } = useI18n();
  const themeStore = useThemeStore();
  const currentColors = getThemeColors(themeStore.currentTheme);
  
  return (
    <View style={styles.themeSelectorContainer}>
      <Text style={[styles.themeSelectorLabel, { color: currentColors.text.primary }]}>{t('settings.appearance.color_theme')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelectorScroll}>
        {THEMES.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeOption,
              { 
                backgroundColor: theme.colors.card,
                borderColor: themeStore.currentTheme === theme.id ? theme.colors.primary[500] : 'transparent',
                borderWidth: 2,
              }
            ]}
            onPress={() => {
              themeStore.setTheme(theme.id);
            }}
          >
            <View style={[styles.themeColorPreview, { backgroundColor: theme.colors.primary[500] }]} />
            <Text style={styles.themeEmoji}>{theme.emoji}</Text>
            <Text style={[styles.themeName, { color: theme.colors.text.primary }]}>{theme.name}</Text>
            {themeStore.currentTheme === theme.id && (
              <View style={[styles.themeSelectedBadge, { backgroundColor: theme.colors.primary[500] }]}>
                <Text style={styles.themeSelectedText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================
// FONT SIZE SELECTOR COMPONENT
// ============================================
function FontSizeSelector() {
  const { t } = useI18n();
  const themeStore = useThemeStore();
  const currentColors = getThemeColors(themeStore.currentTheme);
  
  const sizes: { id: FontSizePreset; label: string; preview: string }[] = [
    { id: 'small', label: t('settings.font.small'), preview: 'Aa' },
    { id: 'medium', label: t('settings.font.medium'), preview: 'Aa' },
    { id: 'large', label: t('settings.font.large'), preview: 'Aa' },
  ];
  
  return (
    <View style={styles.fontSelectorContainer}>
      <Text style={[styles.themeSelectorLabel, { color: currentColors.text.primary }]}>{t('settings.appearance.font_size')}</Text>
      <View style={styles.fontSizeOptions}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size.id}
            style={[
              styles.fontSizeOption,
              { 
                backgroundColor: themeStore.fontSize === size.id ? currentColors.primary[500] + '30' : currentColors.card,
                borderColor: themeStore.fontSize === size.id ? currentColors.primary[500] : 'transparent',
              }
            ]}
            onPress={() => {
              themeStore.setFontSize(size.id);
            }}
          >
            <Text style={[
              styles.fontSizePreview,
              { 
                fontSize: FONT_SIZES[size.id].large,
                color: themeStore.fontSize === size.id ? currentColors.primary[500] : currentColors.text.primary,
              }
            ]}>
              {size.preview}
            </Text>
            <Text style={[
              styles.fontSizeLabel,
              { color: themeStore.fontSize === size.id ? currentColors.primary[500] : currentColors.text.muted }
            ]}>
              {size.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// SETTINGS MODAL
// ============================================
function SettingsModal({ visible, onClose, navigation: _navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const store = useStore();
  const { languageLabel, language, t } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const { user, logout } = useAuth();
  const appDataStats = store.storageStats();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  const refreshNotificationPermissionStatus = useCallback(async () => {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status === 'granted') {
      setNotificationPermissionStatus('granted');
      return;
    }
    if (permissions.status === 'denied') {
      setNotificationPermissionStatus('denied');
      return;
    }
    setNotificationPermissionStatus('undetermined');
  }, []);

  useEffect(() => {
    if (!visible) return;
    void refreshNotificationPermissionStatus();
  }, [visible, refreshNotificationPermissionStatus]);

  const ensureNotificationPermission = useCallback(async (): Promise<boolean> => {
    let permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      permissions = await Notifications.requestPermissionsAsync();
    }

    if (permissions.status === 'granted') {
      setNotificationPermissionStatus('granted');
      return true;
    }

    setNotificationPermissionStatus(permissions.status === 'denied' ? 'denied' : 'undetermined');
    Alert.alert(
      t('settings.notifications.permission_required_title'),
      t('settings.notifications.permission_required_body'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.notifications.open_settings'), onPress: () => { void Linking.openSettings(); } },
      ]
    );
    return false;
  }, [t]);

  const clearAllReminderNotifications = useCallback(async () => {
    await Promise.all([
      clearDailyJokeTeaserNotifications(),
      clearDailyStreakReminder(),
      clearReactivationReminder(),
    ]);
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
  }, []);

  const handleToggleGlobalNotifications = useCallback(async () => {
    const nextEnabled = !store.notificationsEnabled;
    store.setNotificationsEnabled(nextEnabled);

    if (!nextEnabled) {
      await clearAllReminderNotifications();
      return;
    }

    const hasPermission = await ensureNotificationPermission();
    if (!hasPermission) {
      store.setNotificationsEnabled(false);
      return;
    }

    await Promise.all([
      ensureDailyJokeTeaserNotifications({
        enabled: store.dailyJokeNotificationsEnabled,
        forceRefresh: true,
      }),
      scheduleDailyStreakReminder({ enabled: store.dailyStreakNotificationsEnabled }),
      scheduleReactivationReminder({ enabled: store.reactivationNotificationsEnabled }),
    ]);
  }, [clearAllReminderNotifications, ensureNotificationPermission, store]);

  const handleToggleDailyJokeNotifications = useCallback(async () => {
    const nextEnabled = !store.dailyJokeNotificationsEnabled;
    store.setDailyJokeNotificationsEnabled(nextEnabled);

    if (!store.notificationsEnabled) {
      return;
    }

    if (nextEnabled) {
      const hasPermission = await ensureNotificationPermission();
      if (!hasPermission) {
        store.setDailyJokeNotificationsEnabled(false);
        return;
      }
      await ensureDailyJokeTeaserNotifications({ enabled: true, forceRefresh: true });
    } else {
      await clearDailyJokeTeaserNotifications();
    }
  }, [ensureNotificationPermission, store]);

  const handleToggleDailyStreakNotifications = useCallback(async () => {
    const nextEnabled = !store.dailyStreakNotificationsEnabled;
    store.setDailyStreakNotificationsEnabled(nextEnabled);

    if (!store.notificationsEnabled) {
      return;
    }

    if (nextEnabled) {
      const hasPermission = await ensureNotificationPermission();
      if (!hasPermission) {
        store.setDailyStreakNotificationsEnabled(false);
        return;
      }
      await scheduleDailyStreakReminder({ enabled: true });
    } else {
      await clearDailyStreakReminder();
    }
  }, [ensureNotificationPermission, store]);

  const handleToggleReactivationNotifications = useCallback(async () => {
    const nextEnabled = !store.reactivationNotificationsEnabled;
    store.setReactivationNotificationsEnabled(nextEnabled);

    if (!store.notificationsEnabled) {
      return;
    }

    if (nextEnabled) {
      const hasPermission = await ensureNotificationPermission();
      if (!hasPermission) {
        store.setReactivationNotificationsEnabled(false);
        return;
      }
      await scheduleReactivationReminder({ enabled: true });
    } else {
      await clearReactivationReminder();
    }
  }, [ensureNotificationPermission, store]);

  const notificationPermissionValue = useMemo(() => {
    if (notificationPermissionStatus === 'granted') return t('settings.notifications.permission_granted');
    if (notificationPermissionStatus === 'denied') return t('settings.notifications.permission_denied');
    return t('settings.notifications.permission_not_determined');
  }, [notificationPermissionStatus, t]);

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      setPinError(t('settings.pin.error_length'));
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(t('settings.pin.error_match'));
      return;
    }
    store.setPinCode(newPin);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    Alert.alert(t('settings.pin.set_success_title'), t('settings.pin.set_success_message'));
  };

  const handleRemovePin = () => {
    Alert.alert(t('settings.pin.remove_title'), t('settings.pin.remove_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.pin.remove_action'), style: 'destructive', onPress: () => { store.setPinCode(null); } }
    ]);
  };

  const handleToggleBiometrics = async () => {
    if (!store.useBiometrics) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        Alert.alert(t('settings.biometrics.not_available_title'), t('settings.biometrics.not_available_message'));
        return;
      }
    }
    store.setUseBiometrics(!store.useBiometrics);
    };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.account.delete_confirm_title'),
      t('settings.account.delete_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) {
                Alert.alert(t('common.error'), t('settings.account.no_user'));
                return;
              }
              await deleteUser(user);
              store.resetOnboarding();
              await logout();
              onClose();
              Alert.alert(t('settings.account.deleted_title'), t('settings.account.deleted_message'));
            } catch (error: any) {
              if (error?.code === 'auth/requires-recent-login') {
                try {
                  await logout();
                } catch (_) {
                  // Ignore logout failure and still show re-auth guidance.
                }
                onClose();
                Alert.alert(t('settings.account.reauth_title'), t('settings.account.reauth_message'));
              } else {
                Alert.alert(t('common.error'), t('settings.account.delete_failed'));
              }
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚙️ {t('settings.title')}</Text>
              <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
            {/* Security Section */}
            <Text style={styles.settingsSectionTitle}>🔒 {t('settings.section.security')}</Text>
            
            {!showPinSetup ? (
              <>
                <TouchableOpacity style={styles.settingsItem} onPress={() => store.pinCode ? handleRemovePin() : setShowPinSetup(true)}>
                  <Text style={styles.settingsItemText}>{store.pinCode ? `🔐 ${t('settings.pin.change')}` : `🔓 ${t('settings.pin.set')}`}</Text>
                  <Text style={styles.settingsItemValue}>{store.pinCode ? `${t('settings.pin.enabled')} ✓` : t('settings.pin.off')}</Text>
                </TouchableOpacity>
                
                {store.pinCode && (
                  <TouchableOpacity style={styles.settingsItem} onPress={handleToggleBiometrics}>
                    <Text style={styles.settingsItemText}>👆 {t('settings.biometrics')}</Text>
                    <Text style={styles.settingsItemValue}>{store.useBiometrics ? `${t('settings.on')} ✓` : t('settings.pin.off')}</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.pinSetupContainer}>
                <Text style={styles.pinSetupTitle}>{t('settings.pin.setup_title')}</Text>
                <TextInput
                  style={styles.pinInput}
                  value={newPin}
                  onChangeText={setNewPin}
                  placeholder={t('settings.pin.enter')}
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                <TextInput
                  style={styles.pinInput}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder={t('settings.pin.confirm')}
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
                <View style={styles.pinButtonsRow}>
                  <TouchableOpacity style={styles.pinCancelButton} onPress={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); setPinError(''); }}>
                    <Text style={styles.pinCancelText}>{t('settings.pin.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pinSaveButton} onPress={handleSetPin}>
                    <Text style={styles.pinSaveText}>{t('settings.pin.save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Language Section */}
            <Text style={styles.settingsSectionTitle}>🌐 {t('settings.section.language')}</Text>
            <TouchableOpacity style={styles.settingsItem} onPress={() => setShowLanguageOptions((prev) => !prev)}>
              <Text style={styles.settingsItemText}>{t('settings.language')}</Text>
              <Text style={styles.settingsItemValue}>{languageLabel} ▾</Text>
            </TouchableOpacity>
            {showLanguageOptions && (
              <View style={styles.languageDropdown}>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageOption,
                      store.language === item.code && styles.languageOptionActive,
                    ]}
                    onPress={() => {
                      store.setLanguage(item.code);
                      setShowLanguageOptions(false);
                      }}
                  >
                    <Text
                      style={[
                        styles.languageOptionText,
                        store.language === item.code && styles.languageOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {store.language === item.code ? <Text style={styles.languageOptionCheck}>✓</Text> : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Notifications Section */}
            <Text style={styles.settingsSectionTitle}>🔔 {t('settings.section.notifications')}</Text>
            <TouchableOpacity style={styles.settingsItem} onPress={() => { void handleToggleGlobalNotifications(); }}>
              <Text style={styles.settingsItemText}>{t('settings.notifications.master')}</Text>
              <Text style={styles.settingsItemValue}>
                {store.notificationsEnabled ? `${t('settings.on')} ✓` : t('settings.pin.off')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={() => { void handleToggleDailyJokeNotifications(); }}>
              <Text style={styles.settingsItemText}>{t('settings.notifications.daily_tease')}</Text>
              <Text style={styles.settingsItemValue}>
                {store.notificationsEnabled && store.dailyJokeNotificationsEnabled ? `${t('settings.on')} ✓` : t('settings.pin.off')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={() => { void handleToggleDailyStreakNotifications(); }}>
              <Text style={styles.settingsItemText}>{t('settings.notifications.daily_streak')}</Text>
              <Text style={styles.settingsItemValue}>
                {store.notificationsEnabled && store.dailyStreakNotificationsEnabled ? `${t('settings.on')} ✓` : t('settings.pin.off')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem} onPress={() => { void handleToggleReactivationNotifications(); }}>
              <Text style={styles.settingsItemText}>{t('settings.notifications.reactivation')}</Text>
              <Text style={styles.settingsItemValue}>
                {store.notificationsEnabled && store.reactivationNotificationsEnabled ? `${t('settings.on')} ✓` : t('settings.pin.off')}
              </Text>
            </TouchableOpacity>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.notifications.permission_status')}</Text>
              <Text style={styles.settingsItemValue}>{notificationPermissionValue}</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => { void Linking.openSettings(); }}
            >
              <Text style={styles.settingsItemText}>{t('settings.notifications.open_settings')}</Text>
            </TouchableOpacity>

            {/* Appearance Section */}
            <Text style={styles.settingsSectionTitle}>🎨 {t('settings.section.appearance')}</Text>
            <ThemeSelector />
            <FontSizeSelector />

            {/* Account Section */}
            <Text style={styles.settingsSectionTitle}>👤 {t('settings.section.account')}</Text>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.account.name')}</Text>
              <Text style={styles.settingsItemValue}>{store.name || t('common.not_set')}</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.account.experience')}</Text>
              <Text style={styles.settingsItemValue}>{store.experience || t('common.not_set')}</Text>
            </View>
          <TouchableOpacity
            style={[styles.settingsItem, { borderColor: colors.error }]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.settingsItemText, { color: colors.error }]}>❌ {t('settings.account.delete')}</Text>
          </TouchableOpacity>

            {/* Data Section */}
            <Text style={styles.settingsSectionTitle}>📊 {t('settings.section.data')}</Text>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.data.total_stars')}</Text>
              <Text style={styles.settingsItemValue}>⭐ {store.totalStars}</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{t('settings.data.items_tried')}</Text>
              <Text style={styles.settingsItemValue}>{store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length}</Text>
            </View>

            <Text style={styles.settingsSectionTitle}>{`🗂️ ${voice.labels.appDataTitle}`}</Text>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{voice.labels.activityLog}</Text>
              <Text style={styles.settingsItemValue}>{appDataStats.activityLogCount} / 500</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{voice.labels.interactionHistory}</Text>
              <Text style={styles.settingsItemValue}>{appDataStats.interactionHistoryCount} / 100</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{voice.labels.notesSaved}</Text>
              <Text style={styles.settingsItemValue}>{appDataStats.notesCount}</Text>
            </View>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>{voice.labels.totalStarsEarned}</Text>
              <Text style={styles.settingsItemValue}>⭐ {appDataStats.totalStarsEarned}</Text>
            </View>
            
            <TouchableOpacity style={[styles.settingsItem, { borderColor: colors.error }]} onPress={() => {
              Alert.alert(t('settings.data.reset_confirm_title'), t('settings.data.reset_confirm_message'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('settings.data.reset_confirm_action'), style: 'destructive', onPress: () => { store.resetOnboarding(); onClose(); } }
              ]);
            }}>
              <Text style={[styles.settingsItemText, { color: colors.error }]}>🗑️ {t('settings.data.reset')}</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ============================================
// TERMS OF USE MODAL
// ============================================
function TermsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { language } = useI18n();
  const legalContent = useMemo(() => getLegalContent(language), [language]);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📜 {legalContent.terms.title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.legalTitle}>{legalContent.terms.title}</Text>
            <Text style={styles.legalDate}>{legalContent.terms.lastUpdated}</Text>
            {legalContent.terms.intro ? <Text style={styles.legalText}>{legalContent.terms.intro}</Text> : null}
            {legalContent.terms.sections.map((section) => (
              <View key={section.heading}>
                <Text style={styles.legalSection}>{section.heading}</Text>
                <Text style={styles.legalText}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// PRIVACY POLICY MODAL
// ============================================
function PrivacyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { language } = useI18n();
  const legalContent = useMemo(() => getLegalContent(language), [language]);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔐 {legalContent.privacy.title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.legalTitle}>{legalContent.privacy.title}</Text>
            <Text style={styles.legalDate}>{legalContent.privacy.lastUpdated}</Text>
            {legalContent.privacy.intro ? <Text style={styles.legalText}>{legalContent.privacy.intro}</Text> : null}
            {legalContent.privacy.sections.map((section) => (
              <View key={section.heading}>
                <Text style={styles.legalSection}>{section.heading}</Text>
                <Text style={styles.legalText}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AboutBlisseModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { language } = useI18n();
  const legalContent = useMemo(() => getLegalContent(language), [language]);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalOverlay, styles.modalOverlayCentered]}>
        <View style={[styles.modalContent, styles.aboutModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💞 {legalContent.about.title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={styles.legalTitle}>{legalContent.about.title}</Text>
            <Text style={styles.legalDate}>{legalContent.about.subtitle}</Text>
            {legalContent.about.intro.map((paragraph) => (
              <Text key={paragraph} style={styles.legalText}>{paragraph}</Text>
            ))}
            {legalContent.about.sections.map((section) => (
              <View key={section.heading}>
                <Text style={styles.legalSection}>{section.heading}</Text>
                <Text style={styles.legalText}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// CONTACT FORM MODAL (In-App Submission)
// ============================================
function ContactModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<'general' | 'bug' | 'feedback'>('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t('contact.empty_message'));
      return;
    }
    
    setIsSubmitting(true);

    try {
      const result = await submitFormspreeMessage({
        type: 'contact',
        category,
        message,
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
      if (result.queued) {
        Alert.alert(t('contact.queued_title'), t('contact.queued_message'));
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : t('contact.error_message');
      Alert.alert(t('contact.error_title'), description);
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setMessage('');
    setCategory('general');
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={styles.successTitle}>{t('contact.success_title')}</Text>
              <Text style={styles.successText}>{t('contact.success_message')}</Text>
              <TouchableOpacity style={styles.successButton} onPress={handleClose}>
                <Text style={styles.successButtonText}>{t('common.done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardSafeModalContainer maxHeight="80%">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📧 {t('profile.menu.contact')}</Text>
            <TouchableOpacity onPress={handleClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>{t('contact.subtitle')}</Text>
            
            {/* Category Selector */}
            <View style={styles.contactCategoryRow}>
              {[
                { type: 'general' as const, emoji: '💬', label: t('contact.category.general') },
                { type: 'bug' as const, emoji: '🐛', label: t('contact.category.bug') },
                { type: 'feedback' as const, emoji: '💝', label: t('contact.category.feedback') },
              ].map((item) => (
                <TouchableOpacity 
                  key={item.type}
                  style={[styles.contactCategoryButton, category === item.type && styles.contactCategoryButtonActive]}
                  onPress={() => { setCategory(item.type); }}
                >
                  <Text style={styles.contactCategoryEmoji}>{item.emoji}</Text>
                  <Text style={[styles.contactCategoryText, category === item.type && styles.contactCategoryTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.contactInput, styles.contactTextarea]}
              value={message}
              onChangeText={setMessage}
              placeholder={t('contact.placeholder')}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              accessibilityLabel={t('contact.placeholder')}
            />
            
            <TouchableOpacity 
              style={[styles.contactSendButton, isSubmitting && { opacity: 0.6 }]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={isSubmitting ? t('contact.sending') : t('contact.send')}
            >
              <LinearGradient colors={GRADIENT_PRESETS.purplePink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.contactSendGradient}>
                <Text style={styles.contactSendText}>{isSubmitting ? t('contact.sending') : t('contact.send')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.contactPrivacyNote}>{t('contact.privacy_note')}</Text>
          </ScrollView>
      </KeyboardSafeModalContainer>
    </Modal>
  );
}

// ============================================
// IDEAS/FEEDBACK FORM MODAL (In-App Submission)
// ============================================
function IdeasModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [ideaType, setIdeaType] = useState<'position' | 'feature' | 'other'>('position');
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!idea.trim()) {
      Alert.alert(t('ideas.empty_message'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitFormspreeMessage({
        type: 'idea',
        ideaType,
        message: idea,
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
      if (result.queued) {
        Alert.alert(t('ideas.queued_title'), t('ideas.queued_message'));
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : t('ideas.error_message');
      Alert.alert(t('ideas.error_title'), description);
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIdea('');
    setIdeaType('position');
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>{t('ideas.success_title')}</Text>
              <Text style={styles.successText}>{t('ideas.success_message')}</Text>
              <TouchableOpacity style={styles.successButton} onPress={handleClose}>
                <Text style={styles.successButtonText}>{t('celebration.awesome')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardSafeModalContainer maxHeight="80%">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💡 {t('ideas.title')}</Text>
            <TouchableOpacity onPress={handleClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>{t('ideas.subtitle')}</Text>
            
            {/* Idea Type Selector */}
            <View style={styles.ideaTypeRow}>
              {[
                { type: 'position' as const, emoji: '💑', label: t('ideas.type.position') },
                { type: 'feature' as const, emoji: '✨', label: t('ideas.type.feature') },
                { type: 'other' as const, emoji: '💬', label: t('ideas.type.other') },
              ].map((item) => (
                <TouchableOpacity 
                  key={item.type}
                  style={[styles.ideaTypeButton, ideaType === item.type && styles.ideaTypeButtonActive]}
                  onPress={() => { setIdeaType(item.type); }}
                >
                  <Text style={styles.ideaTypeEmoji}>{item.emoji}</Text>
                  <Text style={[styles.ideaTypeText, ideaType === item.type && styles.ideaTypeTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={[styles.contactInput, styles.contactTextarea]}
              value={idea}
              onChangeText={setIdea}
              placeholder={ideaType === 'position' ? t('ideas.placeholder.position') : ideaType === 'feature' ? t('ideas.placeholder.feature') : t('ideas.placeholder.other')}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              accessibilityLabel={t('ideas.title')}
            />
            
            <TouchableOpacity 
              style={[styles.contactSendButton, isSubmitting && { opacity: 0.6 }]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={isSubmitting ? t('ideas.sending') : t('ideas.send')}
            >
              <LinearGradient colors={GRADIENT_PRESETS.cyanGreen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.contactSendGradient}>
                <Text style={styles.contactSendText}>{isSubmitting ? t('ideas.sending') : t('ideas.send')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.contactPrivacyNote}>{t('ideas.privacy_note')}</Text>
          </ScrollView>
      </KeyboardSafeModalContainer>
    </Modal>
  );
}

// ============================================
// APP LOCK SCREEN
// ============================================
function AppLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { t, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const store = useStore();
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  const tryBiometrics = useCallback(async () => {
    if (store.useBiometrics) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t('lock.unlock_prompt'),
          fallbackLabel: t('lock.use_pin'),
        });
        if (result.success) {
          onUnlock();
        }
      } catch (e) {
        // Biometrics failed, fall back to PIN
      }
    }
  }, [store.useBiometrics, onUnlock, t]);

  useEffect(() => {
    void tryBiometrics();
  }, [tryBiometrics]);

  useEffect(() => {
    if (!lockoutUntil) return;

    const tick = () => {
      const seconds = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutSecondsLeft(seconds);
      if (seconds === 0) {
        setLockoutUntil(null);
        setAttempts(0);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handlePinEntry = (digit: string) => {
    if (lockoutUntil) return;

    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setError('');
    
    if (newPin.length === 4) {
      if (newPin === store.pinCode) {
        setAttempts(0);
        onUnlock();
      } else {
        const nextAttempts = attempts + 1;
        if (nextAttempts >= MAX_PIN_ATTEMPTS) {
          setLockoutUntil(Date.now() + PIN_LOCKOUT_MS);
          setError(t('lock.too_many'));
        } else {
          setError(t('lock.incorrect_pin'));
        }
        setEnteredPin('');
        setAttempts(nextAttempts);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(p => p.slice(0, -1));
    setError('');
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.lockScreenContainer}>
      <SafeAreaView style={styles.lockScreenContent}>
        <Text style={styles.lockScreenTitle}>{`🔐 ${voice.labels.brandName}`}</Text>
        <Text style={styles.lockScreenSubtitle}>{t('lock.enter_pin')}</Text>
        
        {/* PIN Dots */}
        <View style={styles.pinDotsRow}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.pinDot, enteredPin.length > i && styles.pinDotFilled]} />
          ))}
        </View>
        
        {lockoutUntil ? (
          <Text style={styles.lockScreenError}>{t('lock.too_many_wait', { seconds: lockoutSecondsLeft })}</Text>
        ) : error ? (
          <Text style={styles.lockScreenError}>{error}</Text>
        ) : null}
        
        {/* Number Pad */}
        <View style={styles.numPad}>
          {[[1,2,3], [4,5,6], [7,8,9], ['bio',0,'del']].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.numPadRow}>
              {row.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[styles.numPadButton, lockoutUntil && item !== 'bio' ? { opacity: 0.5 } : null]}
                  disabled={!!lockoutUntil && item !== 'bio'}
                  onPress={() => {
                    if (lockoutUntil && item !== 'bio') return;
                    if (item === 'del') handleDelete();
                    else if (item === 'bio') tryBiometrics();
                    else handlePinEntry(String(item));
                  }}
                >
                  <Text style={styles.numPadText}>
                    {item === 'del' ? '⌫' : item === 'bio' ? (store.useBiometrics ? '👆' : '') : item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// MAIN APP SCREENS
// ============================================
function HomeScreen({
  navigation,
  pendingDailyJokeDateKey,
  onConsumePendingDailyJokeNotification,
  trialDaysRemaining = 0,
  showTrialBanner = false,
  onOpenPaywallModal,
}: {
  navigation: any;
  pendingDailyJokeDateKey?: string | null;
  onConsumePendingDailyJokeNotification?: () => void;
  trialDaysRemaining?: number;
  showTrialBanner?: boolean;
  onOpenPaywallModal?: () => void;
}) {
  type HomeRecommendation = ReturnType<typeof useRecommendations>['recommendations'][number];
  const store = useStore();
  const featureFlags = useFeatureFlags();
  const { language, t, localizeTerm } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const { recommendations } = useRecommendations();
  const introAnim = useRef(new Animated.Value(0)).current;
  const suggestionsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const [showSpinner, setShowSpinner] = useState(false);
  const [showDateNight, setShowDateNight] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showWeeklyGoals, setShowWeeklyGoals] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showExploreExtras, setShowExploreExtras] = useState(false);
  const [showQuietWins, setShowQuietWins] = useState(false);
  const trackedRecommendationImpressionsRef = useRef<Set<string>>(new Set());
  const [showSeasonal, setShowSeasonal] = useState(false);
  const [showTruthOrDare, setShowTruthOrDare] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [dailyJokeDateKey, setDailyJokeDateKey] = useState(getDateKey(new Date()));
  const [dailyJokeBank, setDailyJokeBank] = useState<DailyJokeBank | null>(null);
  const [showDailyPunchline, setShowDailyPunchline] = useState(false);
  
  const currentHour = new Date().getHours();
  const homeDisplayName = store.name || t('home.there');
  const selectedMoodContext = useMemo(() => getMoodContext(store.currentMood), [store.currentMood]);
  const selectedMoodValue = selectedMoodContext?.mood || store.currentMood;
  const handleHomeMoodSelect = useCallback((mood: MoodPlaylist) => {
    const nextMood = selectedMoodValue === mood.mood ? null : mood.mood;
    store.setCurrentMood(nextMood);
    if (nextMood) {
      Analytics.trackFeatureUsed(`mood_selected_${nextMood}`);
    }
  }, [selectedMoodValue, store]);
  const homeGreetingCopy = currentHour >= 6 && currentHour <= 11
    ? {
      headline: voice.home.greeting.morning(homeDisplayName),
      context: voice.home.greeting.morningContext,
    }
    : currentHour >= 12 && currentHour <= 16
      ? {
        headline: voice.home.greeting.afternoon(homeDisplayName),
        context: voice.home.greeting.afternoonContext,
      }
      : currentHour >= 17 && currentHour <= 21
        ? {
          headline: voice.home.greeting.evening(homeDisplayName),
          context: voice.home.greeting.eveningContext,
        }
        : {
          headline: voice.home.greeting.night(homeDisplayName),
          context: voice.home.greeting.nightContext,
        };
  
  // Level system
  const currentLevel = getLevel(store.totalStars);
  const nextLevel = getNextLevel(store.totalStars);
  const progressToNext = nextLevel 
    ? ((store.totalStars - currentLevel.minStars) / (nextLevel.minStars - currentLevel.minStars)) * 100 
    : 100;
  const unlockedFeatureSet = useMemo(
    () => new Set<UnlockableFeature>(store.unlockedFeatures || []),
    [store.unlockedFeatures]
  );
  const isFeatureUnlocked = useCallback(
    (feature: UnlockableFeature) => unlockedFeatureSet.has(feature),
    [unlockedFeatureSet]
  );
  const dateNightUnlocked = isFeatureUnlocked('date_night_generator');
  const truthOrDareUnlocked = isFeatureUnlocked('truth_or_dare');
  const seasonalUnlocked = isFeatureUnlocked('seasonal_content');
  const lockProgressText = useCallback(
    (feature: keyof typeof FEATURE_LOCK_REQUIREMENTS) => {
      const requirement = FEATURE_LOCK_REQUIREMENTS[feature];
      return `Reach Level ${requirement.level} · ${Math.min(store.totalStars, requirement.stars)}/${requirement.stars} ⭐`;
    },
    [store.totalStars]
  );

  // Current seasonal theme
  const currentSeason = getCurrentSeason();
  const homeCopyDayIndex = useMemo(
    () => Math.max(0, getDayOfYear(new Date(`${dailyJokeDateKey}T12:00:00`)) - 1),
    [dailyJokeDateKey]
  );
  const seasonalHook = useMemo(() => {
    void language;
    const hooks = currentSeason ? SEASONAL_HOOK_LINES[currentSeason.id] : null;
    if (!hooks?.length) return null;
    return hooks[homeCopyDayIndex % hooks.length];
  }, [currentSeason, homeCopyDayIndex, language]);
  const levelMotivator = LEVEL_MOTIVATOR_LINES[homeCopyDayIndex % LEVEL_MOTIVATOR_LINES.length];
  const dailyJoke = useMemo(
    () => getDailyJokeForDate(new Date(`${dailyJokeDateKey}T12:00:00`), dailyJokeBank, language),
    [dailyJokeDateKey, dailyJokeBank, language]
  );
  const weeklyRecap = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklyLog = store.activityLog.filter((entry) => {
      const ts = new Date(entry.date).getTime();
      return Number.isFinite(ts) && ts >= sevenDaysAgo;
    });

    const starsEarned = weeklyLog.reduce((sum, entry) => sum + (entry.starsEarned || 0), 0);
    const uniqueDays = new Set(weeklyLog.map((entry) => entry.date.slice(0, 10))).size;
    const totalTried =
      store.tried.length +
      store.triedForeplay.length +
      store.triedOral.length +
      store.triedMassage.length +
      store.triedRoleplay.length;

    return {
      starsEarned,
      sessions: weeklyLog.length,
      activeDays: uniqueDays,
      totalTried,
    };
  }, [
    store.activityLog,
    store.tried.length,
    store.triedForeplay.length,
    store.triedOral.length,
    store.triedMassage.length,
    store.triedRoleplay.length,
  ]);

  // Keep weekly goals fresh for the home summary cards
  useEffect(() => {
    store.refreshWeeklyGoals();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setInterval(() => {
      const nextDateKey = getDateKey(new Date());
      setDailyJokeDateKey((prev) => (prev === nextDateKey ? prev : nextDateKey));
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!featureFlags.enableDailyJokes) return () => { isMounted = false; };
    const hydrateDailyJokeBank = async () => {
      const bank = await getDailyJokeBank(false);
      if (isMounted && bank) {
        setDailyJokeBank(bank);
      }
    };
    void hydrateDailyJokeBank();
    return () => {
      isMounted = false;
    };
  }, [featureFlags.enableDailyJokes]);

  useEffect(() => {
    let isMounted = true;
    if (!featureFlags.enableDailyJokes) return () => { isMounted = false; };
    const refreshDailyJokeBank = async () => {
      const bank = await getDailyJokeBank(true);
      if (isMounted && bank) {
        setDailyJokeBank(bank);
      }
    };
    void refreshDailyJokeBank();
    return () => {
      isMounted = false;
    };
  }, [dailyJokeDateKey, featureFlags.enableDailyJokes]);

  useEffect(() => {
    setShowDailyPunchline(false);
  }, [dailyJokeDateKey]);

  useEffect(() => {
    if (!pendingDailyJokeDateKey) return;

    const targetDateKey = /^\d{4}-\d{2}-\d{2}$/.test(pendingDailyJokeDateKey)
      ? pendingDailyJokeDateKey
      : getDateKey(new Date());
    const jokeFromNotification = getDailyJokeForDate(
      new Date(`${targetDateKey}T12:00:00`),
      dailyJokeBank,
      language
    );

    setDailyJokeDateKey(targetDateKey);
    setShowDailyPunchline(true);
    Alert.alert(
      `😏 ${t('home.daily_tease')}`,
      `${jokeFromNotification.setup}\n\n${jokeFromNotification.punchline}`
    );
    Analytics.trackFeatureUsed('daily_joke_notification_punchline_opened');
    onConsumePendingDailyJokeNotification?.();
  }, [
    pendingDailyJokeDateKey,
    dailyJokeBank,
    language,
    onConsumePendingDailyJokeNotification,
    t,
  ]);

  useEffect(() => {
    introAnim.setValue(0);
    suggestionsAnim.setValue(0);
    actionsAnim.setValue(0);
    Animated.sequence([
      Animated.timing(introAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(suggestionsAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(actionsAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [actionsAnim, introAnim, suggestionsAnim]);

  const introTranslateY = introAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const suggestionsTranslateY = suggestionsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const actionsTranslateY = actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  const resolveRecommendationItem = useCallback((recommendation: HomeRecommendation) => {
    const targetId = Number(recommendation.item?.id || 0);
    if (recommendation.type === 'position') {
      return positions.find((entry) => entry.id === targetId) || recommendation.item;
    }
    if (recommendation.type === 'foreplay') {
      return foreplayIdeas.find((entry) => entry.id === targetId) || recommendation.item;
    }
    if (recommendation.type === 'oral') {
      return oralPlayIdeas.find((entry) => entry.id === targetId) || recommendation.item;
    }
    if (recommendation.type === 'massage') {
      return massageTechniques.find((entry) => entry.id === targetId) || recommendation.item;
    }
    return rolePlayScenarios.find((entry) => entry.id === targetId) || recommendation.item;
  }, []);

  const trackRecommendationView = useCallback((recommendation: HomeRecommendation) => {
    const resolvedItem = resolveRecommendationItem(recommendation);
    const contentType = recommendation.type as InteractionEvent['contentType'];
    const difficulty =
      resolvedItem &&
      typeof resolvedItem === 'object' &&
      'difficulty' in resolvedItem &&
      typeof (resolvedItem as { difficulty?: unknown }).difficulty === 'string'
        ? (resolvedItem as { difficulty: string }).difficulty
        : undefined;

    store.trackInteraction({
      type: 'view',
      contentType,
      itemId: Number(resolvedItem?.id || recommendation.item.id),
      category: typeof resolvedItem?.category === 'string' ? resolvedItem.category : undefined,
      mood: typeof resolvedItem?.mood === 'string' ? resolvedItem.mood : undefined,
      difficulty,
      opened: true,
    });
  }, [resolveRecommendationItem, store]);

  const handleRecommendationPress = useCallback((recommendation: HomeRecommendation) => {
    const recommendationKey = `${recommendation.type}:${recommendation.item.id}`;
    const resolvedItem = resolveRecommendationItem(recommendation);
    const contentType = recommendation.type as InteractionEvent['contentType'];
    const itemId = Number(resolvedItem?.id || recommendation.item.id || 0);

    if (!trackedRecommendationImpressionsRef.current.has(recommendationKey)) {
      trackedRecommendationImpressionsRef.current.add(recommendationKey);
      trackRecommendationView(recommendation);
    }
    if (itemId) {
      haptics.openCard(`${contentType}:${itemId}`);
    }
    coachVoice.preloadNote(contentType, resolvedItem);

    if (contentType === 'position') {
      navigation.navigate('PositionDetail', { position: resolvedItem });
      return;
    }
    if (contentType === 'foreplay') {
      navigation.navigate('ForeplayDetail', { item: resolvedItem });
      return;
    }
    if (contentType === 'oral') {
      navigation.navigate('OralDetail', { item: resolvedItem });
      return;
    }
    if (contentType === 'massage') {
      navigation.navigate('MassageDetail', { item: resolvedItem });
      return;
    }
    navigation.navigate('RolePlayDetail', { item: resolvedItem });
  }, [navigation, resolveRecommendationItem, trackRecommendationView]);

  return (
    <ScreenWrapper scroll>
      {/* ── Warm Header ── */}
      <View style={styles.homeHeader}>
        <View style={styles.homeHeaderTop}>
          <View>
            <Text style={styles.title}>{homeGreetingCopy.headline}</Text>
            <Text style={[styles.greeting, { marginTop: 2 }]}>{homeGreetingCopy.context}</Text>
          </View>
          <TouchableOpacity style={styles.starCounter} onPress={() => setShowInsights(true)}>
            <Text style={styles.starCounterText}>⭐ {store.totalStars}</Text>
          </TouchableOpacity>
        </View>
        <LanguageQuickSwitcher compact />
        <TouchableOpacity
          style={styles.originLink}
          onPress={() => navigation.navigate('Origin', { fromSettings: true })}
          accessibilityRole="button"
        >
          <Text style={styles.originLinkText}>Why we made this</Text>
        </TouchableOpacity>
      </View>

      {showTrialBanner && trialDaysRemaining > 0 ? (
        <TouchableOpacity
          style={styles.trialBanner}
          onPress={() => {
            onOpenPaywallModal?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={voice.home.trialBanner(trialDaysRemaining)}
        >
          <Text style={styles.trialBannerText}>
            {voice.home.trialBanner(trialDaysRemaining)}
          </Text>
        </TouchableOpacity>
      ) : null}

      <Animated.View style={{ opacity: introAnim, transform: [{ translateY: introTranslateY }] }}>
        <View style={styles.vibePanel}>
          <Text style={styles.vibePanelEyebrow}>What do you want to do right now?</Text>
          <Text style={styles.vibePanelTitle}>Set tonight's vibe</Text>
          <Text style={styles.vibePanelBody}>
            Set tonight's vibe first. The rest can stay easy.
          </Text>
          <View style={styles.vibeGrid}>
            {MOOD_PLAYLISTS.map((mood) => {
              const selected = selectedMoodValue === mood.mood;
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.vibeMoodButton,
                    selected && { backgroundColor: mood.color, borderColor: mood.color },
                  ]}
                  onPress={() => handleHomeMoodSelect(mood)}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={mood.name}
                >
                  <Text style={styles.vibeMoodEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.vibeMoodLabel, selected && styles.vibeMoodLabelSelected]} numberOfLines={2}>
                    {mood.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.homeChoiceRow}>
            <TouchableOpacity
              style={styles.homePrimaryChoice}
              onPress={() => navigation.navigate('MoodCheckScreen', selectedMoodContext ? { mood: selectedMoodContext } : undefined)}
              accessibilityRole="button"
            >
              <Text style={styles.homePrimaryChoiceText}>Set tonight's vibe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeSecondaryChoice}
              onPress={() => {
                Analytics.trackFeatureUsed('home_explore_freely');
                setShowExploreExtras((value) => !value);
              }}
              accessibilityRole="button"
            >
              <Text style={styles.homeSecondaryChoiceText}>Explore freely</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: introAnim, transform: [{ translateY: introTranslateY }] }}>
        <View style={styles.tonightSuggestionHeader}>
          <Text style={styles.sectionTitle}>
            Tonight's suggestions
          </Text>
          <Text style={styles.tonightMoodCopy}>
            {selectedMoodContext
              ? 'Everything below is picked to match this vibe.'
              : 'Pick a vibe first — everything else follows.'}
          </Text>
        </View>
        {selectedMoodContext && recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => (
            <ScaleIn key={`${recommendation.type}-${recommendation.item.id}-${index}`} delay={index * 80}>
              <SmartSuggestionCard
                recommendation={recommendation}
                index={index}
                onPress={() => handleRecommendationPress(recommendation)}
              />
            </ScaleIn>
          ))
        ) : null}
      </Animated.View>

      {showExploreExtras ? (
        <Animated.View style={{ opacity: actionsAnim, transform: [{ translateY: actionsTranslateY }] }}>
          <View style={styles.featureButtonsRow}>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => {
                if (dateNightUnlocked) {
                  setShowDateNight(true);
                  return;
                }
                }}
            >
              <LinearGradient colors={GRADIENT_PRESETS.purplePink} style={styles.featureButtonGradient}>
                <Text style={styles.featureButtonEmoji}>🌙</Text>
                <Text style={styles.featureButtonText}>{dateNightUnlocked ? t('home.feature.date_night') : '🔒 Reach Level 4'}</Text>
                <Text style={styles.featureButtonSubtext}>{dateNightUnlocked ? t('home.quality.romance') : `${Math.min(store.totalStars, FEATURE_LOCK_REQUIREMENTS.date_night_generator.stars)}/${FEATURE_LOCK_REQUIREMENTS.date_night_generator.stars} ⭐`}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureButton} onPress={() => setShowSpinner(true)}>
              <LinearGradient colors={GRADIENT_PRESETS.warm} style={styles.featureButtonGradient}>
                <Text style={styles.featureButtonEmoji}>🎰</Text>
                <Text style={styles.featureButtonText}>{t('home.feature.spin')}</Text>
                <Text style={styles.featureButtonSubtext}>{t('home.quality.playful')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => {
                if (truthOrDareUnlocked) {
                  setShowTruthOrDare(true);
                  return;
                }
                }}
            >
              <LinearGradient colors={[colors.error, '#ec4899']} style={styles.featureButtonGradient}>
                <Text style={styles.featureButtonEmoji}>🎲</Text>
                <Text style={styles.featureButtonText}>{truthOrDareUnlocked ? t('home.feature.truth_dare') : '🔒 Reach Level 3'}</Text>
                <Text style={styles.featureButtonSubtext}>{truthOrDareUnlocked ? t('home.quality.truth_dare') : `${Math.min(store.totalStars, FEATURE_LOCK_REQUIREMENTS.truth_or_dare.stars)}/${FEATURE_LOCK_REQUIREMENTS.truth_or_dare.stars} ⭐`}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.featureButtonsRow}>
            <TouchableOpacity style={styles.featureButton} onPress={() => setShowPlaylists(true)}>
              <LinearGradient colors={GRADIENT_PRESETS.pinkRose} style={styles.featureButtonGradient}>
                <Text style={styles.featureButtonEmoji}>🎭</Text>
                <Text style={styles.featureButtonText}>{t('home.feature.moods')}</Text>
                <Text style={styles.featureButtonSubtext}>{t('home.quality.moods')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureButton} onPress={() => setShowMusic(true)}>
              <LinearGradient colors={['#1DB954', colors.green]} style={styles.featureButtonGradient}>
                <Text style={styles.featureButtonEmoji}>🎵</Text>
                <Text style={styles.featureButtonText}>{t('home.feature.music')}</Text>
                <Text style={styles.featureButtonSubtext}>{t('home.quality.music')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureButton} onPress={() => setShowRecommendations(true)}>
              <LinearGradient colors={GRADIENT_PRESETS.blueViolet} style={styles.featureButtonGradient}>
                <Text style={styles.featureButtonEmoji}>💡</Text>
                <Text style={styles.featureButtonText}>{t('home.feature.for_you')}</Text>
                <Text style={styles.featureButtonSubtext}>{t('home.quality.for_you')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}

      {/* ── Daily Joke & Seasonal ── */}
      <Animated.View style={{ opacity: suggestionsAnim, transform: [{ translateY: suggestionsTranslateY }] }}>
        {featureFlags.enableDailyJokes && (
          <View style={styles.dailyJokeCard}>
            <View style={styles.dailyJokeHeaderRow}>
              <Text style={styles.dailyJokeTitle}>😏 {t('home.daily_tease')}</Text>
              <Text style={styles.dailyJokeDate}>{dailyJokeDateKey}</Text>
            </View>
            <Text style={styles.dailyJokeSetup}>{dailyJoke.setup}</Text>
            {!showDailyPunchline ? (
              <TouchableOpacity
                style={styles.dailyJokeRevealButton}
                onPress={() => {
                  setShowDailyPunchline(true);
                  haptics.reveal();
                  Analytics.trackFeatureUsed('daily_joke_punchline_revealed');
                }}
              >
                <Text style={styles.dailyJokeRevealText}>{t('home.reveal_punchline')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.dailyJokePunchlineBox}>
                <Text style={styles.dailyJokePunchline}>{dailyJoke.punchline}</Text>
              </View>
            )}
          </View>
        )}

        {featureFlags.showSeasonalCard && currentSeason && (
          <TouchableOpacity
            style={[styles.seasonalCard, { borderColor: currentSeason.color, opacity: seasonalUnlocked ? 1 : 0.9 }]}
            onPress={() => {
              if (seasonalUnlocked) {
                setShowSeasonal(true);
                return;
              }
              }}
            activeOpacity={0.8}
          >
            <Text style={styles.seasonalCardEmoji}>{currentSeason.emoji}</Text>
            <View style={styles.seasonalCardInfo}>
              <Text style={[styles.seasonalCardTitle, { color: currentSeason.color }]}>{currentSeason.name}</Text>
              <Text style={styles.seasonalCardSubtitle}>{currentSeason.description}</Text>
              {seasonalUnlocked ? (
                seasonalHook ? <Text style={styles.seasonalCardHook}>{seasonalHook}</Text> : null
              ) : (
                <Text style={styles.seasonalCardHook}>🔒 {lockProgressText('seasonal_content')}</Text>
              )}
            </View>
            <Text style={styles.seasonalCardArrow}>{seasonalUnlocked ? '→' : '🔒'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {featureFlags.enableWeeklyRecap && showQuietWins && (
        <View style={styles.weeklyRecapCard}>
          <View style={styles.weeklyRecapHeader}>
            <Text style={styles.weeklyRecapTitle}>Little wins</Text>
            <TouchableOpacity onPress={() => setShowInsights(true)} accessibilityRole="button" accessibilityLabel={t('home.weekly_recap.open_insights')}>
              <Text style={styles.weeklyRecapAction}>{t('home.weekly_recap.open_insights')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.weeklyRecapSubtitle}>{t('home.weekly_recap.subtitle')}</Text>
          <View style={styles.weeklyRecapStatsRow}>
            <View style={styles.weeklyRecapStat}>
              <Text style={styles.weeklyRecapValue}>{weeklyRecap.starsEarned}</Text>
              <Text style={styles.weeklyRecapLabel}>{t('home.weekly_recap.stars')}</Text>
            </View>
            <View style={styles.weeklyRecapStat}>
              <Text style={styles.weeklyRecapValue}>{weeklyRecap.sessions}</Text>
              <Text style={styles.weeklyRecapLabel}>{t('home.weekly_recap.sessions')}</Text>
            </View>
            <View style={styles.weeklyRecapStat}>
              <Text style={styles.weeklyRecapValue}>{weeklyRecap.activeDays}</Text>
              <Text style={styles.weeklyRecapLabel}>{t('home.weekly_recap.days')}</Text>
            </View>
            <View style={styles.weeklyRecapStat}>
              <Text style={styles.weeklyRecapValue}>{weeklyRecap.totalTried}</Text>
              <Text style={styles.weeklyRecapLabel}>{t('home.weekly_recap.tried')}</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.quietWinsToggle}
        onPress={() => setShowQuietWins((value) => !value)}
        activeOpacity={0.85}
      >
        <Text style={styles.quietWinsToggleText}>
          {showQuietWins ? 'Hide the little wins' : 'Little wins and saved sparks'}
        </Text>
      </TouchableOpacity>

      {showQuietWins ? (
      <>
      <TouchableOpacity style={styles.levelCard} onPress={() => setShowInsights(true)} activeOpacity={0.8}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelEmoji}>{currentLevel.emoji}</Text>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelTitle, { color: currentLevel.color }]}>{localizeTerm(currentLevel.title)}</Text>
            <Text style={styles.levelSubtitle}>{t('home.level', { level: currentLevel.level })}</Text>
          </View>
          {nextLevel && (
            <View style={styles.levelNextBadge}>
              <Text style={styles.levelNextText}>{t('home.next', { emoji: nextLevel.emoji })}</Text>
            </View>
          )}
        </View>
        <View style={styles.levelProgressBar}>
          <Animated.View style={[styles.levelProgressFill, { width: `${progressToNext}%`, backgroundColor: currentLevel.color }]} />
        </View>
        {nextLevel && (
          <Text style={styles.levelProgressText}>{t('home.stars_to_level', { count: nextLevel.minStars - store.totalStars, title: localizeTerm(nextLevel.title) })}</Text>
        )}
        <Text style={styles.levelMotivatorText}>{levelMotivator}</Text>
      </TouchableOpacity>

      {store.currentStreak >= 2 && (
        <View style={styles.streakBanner}>
          <Text style={styles.streakBannerText}>🔥 {t('home.week_streak', { count: store.currentStreak })}</Text>
        </View>
      )}
      {store.loginStreak >= 3 && (
        <View style={[styles.streakBanner, { backgroundColor: colors.gold + '20' }]}>
          <Text style={[styles.streakBannerText, { color: colors.gold }]}>📅 {t('home.day_login_streak', { count: store.loginStreak })}</Text>
        </View>
      )}

      {/* Weekly Goals Preview */}
      {store.weeklyGoals.length > 0 && (
        <TouchableOpacity style={styles.weeklyGoalsPreview} onPress={() => setShowWeeklyGoals(true)}>
          <Text style={styles.weeklyGoalsPreviewTitle}>Little wins</Text>
          <View style={styles.weeklyGoalsPreviewProgress}>
            {store.weeklyGoals.map((goal, index) => (
              <View key={index} style={[styles.weeklyGoalDot, goal.completed && styles.weeklyGoalDotComplete]} />
            ))}
          </View>
          <Text style={styles.weeklyGoalsPreviewText}>
            {store.weeklyGoals.filter(g => g.completed).length}/{store.weeklyGoals.length} {t('common.done')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Current Challenge Preview */}
      {store.currentChallenge && (
        <TouchableOpacity style={styles.challengePreview} onPress={() => setShowChallenge(true)}>
          <View style={styles.challengePreviewHeader}>
            <Text style={styles.challengePreviewLabel}>🎯 {t('home.challenge.active')}</Text>
            <Text style={styles.challengePreviewReward}>+3 ⭐</Text>
          </View>
          <Text style={styles.challengePreviewName}>
            {store.currentChallenge.type === 'position'
              ? positions.find(p => p.id === store.currentChallenge?.itemId)?.name
              : store.currentChallenge.type === 'foreplay'
              ? foreplayIdeas.find(f => f.id === store.currentChallenge?.itemId)?.name
              : oralPlayIdeas.find(o => o.id === store.currentChallenge?.itemId)?.name}
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Stats Row */}
      <View style={styles.quickStatsRow}>
        <TouchableOpacity style={styles.quickStatCard} onPress={() => setShowAchievements(true)}>
          <Text style={styles.quickStatEmoji}>🏆</Text>
          <Text style={styles.quickStatNumber}>{store.earnedAchievements.length}/{ACHIEVEMENTS.length}</Text>
          <Text style={styles.quickStatLabel}>{t('home.quick_stats.achievements')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickStatCard} onPress={() => setShowInsights(true)}>
          <Text style={styles.quickStatEmoji}>📊</Text>
          <Text style={styles.quickStatNumber}>{store.activityLog.length}</Text>
          <Text style={styles.quickStatLabel}>{t('home.quick_stats.activities')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statNumber}>{store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length}</Text><Text style={styles.statLabel}>{t('stats.tried')}</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{store.favorites.length + store.favoriteForeplay.length + store.favoriteOral.length + store.favoriteMassage.length + store.favoriteRoleplay.length}</Text><Text style={styles.statLabel}>{t('stats.favorites')}</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{positions.length + foreplayIdeas.length + oralPlayIdeas.length + massageTechniques.length + rolePlayScenarios.length}</Text><Text style={styles.statLabel}>{t('stats.total')}</Text></View>
      </View>
      </>
      ) : null}

      <SpinnerModal visible={showSpinner} onClose={() => setShowSpinner(false)} navigation={navigation} />
      <DateNightModal visible={showDateNight} onClose={() => setShowDateNight(false)} navigation={navigation} />
      <ChallengeModal visible={showChallenge} onClose={() => setShowChallenge(false)} navigation={navigation} />
      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      <InsightsModal visible={showInsights} onClose={() => setShowInsights(false)} />
      <WeeklyGoalsModal visible={showWeeklyGoals} onClose={() => setShowWeeklyGoals(false)} />
      <MoodPlaylistsModal visible={showPlaylists} onClose={() => setShowPlaylists(false)} navigation={navigation} />
      <RecommendationsModal visible={showRecommendations} onClose={() => setShowRecommendations(false)} navigation={navigation} />
      <SeasonalModal
        visible={showSeasonal}
        onClose={() => setShowSeasonal(false)}
        navigation={navigation}
        onOpenTruthOrDare={() => setShowTruthOrDare(true)}
        onOpenDateNight={() => setShowDateNight(true)}
        onOpenChallenge={() => setShowChallenge(true)}
        onOpenSpinner={() => setShowSpinner(true)}
      />
      <TruthOrDareModal visible={showTruthOrDare} onClose={() => setShowTruthOrDare(false)} />
      <MusicPlaylistsModal visible={showMusic} onClose={() => setShowMusic(false)} />
    </ScreenWrapper>
  );
}

function ExploreScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStarterPack, setSelectedStarterPack] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'positions' | 'foreplay' | 'oral' | 'massage' | 'roleplay'>('positions');
  const [sortBy, setSortBy] = useState<'all' | 'newToYou' | 'tried'>('all');
  const [forYouItemNames, setForYouItemNames] = useState<string[]>([]);
  const store = useStore();
  const { language, t, localizeTerm } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const unlockedFeatureSet = useMemo(
    () => new Set<UnlockableFeature>(store.unlockedFeatures || []),
    [store.unlockedFeatures]
  );
  const starterPacksUnlocked = unlockedFeatureSet.has('starter_pack_collections');
  const dailyRecommendationRotationKey = getRecommendationRotationKey(new Date());

  const normalizeSearchText = useCallback((value: string) => (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  ), []);

  const buildSearchBlob = useCallback((parts: Array<string | string[] | null | undefined>) => (
    normalizeSearchText(
      parts
        .flatMap((part) => Array.isArray(part) ? part : [part ?? ''])
        .filter((part): part is string => Boolean(part))
        .join(' ')
    )
  ), [normalizeSearchText]);

  const normalizedQuery = useMemo(
    () => normalizeSearchText(searchQuery),
    [normalizeSearchText, searchQuery]
  );

  const currentCategories = contentType === 'positions' ? categories : contentType === 'foreplay' ? foreplayCategories : contentType === 'oral' ? oralCategories : contentType === 'massage' ? massageCategories : rolePlayCategories;
  const recommendationContentType = contentType === 'positions' ? 'position' : contentType;
  const currentTypeItemsForPack = useMemo<Array<{ id: number; name: string }>>(() => {
    if (contentType === 'positions') return positions.map((item) => ({ id: item.id, name: item.name }));
    if (contentType === 'foreplay') return foreplayIdeas.map((item) => ({ id: item.id, name: item.name }));
    if (contentType === 'oral') return oralPlayIdeas.map((item) => ({ id: item.id, name: item.name }));
    if (contentType === 'massage') return massageTechniques.map((item) => ({ id: item.id, name: item.name }));
    return rolePlayScenarios.map((item) => ({ id: item.id, name: item.name }));
  }, [contentType]);
  const currentTriedIdsForType = useMemo(() => {
    if (contentType === 'positions') return store.tried;
    if (contentType === 'foreplay') return store.triedForeplay;
    if (contentType === 'oral') return store.triedOral;
    if (contentType === 'massage') return store.triedMassage;
    return store.triedRoleplay;
  }, [
    contentType,
    store.tried,
    store.triedForeplay,
    store.triedOral,
    store.triedMassage,
    store.triedRoleplay,
  ]);
  const categoryCounts = useMemo(() => {
    const source = contentType === 'positions'
      ? positions
      : contentType === 'foreplay'
        ? foreplayIdeas
        : contentType === 'oral'
          ? oralPlayIdeas
          : contentType === 'massage'
            ? massageTechniques
            : rolePlayScenarios;
    return source.reduce<Record<string, number>>((acc, item) => {
      if (!item.category) return acc;
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
  }, [contentType]);
  const currentFavoriteChips = useMemo(() => {
    if (contentType === 'positions') return positions.filter((item) => store.favorites.includes(item.id)).map((item) => ({ contentType: 'positions' as const, item }));
    if (contentType === 'foreplay') return foreplayIdeas.filter((item) => store.favoriteForeplay.includes(item.id)).map((item) => ({ contentType: 'foreplay' as const, item }));
    if (contentType === 'oral') return oralPlayIdeas.filter((item) => store.favoriteOral.includes(item.id)).map((item) => ({ contentType: 'oral' as const, item }));
    if (contentType === 'massage') return massageTechniques.filter((item) => store.favoriteMassage.includes(item.id)).map((item) => ({ contentType: 'massage' as const, item }));
    return rolePlayScenarios.filter((item) => store.favoriteRoleplay.includes(item.id)).map((item) => ({ contentType: 'roleplay' as const, item }));
  }, [
    contentType,
    store.favorites,
    store.favoriteForeplay,
    store.favoriteOral,
    store.favoriteMassage,
    store.favoriteRoleplay,
  ]);

  useEffect(() => {
    const smartRecommendations = useStore.getState().getSmartRecommendations(4);
    const smartNames = smartRecommendations
      .filter((entry) => entry.type === recommendationContentType)
      .map((entry) => (typeof entry.item?.name === 'string' ? entry.item.name : ''))
      .filter((name): name is string => name.length > 0);

    const deduped = Array.from(new Set(smartNames)).slice(0, 4);
    if (deduped.length >= 4) {
      setForYouItemNames(deduped);
      return;
    }

    const currentTriedSet = new Set(currentTriedIdsForType);
    const chosen = new Set(deduped);
    const fallbackPool = [
      ...currentTypeItemsForPack.filter((item) => !currentTriedSet.has(item.id)),
      ...currentTypeItemsForPack,
    ].filter((item) => !chosen.has(item.name));
    const seedRaw = Number(dailyRecommendationRotationKey.replace(/-/g, ''));
    const seed = Number.isFinite(seedRaw) ? seedRaw : 0;
    const offset = fallbackPool.length > 0 ? seed % fallbackPool.length : 0;
    const rotatedFallback = [...fallbackPool.slice(offset), ...fallbackPool.slice(0, offset)];
    const withFallback = [...deduped];
    for (const item of rotatedFallback) {
      if (withFallback.length >= 4) break;
      if (chosen.has(item.name)) continue;
      withFallback.push(item.name);
      chosen.add(item.name);
    }

    setForYouItemNames(withFallback.slice(0, 4));
  }, [
    contentType,
    currentTriedIdsForType,
    currentTypeItemsForPack,
    dailyRecommendationRotationKey,
    recommendationContentType,
  ]);

  const contentTypeTabs = useMemo(
    () => [
      { type: 'positions' as const, label: t('explore.type.positions') },
      { type: 'foreplay' as const, label: t('explore.type.foreplay') },
      { type: 'oral' as const, label: t('explore.type.oral') },
      { type: 'massage' as const, label: t('explore.type.massage') },
      { type: 'roleplay' as const, label: t('explore.type.roleplay') },
    ],
    [t]
  );
  const starterPackConfig = useMemo(() => ({
    positions: [
      {
        id: 'cozy-night-in',
        icon: '🛋️',
        title: t('explore.collections.positions.cozy.title'),
        subtitle: t('explore.collections.positions.cozy.subtitle'),
        itemNames: ['The Cradle', 'Spooning', 'The Lazy Spoon', 'The Sleepy Missionary'],
      },
      {
        id: 'face-to-face',
        icon: '💞',
        title: t('explore.collections.positions.face_to_face.title'),
        subtitle: t('explore.collections.positions.face_to_face.subtitle'),
        itemNames: ['Missionary', 'The Lotus', 'Face to Face Float', 'The Full Embrace'],
      },
      {
        id: 'quick-spark',
        icon: '⚡',
        title: t('explore.collections.positions.quick_spark.title'),
        subtitle: t('explore.collections.positions.quick_spark.subtitle'),
        itemNames: ['The Morning Rush', 'The Lazy Spoon', 'The Cradle', 'Spooning'],
      },
    ],
    foreplay: [
      {
        id: 'ten-minute-spark',
        icon: '💋',
        title: t('explore.collections.foreplay.ten_minute_spark.title'),
        subtitle: t('explore.collections.foreplay.ten_minute_spark.subtitle'),
        itemNames: ['Neck & Ear Focus', 'Countdown Kiss', 'Inner Thigh Teasing', 'The Hallway Pause'],
      },
      {
        id: 'cozy-reconnect',
        icon: '🕯️',
        title: t('explore.collections.foreplay.cozy_reconnect.title'),
        subtitle: t('explore.collections.foreplay.cozy_reconnect.subtitle'),
        itemNames: ['Couch Cocoon', 'Cuddling with Intent', 'Undressing Ritual', 'Pillow Fort Date'],
      },
      {
        id: 'guided-intimacy',
        icon: '🤝',
        title: t('explore.collections.foreplay.guided_intimacy.title'),
        subtitle: t('explore.collections.foreplay.guided_intimacy.subtitle'),
        itemNames: ['Mutual Exploration', 'Guided Hands', 'Show Me Slower', 'Mirror Flirt'],
      },
    ],
    oral: [
      {
        id: 'gentle-starters',
        icon: '🌙',
        title: t('explore.collections.oral.gentle_starters.title'),
        subtitle: t('explore.collections.oral.gentle_starters.subtitle'),
        itemNames: ['The Edge of the Bed', 'The Seated Signal', 'The Warm Welcome', 'The Hum & Kiss'],
      },
      {
        id: 'mutual-flow',
        icon: '🔄',
        title: t('explore.collections.oral.mutual_flow.title'),
        subtitle: t('explore.collections.oral.mutual_flow.subtitle'),
        itemNames: ['The Slow Exchange', 'The Cushion Trade', 'The Stacked 69', 'The Duet'],
      },
      {
        id: 'playful-variety',
        icon: '🎲',
        title: t('explore.collections.oral.playful_variety.title'),
        subtitle: t('explore.collections.oral.playful_variety.subtitle'),
        itemNames: ['The Mirror Game', 'The Blindfold Trade', 'The Shower Steam', 'The Chair Lean'],
      },
    ],
    massage: [
      {
        id: 'melt-the-stress',
        icon: '🧖',
        title: t('explore.collections.massage.melt_the_stress.title'),
        subtitle: t('explore.collections.massage.melt_the_stress.subtitle'),
        itemNames: ['The Full-Body Surrender', 'Shoulder Melting Magic', 'Lower Back Love', 'Neck Reset'],
      },
      {
        id: 'slow-build',
        icon: '✨',
        title: t('explore.collections.massage.slow_build.title'),
        subtitle: t('explore.collections.massage.slow_build.subtitle'),
        itemNames: ['The Almost-There Trail', 'The Oil Drizzle', 'Neck & Décolletage Flow', 'The Whisper Touch'],
      },
      {
        id: 'quick-reset',
        icon: '🌿',
        title: t('explore.collections.massage.quick_reset.title'),
        subtitle: t('explore.collections.massage.quick_reset.subtitle'),
        itemNames: ['Scalp Serenity', 'Face & Jaw Release', 'Arm & Hand Heaven', 'Tension Headache Release'],
      },
    ],
    roleplay: [
      {
        id: 'easy-to-start',
        icon: '🎭',
        title: t('explore.collections.roleplay.easy_to_start.title'),
        subtitle: t('explore.collections.roleplay.easy_to_start.subtitle'),
        itemNames: ['First Date Redux', 'Strangers at a Bar', 'Anniversary Surprise', 'The Dare Jar'],
      },
      {
        id: 'playful-tonight',
        icon: '🎲',
        title: t('explore.collections.roleplay.playful_tonight.title'),
        subtitle: t('explore.collections.roleplay.playful_tonight.subtitle'),
        itemNames: ['Dice Decisions', 'Spin the Bottle (Two Player)', 'Costume Night', 'Two Truths & a Lie (Intimate)'],
      },
      {
        id: 'escapist-fantasy',
        icon: '🌆',
        title: t('explore.collections.roleplay.escapist_fantasy.title'),
        subtitle: t('explore.collections.roleplay.escapist_fantasy.subtitle'),
        itemNames: ['The Photographer', 'Room Service', 'The Royalty Treatment', 'Sunset Getaway'],
      },
    ],
  }), [t]);
  const currentStarterPacks = starterPackConfig[contentType];
  const forYouStarterPack = useMemo(
    () => ({
      id: 'for-you',
      icon: '✨',
      title: 'For You',
      subtitle: 'Very your vibe',
      itemNames: forYouItemNames,
    }),
    [forYouItemNames]
  );
  const visibleStarterPacks = useMemo(
    () => starterPacksUnlocked
      ? [forYouStarterPack, ...currentStarterPacks]
      : [forYouStarterPack],
    [currentStarterPacks, forYouStarterPack, starterPacksUnlocked]
  );
  const activeStarterPack = visibleStarterPacks.find((pack) => pack.id === selectedStarterPack) ?? null;

  useEffect(() => {
    if (!selectedStarterPack) return;
    if (visibleStarterPacks.some((pack) => pack.id === selectedStarterPack)) return;
    setSelectedStarterPack(null);
  }, [selectedStarterPack, visibleStarterPacks]);

  const starterPackMatches = useCallback(
    <T extends { name: string }>(items: T[]) => {
      if (!activeStarterPack || activeStarterPack.itemNames.length === 0) return items;
      return items.filter((item) => activeStarterPack.itemNames.includes(item.name));
    },
    [activeStarterPack]
  );

  const filteredPositions = useMemo(() => {
    let result = starterPackMatches(positions);
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (normalizedQuery) {
      result = result.filter((p) => {
        const moodLabel = moods.find((m) => m.id === p.mood)?.label || p.mood;
        const searchable = buildSearchBlob([
          p.name,
          p.vibe,
          p.category,
          localizeTerm(p.category),
          p.mood,
          moodLabel,
          localizeTerm(moodLabel),
          p.difficulty,
          localizeTerm(p.difficulty),
          p.description,
          p.howTo,
          p.whyItWorks,
          p.tips,
          p.pairsWellWith,
          p.goodFor,
        ]);
        return searchable.includes(normalizedQuery);
      });
    }
    if (sortBy === 'newToYou') result = result.filter(p => !store.tried.includes(p.id));
    if (sortBy === 'tried') result = result.filter(p => store.tried.includes(p.id));
    return result;
  }, [buildSearchBlob, localizeTerm, normalizedQuery, selectedCategory, sortBy, starterPackMatches, store.tried]);

  const filteredForeplay = useMemo(() => {
    let result = starterPackMatches(foreplayIdeas);
    if (selectedCategory) result = result.filter((f) => f.category === selectedCategory);
    if (normalizedQuery) {
      result = result.filter((f) => (
        buildSearchBlob([
          f.name,
          f.vibe,
          f.category,
          localizeTerm(f.category),
          f.mood,
          localizeTerm(f.mood),
          f.duration,
          localizeTerm(f.duration),
          f.description,
          f.howTo,
          f.tips,
          f.pairsWellWith,
        ]).includes(normalizedQuery)
      ));
    }
    if (sortBy === 'newToYou') result = result.filter(f => !store.triedForeplay.includes(f.id));
    if (sortBy === 'tried') result = result.filter(f => store.triedForeplay.includes(f.id));
    return result;
  }, [buildSearchBlob, localizeTerm, normalizedQuery, selectedCategory, sortBy, starterPackMatches, store.triedForeplay]);

  const filteredOral = useMemo(() => {
    let result = starterPackMatches(oralPlayIdeas);
    if (selectedCategory) result = result.filter((o) => o.category === selectedCategory);
    if (normalizedQuery) {
      result = result.filter((o) => (
        buildSearchBlob([
          o.name,
          o.vibe,
          o.category,
          localizeTerm(o.category),
          o.mood,
          localizeTerm(o.mood),
          o.description,
          o.howTo,
          o.tips,
          o.pairsWellWith,
          o.giver,
          o.giver === 'him' ? localizeTerm('He gives') : o.giver === 'her' ? localizeTerm('She gives') : localizeTerm('Mutual'),
        ]).includes(normalizedQuery)
      ));
    }
    if (sortBy === 'newToYou') result = result.filter(o => !store.triedOral.includes(o.id));
    if (sortBy === 'tried') result = result.filter(o => store.triedOral.includes(o.id));
    return result;
  }, [buildSearchBlob, localizeTerm, normalizedQuery, selectedCategory, sortBy, starterPackMatches, store.triedOral]);

  const filteredMassage = useMemo(() => {
    let result = starterPackMatches(massageTechniques);
    if (selectedCategory) result = result.filter((m) => m.category === selectedCategory);
    if (normalizedQuery) {
      result = result.filter((m) => (
        buildSearchBlob([
          m.name,
          m.vibe,
          m.category,
          localizeTerm(m.category),
          m.mood,
          localizeTerm(m.mood),
          m.duration,
          localizeTerm(m.duration),
          m.bodyArea,
          m.description,
          m.howTo,
          m.tips,
          m.pairsWellWith,
        ]).includes(normalizedQuery)
      ));
    }
    if (sortBy === 'newToYou') result = result.filter(m => !store.triedMassage.includes(m.id));
    if (sortBy === 'tried') result = result.filter(m => store.triedMassage.includes(m.id));
    return result;
  }, [buildSearchBlob, localizeTerm, normalizedQuery, selectedCategory, sortBy, starterPackMatches, store.triedMassage]);

  const filteredRoleplay = useMemo(() => {
    let result = starterPackMatches(rolePlayScenarios);
    if (selectedCategory) result = result.filter((r) => r.category === selectedCategory);
    if (normalizedQuery) {
      result = result.filter((r) => (
        buildSearchBlob([
          r.name,
          r.vibe,
          r.category,
          localizeTerm(r.category),
          r.mood,
          localizeTerm(r.mood),
          r.intensity,
          localizeTerm(r.intensity),
          r.description,
          r.setup,
          r.howToPlay,
          r.tips,
          r.pairsWellWith,
        ]).includes(normalizedQuery)
      ));
    }
    if (sortBy === 'newToYou') result = result.filter(r => !store.triedRoleplay.includes(r.id));
    if (sortBy === 'tried') result = result.filter(r => store.triedRoleplay.includes(r.id));
    return result;
  }, [buildSearchBlob, localizeTerm, normalizedQuery, selectedCategory, sortBy, starterPackMatches, store.triedRoleplay]);

  const currentFilteredListCount = contentType === 'positions'
    ? filteredPositions.length
    : contentType === 'foreplay'
      ? filteredForeplay.length
      : contentType === 'oral'
        ? filteredOral.length
        : contentType === 'massage'
          ? filteredMassage.length
          : filteredRoleplay.length;
  const newToYouCount = sortBy === 'newToYou' ? currentFilteredListCount : 0;

  const openFavoriteChip = useCallback((chip: { contentType: 'positions' | 'foreplay' | 'oral' | 'massage' | 'roleplay'; item: any }) => {
    const itemId = Number(chip.item?.id || 0);
    if (itemId) {
      const keyPrefix = chip.contentType === 'positions' ? 'position' : chip.contentType;
      haptics.openCard(`${keyPrefix}:${itemId}`);
    }

    if (chip.contentType === 'positions') {
      coachVoice.preloadNote('position', chip.item);
      navigation.navigate('PositionDetail', { position: chip.item });
      return;
    }
    if (chip.contentType === 'foreplay') {
      coachVoice.preloadNote('foreplay', chip.item);
      navigation.navigate('ForeplayDetail', { item: chip.item });
      return;
    }
    if (chip.contentType === 'oral') {
      coachVoice.preloadNote('oral', chip.item);
      navigation.navigate('OralDetail', { item: chip.item });
      return;
    }
    if (chip.contentType === 'massage') {
      coachVoice.preloadNote('massage', chip.item);
      navigation.navigate('MassageDetail', { item: chip.item });
      return;
    }
    coachVoice.preloadNote('roleplay', chip.item);
    navigation.navigate('RolePlayDetail', { item: chip.item });
  }, [navigation]);

  const clearExploreFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedStarterPack(null);
    setSortBy('all');
  }, []);

  const handleContentTypeChange = (type: 'positions' | 'foreplay' | 'oral' | 'massage' | 'roleplay') => {
    setContentType(type);
    setSelectedCategory(null);
    setSelectedStarterPack(null);
  };

  const exploreEmptyState = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>{pickVoiceLine(voice.empty.nothingYet, `explore-empty-${language}`)}</Text>
      <Text style={styles.exploreEmptyBody}>{voice.empty.exploreBody}</Text>
      <TouchableOpacity style={styles.emptyActionButton} onPress={clearExploreFilters} activeOpacity={0.85}>
        <Text style={styles.emptyActionButtonText}>{voice.empty.clearFilters}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.exploreHeader}><Text style={styles.title}>{t('explore.title')}</Text></View>
      
      {/* Content Type Tabs */}
      <View style={styles.contentTypeSliderWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contentTypeSliderContent}>
          {contentTypeTabs.map((tab) => (
            <TouchableOpacity
              key={tab.type}
              style={[styles.contentTypeSliderTab, contentType === tab.type && styles.contentTypeSliderTabActive]}
              onPress={() => handleContentTypeChange(tab.type)}
              activeOpacity={0.85}
            >
              <Text
                allowFontScaling={false}
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.contentTypeSliderTabText, contentType === tab.type && styles.contentTypeSliderTabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder={t('explore.search_placeholder', {
          type: translateUi(language, getContentTypeKey(contentType)).toLowerCase(),
        })}
      />

      <View style={styles.collectionSection}>
        <View style={styles.collectionHeader}>
          <Text style={styles.collectionTitle}>{t('explore.collections.title')}</Text>
          {selectedStarterPack ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedStarterPack(null);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.collectionClearText}>{t('common.clear')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionScrollContent}>
          {visibleStarterPacks.map((pack) => {
            const isActive = selectedStarterPack === pack.id;
            return (
              <TouchableOpacity
                key={pack.id}
                style={[styles.collectionCard, isActive && styles.collectionCardActive]}
                onPress={() => {
                  setSelectedStarterPack((current) => (current === pack.id ? null : pack.id));
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.collectionEmoji}>{pack.icon}</Text>
                <Text style={[styles.collectionCardTitle, isActive && styles.collectionCardTitleActive]}>{pack.title}</Text>
                <Text style={[styles.collectionCardSubtitle, isActive && styles.collectionCardSubtitleActive]}>{pack.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {!starterPacksUnlocked ? (
          <View style={[styles.collectionLockedCard, styles.collectionLockedInlineCard]}>
            <Text style={styles.collectionLockedEmoji}>🔒</Text>
            <Text style={styles.collectionLockedTitle}>{voice.labels.collectionLevel2Lock}</Text>
            <Text style={styles.collectionLockedSubtitle}>
              {`${Math.min(store.totalStars, FEATURE_LOCK_REQUIREMENTS.starter_pack_collections.stars)}/${FEATURE_LOCK_REQUIREMENTS.starter_pack_collections.stars} ⭐`}
            </Text>
          </View>
        ) : null}
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {(['all', 'newToYou', 'tried'] as const).map((option) => (
          <TouchableOpacity key={option} style={[styles.sortButton, sortBy === option && styles.sortButtonActive]} onPress={() => { setSortBy(option); }}>
            <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>
              {option === 'all' ? t('explore.sort.all') : option === 'newToYou' ? '🆕 New to You' : `✓ ${t('explore.sort.tried')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {sortBy === 'newToYou' ? (
        <Text style={styles.sortMetaText}>{`${newToYouCount} new ideas`}</Text>
      ) : null}

      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
          <TouchableOpacity style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]} onPress={() => { setSelectedCategory(null); }}>
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextSelected]}>{t('common.all')}</Text>
          </TouchableOpacity>
          {currentCategories.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]} onPress={() => { setSelectedCategory(cat); }}>
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>
                {localizeTerm(cat)}{' '}
                <Text style={[styles.categoryChipCountText, selectedCategory === cat && styles.categoryChipCountTextSelected]}>
                  ({categoryCounts[cat] || 0})
                </Text>
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {currentFavoriteChips.length >= 3 ? (
        <View style={styles.favoritesQuickBar}>
          <Text style={styles.favoritesQuickHeader}>
            {`❤️ Your saved ${contentType === 'positions' ? 'positions' : 'ideas'}`}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesQuickScrollContent}>
            {currentFavoriteChips.map((chip) => (
              <TouchableOpacity
                key={`${chip.contentType}-${chip.item.id}`}
                style={styles.favoriteQuickChip}
                onPress={() => openFavoriteChip(chip)}
                activeOpacity={0.85}
              >
                <Text style={styles.favoriteQuickChipText} numberOfLines={1}>
                  {chip.item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}
      {contentType === 'positions' && (
        <FlatList data={filteredPositions} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PositionCard position={item} onPress={() => navigation.navigate('PositionDetail', { position: item })} />}
          ListEmptyComponent={exploreEmptyState}
        />
      )}
      {contentType === 'foreplay' && (
        <FlatList data={filteredForeplay} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ForeplayCard item={item} onPress={() => navigation.navigate('ForeplayDetail', { item })} />}
          ListEmptyComponent={exploreEmptyState}
        />
      )}
      {contentType === 'oral' && (
        <FlatList data={filteredOral} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <OralPlayCard item={item} onPress={() => navigation.navigate('OralDetail', { item })} />}
          ListEmptyComponent={exploreEmptyState}
        />
      )}
      {contentType === 'massage' && (
        <FlatList data={filteredMassage} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MassageCard item={item} onPress={() => navigation.navigate('MassageDetail', { item })} />}
          ListEmptyComponent={exploreEmptyState}
        />
      )}
      {contentType === 'roleplay' && (
        <FlatList data={filteredRoleplay} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RolePlayCard item={item} onPress={() => navigation.navigate('RolePlayDetail', { item })} />}
          ListEmptyComponent={exploreEmptyState}
        />
      )}
    </ScreenWrapper>
  );
}

function FavoritesScreen({ navigation }: any) {
  const store = useStore();
  const { language, t } = useI18n();
  const [contentType, setContentType] = useState<'positions' | 'foreplay' | 'oral'>('positions');
  const [showRecentlyTried, setShowRecentlyTried] = useState(false);
  const favoritePositions = positions.filter((p) => store.favorites.includes(p.id));
  const favoriteForeplayItems = foreplayIdeas.filter((f) => store.favoriteForeplay.includes(f.id));
  const favoriteOralItems = oralPlayIdeas.filter((o) => store.favoriteOral.includes(o.id));

  // Recently tried items (last 10)
  const recentlyTried = useMemo(() => {
    void language;
    return store.activityLog
      .slice(-10)
      .reverse()
      .map(activity => {
        if (activity.type === 'position') return { type: 'position', item: positions.find(p => p.id === activity.itemId) };
        if (activity.type === 'foreplay') return { type: 'foreplay', item: foreplayIdeas.find(f => f.id === activity.itemId) };
        if (activity.type === 'oral') return { type: 'oral', item: oralPlayIdeas.find(o => o.id === activity.itemId) };
        return null;
      })
      .filter(Boolean);
  }, [language, store.activityLog]);

  return (
    <ScreenWrapper>
      <View style={styles.exploreHeader}><Text style={styles.title}>{t('favorites.title')}</Text></View>
      
      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity style={[styles.viewToggleButton, !showRecentlyTried && styles.viewToggleButtonActive]} onPress={() => { setShowRecentlyTried(false); }}>
          <Text style={[styles.viewToggleText, !showRecentlyTried && styles.viewToggleTextActive]}>❤️ {t('favorites.favorites_toggle')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.viewToggleButton, showRecentlyTried && styles.viewToggleButtonActive]} onPress={() => { setShowRecentlyTried(true); }}>
          <Text style={[styles.viewToggleText, showRecentlyTried && styles.viewToggleTextActive]}>🕐 {t('favorites.recent_toggle')}</Text>
        </TouchableOpacity>
      </View>

      {!showRecentlyTried ? (
        <>
          <View style={styles.tripleToggleContainer}>
            <TouchableOpacity style={[styles.tripleToggleButton, contentType === 'positions' && styles.tripleToggleButtonActive]} onPress={() => { setContentType('positions'); }}>
              <Text style={[styles.tripleToggleButtonText, contentType === 'positions' && styles.tripleToggleButtonTextActive]}>{t('favorites.positions_count', { count: favoritePositions.length })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tripleToggleButton, contentType === 'foreplay' && styles.tripleToggleButtonActive]} onPress={() => { setContentType('foreplay'); }}>
              <Text style={[styles.tripleToggleButtonText, contentType === 'foreplay' && styles.tripleToggleButtonTextActive]}>{t('favorites.foreplay_count', { count: favoriteForeplayItems.length })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tripleToggleButton, contentType === 'oral' && styles.tripleToggleButtonActive]} onPress={() => { setContentType('oral'); }}>
              <Text style={[styles.tripleToggleButtonText, contentType === 'oral' && styles.tripleToggleButtonTextActive]}>{t('favorites.oral_count', { count: favoriteOralItems.length })}</Text>
            </TouchableOpacity>
          </View>
          {contentType === 'positions' && (favoritePositions.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>💜</Text><Text style={styles.emptyTitle}>{t('favorites.empty.positions.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.positions.subtitle')}</Text></View>
          ) : (
            <FlatList data={favoritePositions} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <PositionCard position={item} onPress={() => navigation.navigate('PositionDetail', { position: item })} />}
            />
          ))}
          {contentType === 'foreplay' && (favoriteForeplayItems.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>💜</Text><Text style={styles.emptyTitle}>{t('favorites.empty.foreplay.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.foreplay.subtitle')}</Text></View>
          ) : (
            <FlatList data={favoriteForeplayItems} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <ForeplayCard item={item} onPress={() => navigation.navigate('ForeplayDetail', { item })} />}
            />
          ))}
          {contentType === 'oral' && (favoriteOralItems.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>💜</Text><Text style={styles.emptyTitle}>{t('favorites.empty.oral.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.oral.subtitle')}</Text></View>
          ) : (
            <FlatList data={favoriteOralItems} numColumns={2} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.positionGrid} columnWrapperStyle={styles.positionRow} showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <OralPlayCard item={item} onPress={() => navigation.navigate('OralDetail', { item })} />}
            />
          ))}
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {recentlyTried.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🕐</Text><Text style={styles.emptyTitle}>{t('favorites.empty.recent.title')}</Text><Text style={styles.emptySubtitle}>{t('favorites.empty.recent.subtitle')}</Text></View>
          ) : (
            recentlyTried.map((entry: any, index) => (
              <TouchableOpacity key={index} style={styles.recentlyTriedItem} onPress={() => {
                if (entry.type === 'position') navigation.navigate('PositionDetail', { position: entry.item });
                else if (entry.type === 'foreplay') navigation.navigate('ForeplayDetail', { item: entry.item });
                else navigation.navigate('OralDetail', { item: entry.item });
              }}>
                <Text style={styles.recentlyTriedEmoji}>{entry.type === 'position' ? '💑' : entry.type === 'foreplay' ? '💕' : '👄'}</Text>
                <View style={styles.recentlyTriedContent}>
                  <Text style={styles.recentlyTriedName}>{entry.item?.name}</Text>
                  <Text style={styles.recentlyTriedVibe}>{entry.item?.vibe}</Text>
                </View>
                <Text style={styles.recentlyTriedArrow}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

function ProfileScreen({ navigation }: any) {
  const store = useStore();
  const { t, localizeTerm, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [showAboutBlisse, setShowAboutBlisse] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    notifications: boolean;
    appearance: boolean;
    privacy: boolean;
    account: boolean;
    appData: boolean;
    about: boolean;
  }>({
    notifications: true,
    appearance: false,
    privacy: false,
    account: false,
    appData: false,
    about: false,
  });
  const totalTried = store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length;
  const totalContent = positions.length + foreplayIdeas.length + oralPlayIdeas.length + massageTechniques.length + rolePlayScenarios.length;
  const currentLevel = getLevel(store.totalStars);
  const nextLevel = getNextLevel(store.totalStars);
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const preferenceSummary = store.getUserPreferenceSummary();
  const storageStats = store.storageStats();
  const interactionsCount = store.interactionHistory.length;
  const favoritesCount =
    store.favorites.length +
    store.favoriteForeplay.length +
    store.favoriteOral.length +
    store.favoriteMassage.length +
    store.favoriteRoleplay.length;
  const starsToNextLevel = nextLevel ? Math.max(0, nextLevel.minStars - store.totalStars) : 0;
  const exploredTarget = Math.max(400, totalContent);
  const exploredPercent = Math.min(100, (totalTried / Math.max(exploredTarget, 1)) * 100);
  const topMoodKey = preferenceSummary.moods[0];
  const topMood = moods.find((item) => item.id === topMoodKey || item.label === topMoodKey);
  const topContentType = preferenceSummary.contentTypes[0];
  const topContentTypeLabel = topContentType === 'position'
    ? t('explore.type.positions')
    : topContentType === 'foreplay'
      ? t('explore.type.foreplay')
      : topContentType === 'oral'
        ? t('explore.type.oral')
        : topContentType === 'massage'
          ? t('explore.type.massage')
          : topContentType === 'roleplay'
            ? t('explore.type.roleplay')
            : t('common.not_set');
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.signout.title'),
      t('profile.signout.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.menu.signout'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              } catch (error) {
              Alert.alert(t('common.error'), t('profile.signout.error'));
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.account.delete_confirm_title'),
      t('settings.account.delete_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) {
                Alert.alert(t('common.error'), t('settings.account.no_user'));
                return;
              }
              await deleteUser(user);
              store.resetOnboarding();
              await logout();
              Alert.alert(t('settings.account.deleted_title'), t('settings.account.deleted_message'));
            } catch (error: any) {
              if (error?.code === 'auth/requires-recent-login') {
                try {
                  await logout();
                } catch (_) {
                  // Ignore logout failure and still show re-auth guidance.
                }
                Alert.alert(t('settings.account.reauth_title'), t('settings.account.reauth_message'));
              } else {
                Alert.alert(t('common.error'), t('settings.account.delete_failed'));
              }
            }
          },
        },
      ]
    );
  };

  const handleShareBlisse = async () => {
    try {
      await Share.share({
        message: voice.share.appReferral(APP_STORE_LINK),
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('contact.error_message'));
    }
  };

  return (
    <ScreenWrapper scroll>
      <View style={styles.profileSectionCard}>
        <Text style={styles.profileSectionHeading}>{voice.home.profile.rhythmHeading}</Text>
        <View style={styles.profileJourneyLevelRow}>
          <Text style={[styles.profileJourneyLevelText, { color: currentLevel.color }]}>
            {`${currentLevel.emoji} ${localizeTerm(currentLevel.title)}`}
          </Text>
          <Text style={styles.profileJourneyStarsText}>⭐ {store.totalStars}</Text>
        </View>
        {nextLevel ? (
          <>
            <View style={styles.profileJourneyProgressTrack}>
              <View
                style={[
                  styles.profileJourneyProgressFill,
                  {
                    width: `${Math.min(100, ((store.totalStars - currentLevel.minStars) / Math.max(1, nextLevel.minStars - currentLevel.minStars)) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.profileJourneyProgressLabel}>
              {`${starsToNextLevel} ⭐ to ${localizeTerm(nextLevel.title)}`}
            </Text>
          </>
        ) : (
          <Text style={styles.profileJourneyProgressLabel}>{pickVoiceLine(voice.progress.streak, `profile-max-${language}`)}</Text>
        )}
        <View style={styles.profileStatPillsRow}>
          <View style={styles.profileStatPill}>
            <Text style={styles.profileStatPillText}>{`🎯 ${store.completedChallenges.length} ${voice.progress.cardTitle}`}</Text>
          </View>
          <View style={styles.profileStatPill}>
            <Text style={styles.profileStatPillText}>{`❤️ ${favoritesCount} ${t('stats.favorites')}`}</Text>
          </View>
          <View style={styles.profileStatPill}>
            <Text style={styles.profileStatPillText}>{`🔥 ${store.loginStreak}`}</Text>
          </View>
        </View>
        <Text style={styles.profileExploredLabel}>{voice.home.profile.ideasPlayed(totalTried)}</Text>
        <View style={styles.profileExploredTrack}>
          <View style={[styles.profileExploredFill, { width: `${exploredPercent}%` }]} />
        </View>
      </View>

      <View style={styles.profileSectionCard}>
        <Text style={styles.profileSectionHeading}>{t('profile.insights')}</Text>
        {interactionsCount < 5 ? (
          <Text style={styles.profileStylePlaceholder}>{voice.home.profile.styleWarmup}</Text>
        ) : (
          <>
            <View style={styles.profileStyleRow}>
              <Text style={styles.profileStyleLabel}>{voice.home.profile.youLeanInto}</Text>
              <View style={styles.profileStyleChipRow}>
                {preferenceSummary.categories.slice(0, 2).map((category) => (
                  <View key={category} style={styles.profileStyleChip}>
                    <Text style={styles.profileStyleChipText}>{localizeTerm(category)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.profileStyleRow}>
              <Text style={styles.profileStyleLabel}>{voice.labels.profileEnergy}</Text>
              <Text style={styles.profileStyleValue}>
                {`${topMood?.emoji || '🌸'} ${localizeTerm(topMood?.label || topMoodKey || t('common.not_set'))}`}
              </Text>
            </View>
            <View style={styles.profileStyleRow}>
              <Text style={styles.profileStyleLabel}>{voice.labels.profileType}</Text>
              <Text style={styles.profileStyleValue}>{topContentTypeLabel}</Text>
            </View>
          </>
        )}
        <Text style={styles.profileStyleSubtext}>{voice.home.profile.styleUpdates}</Text>
      </View>

      <View style={styles.profileSectionCard}>
        <Text style={styles.profileSectionHeading}>{t('settings.title')}</Text>

        <TouchableOpacity style={styles.profileGroupHeader} onPress={() => toggleSection('notifications')} activeOpacity={0.85}>
          <Text style={styles.profileGroupHeaderText}>🔔 {t('settings.section.notifications')}</Text>
          <Text style={styles.profileGroupChevron}>{expandedSections.notifications ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {expandedSections.notifications ? (
          <View style={styles.profileGroupContent}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.notifications.daily_tease')}</Text>
              <Text style={styles.profileInfoValue}>{store.dailyJokeNotificationsEnabled ? `${t('settings.on')} ✓` : t('settings.pin.off')}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.notifications.daily_streak')}</Text>
              <Text style={styles.profileInfoValue}>{store.dailyStreakNotificationsEnabled ? `${t('settings.on')} ✓` : t('settings.pin.off')}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.notifications.reactivation')}</Text>
              <Text style={styles.profileInfoValue}>{store.reactivationNotificationsEnabled ? `${t('settings.on')} ✓` : t('settings.pin.off')}</Text>
            </View>
            <TouchableOpacity style={styles.profileActionRow} onPress={() => setShowSettings(true)}>
              <Text style={styles.profileActionRowText}>{t('profile.menu.settings')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.profileGroupHeader} onPress={() => toggleSection('appearance')} activeOpacity={0.85}>
          <Text style={styles.profileGroupHeaderText}>🎨 {t('settings.section.appearance')}</Text>
          <Text style={styles.profileGroupChevron}>{expandedSections.appearance ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {expandedSections.appearance ? (
          <View style={styles.profileGroupContent}>
            <ThemeSelector />
            <FontSizeSelector />
          </View>
        ) : null}

        <TouchableOpacity style={styles.profileGroupHeader} onPress={() => toggleSection('privacy')} activeOpacity={0.85}>
          <Text style={styles.profileGroupHeaderText}>🔒 {t('settings.section.security')}</Text>
          <Text style={styles.profileGroupChevron}>{expandedSections.privacy ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {expandedSections.privacy ? (
          <View style={styles.profileGroupContent}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.pin.set')}</Text>
              <Text style={styles.profileInfoValue}>{store.pinCode ? `${t('settings.on')} ✓` : t('settings.pin.off')}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.biometrics')}</Text>
              <Text style={styles.profileInfoValue}>{store.useBiometrics ? `${t('settings.on')} ✓` : t('settings.pin.off')}</Text>
            </View>
            <TouchableOpacity style={styles.profileActionRow} onPress={() => setShowSettings(true)}>
              <Text style={styles.profileActionRowText}>{t('profile.menu.settings')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.profileGroupHeader} onPress={() => toggleSection('account')} activeOpacity={0.85}>
          <Text style={styles.profileGroupHeaderText}>👤 {t('settings.section.account')}</Text>
          <Text style={styles.profileGroupChevron}>{expandedSections.account ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {expandedSections.account ? (
          <View style={styles.profileGroupContent}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.account.name')}</Text>
              <Text style={styles.profileInfoValue}>{store.name || t('common.not_set')}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.account.experience')}</Text>
              <Text style={styles.profileInfoValue}>{store.experience || t('common.not_set')}</Text>
            </View>
            <TouchableOpacity style={styles.profileActionRow} onPress={handleDeleteAccount}>
              <Text style={[styles.profileActionRowText, { color: themeColors.error }]}>{t('settings.account.delete')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileActionRow} onPress={handleLogout}>
              <Text style={[styles.profileActionRowText, { color: themeColors.error }]}>{t('profile.menu.signout')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.profileGroupHeader} onPress={() => toggleSection('appData')} activeOpacity={0.85}>
          <Text style={styles.profileGroupHeaderText}>📊 {t('settings.section.data')}</Text>
          <Text style={styles.profileGroupChevron}>{expandedSections.appData ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {expandedSections.appData ? (
          <View style={styles.profileGroupContent}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{voice.labels.activityLog}</Text>
              <Text style={styles.profileInfoValue}>{`${storageStats.activityLogCount} / 500`}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{voice.labels.interactionHistory}</Text>
              <Text style={styles.profileInfoValue}>{`${storageStats.interactionHistoryCount} / 100`}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{voice.labels.notesSaved}</Text>
              <Text style={styles.profileInfoValue}>{storageStats.notesCount}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{t('settings.data.total_stars')}</Text>
              <Text style={styles.profileInfoValue}>{`⭐ ${storageStats.totalStarsEarned}`}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileActionRow}
              onPress={() => {
                Alert.alert(t('settings.data.reset_confirm_title'), t('settings.data.reset_confirm_message'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('settings.data.reset_confirm_action'), style: 'destructive', onPress: () => store.resetOnboarding() },
                ]);
              }}
            >
              <Text style={[styles.profileActionRowText, { color: themeColors.error }]}>{t('settings.data.reset')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.profileGroupHeader} onPress={() => toggleSection('about')} activeOpacity={0.85}>
          <Text style={styles.profileGroupHeaderText}>ℹ️ {t('profile.menu.about')}</Text>
          <Text style={styles.profileGroupChevron}>{expandedSections.about ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {expandedSections.about ? (
          <View style={styles.profileGroupContent}>
            <TouchableOpacity style={styles.profileActionRow} onPress={() => setShowTerms(true)}>
              <Text style={styles.profileActionRowText}>{t('profile.menu.terms')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileActionRow} onPress={() => setShowPrivacy(true)}>
              <Text style={styles.profileActionRowText}>{t('profile.menu.privacy')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileActionRow} onPress={() => setShowAboutBlisse(true)}>
              <Text style={styles.profileActionRowText}>{t('profile.menu.about')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileActionRow} onPress={() => setShowContact(true)}>
              <Text style={styles.profileActionRowText}>{t('profile.menu.contact')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileActionRow} onPress={() => setShowIdeas(true)}>
              <Text style={styles.profileActionRowText}>{t('profile.menu.ideas')}</Text>
              <Text style={styles.profileActionRowArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileShareButton} onPress={() => { void handleShareBlisse(); }}>
              <Text style={styles.profileShareButtonText}>{voice.labels.shareBlisse}</Text>
            </TouchableOpacity>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{voice.labels.version}</Text>
              <Text style={styles.profileInfoValue}>{t('profile.version')}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {store.notes.length > 0 && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>{t('profile.notes', { count: store.notes.length })}</Text>
          {store.notes.slice(-3).reverse().map((note) => {
            const item = note.type === 'position' ? positions.find(p => p.id === note.itemId) : note.type === 'foreplay' ? foreplayIdeas.find(f => f.id === note.itemId) : note.type === 'massage' ? massageTechniques.find(m => m.id === note.itemId) : note.type === 'roleplay' ? rolePlayScenarios.find(r => r.id === note.itemId) : oralPlayIdeas.find(o => o.id === note.itemId);
            return (
              <View key={note.id} style={styles.notePreview}>
                <Text style={styles.notePreviewName}>{item?.name || t('profile.unknown')}</Text>
                <Text style={styles.notePreviewRating}>{'⭐'.repeat(note.rating)}</Text>
                <Text style={styles.notePreviewText} numberOfLines={1}>{note.text || t('profile.no_notes')}</Text>
              </View>
            );
          })}
        </View>
      )}
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} navigation={navigation} />
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ContactModal visible={showContact} onClose={() => setShowContact(false)} />
      <IdeasModal visible={showIdeas} onClose={() => setShowIdeas(false)} />
      <AboutBlisseModal visible={showAboutBlisse} onClose={() => setShowAboutBlisse(false)} />
    </ScreenWrapper>
  );
}
// ============================================
// DETAIL SCREENS
// ============================================
const normalizePairName = (value: string): string => (
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
);

const openPairedContent = (navigation: any, name: string): void => {
  const voice = getVoiceCopy(useStore.getState().language);
  const normalizedName = normalizePairName(name);
  const foreplayMatch = foreplayIdeas.find((entry) => normalizePairName(entry.name) === normalizedName);
  if (foreplayMatch) {
    haptics.openCard(`foreplay:${foreplayMatch.id}`);
    navigation.push('ForeplayDetail', { item: foreplayMatch });
    return;
  }

  const positionMatch = positions.find((entry) => normalizePairName(entry.name) === normalizedName);
  if (positionMatch) {
    haptics.openCard(`position:${positionMatch.id}`);
    navigation.push('PositionDetail', { position: positionMatch });
    return;
  }

  Alert.alert(
    pickVoiceLine(voice.empty.loading, `pair-search-title-${name}`),
    `${voice.empty.exploreBody} "${name}"`,
    [
      { text: pickVoiceLine(voice.generic.no, `pair-search-no-${name}`), style: 'cancel' },
      {
        text: pickVoiceLine(voice.generic.continue, `pair-search-continue-${name}`),
        onPress: () => navigation.navigate('MainTabs', { screen: 'Explore' }),
      },
    ]
  );
};

function PositionDetailScreen({ route, navigation }: any) {
  const { position }: { position: Position } = route.params;
  const { t, localizeTerm, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const store = useStore();
  const isFavorite = store.favorites.includes(position.id);
  const isTried = store.tried.includes(position.id);
  const mood = moods.find((m) => m.id === position.mood);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === position.id && n.type === 'position');
  const openedAtRef = useRef(Date.now());

  const handleMarkTried = () => {
    if (!isTried) {
      const durationSeconds = Math.max(0, Math.round((Date.now() - openedAtRef.current) / 1000));
      Analytics.trackContentCompleted('position', position.id, durationSeconds);
      const result = store.logActivity('position', position.id);
      store.markTried(position.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: voice.share.position(position.name, APP_STORE_LINK),
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <SlideUp delay={0}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color }]}>
                <Text style={styles.detailMoodEmoji}>{mood?.emoji}</Text>
                <Text style={styles.detailMoodLabel}>{localizeTerm(mood?.label || '')}</Text>
              </View>
              <Text style={styles.detailTitle}>{position.name}</Text>
              <Text style={styles.detailCategory}>{localizeTerm(position.category)} • {localizeTerm(position.difficulty)}</Text>
              {!isTried && (
                <View style={styles.detailStarHint}>
                  <Text style={styles.detailStarHintText}>
                    {position.difficulty === 'Advanced' ? t('detail.try_for_stars', { count: 5 }) : t('detail.try_for_stars', { count: 3 })}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{position.vibe}"</Text></View>
            <CoachNoteSection contentType="position" item={position} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
                <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
                <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptics.confirmAction(); store.toggleFavorite(position.id); }}>
                <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
                <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
                <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
              </TouchableOpacity>
            </View>
            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
            </TouchableOpacity>
            {existingNote && (
              <View style={styles.notePreviewDetail}>
                <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
                <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
              </View>
            )}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
              <Text style={styles.detailText}>{position.description}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
              <Text style={styles.detailText}>{position.howTo}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.why_it_works')}</Text>
              <Text style={styles.detailText}>{position.whyItWorks}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
              {position.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}><Text style={styles.tipBullet}>💡</Text><Text style={styles.tipText}>{tip}</Text></View>
              ))}
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.good_for')}</Text>
              <View style={styles.tagsContainer}>{position.goodFor.map((tag, index) => (<View key={index} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>))}</View>
            </View>
            <View style={[styles.detailSection, { marginBottom: 40 }]}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
              <View style={styles.tagsContainer}>
                {position.pairsWellWith.map((pairItem, index) => (
                  <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => openPairedContent(navigation, pairItem)}>
                    <Text style={styles.tagTextOutline}>{pairItem}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SlideUp>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={position.id} itemType="position" itemName={position.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

function ForeplayDetailScreen({ route, navigation }: any) {
  const { item }: { item: ForeplayIdea } = route.params;
  const { t, localizeTerm, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const store = useStore();
  const isFavorite = store.favoriteForeplay.includes(item.id);
  const isTried = store.triedForeplay.includes(item.id);
  const mood = moods.find((m) => m.id === item.mood);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'foreplay');
  const openedAtRef = useRef(Date.now());

  const handleMarkTried = () => {
    if (!isTried) {
      const durationSeconds = Math.max(0, Math.round((Date.now() - openedAtRef.current) / 1000));
      Analytics.trackContentCompleted('foreplay', item.id, durationSeconds);
      const result = store.logActivity('foreplay', item.id);
      store.markForeplayTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: voice.share.foreplay(item.name, APP_STORE_LINK),
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <SlideUp delay={0}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color }]}>
                <Text style={styles.detailMoodEmoji}>{mood?.emoji}</Text>
                <Text style={styles.detailMoodLabel}>{localizeTerm(mood?.label || '')}</Text>
              </View>
              <Text style={styles.detailTitle}>{item.name}</Text>
              <Text style={styles.detailCategory}>{localizeTerm(item.category)} • {localizeTerm(item.duration)}</Text>
              {!isTried && (
                <View style={styles.detailStarHint}>
                  <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 2 })}</Text>
                </View>
              )}
            </View>
            <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
            <CoachNoteSection contentType="foreplay" item={item} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
                <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
                <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptics.confirmAction(); store.toggleForeplayFavorite(item.id); }}>
                <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
                <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
                <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
              </TouchableOpacity>
            </View>
            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
            </TouchableOpacity>
            {existingNote && (
              <View style={styles.notePreviewDetail}>
                <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
                <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
              </View>
            )}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
              <Text style={styles.detailText}>{item.description}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
              <Text style={styles.detailText}>{item.howTo}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
              {item.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}><Text style={styles.tipBullet}>💡</Text><Text style={styles.tipText}>{tip}</Text></View>
              ))}
            </View>
            <View style={[styles.detailSection, { marginBottom: 40 }]}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
              <View style={styles.tagsContainer}>
                {item.pairsWellWith.map((pairName, index) => (
                  <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => openPairedContent(navigation, pairName)}>
                    <Text style={styles.tagTextOutline}>{pairName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SlideUp>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="foreplay" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

function OralDetailScreen({ route, navigation }: any) {
  const { item }: { item: OralPlayIdea } = route.params;
  const { t, localizeTerm, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const store = useStore();
  const isFavorite = store.favoriteOral?.includes(item.id) || false;
  const isTried = store.triedOral?.includes(item.id) || false;
  const mood = moods.find((m) => m.id === item.mood);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'oral');
  const openedAtRef = useRef(Date.now());

  const handleMarkTried = () => {
    if (!isTried) {
      const durationSeconds = Math.max(0, Math.round((Date.now() - openedAtRef.current) / 1000));
      Analytics.trackContentCompleted('oral', item.id, durationSeconds);
      const result = store.logActivity('oral', item.id);
      store.markOralTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: voice.share.oral(item.name, APP_STORE_LINK),
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <SlideUp delay={0}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color }]}>
                <Text style={styles.detailMoodEmoji}>{mood?.emoji}</Text>
                <Text style={styles.detailMoodLabel}>{localizeTerm(mood?.label || '')}</Text>
              </View>
              <Text style={styles.detailTitle}>{item.name}</Text>
              <Text style={styles.detailCategory}>{localizeTerm(item.category)} • {item.giver === 'him' ? localizeTerm('He gives') : item.giver === 'her' ? localizeTerm('She gives') : localizeTerm('Mutual')}</Text>
              {!isTried && (
                <View style={styles.detailStarHint}>
                  <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 2 })}</Text>
                </View>
              )}
            </View>
            <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
            <CoachNoteSection contentType="oral" item={item} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
                <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
                <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptics.confirmAction(); store.toggleOralFavorite(item.id); }}>
                <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
                <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
                <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
              </TouchableOpacity>
            </View>
            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
            </TouchableOpacity>
            {existingNote && (
              <View style={styles.notePreviewDetail}>
                <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
                <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
              </View>
            )}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
              <Text style={styles.detailText}>{item.description}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
              <Text style={styles.detailText}>{item.howTo}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
              {item.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}><Text style={styles.tipBullet}>💡</Text><Text style={styles.tipText}>{tip}</Text></View>
              ))}
            </View>
            <View style={[styles.detailSection, { marginBottom: 40 }]}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
              <View style={styles.tagsContainer}>
                {item.pairsWellWith.map((pairName, index) => (
                  <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => openPairedContent(navigation, pairName)}>
                    <Text style={styles.tagTextOutline}>{pairName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SlideUp>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="oral" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// MASSAGE DETAIL SCREEN
// ============================================
function MassageDetailScreen({ route, navigation }: any) {
  const { item } = route.params as { item: MassageTechnique };
  const { t, localizeTerm, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const store = useStore();
  const mood = moods.find((m) => m.id === item.mood);
  const isFavorite = store.favoriteMassage.includes(item.id);
  const isTried = store.triedMassage.includes(item.id);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'massage');
  const openedAtRef = useRef(Date.now());

  const handleMarkTried = () => {
    if (!isTried) {
      const durationSeconds = Math.max(0, Math.round((Date.now() - openedAtRef.current) / 1000));
      Analytics.trackContentCompleted('massage', item.id, durationSeconds);
      const result = store.logActivity('massage', item.id);
      store.markMassageTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: voice.share.massage(item.name, APP_STORE_LINK),
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <SlideUp delay={0}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
                <Text style={styles.detailMoodEmoji}>💆</Text>
                <Text style={styles.detailMoodLabel}>{localizeTerm(item.category)}</Text>
              </View>
              <Text style={styles.detailTitle}>{item.name}</Text>
              <Text style={styles.detailCategory}>{item.bodyArea} • {localizeTerm(item.duration)}</Text>
              {!isTried && (
                <View style={styles.detailStarHint}>
                  <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 3 })}</Text>
                </View>
              )}
            </View>
            <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
            <CoachNoteSection contentType="massage" item={item} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
                <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
                <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptics.confirmAction(); store.toggleMassageFavorite(item.id); }}>
                <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
                <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
                <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
            </TouchableOpacity>
            {existingNote && (
              <View style={styles.notePreviewDetail}>
                <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
                <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
              </View>
            )}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.what_is_it')}</Text>
              <Text style={styles.detailText}>{item.description}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to')}</Text>
              <Text style={styles.detailText}>{item.howTo}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.tips')}</Text>
              {item.tips.map((tip, index) => (
                <Text key={index} style={styles.detailTip}>• {tip}</Text>
              ))}
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
              <View style={styles.tagRow}>
                {item.pairsWellWith.map((pairName, index) => (
                  <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => openPairedContent(navigation, pairName)}>
                    <Text style={styles.tagTextOutline}>{pairName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SlideUp>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="massage" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// ROLEPLAY DETAIL SCREEN
// ============================================
function RolePlayDetailScreen({ route, navigation }: any) {
  const { item } = route.params as { item: RolePlayScenario };
  const { t, localizeTerm, language } = useI18n();
  const voice = useMemo(() => getVoiceCopy(language), [language]);
  const store = useStore();
  const mood = moods.find((m) => m.id === item.mood);
  const isFavorite = store.favoriteRoleplay.includes(item.id);
  const isTried = store.triedRoleplay.includes(item.id);
  const [showNotes, setShowNotes] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ stars: number; achievements: string[] }>({ stars: 0, achievements: [] });
  const existingNote = store.notes.find(n => n.itemId === item.id && n.type === 'roleplay');
  const openedAtRef = useRef(Date.now());

  const handleMarkTried = () => {
    if (!isTried) {
      const durationSeconds = Math.max(0, Math.round((Date.now() - openedAtRef.current) / 1000));
      Analytics.trackContentCompleted('roleplay', item.id, durationSeconds);
      const result = store.logActivity('roleplay', item.id);
      store.markRoleplayTried(item.id);
      setCelebrationData({ stars: result.stars, achievements: result.newAchievements });
      setShowCelebration(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: voice.share.roleplay(item.name, APP_STORE_LINK),
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const intensityColor = item.intensity === 'Light' ? colors.success : item.intensity === 'Medium' ? colors.warning : colors.error;

  return (
    <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
          <BackButton onPress={() => navigation.goBack()} />
          <SlideUp delay={0}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailMoodBadge, { backgroundColor: mood?.color || colors.primary[500] }]}>
                <Text style={styles.detailMoodEmoji}>🎭</Text>
                <Text style={styles.detailMoodLabel}>{localizeTerm(item.category)}</Text>
              </View>
              <Text style={styles.detailTitle}>{item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.detailCategory}>{localizeTerm(item.category)} • </Text>
                <View style={[styles.intensityBadge, { backgroundColor: intensityColor + '30' }]}>
                  <Text style={[styles.intensityText, { color: intensityColor }]}>{localizeTerm(item.intensity)}</Text>
                </View>
              </View>
              {!isTried && (
                <View style={styles.detailStarHint}>
                  <Text style={styles.detailStarHintText}>{t('detail.try_for_stars', { count: 4 })}</Text>
                </View>
              )}
            </View>
            <View style={styles.detailVibe}><Text style={styles.detailVibeText}>"{item.vibe}"</Text></View>
            <CoachNoteSection contentType="roleplay" item={item} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, isTried && styles.actionBtnActive]} onPress={handleMarkTried}>
                <Text style={styles.actionBtnIcon}>{isTried ? '✓' : '○'}</Text>
                <Text style={styles.actionBtnText}>{isTried ? t('detail.actions.tried') : t('detail.actions.mark_tried')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, isFavorite && styles.actionBtnFavorite]} onPress={() => { haptics.confirmAction(); store.toggleRoleplayFavorite(item.id); }}>
                <Text style={styles.actionBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionBtnText}>{isFavorite ? t('detail.actions.favorited') : t('detail.actions.favorite')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, existingNote && styles.actionBtnNotes]} onPress={() => setShowNotes(true)}>
                <Text style={styles.actionBtnIcon}>{existingNote ? '📝' : '✏️'}</Text>
                <Text style={styles.actionBtnText}>{existingNote ? t('detail.actions.view_notes') : t('detail.actions.add_notes')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>{t('detail.actions.share_with_partner')}</Text>
            </TouchableOpacity>
            {existingNote && (
              <View style={styles.notePreviewDetail}>
                <Text style={styles.notePreviewRating}>{'⭐'.repeat(existingNote.rating)}</Text>
                <Text style={styles.notePreviewText} numberOfLines={2}>{existingNote.text}</Text>
              </View>
            )}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.scenario')}</Text>
              <Text style={styles.detailText}>{item.description}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.setup')}</Text>
              <Text style={styles.detailText}>{item.setup}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.how_to_play')}</Text>
              <Text style={styles.detailText}>{item.howToPlay}</Text>
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.tips_for_success')}</Text>
              {item.tips.map((tip, index) => (
                <Text key={index} style={styles.detailTip}>• {tip}</Text>
              ))}
            </View>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('detail.sections.pairs_well_with')}</Text>
              <View style={styles.tagRow}>
                {item.pairsWellWith.map((pairName, index) => (
                  <TouchableOpacity key={index} style={[styles.tag, styles.tagOutline]} onPress={() => openPairedContent(navigation, pairName)}>
                    <Text style={styles.tagTextOutline}>{pairName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SlideUp>
        </ScrollView>
        <NotesModal visible={showNotes} onClose={() => setShowNotes(false)} itemId={item.id} itemType="roleplay" itemName={item.name} />
        <StarCelebrationModal visible={showCelebration} onClose={() => setShowCelebration(false)} stars={celebrationData.stars} achievements={celebrationData.achievements} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================
// SEASONAL CONTENT MODAL
// ============================================
function SeasonalModal({
  visible,
  onClose,
  navigation,
  onOpenTruthOrDare,
  onOpenDateNight,
  onOpenChallenge,
  onOpenSpinner,
}: {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  onOpenTruthOrDare?: () => void;
  onOpenDateNight?: () => void;
  onOpenChallenge?: () => void;
  onOpenSpinner?: () => void;
}) {
  const { language, t } = useI18n();
  const currentSeason = getCurrentSeason();
  const store = useStore();

  type SeasonalContentType = 'position' | 'foreplay' | 'oral' | 'roleplay';

  const seasonalRecommendations = useMemo(() => {
    void language;
    const season = currentSeason;
    if (!season) {
      return { positions: [], foreplay: [], oral: [], roleplay: [] };
    }

    const scoreSeasonalItem = (
      type: SeasonalContentType,
      item: { id: number; category?: string; mood?: string; difficulty?: string },
      isSeasonalSeed: boolean
    ): number => {
      const categoryScore = item.category ? (store.learningPreferences.categoryScores[item.category] || 50) : 50;
      const moodScore = item.mood ? (store.learningPreferences.moodScores[item.mood] || 50) : 50;
      const difficultyScore = item.difficulty ? (store.learningPreferences.difficultyScores[item.difficulty] || 50) : 50;
      const typeScore = store.learningPreferences.contentTypeScores[type] || 50;

      const triedSet = type === 'position'
        ? store.tried
        : type === 'foreplay'
          ? store.triedForeplay
          : type === 'oral'
            ? store.triedOral
            : store.triedRoleplay;

      const favoriteSet = type === 'position'
        ? store.favorites
        : type === 'foreplay'
          ? store.favoriteForeplay
          : type === 'oral'
            ? store.favoriteOral
            : store.favoriteRoleplay;

      const isTried = triedSet.includes(item.id);
      const isFavorite = favoriteSet.includes(item.id);
      const moodMatchBoost = store.currentMood && item.mood === store.currentMood ? 12 : 0;
      const noveltyBoost = isTried ? -3 : 8;
      const favoriteBoost = isFavorite ? 10 : 0;
      const seasonalBoost = isSeasonalSeed ? 18 : 0;

      return (
        50 +
        (categoryScore - 50) * 0.35 +
        (moodScore - 50) * 0.25 +
        (difficultyScore - 50) * 0.15 +
        (typeScore - 50) * 0.2 +
        moodMatchBoost +
        noveltyBoost +
        favoriteBoost +
        seasonalBoost
      );
    };

    const build = <T extends { id: number; category?: string; mood?: string; difficulty?: string }>(
      type: SeasonalContentType,
      items: T[],
      seasonalSeedIds: number[],
      limit: number
    ): T[] => {
      const ranked = [...items]
        .map(item => ({
          item,
          score: scoreSeasonalItem(type, item, seasonalSeedIds.includes(item.id)),
        }))
        .sort((a, b) => b.score - a.score);

      const seedFirst = ranked.filter((entry) => seasonalSeedIds.includes(entry.item.id));
      const fallback = ranked.filter((entry) => !seasonalSeedIds.includes(entry.item.id));
      const merged = [...seedFirst, ...fallback];
      const uniqueById = Array.from(new Map(merged.map((entry) => [entry.item.id, entry.item])).values());
      return uniqueById.slice(0, limit);
    };

    return {
      positions: build('position', positions, season.positions, 3),
      foreplay: build('foreplay', foreplayIdeas, season.foreplay, 3),
      oral: build('oral', oralPlayIdeas, season.oral, 3),
      roleplay: build('roleplay', rolePlayScenarios, season.roleplay, 2),
    };
  }, [
    language,
    currentSeason,
    store.currentMood,
    store.learningPreferences,
    store.tried,
    store.triedForeplay,
    store.triedOral,
    store.triedRoleplay,
    store.favorites,
    store.favoriteForeplay,
    store.favoriteOral,
    store.favoriteRoleplay,
  ]);

  const seasonalGameRecommendations = useMemo(() => {
    const season = currentSeason;
    if (!season) return [] as SeasonalGameOption[];

    const totalTried = store.tried.length + store.triedForeplay.length + store.triedOral.length + store.triedMassage.length + store.triedRoleplay.length;

    const scoreGame = (gameId: SeasonalGameAction): number => {
      let score = 50;

      if (season.games.includes(gameId)) score += 28;
      if (store.currentMood === 'playful' && (gameId === 'truth_or_dare' || gameId === 'spin')) score += 12;
      if (store.currentMood === 'passionate' && gameId === 'date_night') score += 10;
      if (store.currentMood === 'commanding' && gameId === 'challenge') score += 10;

      if (gameId === 'challenge') score += store.currentChallenge ? -8 : 10;
      if (gameId === 'spin') score += totalTried < 20 ? 8 : 2;
      if (gameId === 'date_night') score += store.dateNightsCompleted < 3 ? 8 : 3;

      return score;
    };

    return (Object.keys(SEASONAL_GAME_OPTIONS) as SeasonalGameAction[])
      .map((gameId) => ({
        ...SEASONAL_GAME_OPTIONS[gameId],
        score: scoreGame(gameId),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score: _score, ...game }) => game);
  }, [
    currentSeason,
    store.currentMood,
    store.currentChallenge,
    store.dateNightsCompleted,
    store.tried.length,
    store.triedForeplay.length,
    store.triedOral.length,
    store.triedMassage.length,
    store.triedRoleplay.length,
  ]);

  if (!currentSeason) return null;

  const openSeasonalItem = (type: SeasonalContentType, item: any) => {
    store.trackInteraction({
      type: 'view',
      contentType: type,
      itemId: item.id,
      category: item.category,
      mood: item.mood,
      difficulty: type === 'position' ? item.difficulty : undefined,
    });

    onClose();
    if (type === 'position') navigation.navigate('PositionDetail', { position: item });
    if (type === 'foreplay') navigation.navigate('ForeplayDetail', { item });
    if (type === 'oral') navigation.navigate('OralDetail', { item });
    if (type === 'roleplay') navigation.navigate('RolePlayDetail', { item });
  };

  const openSeasonalGame = (gameId: SeasonalGameAction) => {
    onClose();

    if (gameId === 'truth_or_dare') {
      if (onOpenTruthOrDare) onOpenTruthOrDare();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.truth_or_dare'));
      return;
    }
    if (gameId === 'date_night') {
      if (onOpenDateNight) onOpenDateNight();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.date_night'));
      return;
    }
    if (gameId === 'challenge') {
      if (onOpenChallenge) onOpenChallenge();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.challenge'));
      return;
    }
    if (gameId === 'spin') {
      if (onOpenSpinner) onOpenSpinner();
      else Alert.alert(t('seasonal.open_from_home.title'), t('seasonal.open_from_home.spin'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{currentSeason.emoji} {currentSeason.name}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>{currentSeason.description}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tips Section */}
            <View style={[styles.seasonalTipsCard, { backgroundColor: currentSeason.color + '20' }]}>
              <Text style={styles.seasonalTipsTitle}>{t('seasonal.tips_title')}</Text>
              {currentSeason.tips.map((tip, index) => (
                <Text key={index} style={styles.seasonalTip}>• {tip}</Text>
              ))}
            </View>

            {/* Seasonal Games */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.games')}</Text>
            {seasonalGameRecommendations.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalGame(game.id)}
              >
                <Text style={styles.seasonalItemEmoji}>{game.emoji}</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{game.title}</Text>
                  <Text style={styles.seasonalItemVibe}>{game.description}</Text>
                </View>
                <View style={styles.seasonalGamePill}>
                  <Text style={styles.seasonalGamePillText}>{t('seasonal.play')}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Recommended Positions */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.positions')}</Text>
            {seasonalRecommendations.positions.map((pos) => (
              <TouchableOpacity 
                key={pos.id} 
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalItem('position', pos)}
              >
                <Text style={styles.seasonalItemEmoji}>💑</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{pos.name}</Text>
                  <Text style={styles.seasonalItemVibe}>{pos.vibe}</Text>
                </View>
                <Text style={styles.seasonalItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {seasonalRecommendations.positions.length === 0 && (
              <Text style={styles.seasonalEmptyText}>{t('seasonal.empty.positions')}</Text>
            )}

            {/* Recommended Foreplay */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.foreplay')}</Text>
            {seasonalRecommendations.foreplay.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalItem('foreplay', item)}
              >
                <Text style={styles.seasonalItemEmoji}>💕</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{item.name}</Text>
                  <Text style={styles.seasonalItemVibe}>{item.vibe}</Text>
                </View>
                <Text style={styles.seasonalItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {seasonalRecommendations.foreplay.length === 0 && (
              <Text style={styles.seasonalEmptyText}>{t('seasonal.empty.foreplay')}</Text>
            )}

            {/* Recommended Oral Play */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.oral')}</Text>
            {seasonalRecommendations.oral.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalItem('oral', item)}
              >
                <Text style={styles.seasonalItemEmoji}>👄</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{item.name}</Text>
                  <Text style={styles.seasonalItemVibe}>{item.vibe}</Text>
                </View>
                <Text style={styles.seasonalItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {seasonalRecommendations.oral.length === 0 && (
              <Text style={styles.seasonalEmptyText}>{t('seasonal.empty.oral')}</Text>
            )}

            {/* Recommended Role Play */}
            <Text style={styles.seasonalSectionTitle}>{t('seasonal.section.roleplay')}</Text>
            {seasonalRecommendations.roleplay.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.seasonalItemCard}
                onPress={() => openSeasonalItem('roleplay', item)}
              >
                <Text style={styles.seasonalItemEmoji}>🎭</Text>
                <View style={styles.seasonalItemInfo}>
                  <Text style={styles.seasonalItemName}>{item.name}</Text>
                  <Text style={styles.seasonalItemVibe}>{item.vibe}</Text>
                </View>
                <Text style={styles.seasonalItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {seasonalRecommendations.roleplay.length === 0 && (
              <Text style={styles.seasonalEmptyText}>{t('seasonal.empty.roleplay')}</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// ANALYTICS FLUSHER COMPONENT
// ============================================
// This component sits inside PostHogProvider and flushes queued events
function AnalyticsFlusher() {
  const posthog = usePostHog();
  
  useEffect(() => {
    // Flush any pending events on mount and periodically
    const flushEvents = () => {
      const events = Analytics.getPendingEvents();
      events.forEach(({ event, properties }) => {
        const sanitizedProperties = sanitizeAnalyticsProperties(properties);
        posthog.capture(event, {
          ...ANALYTICS_BASE_PROPERTIES,
          ...sanitizedProperties,
        }, { disableGeoip: true });
        void sendAggregateAnalyticsEvent(event, sanitizedProperties);
      });
    };
    
    flushEvents();
    const interval = setInterval(flushEvents, 10000); // Flush every 10 seconds
    
    return () => clearInterval(interval);
  }, [posthog]);
  
  return null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, recoveryAttempted: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, recoveryAttempted: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);

    if (!this.state.recoveryAttempted) {
      try {
        useStore.setState({
          hasCompletedOnboarding: false,
          pendingLevelUp: null,
          currentChallenge: null,
          weeklyGoals: [],
          pinCode: null,
          unlockedFeatures: getUnlockedFeaturesForLevel(1),
        });
      } catch (recoveryError) {
        console.error('App recovery failed:', recoveryError);
      }

      setTimeout(() => {
        this.setState({ hasError: false, error: null, recoveryAttempted: true });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      const language = useStore.getState().language;
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary, padding: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>😔</Text>
          <Text style={{ fontSize: 20, color: colors.white, textAlign: 'center', marginBottom: 10 }}>{translateUi(language, 'app.error.title')}</Text>
          <Text style={{ fontSize: 14, color: colors.text.muted, textAlign: 'center' }}>{translateUi(language, 'app.error.restart')}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function ConnectivityBanner({ visible, text, isError = false }: { visible: boolean; text: string; isError?: boolean }) {
  if (!visible) return null;
  return (
    <View style={[styles.connectivityBanner, isError ? styles.connectivityBannerOffline : styles.connectivityBannerOnline]}>
      <Text style={styles.connectivityBannerText}>{text}</Text>
    </View>
  );
}

// Inner App Component that uses the store
function AppContent({ enableAnalytics = false }: { enableAnalytics?: boolean }) {
  const store = useStore();
  const featureFlags = useFeatureFlags();
  const isOnline = useNetworkStatus();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isQueueSyncing, setIsQueueSyncing] = useState(false);
  const [showOnlineRecovered, setShowOnlineRecovered] = useState(false);
  const [showDailyBonusModal, setShowDailyBonusModal] = useState(false);
  const [pendingDailyJokeDateKey, setPendingDailyJokeDateKey] = useState<string | null>(null);
  const lastOnlineStateRef = useRef(true);
  const lastHandledNotificationIdRef = useRef<string | null>(null);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse | null) => {
    if (!response) return;

    const requestId = response.notification.request.identifier;
    if (lastHandledNotificationIdRef.current === requestId) return;
    lastHandledNotificationIdRef.current = requestId;

    const data = response.notification.request.content.data;
    const payload = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    if (payload?.type !== 'daily_joke_tease') return;

    const notificationDateKey = typeof payload.dateKey === 'string' && payload.dateKey.length > 0
      ? payload.dateKey
      : getDateKey(new Date());

    setPendingDailyJokeDateKey(notificationDateKey);
    Analytics.trackFeatureUsed('daily_joke_notification_opened');

    if (navigationRef.isReady()) {
      navigationRef.navigate('MainTabs', { screen: 'Home' });
    }
  }, []);

  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    void Notifications.getLastNotificationResponseAsync()
      .then((lastResponse) => {
        handleNotificationResponse(lastResponse);
      })
      .catch(() => undefined);

    return () => {
      responseSubscription.remove();
    };
  }, [handleNotificationResponse]);

  useEffect(() => {
    let isMounted = true;

    const initializeAppState = async () => {
      try {
        // Wait for persisted store hydration first.
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Migrate existing PIN from legacy AsyncStorage state into secure storage once.
        const currentPin = useStore.getState().pinCode;
        const securePin = await loadPinFromSecureStorage();
        if (currentPin && !securePin) {
          await savePinToSecureStorage(currentPin);
        } else if (!currentPin && securePin) {
          useStore.getState().setPinCode(securePin);
        } else if (currentPin && securePin && currentPin !== securePin) {
          useStore.getState().setPinCode(securePin);
        }

        const appState = useStore.getState();
        const baselineUnlocks = getUnlockedFeaturesForLevel(getLevel(appState.totalStars).level);
        if (baselineUnlocks.some((feature) => !appState.unlockedFeatures.includes(feature))) {
          useStore.setState({
            unlockedFeatures: Array.from(new Set([...appState.unlockedFeatures, ...baselineUnlocks])),
          });
        }
        Analytics.trackSessionStart(appState.interactionHistory.length === 0);

        const todayKey = getDateKey(new Date());
        const installDateKey = appState.firstOpenDate || todayKey;
        if (!appState.firstOpenDate) {
          appState.setFirstOpenDate(installDateKey);
        }

        const totalActivities = appState.activityLog.length;
        if (totalActivities > 0) {
          const installDate = new Date(`${installDateKey}T00:00:00`);
          const todayDate = new Date(`${todayKey}T00:00:00`);
          const daysSinceInstall = Math.max(
            0,
            Math.floor((todayDate.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24))
          );
          Analytics.trackRetentionSignal(daysSinceInstall, totalActivities);
        }
      } catch (error) {
        console.error('App initialization failed; continuing in safe mode:', error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void initializeAppState();

    const appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        setIsUnlocked(false);
        if (featureFlags.enableReactivationReminder && useStore.getState().hasAgreedToTerms) {
          void scheduleReactivationReminder({
            enabled: useStore.getState().notificationsEnabled && useStore.getState().reactivationNotificationsEnabled,
          });
        }
        return;
      }

      void clearReactivationReminder();

      if (useStore.getState().hasAgreedToTerms) {
        void ensureDailyJokeTeaserNotifications({
          enabled:
            useStore.getState().notificationsEnabled &&
            featureFlags.enableDailyJokes &&
            useStore.getState().dailyJokeNotificationsEnabled,
        });
        void scheduleDailyStreakReminder({
          enabled: useStore.getState().notificationsEnabled && useStore.getState().dailyStreakNotificationsEnabled,
        });
        if (isOnline) {
          void flushQueuedFormspreeMessages();
        }
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
    };
  }, [featureFlags.enableDailyJokes, featureFlags.enableReactivationReminder, isOnline]);

  useEffect(() => {
    if (!isReady || !store.hasAgreedToTerms) return;
    void ensureDailyJokeTeaserNotifications({
      enabled: store.notificationsEnabled && featureFlags.enableDailyJokes && store.dailyJokeNotificationsEnabled,
    });
    void scheduleDailyStreakReminder({
      enabled: store.notificationsEnabled && store.dailyStreakNotificationsEnabled,
    });
  }, [
    isReady,
    store.hasAgreedToTerms,
    store.notificationsEnabled,
    store.dailyJokeNotificationsEnabled,
    store.dailyStreakNotificationsEnabled,
    featureFlags.enableDailyJokes,
  ]);

  useEffect(() => {
    const wasOnline = lastOnlineStateRef.current;
    lastOnlineStateRef.current = isOnline;

    if (!wasOnline && isOnline) {
      setShowOnlineRecovered(true);
      setIsQueueSyncing(true);
      void flushQueuedFormspreeMessages()
        .catch(() => undefined)
        .finally(() => {
          setIsQueueSyncing(false);
          setTimeout(() => setShowOnlineRecovered(false), 3000);
        });
      return;
    }

    if (!isOnline) {
      setShowOnlineRecovered(false);
    }
  }, [isOnline]);

  useEffect(() => {
    if (!isReady || !isOnline) return;
    setIsQueueSyncing(true);
    void flushQueuedFormspreeMessages()
      .catch(() => undefined)
      .finally(() => setIsQueueSyncing(false));
  }, [isReady, isOnline]);

  useEffect(() => {
    if (!isReady) return;

    const today = getDateKey(new Date());
    const previousLastLoginDate = useStore.getState().lastLoginDate;
    useStore.getState().checkLoginStreak();
    useStore.getState().archiveOldStats();

    const currentState = useStore.getState();
    const shouldShowDailyBonus =
      currentState.hasCompletedOnboarding &&
      currentState.hasAgreedToTerms &&
      previousLastLoginDate !== today &&
      currentState.lastLoginDate === today &&
      !currentState.dailyBonusClaimed;

    if (!shouldShowDailyBonus) return;

    const timer = setTimeout(() => {
      setShowDailyBonusModal(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isReady]);

  // Show loading while store hydrates
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  // If PIN is set and not unlocked, show lock screen
  if (store.pinCode && !isUnlocked) {
    return (
      <SafeAreaProvider>
        <ConnectivityBanner visible={!isOnline} text={translateUi(store.language, 'network.offline_banner')} isError />
        <AppLockScreen onUnlock={() => setIsUnlocked(true)} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
      <SafeAreaProvider>
        <ConnectivityBanner visible={!isOnline} text={translateUi(store.language, 'network.offline_banner')} isError />
        <ConnectivityBanner
          visible={isOnline && (showOnlineRecovered || isQueueSyncing)}
          text={translateUi(
            store.language,
            isQueueSyncing ? 'network.online_syncing' : 'network.online_banner'
          )}
        />
        {enableAnalytics ? <AnalyticsFlusher /> : null}
        <NavigationContainer ref={navigationRef}>
          <RootAppNavigator
            screens={{
              AuthScreen,
              HomeScreen: (props: any) => (
                <HomeScreen
                  {...props}
                  pendingDailyJokeDateKey={pendingDailyJokeDateKey}
                  onConsumePendingDailyJokeNotification={() => setPendingDailyJokeDateKey(null)}
                />
              ),
              ExploreScreen,
              FavoritesScreen,
              ProfileScreen,
              MoodCheckScreen,
              TonightSessionScreen,
              SessionRatingScreen: (props: any) => (
                <SessionRatingScreen
                  {...props}
                  ConfettiComponent={ConfettiCelebration}
                />
              ),
              PositionDetailScreen,
              ForeplayDetailScreen,
              OralDetailScreen,
              MassageDetailScreen,
              RolePlayDetailScreen,
              WelcomeScreen,
              NameInputScreen,
              RelationshipTypeScreen,
              PreferencesScreen,
              ExperienceLevelScreen,
              LegalScreen,
              OriginScreen,
              OnboardingPayoffScreen,
              SignInScreen,
            }}
          />
        </NavigationContainer>
        <DailyBonusModal
          visible={showDailyBonusModal}
          onClose={() => setShowDailyBonusModal(false)}
          ConfettiComponent={ConfettiCelebration}
        />
        <LevelUpModal
          visible={Boolean(store.pendingLevelUp?.leveledUp)}
          onClose={store.clearPendingLevelUp}
          newLevel={store.pendingLevelUp?.newLevel || null}
          unlockedFeatures={store.pendingLevelUp?.unlockedFeatures || []}
          unlockMessage={store.pendingLevelUp?.unlockMessage || ''}
          ConfettiComponent={ConfettiCelebration}
        />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

export default function App() {
  // PostHog configuration
  const posthogOptions: PostHogOptions = {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    personProfiles: 'never',
    setDefaultPersonProperties: false,
    captureAppLifecycleEvents: false,
    enableSessionReplay: false,
    sendFeatureFlagEvent: false,
    preloadFeatureFlags: false,
    disableGeoip: true,
    disableRemoteConfig: true,
    disableSurveys: true,
    persistence: 'memory',
  };
  const posthogConfig = {
    apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
    options: posthogOptions,
  };

  // Firebase now initializes lazily inside AuthProvider
  // No need to check here - AuthProvider handles initialization errors gracefully

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          {posthogConfig.apiKey ? (
            <PostHogProvider apiKey={posthogConfig.apiKey} options={posthogConfig.options} autocapture={false}>
              <AppContent enableAnalytics />
            </PostHogProvider>
          ) : (
            <AppContent />
          )}
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContainer: { paddingBottom: 40 },
  connectivityBanner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 50,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  connectivityBannerOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.92)',
  },
  connectivityBannerOnline: {
    backgroundColor: 'rgba(22, 163, 74, 0.92)',
  },
  connectivityBannerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenContent: { flex: 1, paddingTop: 20 },
  logoContainer: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
  bloom: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center' },
  bloomCore: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFAF0' },
  titleLarge: { fontSize: 48, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.text.secondary, textAlign: 'center', lineHeight: 24 },
  welcomeTagline: { marginTop: 14, fontSize: 20, lineHeight: 28, color: colors.text.primary, textAlign: 'center', fontWeight: '700' },
  welcomeTeaser: { marginTop: 10, fontSize: 15, lineHeight: 22, color: colors.text.secondary, textAlign: 'center', maxWidth: 320 },
  welcomeJokeCard: { marginTop: 16, width: '100%', maxWidth: 340, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLight, borderRadius: 16, padding: 14 },
  welcomeJokeLabel: { color: colors.primary[400], fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 },
  welcomeJokeSetup: { color: colors.text.primary, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  welcomeJokeHint: { marginTop: 8, color: colors.text.secondary, fontSize: 13, lineHeight: 19 },
  welcomeJokePunchline: { marginTop: 10, color: colors.text.secondary, fontSize: 14, lineHeight: 20 },
  welcomeJokeAction: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: colors.primary[500] + '25', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  welcomeJokeActionText: { color: colors.primary[400], fontSize: 13, fontWeight: '700' },
  buttons: { paddingBottom: 40 },
  primaryButton: { paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  primaryButtonText: { color: colors.white, fontSize: 18, fontWeight: '600' },
  secondaryButton: { marginTop: 16, alignItems: 'center' },
  secondaryButtonText: { color: colors.text.muted, fontSize: 14 },
  linkText: { color: colors.primary[400] },
  backButton: { paddingVertical: 10 },
  backButtonText: { color: colors.text.secondary, fontSize: 16 },
  textInput: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 18, color: colors.text.primary, marginTop: 30 },
  optionsContainer: { marginTop: 30 },
  optionCard: { backgroundColor: colors.card, borderRadius: 12, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  optionCardSelected: { borderColor: colors.primary[500], backgroundColor: colors.cardLight },
  optionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary },
  optionTitleSelected: { color: colors.primary[400] },
  optionSubtitle: { fontSize: 14, color: colors.text.muted, marginTop: 4 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  chip: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  chipSelected: { backgroundColor: colors.primary[500], borderColor: colors.primary[400] },
  chipText: { color: colors.text.primary, fontSize: 14 },
  chipTextSelected: { color: colors.white, fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginTop: 30, borderWidth: 2, borderColor: 'transparent' },
  checkboxRowSelected: { borderColor: colors.primary[500] },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.text.muted, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  checkboxText: { flex: 1, color: colors.text.primary, fontSize: 14, lineHeight: 20 },
  originHero: { alignItems: 'center', paddingTop: 28, paddingBottom: 18 },
  originEmoji: { fontSize: 64, marginBottom: 10 },
  originSubtitle: { color: colors.text.secondary, fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 8, paddingHorizontal: 14 },
  originSection: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.cardLight },
  originSectionTitle: { color: colors.text.primary, fontSize: 17, fontWeight: '800', marginBottom: 6 },
  originBody: { color: colors.text.secondary, fontSize: 14, lineHeight: 21 },
  homeHeader: { paddingTop: 10, marginBottom: 16 },
  homeHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  originLink: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 4 },
  originLinkText: { color: colors.primary[400], fontSize: 12, fontWeight: '700' },
  trialBanner: {
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 165, 116, 0.26)',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  trialBannerText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  greeting: { fontSize: 14, color: colors.text.secondary },
  homeSparkBanner: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.cardLight, padding: 14, marginBottom: 16 },
  homeSparkBannerHeadline: { color: colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  homeSparkBannerBody: { color: colors.text.secondary, fontSize: 13, lineHeight: 18 },
  starCounter: { backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  starCounterText: { color: colors.textDark, fontWeight: '700', fontSize: 14 },
  streakBanner: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  streakBannerText: { color: colors.error, fontWeight: '600', fontSize: 14 },

  // Couple's Spark card
  coupleSparkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.primary[500] + '40' },
  coupleSparkEmoji: { fontSize: 28, marginRight: 12 },
  coupleSparkLabel: { fontSize: 11, fontWeight: '700', color: colors.primary[400], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  coupleSparkText: { fontSize: 14, color: colors.text.primary, lineHeight: 20 },

  dailyJokeCard: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.cardLight },
  dailyJokeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dailyJokeTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  dailyJokeDate: { fontSize: 11, color: colors.text.muted },
  dailyJokeSetup: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  dailyJokeRevealButton: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.primary[500] + '25' },
  dailyJokeRevealText: { color: colors.primary[400], fontSize: 13, fontWeight: '600' },
  dailyJokePunchlineBox: { marginTop: 10, backgroundColor: colors.cardLight, borderRadius: 12, padding: 10 },
  dailyJokePunchlineLabel: { color: colors.text.muted, fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  dailyJokePunchline: { color: colors.text.primary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  tonightCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  tonightGradient: { padding: 24 },
  tonightLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  tonightTitle: { color: colors.white, fontSize: 26, fontWeight: '700', marginBottom: 4 },
  tonightSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  tonightTeaser: { color: 'rgba(255,255,255,0.88)', fontSize: 13, marginTop: 10, lineHeight: 18 },
  tonightSessionButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  tonightSessionButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  vibePanel: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary[500] + '44',
  },
  vibePanelEyebrow: { color: colors.primary[400], fontSize: 12, fontWeight: '700', marginBottom: 6 },
  vibePanelTitle: { color: colors.text.primary, fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 6 },
  vibePanelBody: { color: colors.text.secondary, fontSize: 14, lineHeight: 20, marginBottom: 14 },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  vibeMoodButton: {
    width: '48%',
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardLight,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  vibeMoodEmoji: { fontSize: 24, marginBottom: 4 },
  vibeMoodLabel: { color: colors.text.primary, fontSize: 13, lineHeight: 17, fontWeight: '700' },
  vibeMoodLabelSelected: { color: colors.white },
  homeChoiceRow: { flexDirection: 'row', gap: 10 },
  homePrimaryChoice: { flex: 1.2, minHeight: 48, borderRadius: 14, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  homePrimaryChoiceText: { color: colors.white, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  homeSecondaryChoice: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: colors.cardLight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  homeSecondaryChoiceText: { color: colors.text.primary, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  tonightSuggestionHeader: { marginBottom: 6 },
  tonightMoodCopy: { color: colors.text.secondary, fontSize: 13, lineHeight: 18, marginTop: -6, marginBottom: 10 },
  quietWinsToggle: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  quietWinsToggleText: { color: colors.text.secondary, fontSize: 13, fontWeight: '700' },
  newBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginTop: 12 },
  newBadgeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  featureButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  featureButton: { flex: 1, marginHorizontal: 4, borderRadius: 16, overflow: 'hidden' },
  featureButtonGradient: { paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', minHeight: 118 },
  featureButtonEmoji: { fontSize: 24, marginBottom: 4 },
  featureButtonText: { color: colors.white, fontSize: 12, fontWeight: '700', marginBottom: 3 },
  featureButtonSubtext: { color: 'rgba(255,255,255,0.88)', fontSize: 10, textAlign: 'center', lineHeight: 13 },
  quickStatsRow: { flexDirection: 'row', marginBottom: 16 },
  quickStatCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  quickStatEmoji: { fontSize: 20, marginBottom: 4 },
  quickStatNumber: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  quickStatLabel: { fontSize: 11, color: colors.text.muted },
  challengePreview: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: colors.green },
  challengePreviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  challengePreviewLabel: { color: colors.text.secondary, fontSize: 12 },
  challengePreviewReward: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  challengePreviewName: { color: colors.text.primary, fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 12, marginTop: 10 },
  moodScroll: { marginBottom: 16 },
  horizontalScrollContent: { paddingRight: 20 },
  moodChip: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  moodChipText: { color: colors.text.primary, fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.muted, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text.primary },
  clearButton: { padding: 4 },
  clearButtonText: { color: colors.text.muted, fontSize: 16 },
  exploreHeader: { paddingTop: 10, marginBottom: 16 },
  collectionSection: { marginBottom: 14 },
  collectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  collectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  collectionClearText: { fontSize: 13, fontWeight: '600', color: colors.primary[400] },
  collectionScrollContent: { paddingRight: 20 },
  collectionCard: { width: 188, minHeight: 118, backgroundColor: colors.card, borderRadius: 18, padding: 14, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  collectionCardActive: { backgroundColor: 'rgba(168, 85, 247, 0.22)', borderColor: 'rgba(196, 128, 255, 0.7)' },
  collectionLockedCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.cardLight, paddingVertical: 14, paddingHorizontal: 14, alignItems: 'center' },
  collectionLockedInlineCard: { marginTop: 10 },
  collectionLockedEmoji: { fontSize: 20, marginBottom: 4 },
  collectionLockedTitle: { fontSize: 13, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  collectionLockedSubtitle: { marginTop: 4, fontSize: 12, color: colors.text.muted, textAlign: 'center' },
  collectionEmoji: { fontSize: 20, marginBottom: 10 },
  collectionCardTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 6 },
  collectionCardTitleActive: { color: colors.white },
  collectionCardSubtitle: { fontSize: 12, lineHeight: 18, color: colors.text.muted },
  collectionCardSubtitleActive: { color: 'rgba(255,255,255,0.88)' },
  tripleToggleContainer: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 4, marginBottom: 12 },
  tripleToggleButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tripleToggleButtonActive: { backgroundColor: colors.primary[500] },
  tripleToggleButtonText: { color: colors.text.muted, fontSize: 12 },
  tripleToggleButtonTextActive: { color: colors.white, fontWeight: '600' },
  sortContainer: { flexDirection: 'row', marginBottom: 12 },
  sortButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8, backgroundColor: colors.card },
  sortButtonActive: { backgroundColor: colors.primary[500] },
  sortButtonText: { fontSize: 12, color: colors.text.muted },
  sortButtonTextActive: { color: colors.white, fontWeight: '600' },
  sortMetaText: { fontSize: 12, color: colors.text.muted, marginBottom: 10 },
  categoryWrapper: { marginBottom: 12 },
  categoryScrollContent: { paddingRight: 20 },
  categoryChip: { backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryChipSelected: { backgroundColor: colors.primary[500] },
  categoryChipText: { color: colors.text.muted, fontSize: 14 },
  categoryChipTextSelected: { color: colors.white, fontWeight: '600' },
  categoryChipCountText: { color: colors.text.muted, fontSize: 12 },
  categoryChipCountTextSelected: { color: 'rgba(255,255,255,0.85)' },
  favoritesQuickBar: { marginBottom: 12 },
  favoritesQuickHeader: { fontSize: 13, color: colors.text.secondary, marginBottom: 8, fontWeight: '600' },
  favoritesQuickScrollContent: { paddingRight: 20 },
  favoriteQuickChip: { backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  favoriteQuickChipText: { color: colors.text.primary, fontSize: 12, fontWeight: '600', maxWidth: 180 },
  positionGrid: { paddingHorizontal: 10, paddingBottom: 20 },
  positionRow: { justifyContent: 'space-between' },
  positionCard: { flex: 1, marginHorizontal: 6, backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  triedBadge: { color: colors.success, fontSize: 14, marginRight: 8, fontWeight: '700' },
  positionMoodBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  positionMoodEmoji: { fontSize: 16 },
  favoriteIcon: { fontSize: 18 },
  positionName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  positionCategory: { fontSize: 12, color: colors.text.secondary, marginBottom: 6 },
  positionVibe: { fontSize: 12, color: colors.text.muted, fontStyle: 'italic', marginBottom: 10 },
  positionFooter: { flexDirection: 'row' },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  difficultyBeginner: { backgroundColor: 'rgba(132, 204, 22, 0.2)' },
  difficultyIntermediate: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  difficultyAdvanced: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  difficultyText: { fontSize: 10, color: colors.text.secondary, fontWeight: '600' },
  durationBadge: { backgroundColor: 'rgba(6, 182, 212, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  durationText: { fontSize: 10, color: colors.cyan, fontWeight: '600' },
  giverBadge: { backgroundColor: 'rgba(168, 85, 247, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  giverText: { fontSize: 10, color: colors.text.secondary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.text.muted },
  exploreEmptyBody: { fontSize: 14, color: colors.text.muted, textAlign: 'center', lineHeight: 20, maxWidth: 280, marginBottom: 14 },
  emptyActionButton: { backgroundColor: colors.primary[500], borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  emptyActionButtonText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  viewToggleContainer: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, padding: 4, marginBottom: 12 },
  viewToggleButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  viewToggleButtonActive: { backgroundColor: colors.primary[500] },
  viewToggleText: { color: colors.text.muted, fontSize: 13 },
  viewToggleTextActive: { color: colors.white, fontWeight: '600' },
  recentlyTriedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  recentlyTriedEmoji: { fontSize: 24, marginRight: 12 },
  recentlyTriedContent: { flex: 1 },
  recentlyTriedName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  recentlyTriedVibe: { fontSize: 12, color: colors.text.muted },
  recentlyTriedArrow: { fontSize: 18, color: colors.text.muted },
  profileSectionCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  profileSectionHeading: { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 12 },
  profileJourneyLevelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  profileJourneyLevelText: { fontSize: 16, fontWeight: '700' },
  profileJourneyStarsText: { fontSize: 14, color: colors.gold, fontWeight: '700' },
  profileJourneyProgressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' },
  profileJourneyProgressFill: { height: '100%', backgroundColor: colors.primary[500], borderRadius: 999 },
  profileJourneyProgressLabel: { marginTop: 8, fontSize: 12, color: colors.text.muted },
  profileStatPillsRow: { flexDirection: 'row', marginBottom: 14 },
  profileStatPill: { flex: 1, backgroundColor: colors.card, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 8, marginHorizontal: 4, alignItems: 'center' },
  profileStatPillText: { fontSize: 12, color: colors.text.secondary, fontWeight: '600', textAlign: 'center' },
  profileExploredLabel: { fontSize: 13, color: colors.text.secondary, marginBottom: 8 },
  profileExploredTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' },
  profileExploredFill: { height: '100%', backgroundColor: colors.success, borderRadius: 999 },
  profileStylePlaceholder: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  profileStyleRow: { marginBottom: 10 },
  profileStyleLabel: { fontSize: 13, color: colors.text.muted, marginBottom: 6 },
  profileStyleValue: { fontSize: 14, color: colors.text.primary, fontWeight: '600' },
  profileStyleChipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  profileStyleChip: { backgroundColor: 'rgba(168, 85, 247, 0.22)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, marginBottom: 6 },
  profileStyleChipText: { fontSize: 12, color: colors.primary[400], fontWeight: '600' },
  profileStyleSubtext: { marginTop: 8, fontSize: 12, color: colors.text.muted },
  profileGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  profileGroupHeaderText: { fontSize: 15, color: colors.text.primary, fontWeight: '600' },
  profileGroupChevron: { fontSize: 16, color: colors.text.muted },
  profileGroupContent: { paddingBottom: 10 },
  profileInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  profileInfoLabel: { fontSize: 13, color: colors.text.muted },
  profileInfoValue: { fontSize: 13, color: colors.text.primary, fontWeight: '600' },
  profileActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  profileActionRowText: { fontSize: 14, color: colors.text.primary },
  profileActionRowArrow: { fontSize: 16, color: colors.text.muted },
  profileShareButton: { marginTop: 8, marginBottom: 8, backgroundColor: colors.primary[500], borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  profileShareButtonText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary[500], justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.white },
  profileName: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  profileStarBadge: { backgroundColor: colors.gold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  profileStarText: { color: colors.textDark, fontWeight: '700', fontSize: 14 },
  profileStreakBanner: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  profileStreakText: { color: colors.error, fontWeight: '600' },
  progressSection: { marginBottom: 20 },
  progressBar: { height: 8, backgroundColor: colors.card, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  progressText: { fontSize: 12, color: colors.text.muted },
  profileActionsRow: { flexDirection: 'row', marginBottom: 20 },
  profileActionButton: { flex: 1, marginHorizontal: 4, borderRadius: 16, overflow: 'hidden' },
  profileActionGradient: { padding: 16, alignItems: 'center' },
  profileActionEmoji: { fontSize: 28, marginBottom: 4 },
  profileActionText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  profileActionCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  recentAchievementsSection: { marginBottom: 20 },
  recentAchievementItem: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginRight: 10, alignItems: 'center', width: 80 },
  recentAchievementEmoji: { fontSize: 28, marginBottom: 4 },
  recentAchievementName: { fontSize: 10, color: colors.text.primary, textAlign: 'center' },
  notesSection: { marginBottom: 20 },
  notePreview: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  notePreviewName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  notePreviewRating: { fontSize: 12, marginVertical: 4 },
  notePreviewText: { fontSize: 12, color: colors.text.muted },
  notePreviewDetail: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 16 },
  menuSection: { marginTop: 10 },
  menuItem: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  menuItemText: { fontSize: 16, color: colors.text.primary },
  detailScrollContent: { paddingBottom: 40 },
  detailHeader: { alignItems: 'center', paddingVertical: 20 },
  detailMoodBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  detailMoodEmoji: { fontSize: 20, marginRight: 8 },
  detailMoodLabel: { fontSize: 14, color: colors.white, fontWeight: '600' },
  detailTitle: { fontSize: 32, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  detailCategory: { fontSize: 14, color: colors.text.secondary },
  detailStarHint: { backgroundColor: 'rgba(251, 191, 36, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  detailStarHintText: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  detailVibe: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 20 },
  detailVibeText: { fontSize: 16, color: colors.text.primary, fontStyle: 'italic', textAlign: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginHorizontal: 4, marginBottom: 8 },
  actionBtnActive: { backgroundColor: 'rgba(132, 204, 22, 0.2)' },
  actionBtnFavorite: { backgroundColor: 'rgba(236, 72, 153, 0.2)' },
  actionBtnNotes: { backgroundColor: 'rgba(168, 85, 247, 0.2)' },
  actionBtnIcon: { fontSize: 16, marginRight: 6 },
  actionBtnText: { fontSize: 13, color: colors.text.primary },
  coachNoteCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 16 },
  coachNoteTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  coachNoteText: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  coachSkeletonWrap: { height: 38, justifyContent: 'space-between', overflow: 'hidden' },
  coachSkeletonLine: { height: 14, borderRadius: 8 },
  coachShimmer: { position: 'absolute', top: 0, left: 0, width: 120, height: 42 },
  detailSection: { marginBottom: 24 },
  detailSectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 12 },
  detailText: { fontSize: 15, color: colors.text.secondary, lineHeight: 24 },
  detailTip: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 8, paddingLeft: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tipRow: { flexDirection: 'row', marginBottom: 10 },
  tipBullet: { fontSize: 14, marginRight: 10 },
  tipText: { flex: 1, fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(168, 85, 247, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 12, color: colors.primary[400] },
  tagOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary[400] },
  tagTextOutline: { fontSize: 12, color: colors.primary[400] },
  starBadge: { backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  starBadgeText: { color: colors.textDark, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalOverlayCentered: { justifyContent: 'center', paddingHorizontal: 14 },
  aboutModalContent: { borderRadius: 24, maxHeight: '82%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  modalClose: { fontSize: 24, color: colors.text.muted, padding: 4 },
  modalSubtitle: { fontSize: 14, color: colors.text.secondary, marginBottom: 20 },
  spinTypeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  spinTypeButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  spinTypeButtonActive: { backgroundColor: colors.primary[500] },
  spinTypeText: { fontSize: 20 },
  spinTypeTextActive: { fontSize: 20 },
  spinnerContainer: { alignItems: 'center', marginVertical: 30 },
  spinnerWheel: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: colors.primary[500] },
  spinnerEmoji: { fontSize: 48 },
  spinnerResult: { alignItems: 'center', marginBottom: 20 },
  spinnerResultType: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  spinnerResultName: { fontSize: 24, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  spinnerResultVibe: { fontSize: 14, color: colors.text.muted, textAlign: 'center', fontStyle: 'italic', marginBottom: 16 },
  viewResultButton: { backgroundColor: colors.card, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  viewResultButtonText: { color: colors.primary[400], fontSize: 14, fontWeight: '600' },
  spinButton: { borderRadius: 30, overflow: 'hidden', marginTop: 10 },
  spinButtonDisabled: { opacity: 0.6 },
  spinButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  spinButtonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  dateNightStep: { marginBottom: 16 },
  dateNightStepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dateNightStepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary[500], color: colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center', lineHeight: 28, marginRight: 10, overflow: 'hidden' },
  dateNightStepLabel: { fontSize: 14, color: colors.text.secondary },
  dateNightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 16 },
  dateNightCardEmoji: { fontSize: 28, marginRight: 12 },
  dateNightCardContent: { flex: 1 },
  dateNightCardName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  dateNightCardVibe: { fontSize: 12, color: colors.text.muted },
  dateNightCardArrow: { fontSize: 18, color: colors.text.muted },
  completeDateNightButton: { borderRadius: 30, overflow: 'hidden', marginTop: 16 },
  completeDateNightGradient: { paddingVertical: 16, alignItems: 'center' },
  completeDateNightText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  regenerateButton: { backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  regenerateButtonText: { color: colors.text.primary, fontSize: 16 },
  challengeCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  challengeType: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  challengeName: { fontSize: 22, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  challengeVibe: { fontSize: 14, color: colors.text.muted, textAlign: 'center', fontStyle: 'italic', marginBottom: 12 },
  challengeReward: { backgroundColor: 'rgba(251, 191, 36, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 16 },
  challengeRewardText: { color: colors.gold, fontWeight: '600' },
  challengeViewButton: { backgroundColor: colors.cardLight, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  challengeViewButtonText: { color: colors.primary[400], fontSize: 14, fontWeight: '600' },
  completeButton: { borderRadius: 30, overflow: 'hidden', marginBottom: 12 },
  completeButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  completeButtonText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  skipButton: { alignItems: 'center', paddingVertical: 12 },
  skipButtonText: { color: colors.text.muted, fontSize: 14 },
  challengeStats: { alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.card },
  challengeStatsText: { fontSize: 14, color: colors.text.secondary },
  noChallengeContainer: { alignItems: 'center', paddingVertical: 30 },
  noChallengeEmoji: { fontSize: 64, marginBottom: 16 },
  noChallengeTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  noChallengeSubtitle: { fontSize: 14, color: colors.text.muted, textAlign: 'center', marginBottom: 24 },
  generateChallengeButton: { borderRadius: 30, overflow: 'hidden' },
  generateChallengeGradient: { paddingVertical: 16, paddingHorizontal: 32 },
  generateChallengeText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  notesItemName: { fontSize: 18, fontWeight: '600', color: colors.text.primary, textAlign: 'center', marginBottom: 20 },
  notesLabel: { fontSize: 14, color: colors.text.secondary, marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  ratingStar: { fontSize: 32, marginHorizontal: 4 },
  notesInput: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text.primary, minHeight: 120, textAlignVertical: 'top', marginBottom: 20 },
  notesButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  deleteNoteButton: { paddingVertical: 12, paddingHorizontal: 20, marginRight: 12 },
  deleteNoteButtonText: { color: colors.error, fontSize: 14 },
  saveNoteButton: { borderRadius: 20, overflow: 'hidden' },
  saveNoteGradient: { paddingVertical: 12, paddingHorizontal: 24 },
  saveNoteText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  celebrationOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  celebrationContent: { backgroundColor: colors.background.primary, borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', maxWidth: 320 },
  celebrationEmoji: { fontSize: 72, marginBottom: 16 },
  celebrationTitle: { fontSize: 36, fontWeight: '700', color: colors.gold, marginBottom: 8 },
  celebrationSubtitle: { fontSize: 16, color: colors.text.secondary, marginBottom: 24 },
  achievementEarnedContainer: { backgroundColor: colors.card, borderRadius: 16, padding: 16, width: '100%', marginBottom: 24 },
  achievementEarnedTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 12, textAlign: 'center' },
  achievementEarnedItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  achievementEarnedEmoji: { fontSize: 28, marginRight: 12 },
  achievementEarnedName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  achievementEarnedDesc: { fontSize: 12, color: colors.text.muted },
  celebrationButton: { backgroundColor: colors.primary[500], paddingHorizontal: 32, paddingVertical: 14, borderRadius: 25 },
  celebrationButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  achievementProgress: { color: colors.text.secondary, fontSize: 14, marginBottom: 20 },
  achievementCategory: { marginBottom: 24 },
  achievementCategoryTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 12 },
  achievementItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  achievementItemLocked: { opacity: 0.5 },
  achievementEmoji: { fontSize: 28, marginRight: 12 },
  achievementEmojiLocked: { opacity: 0.5 },
  achievementInfo: { flex: 1 },
  achievementName: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  achievementNameLocked: { color: colors.text.muted },
  achievementDesc: { fontSize: 12, color: colors.text.muted },
  achievementDescLocked: { color: colors.text.muted },
  achievementCheck: { color: colors.success, fontSize: 18, fontWeight: '700' },
  insightCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  insightCardTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: 16, textAlign: 'center' },
  insightStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  insightStat: { alignItems: 'center' },
  insightStatNumber: { fontSize: 24, fontWeight: '700', color: colors.text.primary },
  insightStatLabel: { fontSize: 12, color: colors.text.muted, marginTop: 4 },
  comparisonCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  comparisonTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12 },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  comparisonLabel: { fontSize: 14, color: colors.text.muted },
  comparisonValue: { fontSize: 14, fontWeight: '600' },
  comparisonUp: { color: colors.success },
  comparisonDown: { color: colors.error },
  streakCard: { backgroundColor: colors.card, borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  streakEmoji: { fontSize: 40, marginBottom: 8 },
  streakNumber: { fontSize: 48, fontWeight: '700', color: colors.text.primary },
  streakLabel: { fontSize: 14, color: colors.text.muted },
  streakMessage: { fontSize: 14, color: colors.success, marginTop: 8 },
  recentActivityCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 20 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.cardLight },
  activityEmoji: { fontSize: 20, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 14, color: colors.text.primary },
  activityDate: { fontSize: 11, color: colors.text.muted },
  activityStars: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  // Share Button Styles
  shareButton: { backgroundColor: colors.card, borderRadius: 12, padding: 14, alignItems: 'center', marginVertical: 12, borderWidth: 1, borderColor: colors.primary[400] },
  shareButtonText: { color: colors.primary[400], fontSize: 15, fontWeight: '600' },
  
  // ============================================
  // LEVEL SYSTEM STYLES
  // ============================================
  levelCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelEmoji: { fontSize: 36, marginRight: 12 },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 20, fontWeight: '700' },
  levelSubtitle: { fontSize: 12, color: colors.text.muted },
  levelNextBadge: { backgroundColor: colors.cardLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelNextText: { fontSize: 12, color: colors.text.secondary },
  levelProgressBar: { height: 8, backgroundColor: colors.cardLight, borderRadius: 4, overflow: 'hidden' },
  levelProgressFill: { height: '100%', borderRadius: 4 },
  levelProgressText: { fontSize: 11, color: colors.text.muted, marginTop: 6, textAlign: 'center' },
  levelMotivatorText: { fontSize: 12, color: colors.text.secondary, marginTop: 8, textAlign: 'center' },

  // ============================================
  // WEEKLY GOALS STYLES
  // ============================================
  weeklyProgressContainer: { alignItems: 'center', marginBottom: 20 },
  weeklyProgressBar: { width: '100%', height: 10, backgroundColor: colors.cardLight, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  weeklyProgressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 5 },
  weeklyProgressText: { fontSize: 14, color: colors.text.secondary },
  goalCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  goalCardCompleted: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  goalEmoji: { fontSize: 28, marginRight: 12 },
  goalInfo: { flex: 1 },
  goalDescription: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 6 },
  goalProgressRow: { flexDirection: 'row', alignItems: 'center' },
  goalMiniProgress: { flex: 1, height: 6, backgroundColor: colors.cardLight, borderRadius: 3, overflow: 'hidden', marginRight: 8 },
  goalMiniProgressFill: { height: '100%', backgroundColor: colors.primary[500], borderRadius: 3 },
  goalProgressText: { fontSize: 12, color: colors.text.muted, minWidth: 40 },
  goalReward: { backgroundColor: colors.gold + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  goalRewardText: { fontSize: 12, color: colors.gold, fontWeight: '600' },
  allGoalsComplete: { alignItems: 'center', paddingVertical: 20 },
  allGoalsCompleteEmoji: { fontSize: 48, marginBottom: 8 },
  allGoalsCompleteText: { fontSize: 16, color: colors.success, fontWeight: '600' },
  weeklyGoalsPreview: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  weeklyGoalsPreviewTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary, flex: 1 },
  weeklyGoalsPreviewProgress: { flexDirection: 'row', marginRight: 10 },
  weeklyGoalDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cardLight, marginHorizontal: 2 },
  weeklyGoalDotComplete: { backgroundColor: colors.success },
  weeklyGoalsPreviewText: { fontSize: 12, color: colors.text.muted },
  weeklyRecapCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 14 },
  weeklyRecapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  weeklyRecapTitle: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  weeklyRecapAction: { fontSize: 12, color: colors.primary[400], fontWeight: '700' },
  weeklyRecapSubtitle: { fontSize: 12, color: colors.text.muted, marginBottom: 10 },
  weeklyRecapStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weeklyRecapStat: { flex: 1, alignItems: 'center' },
  weeklyRecapValue: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  weeklyRecapLabel: { fontSize: 11, color: colors.text.muted, marginTop: 2, textAlign: 'center' },

  // ============================================
  // DAILY BONUS STYLES
  // ============================================
  dailyBonusContent: { backgroundColor: colors.background.primary, borderRadius: 24, padding: 32, alignItems: 'center', width: '85%', maxWidth: 320 },
  dailyBonusEmoji: { fontSize: 72, marginBottom: 16 },
  dailyBonusTitle: { fontSize: 28, fontWeight: '700', color: colors.gold, marginBottom: 8 },
  dailyBonusSubtitle: { fontSize: 16, color: colors.text.secondary, marginBottom: 24, textAlign: 'center' },
  dailyBonusButton: { borderRadius: 25, overflow: 'hidden', width: '100%' },
  dailyBonusButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  dailyBonusButtonText: { color: colors.textDark, fontSize: 16, fontWeight: '700' },

  // ============================================
  // LEVEL UP STYLES
  // ============================================
  levelUpContent: { backgroundColor: colors.background.primary, borderRadius: 24, padding: 32, alignItems: 'center', width: '85%', maxWidth: 320 },
  levelUpEmoji: { fontSize: 80, marginBottom: 16 },
  levelUpTitle: { fontSize: 32, fontWeight: '700', color: colors.gold, marginBottom: 8 },
  levelUpNewLevel: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  levelUpSubtitle: { fontSize: 16, color: colors.text.secondary, marginBottom: 24 },

  // ============================================
  // MOOD PLAYLISTS STYLES
  // ============================================
  playlistCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  playlistCardActive: { borderWidth: 2, borderColor: colors.primary[500] },
  playlistEmojiBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  playlistEmoji: { fontSize: 24 },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
  playlistDescription: { fontSize: 13, color: colors.text.muted },
  playlistCheck: { fontSize: 20, color: colors.success, fontWeight: '700' },

  // ============================================
  // RECOMMENDATIONS STYLES
  // ============================================
  recSection: { marginBottom: 20 },
  recHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  recEmoji: { fontSize: 20, marginRight: 8 },
  recTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  recCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  recCardContent: { flex: 1 },
  recItemName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  recItemReason: { fontSize: 12, marginTop: 2 },
  recItemVibe: { fontSize: 12, color: colors.text.muted, flex: 2, marginHorizontal: 10 },
  recItemArrow: { fontSize: 16, color: colors.text.muted, marginLeft: 8 },
  recScoreBadge: { backgroundColor: colors.primary[500] + '30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  recScoreText: { fontSize: 11, fontWeight: '600', color: colors.primary[400] },
  noRecsContainer: { alignItems: 'center', paddingVertical: 40 },
  noRecsEmoji: { fontSize: 48, marginBottom: 16 },
  noRecsText: { fontSize: 14, color: colors.text.muted, textAlign: 'center' },
  noRecsSubtext: { fontSize: 12, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  
  // Smart Learning Preference Summary
  prefSummaryContainer: { padding: 12, borderRadius: 12, marginBottom: 16 },
  prefSummaryTitle: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  prefTagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  prefTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, marginBottom: 4 },
  prefTagText: { fontSize: 11, fontWeight: '500' },

  // ============================================
  // CONTENT TYPE TABS (5 tabs)
  // ============================================
  contentTypeSliderWrapper: { marginBottom: 14 },
  contentTypeSliderContent: { paddingRight: 20 },
  contentTypeSliderTab: {
    minWidth: 132,
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentTypeSliderTabActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[400] },
  contentTypeSliderTabText: { fontSize: 15, lineHeight: 19, color: colors.white, fontWeight: '700', textAlign: 'center' },
  contentTypeSliderTabTextActive: { color: colors.white },

  // ============================================
  // INTENSITY BADGE (for roleplay cards)
  // ============================================
  intensityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  intensityText: { fontSize: 10, fontWeight: '600' },

  // ============================================
  // SEASONAL STYLES
  // ============================================
  seasonalTipsCard: { borderRadius: 12, padding: 16, marginBottom: 20 },
  seasonalTipsTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 10 },
  seasonalTip: { fontSize: 14, color: colors.text.secondary, marginBottom: 6, paddingLeft: 4 },
  seasonalSectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 10, marginTop: 10 },
  seasonalItemCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  seasonalItemEmoji: { fontSize: 24, marginRight: 12 },
  seasonalItemInfo: { flex: 1 },
  seasonalItemName: { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  seasonalItemVibe: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  seasonalItemArrow: { fontSize: 16, color: colors.text.muted },
  seasonalGamePill: { backgroundColor: colors.primary[500] + '35', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  seasonalGamePillText: { color: colors.primary[400], fontSize: 12, fontWeight: '700' },
  seasonalEmptyText: { fontSize: 13, color: colors.text.muted, marginBottom: 8 },

  // ============================================
  // SEASONAL CARD (Home Screen)
  // ============================================
  seasonalCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2 },
  seasonalCardEmoji: { fontSize: 36, marginRight: 14 },
  seasonalCardInfo: { flex: 1 },
  seasonalCardTitle: { fontSize: 18, fontWeight: '700' },
  seasonalCardSubtitle: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
  seasonalCardHook: { fontSize: 12, color: colors.text.secondary, marginTop: 4, lineHeight: 16 },
  seasonalCardArrow: { fontSize: 20, color: colors.text.muted },

  // ============================================
  // TRUTH OR DARE STYLES
  // ============================================
  intensitySelector: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  intensityOption: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: colors.card, margin: 4, backgroundColor: colors.card },
  intensityOptionText: { fontSize: 13, color: colors.text.secondary },
  todCard: { borderRadius: 16, padding: 24, borderWidth: 2, marginBottom: 24, minHeight: 150, justifyContent: 'center' },
  todCardType: { fontSize: 14, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  todCardText: { fontSize: 18, color: colors.text.primary, textAlign: 'center', lineHeight: 26 },
  todPlaceholder: { backgroundColor: colors.card, borderRadius: 16, padding: 40, alignItems: 'center', marginBottom: 24 },
  todPlaceholderEmoji: { fontSize: 48, marginBottom: 12 },
  todPlaceholderText: { fontSize: 14, color: colors.text.muted, textAlign: 'center' },
  todButtonsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  todButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 25, marginHorizontal: 8 },
  todButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  todRandomButton: { borderRadius: 25, overflow: 'hidden' },
  todRandomGradient: { paddingHorizontal: 40, paddingVertical: 14, alignItems: 'center' },
  todRandomText: { color: colors.white, fontSize: 16, fontWeight: '600' },

  // ============================================
  // MUSIC PLAYLISTS STYLES
  // ============================================
  musicPlaylistCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 12 },
  musicPlaylistName: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
  musicPlaylistDesc: { fontSize: 13, color: colors.text.muted, marginBottom: 12 },
  musicButtonsRow: { flexDirection: 'row' },
  musicButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  musicButtonText: { color: colors.white, fontSize: 13, fontWeight: '600' },

  // ============================================
  // SETTINGS STYLES
  // ============================================
  settingsSectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text.muted, marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 8 },
  settingsItemText: { fontSize: 15, color: colors.text.primary },
  settingsItemValue: { fontSize: 14, color: colors.text.muted },
  languageDropdown: { backgroundColor: colors.card, borderRadius: 12, padding: 8, marginBottom: 12 },
  languageOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  languageOptionActive: { backgroundColor: colors.primary[500] + '25' },
  languageOptionText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  languageOptionTextActive: { color: colors.primary[400], fontWeight: '700' },
  languageOptionCheck: { color: colors.primary[400], fontSize: 14, fontWeight: '700' },
  quickLanguageSwitcher: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardLight,
    padding: 4,
    marginBottom: 16,
  },
  quickLanguageSwitcherCompact: {
    alignSelf: 'flex-start',
    marginBottom: 0,
    marginTop: 10,
  },
  quickLanguageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLanguageButtonActive: {
    backgroundColor: colors.primary[500] + '25',
  },
  quickLanguageButtonText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  quickLanguageButtonTextActive: {
    color: colors.primary[400],
  },
  pinSetupContainer: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8 },
  pinSetupTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 16, textAlign: 'center' },
  pinInput: { backgroundColor: colors.cardLight, borderRadius: 8, padding: 14, fontSize: 18, color: colors.text.primary, textAlign: 'center', marginBottom: 12, letterSpacing: 8 },
  pinError: { color: colors.error, fontSize: 13, textAlign: 'center', marginBottom: 12 },
  pinButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pinCancelButton: { flex: 1, padding: 12, marginRight: 8, borderRadius: 8, backgroundColor: colors.cardLight, alignItems: 'center' },
  pinCancelText: { color: colors.text.muted, fontSize: 14 },
  pinSaveButton: { flex: 1, padding: 12, marginLeft: 8, borderRadius: 8, backgroundColor: colors.primary[500], alignItems: 'center' },
  pinSaveText: { color: colors.white, fontSize: 14, fontWeight: '600' },

  // ============================================
  // LEGAL/TERMS STYLES
  // ============================================
  legalTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  legalDate: { fontSize: 12, color: colors.text.muted, marginBottom: 20 },
  legalSection: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 16, marginBottom: 8 },
  legalText: { fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 8 },

  // ============================================
  // CONTACT/IDEAS STYLES
  // ============================================
  contactInput: { backgroundColor: colors.card, borderRadius: 12, padding: 16, fontSize: 15, color: colors.text.primary, marginBottom: 12 },
  contactTextarea: { minHeight: 120, textAlignVertical: 'top' },
  contactSendButton: { borderRadius: 25, overflow: 'hidden', marginTop: 8 },
  contactSendGradient: { paddingVertical: 16, alignItems: 'center' },
  contactSendText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  contactPrivacyNote: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 16 },
  contactCategoryRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  contactCategoryButton: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.card, marginHorizontal: 6 },
  contactCategoryButtonActive: { backgroundColor: colors.primary[500] + '30', borderWidth: 1, borderColor: colors.primary[500] },
  contactCategoryEmoji: { fontSize: 20, marginBottom: 2 },
  contactCategoryText: { fontSize: 11, color: colors.text.muted },
  contactCategoryTextActive: { color: colors.primary[400] },
  ideaTypeRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  ideaTypeButton: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.card, marginHorizontal: 6 },
  ideaTypeButtonActive: { backgroundColor: colors.primary[500] + '30', borderWidth: 1, borderColor: colors.primary[500] },
  ideaTypeEmoji: { fontSize: 24, marginBottom: 4 },
  ideaTypeText: { fontSize: 12, color: colors.text.muted },
  ideaTypeTextActive: { color: colors.primary[400] },
  
  // Success state
  successContainer: { alignItems: 'center', paddingVertical: 40 },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  successText: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  successButton: { backgroundColor: colors.primary[500], paddingHorizontal: 40, paddingVertical: 14, borderRadius: 25 },
  successButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },

  // ============================================
  // APP LOCK SCREEN STYLES
  // ============================================
  lockScreenContainer: { flex: 1 },
  lockScreenContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  lockScreenTitle: { fontSize: 32, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  lockScreenSubtitle: { fontSize: 16, color: colors.text.muted, marginBottom: 40 },
  pinDotsRow: { flexDirection: 'row', marginBottom: 20 },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.text.muted, marginHorizontal: 8 },
  pinDotFilled: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  lockScreenError: { color: colors.error, fontSize: 14, marginBottom: 20 },
  numPad: { width: '100%', maxWidth: 280 },
  numPadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  numPadButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
  numPadText: { fontSize: 28, color: colors.text.primary },

  // ============================================
  // PROFILE EXTRAS
  // ============================================
  profileLevel: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  profileEmail: { fontSize: 12, marginTop: 2 },
  pinProtectedBadge: { fontSize: 12, color: colors.success, marginTop: 8 },
  legendaryBadge: { marginTop: 8, backgroundColor: 'rgba(212, 165, 116, 0.18)', borderWidth: 1, borderColor: 'rgba(212, 165, 116, 0.42)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  legendaryBadgeText: { fontSize: 12, fontWeight: '700', color: colors.gold },
  menuItemArrow: { fontSize: 16, color: colors.text.muted },
  logoutMenuItem: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.card, paddingTop: 16 },
  versionText: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 20, marginBottom: 40 },

  // ============================================
  // AUTH SCREEN STYLES
  // ============================================
  authScrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  authHeader: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  authLogo: { fontSize: 64, marginBottom: 16 },
  authTitle: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  authSubtitle: { fontSize: 15, textAlign: 'center' },
  authTeaser: { marginTop: 8, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 320 },
  authPersonalNote: { marginTop: 10, fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 320, fontWeight: '600' },
  authErrorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: 12, borderRadius: 12, marginBottom: 16 },
  authErrorText: { color: colors.error, fontSize: 14, textAlign: 'center' },
  authInputContainer: { marginBottom: 16 },
  authInputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  authInput: { borderRadius: 12, padding: 16, fontSize: 16 },
  authPasswordContainer: { position: 'relative' },
  authPasswordInput: { paddingRight: 50 },
  authPasswordToggle: { position: 'absolute', right: 16, top: 16 },
  authForgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  authForgotPasswordText: { fontSize: 14 },
  authButton: { borderRadius: 25, overflow: 'hidden', marginBottom: 16 },
  authButtonDisabled: { opacity: 0.7 },
  authButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  authButtonText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  authDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  authDividerLine: { flex: 1, height: 1 },
  authDividerText: { paddingHorizontal: 16, fontSize: 14 },
  appleButton: { backgroundColor: colors.black, borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  appleButtonText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  authSwitchContainer: { alignItems: 'center', marginTop: 16 },
  authSwitchText: { fontSize: 15 },

  // ============================================
  // THEME SELECTOR STYLES
  // ============================================
  themeSelectorContainer: { marginBottom: 16 },
  themeSelectorLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12, color: colors.text.primary },
  themeSelectorScroll: { marginHorizontal: -8 },
  themeOption: { width: 100, padding: 12, borderRadius: 12, marginHorizontal: 6, alignItems: 'center' },
  themeColorPreview: { width: 40, height: 40, borderRadius: 20, marginBottom: 8 },
  themeEmoji: { fontSize: 20, marginBottom: 4 },
  themeName: { fontSize: 11, textAlign: 'center' },
  themeSelectedBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  themeSelectedText: { color: colors.white, fontSize: 10, fontWeight: '700' },

  // ============================================
  // FONT SIZE SELECTOR STYLES
  // ============================================
  fontSelectorContainer: { marginBottom: 16 },
  fontSizeOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  fontSizeOption: { flex: 1, padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center', borderWidth: 2 },
  fontSizePreview: { fontWeight: '600', marginBottom: 4 },
  fontSizeLabel: { fontSize: 12 },

  // ============================================
  // ANIMATION STYLES
  // ============================================
  confettiContainer: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  pulseHeartContainer: { alignItems: 'center', justifyContent: 'center' },

  // ============================================
  // ENHANCED LEGAL SCREEN STYLES
  // ============================================
  legalCheckSection: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  legalCheckHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  legalCheckTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
  legalCheckSummary: { fontSize: 13, color: colors.text.muted, lineHeight: 20, marginBottom: 12 },
  readButton: { backgroundColor: colors.primary[500] + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  readButtonText: { fontSize: 12, color: colors.primary[400], fontWeight: '600' },
  legalHint: { fontSize: 12, color: colors.text.muted, textAlign: 'center', marginTop: 8 },
  legalHighlightBox: { backgroundColor: colors.primary[500] + '15', borderLeftWidth: 4, borderLeftColor: colors.primary[500], borderRadius: 8, padding: 16 },
  legalHighlightTitle: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  legalHighlightTextSmall: { fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
  scrollHint: { alignItems: 'center', paddingVertical: 16 },
  scrollHintText: { fontSize: 13, color: colors.primary[400] },
  legalConfirmButton: { backgroundColor: colors.primary[500], paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginTop: 12 },
  legalConfirmButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});

