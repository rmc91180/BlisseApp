import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Root Stack (all screens)
export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  NameInput: undefined;
  RelationshipType: undefined;
  Preferences: undefined;
  ExperienceLevel: undefined;
  MoodSelection: undefined;
  Legal: undefined;
  CreateAccount: undefined;
  SignIn: undefined;

  // Main App
  MainTabs: undefined;

  // Content Screens
  PositionDetail: { id: number };
  ForeplayDetail: { id: number };
  CategoryList: { category: string; title: string };
  MoodList: { mood: string; title: string };
  SearchResults: { query: string };

  // Features
  SessionBuilder: undefined;
  Journey: undefined;
  Settings: undefined;
  EditPreferences: undefined;
  Language: undefined;
  SubmitIdea: undefined;
};

// Bottom Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Favorites: undefined;
  Profile: undefined;
};

// Navigation prop type
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;