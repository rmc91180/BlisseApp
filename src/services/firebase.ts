/**
 * Lazy Firebase initialization and secure PIN storage.
 *
 * Firebase is only initialized when first accessed (inside React components).
 * This prevents native module crashes at app startup.
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { firebaseConfig, PIN_SECURE_STORAGE_KEY } from '@/constants/appConfig';

// ============================================
// LAZY FIREBASE INITIALIZATION
// Firebase is only initialized when first accessed (inside React components)
// This prevents native module crashes at app startup
// ============================================
let _firebaseApp: ReturnType<typeof initializeApp> | null = null;
let _firebaseAuth: ReturnType<typeof getAuth> | null = null;
let _firebaseDb: ReturnType<typeof getFirestore> | null = null;
let _firebaseError: Error | null = null;

const hasMinimumFirebaseConfig = (): boolean => (
  Boolean(firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId)
);

export const getFirebaseApp = (): ReturnType<typeof initializeApp> | null => {
  if (_firebaseError) return null;
  if (_firebaseApp) return _firebaseApp;

  if (!hasMinimumFirebaseConfig()) {
    _firebaseError = new Error('firebase_config_missing');
    console.error('Firebase app initialization error: missing apiKey/appId/projectId');
    return null;
  }

  try {
    if (getApps().length > 0) {
      _firebaseApp = getApp();
    } else {
      _firebaseApp = initializeApp(firebaseConfig);
    }
    return _firebaseApp;
  } catch (error) {
    console.error('Firebase app initialization error:', error);
    _firebaseError = error as Error;
    return null;
  }
};

export const getFirebaseAuth = (): ReturnType<typeof getAuth> | null => {
  if (_firebaseError) return null;
  if (_firebaseAuth) return _firebaseAuth;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    _firebaseAuth = getAuth(app);
    return _firebaseAuth;
  } catch (error) {
    console.error('Firebase auth initialization error:', error);
    _firebaseError = error as Error;
    return null;
  }
};

export const getFirebaseDb = (): ReturnType<typeof getFirestore> | null => {
  if (_firebaseError) return null;
  if (_firebaseDb) return _firebaseDb;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    _firebaseDb = getFirestore(app);
    return _firebaseDb;
  } catch (error) {
    console.error('Firebase firestore initialization error:', error);
    return null;
  }
};

export const savePinToSecureStorage = async (pin: string | null): Promise<void> => {
  try {
    if (pin) {
      await SecureStore.setItemAsync(PIN_SECURE_STORAGE_KEY, pin);
    } else {
      await SecureStore.deleteItemAsync(PIN_SECURE_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Secure PIN storage error:', error);
  }
};

export const loadPinFromSecureStorage = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(PIN_SECURE_STORAGE_KEY);
  } catch (error) {
    console.error('Secure PIN read error:', error);
    return null;
  }
};
