import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { useAuth } from '@/services/auth';

export interface SubscriptionContextType {
  enabled: boolean;
  required: boolean;
  ready: boolean;
  loading: boolean;
  hasActiveEntitlement: boolean;
  offerings: PurchasesPackage[];
  configError: string | null;
  actionError: string | null;
  refresh: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '';
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || 'pro';
const REQUIRED_OVERRIDE = process.env.EXPO_PUBLIC_REVENUECAT_REQUIRED;
const IS_DEV = process.env.NODE_ENV !== 'production';

const isBillingRequired = (): boolean => {
  if (REQUIRED_OVERRIDE === 'true') return true;
  if (REQUIRED_OVERRIDE === 'false') return false;
  return !IS_DEV;
};

const getApiKey = (): string => {
  if (Platform.OS === 'ios') return IOS_API_KEY;
  if (Platform.OS === 'android') return ANDROID_API_KEY;
  return '';
};

const hasRevenueCatConfig = (): boolean => Boolean(getApiKey() && ENTITLEMENT_ID);

const hasActiveEntitlement = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo) return false;
  const active = customerInfo.entitlements?.active ?? {};
  if (ENTITLEMENT_ID && active[ENTITLEMENT_ID]) return true;
  return Object.keys(active).length > 0;
};

let configured = false;
let configuredApiKey = '';

const isSameUserLoginError = (error: unknown): boolean => {
  const msg = String((error as { message?: string })?.message || '').toLowerCase();
  return msg.includes('same appuserid') || msg.includes('already logged in');
};

const configureRevenueCat = async (appUserId?: string): Promise<void> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('revenuecat_missing_api_key');
  }

  if (!configured || configuredApiKey !== apiKey) {
    Purchases.setLogLevel(IS_DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    await Purchases.configure({ apiKey, appUserID: appUserId });
    configured = true;
    configuredApiKey = apiKey;
    return;
  }

  if (appUserId) {
    try {
      await Purchases.logIn(appUserId);
    } catch (error) {
      if (!isSameUserLoginError(error)) {
        throw error;
      }
    }
  }
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const enabled = hasRevenueCatConfig();
  const required = isBillingRequired();

  const loadBillingState = useCallback(async () => {
    setLoading(true);
    setActionError(null);

    if (!enabled) {
      if (required) {
        setConfigError('Billing is required but RevenueCat is not configured for this build.');
      } else {
        setConfigError(null);
      }
      setOfferings([]);
      setCustomerInfo(null);
      setReady(true);
      setLoading(false);
      return;
    }

    try {
      await configureRevenueCat();

      const nextUserId = user?.uid ?? null;
      if (nextUserId && userIdRef.current !== nextUserId) {
        await Purchases.logIn(nextUserId);
        userIdRef.current = nextUserId;
      } else if (!nextUserId && userIdRef.current) {
        await Purchases.logOut();
        userIdRef.current = null;
      }

      const offeringsResponse = await Purchases.getOfferings();
      const available = offeringsResponse.current?.availablePackages ?? [];
      setOfferings(available);

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      setConfigError(null);
      setActionError(null);
    } catch (error) {
      console.error('RevenueCat initialization failed:', error);
      const code = String((error as { code?: string })?.code || '').toLowerCase();
      const message = String((error as { message?: string })?.message || '').toLowerCase();
      const missingConfiguration =
        code.includes('revenuecat_missing_api_key') || message.includes('revenuecat_missing_api_key');

      if (missingConfiguration) {
        setConfigError('Billing is required but RevenueCat is not configured for this build.');
      } else {
        // Transient StoreKit / network / offerings issues should not dead-end auth flow.
        // Show retryable error in paywall instead of rendering a hard blocker screen.
        setConfigError(null);
        setActionError('Billing service is currently unavailable. Please try again.');
      }
      setOfferings([]);
      setCustomerInfo(null);
    } finally {
      setReady(true);
      setLoading(false);
    }
  }, [enabled, required, user?.uid]);

  useEffect(() => {
    void loadBillingState();
  }, [loadBillingState]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
      setActionError(null);
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [enabled]);

  const refresh = useCallback(async () => {
    await loadBillingState();
  }, [loadBillingState]);

  const purchase = useCallback(
    async (pkg: PurchasesPackage) => {
      if (!enabled) {
        throw new Error('billing_not_enabled');
      }
      setLoading(true);
      setActionError(null);
      try {
        const result = await Purchases.purchasePackage(pkg);
        const info = result?.customerInfo ?? (await Purchases.getCustomerInfo());
        setCustomerInfo(info);
        if (!hasActiveEntitlement(info)) {
          throw new Error('entitlement_not_active');
        }
      } catch (error) {
        const code = String((error as { code?: string })?.code || '');
        if (code === '1' || code.includes('PURCHASE_CANCELLED')) {
          setActionError(null);
          return;
        }
        setActionError('Purchase failed. Please try again.');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [enabled]
  );

  const restore = useCallback(async (): Promise<boolean> => {
    if (!enabled) {
      throw new Error('billing_not_enabled');
    }
    setLoading(true);
    setActionError(null);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      if (!hasActiveEntitlement(info)) {
        setActionError('No active subscription was found to restore.');
        return false;
      }
      return true;
    } catch (error) {
      setActionError('Restore failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const value = useMemo<SubscriptionContextType>(
    () => ({
      enabled,
      required,
      ready,
      loading,
      hasActiveEntitlement: hasActiveEntitlement(customerInfo),
      offerings,
      configError,
      actionError,
      refresh,
      purchase,
      restore,
    }),
    [
      actionError,
      configError,
      customerInfo,
      enabled,
      loading,
      offerings,
      purchase,
      ready,
      refresh,
      required,
      restore,
    ]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}
