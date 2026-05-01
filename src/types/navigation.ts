import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Root Stack (all screens)
export type RootStackParamList = {
  // Auth
  Auth: undefined;

  // Onboarding
  Onboarding: undefined;
  Welcome: undefined;
  NameInput: undefined;
  RelationshipType: undefined;
  Preferences: undefined;
  ExperienceLevel: undefined;
  Legal: undefined;
  SignIn: undefined;

  // Main App
  MainTabs: undefined;

  // Content Detail Screens (pass full item objects)
  PositionDetail: { position: any };
  ForeplayDetail: { item: any };
  OralDetail: { item: any };
  MassageDetail: { item: any };
  RolePlayDetail: { item: any };
};

// Bottom Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Profile: undefined;
};

// Navigation prop type
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
