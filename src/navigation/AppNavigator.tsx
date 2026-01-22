import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackParamList, MainTabParamList } from '@/types/navigation';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors } from '@/constants/theme';

// Import screens
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';

// Placeholder component for screens we haven't built yet
const PlaceholderScreen = ({ route }: { route: { name: string } }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{route.name}</Text>
    <Text style={styles.placeholderSubtext}>Coming soon...</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator (Home, Explore, Favorites, Profile)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.background.secondary,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>❤️</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { hasCompletedOnboarding } = usePreferencesStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'slide_from_right',
        }}
      >
        {!hasCompletedOnboarding ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="NameInput" component={PlaceholderScreen} />
            <Stack.Screen name="RelationshipType" component={PlaceholderScreen} />
            <Stack.Screen name="Preferences" component={PlaceholderScreen} />
            <Stack.Screen name="ExperienceLevel" component={PlaceholderScreen} />
            <Stack.Screen name="MoodSelection" component={PlaceholderScreen} />
            <Stack.Screen name="Legal" component={PlaceholderScreen} />
            <Stack.Screen name="CreateAccount" component={PlaceholderScreen} />
            <Stack.Screen name="SignIn" component={PlaceholderScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="PositionDetail" component={PlaceholderScreen} />
            <Stack.Screen name="ForeplayDetail" component={PlaceholderScreen} />
            <Stack.Screen name="CategoryList" component={PlaceholderScreen} />
            <Stack.Screen name="MoodList" component={PlaceholderScreen} />
            <Stack.Screen name="SessionBuilder" component={PlaceholderScreen} />
            <Stack.Screen name="Journey" component={PlaceholderScreen} />
            <Stack.Screen name="Settings" component={PlaceholderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});