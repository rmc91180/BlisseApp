import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Track loading steps
const loadingSteps: string[] = [];
const errors: string[] = [];

function log(message: string) {
  console.log(message);
  loadingSteps.push(`✓ ${message}`);
}

function logError(message: string, error?: any) {
  console.error(message, error);
  errors.push(`✗ ${message}: ${error?.message || error || 'Unknown error'}`);
}

// Step 1: Basic imports worked
log('Basic React Native imports loaded');

// Step 2: Try importing navigation
let NavigationContainer: any = null;
let createNativeStackNavigator: any = null;
let createBottomTabNavigator: any = null;
try {
  const nav = require('@react-navigation/native');
  NavigationContainer = nav.NavigationContainer;
  const stack = require('@react-navigation/native-stack');
  createNativeStackNavigator = stack.createNativeStackNavigator;
  const tabs = require('@react-navigation/bottom-tabs');
  createBottomTabNavigator = tabs.createBottomTabNavigator;
  log('Navigation imports loaded');
} catch (e) {
  logError('Navigation imports failed', e);
}

// Step 3: Try importing expo modules
try {
  require('expo-linear-gradient');
  log('expo-linear-gradient loaded');
} catch (e) {
  logError('expo-linear-gradient failed', e);
}

try {
  require('expo-av');
  log('expo-av loaded');
} catch (e) {
  logError('expo-av failed', e);
}

try {
  require('expo-linking');
  log('expo-linking loaded');
} catch (e) {
  logError('expo-linking failed', e);
}

try {
  require('expo-local-authentication');
  log('expo-local-authentication loaded');
} catch (e) {
  logError('expo-local-authentication failed', e);
}

try {
  require('expo-apple-authentication');
  log('expo-apple-authentication loaded');
} catch (e) {
  logError('expo-apple-authentication failed', e);
}

// Step 4: Try importing zustand
try {
  require('zustand');
  log('zustand loaded');
} catch (e) {
  logError('zustand failed', e);
}

// Step 5: Try importing AsyncStorage
try {
  require('@react-native-async-storage/async-storage');
  log('AsyncStorage loaded');
} catch (e) {
  logError('AsyncStorage failed', e);
}

// Step 6: Try importing Firebase
try {
  require('firebase/app');
  log('firebase/app loaded');
} catch (e) {
  logError('firebase/app failed', e);
}

try {
  require('firebase/auth');
  log('firebase/auth loaded');
} catch (e) {
  logError('firebase/auth failed', e);
}

// Step 7: Try importing PostHog
try {
  require('posthog-react-native');
  log('posthog-react-native loaded');
} catch (e) {
  logError('posthog-react-native failed', e);
}

// Step 8: Try importing content files
try {
  require('@/content/positions');
  log('@/content/positions loaded');
} catch (e) {
  logError('@/content/positions failed', e);
}

try {
  require('@/content/foreplay');
  log('@/content/foreplay loaded');
} catch (e) {
  logError('@/content/foreplay failed', e);
}

try {
  require('@/content/oralplay');
  log('@/content/oralplay loaded');
} catch (e) {
  logError('@/content/oralplay failed', e);
}

try {
  require('@/content/massage');
  log('@/content/massage loaded');
} catch (e) {
  logError('@/content/massage failed', e);
}

try {
  require('@/content/roleplay');
  log('@/content/roleplay loaded');
} catch (e) {
  logError('@/content/roleplay failed', e);
}

log('All imports attempted');

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure all logs are captured
    setTimeout(() => setReady(true), 100);
  }, []);

  const hasErrors = errors.length > 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>🔍 Blisse Diagnostic</Text>
          
          {hasErrors ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>❌ Errors Found:</Text>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>{error}</Text>
              ))}
            </View>
          ) : (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>✅ All imports successful!</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Loading Steps:</Text>
          {loadingSteps.map((step, index) => (
            <Text key={index} style={styles.stepText}>{step}</Text>
          ))}
        </ScrollView>
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0F24',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fca5a5',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#fecaca',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  successBox: {
    backgroundColor: '#14532d',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#86efac',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AAAAAA',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
});
