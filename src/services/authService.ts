import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { initializeFirebaseServices, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { UserProfile } from '../types';

const DEMO_USER_KEY = 'melovision_demo_user';

export function getLocalDemoUser(): UserProfile | null {
  try {
    const saved = localStorage.getItem(DEMO_USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function setLocalDemoUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_USER_KEY);
  }
}

export function formatUserProfile(firebaseUser: FirebaseUser | null): UserProfile | null {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Usuário MeloVision'),
    photoURL: firebaseUser.photoURL,
    isAnonymous: firebaseUser.isAnonymous,
  };
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const { auth, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !auth) {
    // Demo mode fallback
    const demoUser: UserProfile = {
      uid: 'demo_user_google_12345',
      email: 'usuario.demo@melovision.com',
      displayName: 'Demonstração Google',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isAnonymous: false,
    };
    setLocalDemoUser(demoUser);
    return demoUser;
  }

  const credential = await signInWithPopup(auth, googleProvider);
  const formatted = formatUserProfile(credential.user)!;
  return formatted;
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const { auth, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !auth) {
    const demoUser: UserProfile = {
      uid: `demo_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      isAnonymous: false,
    };
    setLocalDemoUser(demoUser);
    return demoUser;
  }

  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return formatUserProfile(credential.user)!;
}

export async function registerWithEmail(email: string, pass: string, name?: string): Promise<UserProfile> {
  const { auth, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !auth) {
    const demoUser: UserProfile = {
      uid: `demo_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      displayName: name?.trim() || email.split('@')[0],
      photoURL: null,
      isAnonymous: false,
    };
    setLocalDemoUser(demoUser);
    return demoUser;
  }

  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
  return formatUserProfile(auth.currentUser || credential.user)!;
}

export async function resetUserPassword(email: string): Promise<void> {
  const { auth, isConfigured } = initializeFirebaseServices();
  if (!isConfigured || !auth) {
    // In demo mode, simulate success
    return;
  }
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  const { auth, isConfigured } = initializeFirebaseServices();
  setLocalDemoUser(null);
  if (isConfigured && auth) {
    await signOut(auth);
  }
}

export function subscribeToAuthChanges(callback: (user: UserProfile | null) => void): () => void {
  const { auth, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !auth) {
    const local = getLocalDemoUser();
    callback(local);
    // Listen to storage events for cross-tab or local state changes
    const handler = () => {
      callback(getLocalDemoUser());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(formatUserProfile(firebaseUser));
  });
}
