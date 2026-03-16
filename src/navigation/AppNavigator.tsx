import React, { useEffect, useState, type ComponentType } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { useThemeStore, getThemeColors, colors } from '@/store/useThemeStore';
import { useAuth } from '@/services/auth';
import { useSubscription } from '@/services/subscription';
import type { PurchasesPackage } from 'react-native-purchases';

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

const formatIntroPeriod = (periodNumberOfUnits: number, periodUnit: string, language: 'en' | 'es' | 'pt'): string => {
  const unit = periodUnit.toUpperCase();
  const plural = periodNumberOfUnits > 1;

  if (language === 'es') {
    if (unit === 'DAY') return `${periodNumberOfUnits} ${plural ? 'días' : 'día'}`;
    if (unit === 'WEEK') return `${periodNumberOfUnits} ${plural ? 'semanas' : 'semana'}`;
    if (unit === 'MONTH') return `${periodNumberOfUnits} ${plural ? 'meses' : 'mes'}`;
    if (unit === 'YEAR') return `${periodNumberOfUnits} ${plural ? 'años' : 'año'}`;
    return `${periodNumberOfUnits}`;
  }

  if (language === 'pt') {
    if (unit === 'DAY') return `${periodNumberOfUnits} ${plural ? 'dias' : 'dia'}`;
    if (unit === 'WEEK') return `${periodNumberOfUnits} ${plural ? 'semanas' : 'semana'}`;
    if (unit === 'MONTH') return `${periodNumberOfUnits} ${plural ? 'meses' : 'mês'}`;
    if (unit === 'YEAR') return `${periodNumberOfUnits} ${plural ? 'anos' : 'ano'}`;
    return `${periodNumberOfUnits}`;
  }

  if (unit === 'DAY') return `${periodNumberOfUnits} day${plural ? 's' : ''}`;
  if (unit === 'WEEK') return `${periodNumberOfUnits} week${plural ? 's' : ''}`;
  if (unit === 'MONTH') return `${periodNumberOfUnits} month${plural ? 's' : ''}`;
  if (unit === 'YEAR') return `${periodNumberOfUnits} year${plural ? 's' : ''}`;
  return `${periodNumberOfUnits}`;
};

function SubscriptionPaywallScreen() {
  const language = useStore((state) => state.language);
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const {
    offerings,
    loading,
    actionError,
    purchase,
    restore,
    refresh,
  } = useSubscription();

  const copy = {
    en: {
      title: 'Unlock Blisse',
      subtitle: 'Start your premium access to all experiences, games, and personalized recommendations.',
      restore: 'Restore Purchases',
      retry: 'Retry',
      freeTrialBadge: 'Free trial available',
      freeTrialThen: 'Then {price}',
      introOfferBadge: 'Intro offer available',
      noPlans: 'Plans are loading. Please wait a moment or retry.',
      legal: 'Subscriptions renew automatically unless canceled in App Store settings.',
      purchaseError: 'Purchase failed',
      restoreSuccess: 'Restore complete',
      restoreFound: 'Your subscription was restored.',
      restoreMissing: 'No active subscription found.',
      checkingSubscription: 'Checking subscription...',
      billingUnavailableTitle: 'Billing unavailable',
    },
    es: {
      title: 'Desbloquea Blisse',
      subtitle: 'Activa el acceso premium a todas las experiencias, juegos y recomendaciones personalizadas.',
      restore: 'Restaurar compras',
      retry: 'Reintentar',
      freeTrialBadge: 'Prueba gratis disponible',
      freeTrialThen: 'Luego {price}',
      introOfferBadge: 'Oferta de introducción disponible',
      noPlans: 'Estamos cargando los planes. Espera un momento o vuelve a intentar.',
      legal: 'Las suscripciones se renuevan automáticamente hasta que las canceles en App Store.',
      purchaseError: 'No se pudo completar la compra',
      restoreSuccess: 'Restauración completada',
      restoreFound: 'Tu suscripción fue restaurada.',
      restoreMissing: 'No encontramos una suscripción activa.',
      checkingSubscription: 'Comprobando la suscripción...',
      billingUnavailableTitle: 'Facturación no disponible',
    },
    pt: {
      title: 'Desbloqueie o Blisse',
      subtitle: 'Ative o acesso premium para todas as experiências, jogos e recomendações personalizadas.',
      restore: 'Restaurar compras',
      retry: 'Tentar novamente',
      freeTrialBadge: 'Teste grátis disponível',
      freeTrialThen: 'Depois {price}',
      introOfferBadge: 'Oferta de introdução disponível',
      noPlans: 'Estamos carregando os planos. Aguarde um momento ou tente novamente.',
      legal: 'As assinaturas renovam automaticamente até serem canceladas na App Store.',
      purchaseError: 'Não foi possível concluir a compra',
      restoreSuccess: 'Restauração concluída',
      restoreFound: 'Sua assinatura foi restaurada.',
      restoreMissing: 'Não encontramos assinatura ativa.',
      checkingSubscription: 'Verificando assinatura...',
      billingUnavailableTitle: 'Cobrança indisponível',
    },
  } as const;

  const i18n = copy[language] ?? copy.en;

  const onPurchase = async (pkg: PurchasesPackage) => {
    try {
      await purchase(pkg);
    } catch {
      Alert.alert(i18n.purchaseError);
    }
  };

  const onRestore = async () => {
    try {
      const restored = await restore();
      if (restored) {
        Alert.alert(i18n.restoreSuccess, i18n.restoreFound);
        return;
      }
      Alert.alert(i18n.restoreSuccess, i18n.restoreMissing);
    } catch {
      Alert.alert(i18n.purchaseError);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.background.primary }}
      contentContainerStyle={{ padding: 20, paddingTop: 80, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: themeColors.text.primary, fontSize: 34, fontWeight: '800', marginBottom: 10 }}>🌸</Text>
      <Text style={{ color: themeColors.text.primary, fontSize: 30, fontWeight: '700', marginBottom: 8 }}>{i18n.title}</Text>
      <Text style={{ color: themeColors.text.secondary, fontSize: 15, lineHeight: 22, marginBottom: 20 }}>{i18n.subtitle}</Text>

      {offerings.length === 0 ? (
        <View style={{ backgroundColor: themeColors.card, borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <Text style={{ color: themeColors.text.muted, fontSize: 14 }}>{i18n.noPlans}</Text>
          <TouchableOpacity
            onPress={() => void refresh()}
            style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: themeColors.primary[500], paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}
          >
            <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>{i18n.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        offerings.map((pkg) => (
          (() => {
            const intro = pkg.product.introPrice;
            const hasIntro = Boolean(intro);
            const hasFreeTrial = Boolean(intro && intro.price === 0);
            const introDuration = intro
              ? formatIntroPeriod(intro.periodNumberOfUnits, intro.periodUnit, language)
              : null;

            return (
          <TouchableOpacity
            key={pkg.identifier}
            onPress={() => void onPurchase(pkg)}
            disabled={loading}
            style={{
              backgroundColor: themeColors.card,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: themeColors.cardLight,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: themeColors.text.primary, fontSize: 17, fontWeight: '700' }}>{pkg.product.title}</Text>
            <Text style={{ color: themeColors.text.secondary, fontSize: 13, marginTop: 4 }}>{pkg.product.description}</Text>
            {hasFreeTrial && introDuration ? (
              <Text style={{ color: themeColors.success, fontSize: 13, marginTop: 8, fontWeight: '700' }}>
                {`${i18n.freeTrialBadge} - ${introDuration}. ${i18n.freeTrialThen.replace('{price}', pkg.product.priceString)}`}
              </Text>
            ) : hasIntro && intro ? (
              <Text style={{ color: themeColors.success, fontSize: 13, marginTop: 8, fontWeight: '700' }}>
                {`${i18n.introOfferBadge}: ${intro.priceString}`}
              </Text>
            ) : null}
            <Text style={{ color: themeColors.primary[400], fontSize: 16, fontWeight: '700', marginTop: 10 }}>{pkg.product.priceString}</Text>
          </TouchableOpacity>
            );
          })()
        ))
      )}

      {actionError ? <Text style={{ color: themeColors.error, fontSize: 13, marginBottom: 12 }}>{actionError}</Text> : null}

      <TouchableOpacity
        onPress={() => void onRestore()}
        disabled={loading}
        style={{ backgroundColor: themeColors.cardLight, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 }}
      >
        <Text style={{ color: themeColors.text.primary, fontSize: 15, fontWeight: '600' }}>{i18n.restore}</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator color={themeColors.primary[500]} style={{ marginTop: 14 }} /> : null}
      <Text style={{ color: themeColors.text.muted, fontSize: 12, lineHeight: 18, marginTop: 14 }}>{i18n.legal}</Text>
    </ScrollView>
  );
}

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
  const reviewerBypassEmail = (process.env.EXPO_PUBLIC_REVIEW_BYPASS_EMAIL || '').trim().toLowerCase();
  const isReviewerBypassUser =
    Boolean(reviewerBypassEmail) &&
    Boolean(user?.email) &&
    user!.email!.trim().toLowerCase() === reviewerBypassEmail;
  const {
    enabled: billingEnabled,
    required: billingRequired,
    ready: billingReady,
    loading: billingLoading,
    hasActiveEntitlement,
    configError: billingConfigError,
    refresh: refreshBilling,
  } = useSubscription();
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

  if (billingRequired && !billingReady && !isReviewerBypassUser) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 44, marginBottom: 12 }}>💳</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 22, fontWeight: '700' }}>{t('app.checking_subscription')}</Text>
        <ActivityIndicator color={themeColors.primary[500]} style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (billingRequired && billingConfigError && !isReviewerBypassUser) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 44, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          {t('app.billing_unavailable')}
        </Text>
        <Text style={{ color: themeColors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
          {billingConfigError}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: themeColors.primary[500], paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}
          onPress={() => void refreshBilling()}
        >
          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (billingEnabled && !billingLoading && !hasActiveEntitlement && !isReviewerBypassUser) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Paywall" component={SubscriptionPaywallScreen} />
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
