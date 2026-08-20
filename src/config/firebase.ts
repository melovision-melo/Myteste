import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseConfigState } from '../types';

const STORAGE_KEY = 'melovision_firebase_config';

// Default empty/pre-configured config matching user's project: encurtadorlink
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigState = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'encurtadorlink.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'encurtadorlink',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'encurtadorlink.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export function getStoredFirebaseConfig(): FirebaseConfigState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Error loading stored firebase config:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(config: FirebaseConfigState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving firebase config:', e);
  }
}

export function isFirebaseConfigured(config: FirebaseConfigState = getStoredFirebaseConfig()): boolean {
  return Boolean(config.apiKey && config.apiKey.trim() !== '' && config.projectId && config.projectId.trim() !== '');
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function initializeFirebaseServices(customConfig?: FirebaseConfigState) {
  const config = customConfig || getStoredFirebaseConfig();

  if (!isFirebaseConfigured(config)) {
    return { app: null, auth: null, db: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }

    authInstance = getAuth(appInstance);
    firestoreInstance = getFirestore(appInstance);

    return {
      app: appInstance,
      auth: authInstance,
      db: firestoreInstance,
      isConfigured: true,
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null, db: null, isConfigured: false, error };
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
