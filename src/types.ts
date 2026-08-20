export interface ShortLink {
  id: string;
  slug: string; // e.g. 'melovisionA1B2'
  originalUrl: string;
  shortUrl: string;
  userId: string;
  userEmail?: string;
  createdAt: number;
  updatedAt?: number;
  clicks: number;
  lastClickedAt?: number;
  title?: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}
