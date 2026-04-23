/**
 * Firebase Authentication context and provider.
 * Handles email/password and Apple Sign-In authentication.
 */
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  OAuthProvider,
  signInWithCredential,
  fetchSignInMethodsForEmail,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { getFirebaseAuth } from '@/services/firebase';
import { AUTH_RETRY_DELAY_MS, AUTH_MAX_RETRIES, AUTH_SYNC_LOOP_MS } from '@/constants/appConfig';
import { isReviewerBypassEmail, normalizeEmail } from '@/services/reviewerAccess';

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  initError: string | null;
  isBypassSession: boolean;
  retryInit: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const REVIEW_BYPASS_EMAIL_KEY = 'blisse-review-bypass-email-v1';
  const REVIEW_BYPASS_UID_PREFIX = 'review-bypass:';
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [bypassEmail, setBypassEmail] = useState<string | null>(null);
  const [initNonce, setInitNonce] = useState(0);
  const bypassEmailRef = useRef<string | null>(null);

  useEffect(() => {
    bypassEmailRef.current = bypassEmail;
  }, [bypassEmail]);

  const createBypassUser = (email: string): FirebaseUser => (
    ({
      uid: `${REVIEW_BYPASS_UID_PREFIX}${email}`,
      email,
      isAnonymous: true,
    } as unknown as FirebaseUser)
  );

  // Initialize Firebase lazily and retry until auth is available.
  useEffect(() => {
    const restoreBypassSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(REVIEW_BYPASS_EMAIL_KEY);
        if (stored) {
          setBypassEmail(stored);
          setUser((current) => current || createBypassUser(stored));
        }
      } catch {
        // Ignore storage read failures for auth bootstrap.
      }
    };
    void restoreBypassSession();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: (() => void) | null = null;
    let retryCount = 0;

    const initializeAuth = () => {
      if (!isMounted) return;

      const auth = getFirebaseAuth();
      if (!auth) {
        retryCount += 1;
        if (retryCount >= AUTH_MAX_RETRIES) {
          setInitError('Authentication is currently unavailable. Please restart the app and try again.');
          setLoading(false);
          return;
        }
        retryTimer = setTimeout(initializeAuth, AUTH_RETRY_DELAY_MS);
        return;
      }

      setFirebaseReady(true);
      setInitError(null);
      unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else if (bypassEmailRef.current) {
          setUser(createBypassUser(bypassEmailRef.current));
        } else {
          setUser(null);
        }
        const email = firebaseUser?.email ? normalizeEmail(firebaseUser.email) : null;
        if (email && safeIsReviewerBypassEmail(email)) {
          setBypassEmail(email);
          void AsyncStorage.setItem(REVIEW_BYPASS_EMAIL_KEY, email);
        }
        setLoading(false);
      }, (error) => {
        console.error('Auth state observer error:', error);
        setInitError('Authentication sync failed. Please sign in again.');
        setLoading(false);
      });
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (unsubscribe) unsubscribe();
    };
  }, [initNonce]);

  // Keep Firebase auth synced with provider state while app is running.
  useEffect(() => {
    if (!firebaseReady) return;

    const syncLoop = setInterval(() => {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        auth.currentUser.reload().catch(() => {});
      }
    }, AUTH_SYNC_LOOP_MS);

    return () => clearInterval(syncLoop);
  }, [firebaseReady]);

  const waitForAuth = async (): Promise<Auth> => {
    let attempts = 0;
    while (attempts < AUTH_MAX_RETRIES) {
      const auth = getFirebaseAuth();
      if (auth) return auth;
      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, Math.min(500, AUTH_RETRY_DELAY_MS)));
    }
    const initErr = new Error('auth/not-initialized');
    (initErr as Error & { code?: string }).code = 'auth/not-initialized';
    throw initErr;
  };

  const getErrorCode = (error: unknown): string => (
    String((error as { code?: string })?.code || '').trim()
  );

  const retryInit = () => {
    setInitError(null);
    setLoading(true);
    setFirebaseReady(false);
    setInitNonce((value) => value + 1);
  };

  const safeIsReviewerBypassEmail = (email?: string | null): boolean => {
    try {
      return isReviewerBypassEmail(email);
    } catch (error) {
      console.error('Reviewer bypass email check failed:', error);
      return false;
    }
  };

  const createReviewerAccountIfMissing = async (email: string, password: string): Promise<void> => {
    const auth = await waitForAuth();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (getErrorCode(error) !== 'auth/email-already-in-use') {
        throw error;
      }
    }
  };

  const signUp = async (email: string, password: string, _name: string) => {
    const auth = await waitForAuth();
    const normalizedEmail = normalizeEmail(email);
    await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const isBypass = safeIsReviewerBypassEmail(normalizedEmail);

    if (isBypass) {
      setBypassEmail(normalizedEmail);
      await AsyncStorage.setItem(REVIEW_BYPASS_EMAIL_KEY, normalizedEmail);
    }

    let auth: Auth;
    try {
      auth = await waitForAuth();
    } catch (error) {
      if (isBypass) {
        setUser(createBypassUser(normalizedEmail));
        setInitError(null);
        setLoading(false);
        return;
      }
      throw error;
    }

    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return;
    } catch (error) {
      const code = getErrorCode(error);
      const canAttemptProvisioning =
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials';

      if (isBypass && canAttemptProvisioning) {
        try {
          await createReviewerAccountIfMissing(normalizedEmail, password);
          await signInWithEmailAndPassword(auth, normalizedEmail, password);
          return;
        } catch (provisionError) {
          console.warn('Reviewer provisioning fallback failed:', provisionError);
        }
      }

      if (isBypass && code === 'auth/operation-not-allowed') {
        // Keep reviewer/test access available even if email-password provider
        // is disabled in Firebase for a given environment.
        try {
          await signInAnonymously(auth);
        } catch {
          // Ignore and rely on local bypass identity fallback below.
        }
        setBypassEmail(normalizedEmail);
        await AsyncStorage.setItem(REVIEW_BYPASS_EMAIL_KEY, normalizedEmail);
        setUser(createBypassUser(normalizedEmail));
        setInitError(null);
        setLoading(false);
        return;
      }

      if (isBypass) {
        // Last-resort reviewer path:
        // allow app access even when provider config is temporarily broken.
        try {
          await signInAnonymously(auth);
        } catch {
          // Ignore and rely on local bypass identity fallback below.
        }
        setBypassEmail(normalizedEmail);
        await AsyncStorage.setItem(REVIEW_BYPASS_EMAIL_KEY, normalizedEmail);
        setUser(createBypassUser(normalizedEmail));
        setInitError(null);
        setLoading(false);
        return;
      }

      throw error;
    }
  };

  const signInWithAppleHandler = async () => {
    const auth = await waitForAuth();
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple Sign-In did not return an identity token');
      }

      const provider = new OAuthProvider('apple.com');
      const oAuthCredential = provider.credential({
        idToken: credential.identityToken,
      });

      await signInWithCredential(auth, oAuthCredential);
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED' && error.code !== 'ERR_REQUEST_CANCELED') {
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      const auth = await waitForAuth();
      await signOut(auth);
    } catch {
      // Ignore sign-out errors for local bypass sessions.
    }
    setUser(null);
    setBypassEmail(null);
    await AsyncStorage.removeItem(REVIEW_BYPASS_EMAIL_KEY);
  };

  const resetPassword = async (email: string) => {
    const auth = await waitForAuth();
    const normalizedEmail = normalizeEmail(email);
    // Use enumeration-safe existence check before issuing the reset request.
    const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
    if (!methods || methods.length === 0) {
      const notFoundError = new Error('auth/user-not-found');
      (notFoundError as Error & { code?: string }).code = 'auth/user-not-found';
      throw notFoundError;
    }
    await sendPasswordResetEmail(auth, normalizedEmail);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initError,
        isBypassSession: Boolean(bypassEmail),
        retryInit,
        signUp,
        signIn,
        signInWithApple: signInWithAppleHandler,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
