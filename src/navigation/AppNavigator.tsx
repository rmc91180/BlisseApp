import React, { useEffect, useMemo, useState, type ComponentType } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { useThemeStore, getThemeColors, colors } from '@/store/useThemeStore';
import { useAuth } from '@/services/auth';
import { useSubscription } from '@/services/subscription';
import { Analytics } from '@/services/analytics';
import { isReviewerBypassEmail } from '@/services/reviewerAccess';
import { getVoiceCopy } from '@/copy';
import type { AppLanguage } from '@/i18n/translations';
import type { PurchasesPackage } from 'react-native-purchases';

type ScreenComponent = ComponentType<any>;

export interface AppNavigatorScreens {
  AuthScreen: ScreenComponent;
  HomeScreen: ScreenComponent;
  ExploreScreen: ScreenComponent;
  FavoritesScreen: ScreenComponent;
  ProfileScreen: ScreenComponent;
  MoodCheckScreen: ScreenComponent;
  TonightSessionScreen: ScreenComponent;
  SessionRatingScreen: ScreenComponent;
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
  OnboardingPayoffScreen: ScreenComponent;
  SignInScreen: ScreenComponent;
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const getTodayKey = () => new Date().toISOString().split('T')[0];

const parseIso8601Period = (period: string | null): { count: number; unit: 'day' | 'week' | 'month' | 'year' } | null => {
  if (!period) return null;
  const match = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/i.exec(period);
  if (!match) return null;

  const year = Number(match[1] || 0);
  const month = Number(match[2] || 0);
  const week = Number(match[3] || 0);
  const day = Number(match[4] || 0);

  if (year) return { count: year, unit: 'year' };
  if (month) return { count: month, unit: 'month' };
  if (week) return { count: week, unit: 'week' };
  if (day) return { count: day, unit: 'day' };
  return null;
};

const formatIntroPeriod = (periodNumberOfUnits: number, periodUnit: string, language: AppLanguage): string => {
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

  if (language === 'hi') {
    if (unit === 'DAY') return `${periodNumberOfUnits} ${plural ? 'दिन' : 'दिन'}`;
    if (unit === 'WEEK') return `${periodNumberOfUnits} ${plural ? 'सप्ताह' : 'सप्ताह'}`;
    if (unit === 'MONTH') return `${periodNumberOfUnits} ${plural ? 'महीने' : 'महीना'}`;
    if (unit === 'YEAR') return `${periodNumberOfUnits} ${plural ? 'वर्ष' : 'वर्ष'}`;
    return `${periodNumberOfUnits}`;
  }

  if (unit === 'DAY') return `${periodNumberOfUnits} day${plural ? 's' : ''}`;
  if (unit === 'WEEK') return `${periodNumberOfUnits} week${plural ? 's' : ''}`;
  if (unit === 'MONTH') return `${periodNumberOfUnits} month${plural ? 's' : ''}`;
  if (unit === 'YEAR') return `${periodNumberOfUnits} year${plural ? 's' : ''}`;
  return `${periodNumberOfUnits}`;
};

const formatBillingPeriod = (
  count: number,
  unit: 'day' | 'week' | 'month' | 'year',
  language: AppLanguage,
  style: 'per' | 'every' = 'per'
): string => {
  const plural = count > 1;

  if (language === 'es') {
    const label =
      unit === 'day' ? (plural ? 'días' : 'día')
      : unit === 'week' ? (plural ? 'semanas' : 'semana')
      : unit === 'month' ? (plural ? 'meses' : 'mes')
      : (plural ? 'años' : 'año');

    if (style === 'per' && count === 1) {
      return unit === 'day' ? 'por día'
        : unit === 'week' ? 'por semana'
        : unit === 'month' ? 'por mes'
        : 'por año';
    }
    return `cada ${count} ${label}`;
  }

  if (language === 'pt') {
    const label =
      unit === 'day' ? (plural ? 'dias' : 'dia')
      : unit === 'week' ? (plural ? 'semanas' : 'semana')
      : unit === 'month' ? (plural ? 'meses' : 'mês')
      : (plural ? 'anos' : 'ano');

    if (style === 'per' && count === 1) {
      return unit === 'day' ? 'por dia'
        : unit === 'week' ? 'por semana'
        : unit === 'month' ? 'por mês'
        : 'por ano';
    }
    return `a cada ${count} ${label}`;
  }

  if (language === 'hi') {
    const label =
      unit === 'day' ? (plural ? 'दिन' : 'दिन')
      : unit === 'week' ? (plural ? 'सप्ताह' : 'सप्ताह')
      : unit === 'month' ? (plural ? 'महीने' : 'महीना')
      : (plural ? 'वर्ष' : 'वर्ष');

    if (style === 'per' && count === 1) {
      return unit === 'day' ? 'प्रति दिन'
        : unit === 'week' ? 'प्रति सप्ताह'
        : unit === 'month' ? 'प्रति माह'
        : 'प्रति वर्ष';
    }
    return `हर ${count} ${label}`;
  }

  const label =
    unit === 'day' ? `day${plural ? 's' : ''}`
    : unit === 'week' ? `week${plural ? 's' : ''}`
    : unit === 'month' ? `month${plural ? 's' : ''}`
    : `year${plural ? 's' : ''}`;

  if (style === 'per' && count === 1) {
    return unit === 'day' ? 'per day'
      : unit === 'week' ? 'per week'
      : unit === 'month' ? 'per month'
      : 'per year';
  }
  return `every ${count} ${label}`;
};

const getPlanName = (pkg: PurchasesPackage, language: AppLanguage): string => {
  const packageType = String(pkg.packageType || '').toUpperCase();

  const map = {
    en: {
      MONTHLY: 'Monthly',
      ANNUAL: 'Annual',
      WEEKLY: 'Weekly',
      LIFETIME: 'Lifetime',
      SIX_MONTH: '6 Months',
      THREE_MONTH: '3 Months',
      TWO_MONTH: '2 Months',
    },
    es: {
      MONTHLY: 'Mensual',
      ANNUAL: 'Anual',
      WEEKLY: 'Semanal',
      LIFETIME: 'De por vida',
      SIX_MONTH: '6 meses',
      THREE_MONTH: '3 meses',
      TWO_MONTH: '2 meses',
    },
    pt: {
      MONTHLY: 'Mensal',
      ANNUAL: 'Anual',
      WEEKLY: 'Semanal',
      LIFETIME: 'Vitalício',
      SIX_MONTH: '6 meses',
      THREE_MONTH: '3 meses',
      TWO_MONTH: '2 meses',
    },
    hi: {
      MONTHLY: 'मासिक',
      ANNUAL: 'वार्षिक',
      WEEKLY: 'साप्ताहिक',
      LIFETIME: 'आजीवन',
      SIX_MONTH: '6 महीने',
      THREE_MONTH: '3 महीने',
      TWO_MONTH: '2 महीने',
    },
  } as const;

  const localized = map[language] ?? map.en;
  if (packageType in localized) {
    return localized[packageType as keyof typeof localized];
  }

  const subscriptionPeriod = parseIso8601Period(pkg.product.subscriptionPeriod);
  if (subscriptionPeriod) {
    return formatBillingPeriod(subscriptionPeriod.count, subscriptionPeriod.unit, language, 'every');
  }

  return pkg.product.title;
};

const getPackageTypeKey = (pkg: PurchasesPackage) => String(pkg.packageType || '').toUpperCase();

const getPercentSavings = (monthlyPrice?: number, annualPrice?: number): number | null => {
  if (!monthlyPrice || !annualPrice || monthlyPrice <= 0 || annualPrice <= 0) return null;
  const yearlyMonthlyCost = monthlyPrice * 12;
  if (annualPrice >= yearlyMonthlyCost) return null;
  return Math.round(((yearlyMonthlyCost - annualPrice) / yearlyMonthlyCost) * 100);
};

function SubscriptionPaywallScreen({ route }: { route?: { params?: { trigger?: 'trial_expired' | 'manual' | 'banner' } } }) {
  const language = useStore((state) => state.language);
  const voice = getVoiceCopy(language);
  const themeStore = useThemeStore();
  const themeColors = getThemeColors(themeStore.currentTheme);
  const trigger = route?.params?.trigger === 'trial_expired' || route?.params?.trigger === 'banner' ? route.params.trigger : 'manual';
  const {
    offerings,
    loading,
    actionError,
    purchase,
    restore,
    refresh,
  } = useSubscription();

  useEffect(() => {
    Analytics.trackPaywallShown(trigger);
  }, [trigger]);

  const copy = {
    en: {
      title: voice.paywall.title,
      subtitle: voice.paywall.subtitle,
      restore: 'Restore Purchase',
      retry: 'Retry',
      freeTrialBadge: 'Free trial available',
      freeTrialThen: 'Then {price}',
      introOfferBadge: 'Intro offer available',
      noPlans: 'Plans are loading. Please wait a moment or retry.',
      legal: 'Subscriptions renew automatically unless canceled in App Store settings.',
      fullAccess: 'Full premium access for couples',
      monthlyHighlight: 'Most flexible',
      annualHighlight: 'Best value',
      lifetimeHighlight: 'One-time unlock',
      weeklyHighlight: 'Easy to try',
      recurringNote: 'Cancel anytime in your App Store settings.',
      lifetimeNote: 'Pay once and keep premium access.',
      saveVsMonthly: 'Save {percent}% vs monthly',
      billedEvery: 'Billed {period}',
      billedOnce: 'One-time purchase',
      purchaseError: 'Purchase failed',
      restoreSuccess: 'Restore complete',
      restoreFound: 'Your subscription was restored.',
      restoreMissing: 'No active subscription found.',
      checkingSubscription: 'Checking subscription...',
      billingUnavailableTitle: 'Billing unavailable',
      featureIdeas: voice.paywall.featureIdeas,
      featureChallenges: voice.paywall.featureChallenges,
      featurePrivacy: voice.paywall.featurePrivacy,
      primaryCta: voice.paywall.primaryCta,
      contact: voice.paywall.contact,
    },
    es: {
      title: voice.paywall.title,
      subtitle: voice.paywall.subtitle,
      restore: 'Restore Purchase',
      retry: 'Reintentar',
      freeTrialBadge: 'Prueba gratis disponible',
      freeTrialThen: 'Luego {price}',
      introOfferBadge: 'Oferta de introducción disponible',
      noPlans: 'Estamos cargando los planes. Espera un momento o vuelve a intentar.',
      legal: 'Las suscripciones se renuevan automáticamente hasta que las canceles en App Store.',
      fullAccess: 'Acceso premium completo para parejas',
      monthlyHighlight: 'La opción más flexible',
      annualHighlight: 'Mejor valor',
      lifetimeHighlight: 'Desbloqueo único',
      weeklyHighlight: 'Fácil de probar',
      recurringNote: 'Puedes cancelar cuando quieras desde App Store.',
      lifetimeNote: 'Pagas una vez y mantienes el acceso premium.',
      saveVsMonthly: 'Ahorra {percent}% frente al plan mensual',
      billedEvery: 'Cobro {period}',
      billedOnce: 'Pago único',
      purchaseError: 'No se pudo completar la compra',
      restoreSuccess: 'Restauración completada',
      restoreFound: 'Tu suscripción fue restaurada.',
      restoreMissing: 'No encontramos una suscripción activa.',
      checkingSubscription: 'Comprobando la suscripción...',
      billingUnavailableTitle: 'Facturación no disponible',
      featureIdeas: voice.paywall.featureIdeas,
      featureChallenges: voice.paywall.featureChallenges,
      featurePrivacy: voice.paywall.featurePrivacy,
      primaryCta: voice.paywall.primaryCta,
      contact: voice.paywall.contact,
    },
    pt: {
      title: voice.paywall.title,
      subtitle: voice.paywall.subtitle,
      restore: 'Restore Purchase',
      retry: 'Tentar novamente',
      freeTrialBadge: 'Teste grátis disponível',
      freeTrialThen: 'Depois {price}',
      introOfferBadge: 'Oferta de introdução disponível',
      noPlans: 'Estamos carregando os planos. Aguarde um momento ou tente novamente.',
      legal: 'As assinaturas renovam automaticamente até serem canceladas na App Store.',
      fullAccess: 'Acesso premium completo para casais',
      monthlyHighlight: 'Mais flexível',
      annualHighlight: 'Melhor valor',
      lifetimeHighlight: 'Desbloqueio único',
      weeklyHighlight: 'Fácil de experimentar',
      recurringNote: 'Cancele a qualquer momento na App Store.',
      lifetimeNote: 'Pague uma vez e mantenha o acesso premium.',
      saveVsMonthly: 'Economize {percent}% em relação ao mensal',
      billedEvery: 'Cobrança {period}',
      billedOnce: 'Pagamento único',
      purchaseError: 'Não foi possível concluir a compra',
      restoreSuccess: 'Restauração concluída',
      restoreFound: 'Sua assinatura foi restaurada.',
      restoreMissing: 'Não encontramos assinatura ativa.',
      checkingSubscription: 'Verificando assinatura...',
      billingUnavailableTitle: 'Cobrança indisponível',
      featureIdeas: voice.paywall.featureIdeas,
      featureChallenges: voice.paywall.featureChallenges,
      featurePrivacy: voice.paywall.featurePrivacy,
      primaryCta: voice.paywall.primaryCta,
      contact: voice.paywall.contact,
    },
    hi: {
      title: voice.paywall.title,
      subtitle: voice.paywall.subtitle,
      restore: 'Restore Purchase',
      retry: 'फिर से कोशिश करें',
      freeTrialBadge: 'मुफ़्त ट्रायल उपलब्ध',
      freeTrialThen: 'इसके बाद {price}',
      introOfferBadge: 'शुरुआती ऑफ़र उपलब्ध',
      noPlans: 'प्लान लोड हो रहे हैं। कृपया थोड़ी देर रुकें या फिर से कोशिश करें।',
      legal: 'सब्सक्रिप्शन अपने-आप नवीनीकृत होते हैं, जब तक आप उन्हें App Store सेटिंग्स में रद्द न करें।',
      fullAccess: 'कपल्स के लिए पूरा premium access',
      monthlyHighlight: 'सबसे लचीला',
      annualHighlight: 'सबसे अच्छा value',
      lifetimeHighlight: 'एक बार का unlock',
      weeklyHighlight: 'आसानी से आज़माएँ',
      recurringNote: 'आप App Store सेटिंग्स में कभी भी रद्द कर सकते हैं।',
      lifetimeNote: 'एक बार भुगतान करें और premium access बनाए रखें।',
      saveVsMonthly: 'मासिक की तुलना में {percent}% बचाएँ',
      billedEvery: 'बिलिंग {period}',
      billedOnce: 'एक बार का भुगतान',
      purchaseError: 'खरीद पूरी नहीं हो सकी',
      restoreSuccess: 'बहाली पूरी हुई',
      restoreFound: 'आपका subscription बहाल हो गया।',
      restoreMissing: 'कोई सक्रिय subscription नहीं मिला।',
      checkingSubscription: 'subscription जाँची जा रही है...',
      billingUnavailableTitle: 'बिलिंग उपलब्ध नहीं है',
      featureIdeas: voice.paywall.featureIdeas,
      featureChallenges: voice.paywall.featureChallenges,
      featurePrivacy: voice.paywall.featurePrivacy,
      primaryCta: voice.paywall.primaryCta,
      contact: voice.paywall.contact,
    },
  } as const;

  const i18n = copy[language] ?? copy.en;
  const monthlyPackage = offerings.find((pkg) => getPackageTypeKey(pkg) === 'MONTHLY');

  const onPurchase = async (pkg: PurchasesPackage) => {
    try {
      await purchase(pkg);
      Analytics.trackPaywallConverted(getPackageTypeKey(pkg) || pkg.identifier || 'unknown');
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
      <View style={{ marginBottom: 18, gap: 6 }}>
        <Text style={{ color: themeColors.text.primary, fontSize: 14, fontWeight: '600' }}>{i18n.featureIdeas}</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 14, fontWeight: '600' }}>{i18n.featureChallenges}</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 14, fontWeight: '600' }}>{i18n.featurePrivacy}</Text>
      </View>

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
            const billingPeriod = parseIso8601Period(pkg.product.subscriptionPeriod);
            const planName = getPlanName(pkg, language);
            const packageType = getPackageTypeKey(pkg);
            const savingsPercent = packageType === 'ANNUAL'
              ? getPercentSavings(monthlyPackage?.product.price, pkg.product.price)
              : null;
            const highlight = packageType === 'ANNUAL'
              ? i18n.annualHighlight
              : packageType === 'LIFETIME'
                ? i18n.lifetimeHighlight
                : packageType === 'WEEKLY'
                  ? i18n.weeklyHighlight
                  : i18n.monthlyHighlight;
            const billingCaption = billingPeriod
              ? i18n.billedEvery.replace('{period}', formatBillingPeriod(billingPeriod.count, billingPeriod.unit, language))
              : i18n.billedOnce;
            const renewalPrice = billingPeriod
              ? `${pkg.product.priceString} ${formatBillingPeriod(billingPeriod.count, billingPeriod.unit, language)}`
              : pkg.product.priceString;
            const planSupportCopy = packageType === 'LIFETIME' ? i18n.lifetimeNote : i18n.recurringNote;

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
            <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(168, 85, 247, 0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 }}>
              <Text style={{ color: themeColors.primary[400], fontSize: 11, fontWeight: '800', letterSpacing: 0.2 }}>{highlight}</Text>
            </View>
            <Text style={{ color: themeColors.text.primary, fontSize: 19, fontWeight: '700' }}>{planName}</Text>
            <Text style={{ color: themeColors.text.secondary, fontSize: 13, marginTop: 4 }}>{i18n.fullAccess}</Text>
            <Text style={{ color: themeColors.text.muted, fontSize: 12, marginTop: 6 }}>{billingCaption}</Text>
            {savingsPercent ? (
              <Text style={{ color: themeColors.gold, fontSize: 12, marginTop: 8, fontWeight: '700' }}>
                {i18n.saveVsMonthly.replace('{percent}', String(savingsPercent))}
              </Text>
            ) : null}
            {hasFreeTrial && introDuration ? (
              <Text style={{ color: themeColors.success, fontSize: 13, marginTop: 8, fontWeight: '700' }}>
                {`${i18n.freeTrialBadge} - ${introDuration}. ${i18n.freeTrialThen.replace('{price}', renewalPrice)}`}
              </Text>
            ) : hasIntro && intro ? (
              <Text style={{ color: themeColors.success, fontSize: 13, marginTop: 8, fontWeight: '700' }}>
                {`${i18n.introOfferBadge}: ${intro.priceString}`}
              </Text>
            ) : null}
            <Text style={{ color: themeColors.primary[400], fontSize: 16, fontWeight: '700', marginTop: 10 }}>{renewalPrice}</Text>
            <Text style={{ color: themeColors.text.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }}>{planSupportCopy}</Text>
            <Text style={{ color: themeColors.primary[400], fontSize: 14, fontWeight: '700', marginTop: 12 }}>
              {i18n.primaryCta}
            </Text>
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
      <Text style={{ color: themeColors.text.secondary, fontSize: 12, lineHeight: 18, marginTop: 12 }}>{i18n.contact}</Text>
    </ScrollView>
  );
}

function MainTabs({
  screens,
  trialDaysRemaining,
  showTrialBanner,
}: {
  screens: AppNavigatorScreens;
  trialDaysRemaining: number;
  showTrialBanner: boolean;
}) {
  const { t } = useI18n();
  const HomeScreenComponent = screens.HomeScreen;
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
        options={{ tabBarLabel: t('tabs.home'), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      >
        {(props: any) => (
          <HomeScreenComponent
            {...props}
            trialDaysRemaining={trialDaysRemaining}
            showTrialBanner={showTrialBanner}
            onOpenPaywallModal={() => props.navigation.getParent()?.navigate('PaywallModal', { trigger: 'banner' })}
          />
        )}
      </Tab.Screen>
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
      <Stack.Screen name="OnboardingPayoff" component={screens.OnboardingPayoffScreen} />
      <Stack.Screen name="SignIn" component={screens.SignInScreen} />
    </Stack.Navigator>
  );
}

export function RootAppNavigator({ screens }: { screens: AppNavigatorScreens }) {
  const { t } = useI18n();
  const store = useStore();
  const voice = useMemo(() => getVoiceCopy(store.language), [store.language]);
  const { user, loading: authLoading, initError, isBypassSession, retryInit } = useAuth();
  const isReviewerBypassUser = useMemo(() => {
    if (isBypassSession) return true;
    try {
      return isReviewerBypassEmail(user?.email || null);
    } catch (error) {
      console.error('Reviewer bypass email check failed in navigator:', error);
      return false;
    }
  }, [isBypassSession, user?.email]);
  const {
    enabled: billingEnabled,
    required: billingRequired,
    ready: billingReady,
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

  useEffect(() => {
    if (!hasActiveEntitlement) return;
    useStore.getState().grantSubscriberAccess();
  }, [hasActiveEntitlement]);

  const todayKey = getTodayKey();
  useEffect(() => {
    if (!store.firstOpenDate) {
      store.setFirstOpenDate(todayKey);
    }
  }, [store.firstOpenDate, store.setFirstOpenDate, todayKey]);

  const trialDaysRemaining = useMemo(() => {
    if (!store.firstOpenDate) return 3;
    const trialStart = new Date(`${store.firstOpenDate}T00:00:00`);
    const today = new Date(`${todayKey}T00:00:00`);
    const diffMs = today.getTime() - trialStart.getTime();
    const daysSince = Math.max(0, Math.floor(diffMs / MS_PER_DAY));
    return Math.max(0, 3 - daysSince);
  }, [store.firstOpenDate, todayKey]);

  const shouldShowTrialBanner =
    billingEnabled &&
    !hasActiveEntitlement &&
    !isReviewerBypassUser &&
    trialDaysRemaining > 0 &&
    trialDaysRemaining < 3;

  if (!isReady || authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌸</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 28, fontWeight: '700' }}>{voice.labels.brandName}</Text>
        <Text style={{ color: themeColors.text.secondary, fontSize: 14, marginTop: 8 }}>{t('common.loading')}</Text>
        <ActivityIndicator color={themeColors.primary[500]} style={{ marginTop: 20 }} />
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

  if (initError && !isReviewerBypassUser) {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.background.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 44, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ color: themeColors.text.primary, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>{t('app.auth_unavailable')}</Text>
        <Text style={{ color: themeColors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{initError}</Text>
        <TouchableOpacity
          style={{ backgroundColor: themeColors.primary[500], paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}
          onPress={retryInit}
        >
          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
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

  if (billingEnabled && !hasActiveEntitlement && trialDaysRemaining <= 0 && !isReviewerBypassUser) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Paywall" component={SubscriptionPaywallScreen} initialParams={{ trigger: 'trial_expired' }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => (
          <MainTabs
            screens={screens}
            trialDaysRemaining={trialDaysRemaining}
            showTrialBanner={shouldShowTrialBanner}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PaywallModal" component={SubscriptionPaywallScreen} initialParams={{ trigger: 'manual' }} options={{ presentation: 'modal' }} />
      <Stack.Screen name="MoodCheckScreen" component={screens.MoodCheckScreen} />
      <Stack.Screen name="TonightSessionScreen" component={screens.TonightSessionScreen} />
      <Stack.Screen name="SessionRatingScreen" component={screens.SessionRatingScreen} />
      <Stack.Screen name="PositionDetail" component={screens.PositionDetailScreen} />
      <Stack.Screen name="ForeplayDetail" component={screens.ForeplayDetailScreen} />
      <Stack.Screen name="OralDetail" component={screens.OralDetailScreen} />
      <Stack.Screen name="MassageDetail" component={screens.MassageDetailScreen} />
      <Stack.Screen name="RolePlayDetail" component={screens.RolePlayDetailScreen} />
    </Stack.Navigator>
  );
}
