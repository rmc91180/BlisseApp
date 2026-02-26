import React, { useEffect, useState, type ComponentType } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { useThemeStore, getThemeColors, colors } from '@/store/useThemeStore';
import { useAuth } from '@/services/auth';

type ScreenComponent = ComponentType<any>;

export interface AppNavigatorScreens {
  AuthScreen: ScreenComponent;
  HomeScreen: ScreenComponent;
  ExploreScreen: ScreenComponent;
  FavoritesScreen: ScreenComponent;
  ProfileScreen: ScreenComponent;
  PositionDetailScreen: ScreenComponent;
  ForeplayDetailScreen: ScreenComponent;
  OralDetailScreen: ScreenComponent;
  MassageDetailScreen: ScreenComponent;
  RolePlayDetailScreen: ScreenComponent;
  WelcomeScreen: ScreenComponent;
  NameInputScreen: ScreenComponent;
  RelationshipTypeScreen: ScreenComponent;
  PreferencesScreen: ScreenComponent;
  ExperienceLevelScreen: ScreenComponent;
  LegalScreen: ScreenComponent;
  SignInScreen: ScreenComponent;
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ screens }: { screens: AppNavigatorScreens }) {
  const { t } = useI18n();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.card,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.text.muted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={screens.HomeScreen}
        options={{ tabBarLabel: t('tabs.home'), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Explore"
        component={screens.ExploreScreen}
        options={{ tabBarLabel: t('tabs.explore'), tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Favorites"
        component={screens.FavoritesScreen}
        options={{ tabBarLabel: t('tabs.favorites'), tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={screens.ProfileScreen}
        options={{ tabBarLabel: t('tabs.profile'), tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

function OnboardingStack({ screens }: { screens: AppNavigatorScreens }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={screens.WelcomeScreen} />
      <Stack.Screen name="NameInput" component={screens.NameInputScreen} />
      <Stack.Screen name="RelationshipType" component={screens.RelationshipTypeScreen} />
      <Stack.Screen name="Preferences" component={screens.PreferencesScreen} />
      <Stack.Screen name="ExperienceLevel" component={screens.ExperienceLevelScreen} />
      <Stack.Screen name="Legal" component={screens.LegalScreen} />
      <Stack.Screen name="SignIn" component={screens.SignInScreen} />
    </Stack.Navigator>
  );
}

export function RootAppNavigator({ screens }: { screens: AppNavigatorScreens }) {
  const { t } = useI18n();
  const store = useStore();
  const { user, loading: authLoading, initError } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌸</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 28, fontWeight: '700' }}>Blisse</Text>
        <Text style={{ color: themeColors.text.secondary, fontSize: 14, marginTop: 8 }}>{t('common.loading')}</Text>
        <ActivityIndicator color={themeColors.primary[500]} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 44, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>{t('app.auth_unavailable')}</Text>
        <Text style={{ color: themeColors.text.secondary, fontSize: 14, textAlign: 'center' }}>{initError}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={screens.AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (!store.hasCompletedOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {() => <OnboardingStack screens={screens} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <MainTabs screens={screens} />}
      </Stack.Screen>
      <Stack.Screen name="PositionDetail" component={screens.PositionDetailScreen} />
      <Stack.Screen name="ForeplayDetail" component={screens.ForeplayDetailScreen} />
      <Stack.Screen name="OralDetail" component={screens.OralDetailScreen} />
      <Stack.Screen name="MassageDetail" component={screens.MassageDetailScreen} />
      <Stack.Screen name="RolePlayDetail" component={screens.RolePlayDetailScreen} />
    </Stack.Navigator>
  );
}

