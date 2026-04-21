import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '@/hooks/useI18n';
import { getVoiceCopy, pickVoiceLine } from '@/copy';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { language } = useI18n();
  const voice = getVoiceCopy(language);
  const primaryCta = pickVoiceLine(voice.entry.primaryCTA, `welcome-primary-${language}`);

  return (
    <LinearGradient
      colors={['#1A0F24', '#2D1B3D']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#FFFAF0', '#FFB6A3', '#D4818F', '#8B4A6B', '#4A2C5A']}
            style={styles.bloom}
          >
            <View style={styles.bloomCore} />
          </LinearGradient>
        </View>

        {/* Text Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{voice.labels.brandName}</Text>
          <Text style={styles.subtitle}>
            {voice.onboarding.welcomeSubtitle}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NameInput' as never)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#a855f7', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{primaryCta}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignIn' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {voice.onboarding.welcomeExisting}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloom: {
    width: 140,
    height: 180,
    borderRadius: 70,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  bloomCore: {
    width: 24,
    height: 18,
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 52,
    color: '#FFF8E7',
    marginBottom: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#E8A4B8',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttons: {
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E8A4B8',
    fontSize: 16,
  },
});
