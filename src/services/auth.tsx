/**
 * Firebase Authentication context and provider.
 * Handles email/password and Apple Sign-In authentication.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  OAuthProvider,
  signInWithCredential,
  type User as FirebaseUser,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { getFirebaseAuth } from '@/services/firebase';
import { AUTH_RETRY_DELAY_MS, AUTH_MAX_RETRIES, AUTH_SYNC_LOOP_MS } from '@/constants/appConfig';

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  initError: string | null;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize Firebase lazily and retry until auth is available.
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
        setUser(firebaseUser);
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
  }, []);

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

  const signUp = async (email: string, password: string, _name: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithAppleHandler = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const provider = new OAuthProvider('apple.com');
      const oAuthCredential = provider.credential({
        idToken: credential.identityToken!,
      });

      await signInWithCredential(auth, oAuthCredential);
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        throw error;
      }
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Auth not initialized');
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, initError, signUp, signIn, signInWithApple: signInWithAppleHandler, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
