import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { initializeFirebaseServices } from '../config/firebase';
import { ShortLink, UserProfile } from '../types';

const LOCAL_STORAGE_LINKS_KEY = 'melovision_local_links';

/**
 * Generates slug starting with 'melovision' followed by exactly 4 alphanumeric characters.
 * Example: melovisionA1B2, melovisionX9Y8
 */
export function generateMeloVisionSlug(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomSuffix += chars.charAt(randomIndex);
  }
  return `melovision${randomSuffix}`;
}

export function isValidSlug(slug: string): boolean {
  return /^melovision[a-zA-Z0-9]{4}$/.test(slug);
}

export function normalizeUrl(inputUrl: string): string {
  let trimmed = inputUrl.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.href;
  } catch {
    return trimmed;
  }
}

// Local mock links management for demo or offline fallback
function getLocalLinks(): ShortLink[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LINKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveLocalLinks(links: ShortLink[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_LINKS_KEY, JSON.stringify(links));
    window.dispatchEvent(new Event('melovision_local_links_updated'));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Create a new shortened link in Firestore (or local fallback if not configured)
 */
export async function createShortLink(
  originalUrl: string,
  user: UserProfile,
  title?: string
): Promise<ShortLink> {
  const cleanUrl = normalizeUrl(originalUrl);
  const slug = generateMeloVisionSlug();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://melovision.com';
  const shortUrl = `${currentOrigin}/${slug}`;

  const linkData: ShortLink = {
    id: slug,
    slug,
    originalUrl: cleanUrl,
    shortUrl,
    userId: user.uid,
    userEmail: user.email || 'anônimo',
    createdAt: Date.now(),
    clicks: 0,
    title: title?.trim() || cleanUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Link Encurtado',
  };

  const { db, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !db) {
    const existing = getLocalLinks();
    const updated = [linkData, ...existing];
    saveLocalLinks(updated);
    return linkData;
  }

  try {
    // Store in Firestore using slug as the document ID for O(1) lookup
    const linkDocRef = doc(db, 'links', slug);
    await setDoc(linkDocRef, linkData);
    return linkData;
  } catch (err) {
    console.error('Firestore create error, falling back to local storage:', err);
    const existing = getLocalLinks();
    const updated = [linkData, ...existing];
    saveLocalLinks(updated);
    return linkData;
  }
}

/**
 * Real-time listener for current user's short links
 */
export function subscribeToUserLinks(
  userId: string,
  callback: (links: ShortLink[]) => void
): Unsubscribe {
  const { db, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !db) {
    const emit = () => {
      const all = getLocalLinks();
      const userLinks = all.filter((l) => l.userId === userId);
      userLinks.sort((a, b) => b.createdAt - a.createdAt);
      callback(userLinks);
    };

    emit();

    const listener = () => emit();
    window.addEventListener('melovision_local_links_updated', listener);
    window.addEventListener('storage', listener);

    return () => {
      window.removeEventListener('melovision_local_links_updated', listener);
      window.removeEventListener('storage', listener);
    };
  }

  try {
    const linksRef = collection(db, 'links');
    const q = query(linksRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const links: ShortLink[] = [];
        snapshot.forEach((docSnap) => {
          links.push(docSnap.data() as ShortLink);
        });
        links.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(links);
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        // Fallback to local
        const all = getLocalLinks();
        callback(all.filter((l) => l.userId === userId));
      }
    );
  } catch (err) {
    console.error('Subscribe error:', err);
    const all = getLocalLinks();
    callback(all.filter((l) => l.userId === userId));
    return () => {};
  }
}

/**
 * Update the original target URL for a given slug / link ID
 */
export async function updateShortLink(
  linkId: string,
  newOriginalUrl: string,
  newTitle?: string
): Promise<void> {
  const cleanUrl = normalizeUrl(newOriginalUrl);
  const { db, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !db) {
    const existing = getLocalLinks();
    const updated = existing.map((link) => {
      if (link.id === linkId || link.slug === linkId) {
        return {
          ...link,
          originalUrl: cleanUrl,
          title: newTitle !== undefined ? newTitle : link.title,
          updatedAt: Date.now(),
        };
      }
      return link;
    });
    saveLocalLinks(updated);
    return;
  }

  try {
    const linkDocRef = doc(db, 'links', linkId);
    const payload: Partial<ShortLink> = {
      originalUrl: cleanUrl,
      updatedAt: Date.now(),
    };
    if (newTitle !== undefined) {
      payload.title = newTitle;
    }
    await updateDoc(linkDocRef, payload);
  } catch (err) {
    console.error('Firestore update error:', err);
    const existing = getLocalLinks();
    const updated = existing.map((link) => {
      if (link.id === linkId || link.slug === linkId) {
        return {
          ...link,
          originalUrl: cleanUrl,
          title: newTitle !== undefined ? newTitle : link.title,
          updatedAt: Date.now(),
        };
      }
      return link;
    });
    saveLocalLinks(updated);
  }
}

/**
 * Delete a short link from Firestore
 */
export async function deleteShortLink(linkId: string): Promise<void> {
  const { db, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !db) {
    const existing = getLocalLinks();
    const filtered = existing.filter((l) => l.id !== linkId && l.slug !== linkId);
    saveLocalLinks(filtered);
    return;
  }

  try {
    const linkDocRef = doc(db, 'links', linkId);
    await deleteDoc(linkDocRef);
  } catch (err) {
    console.error('Firestore delete error:', err);
    const existing = getLocalLinks();
    const filtered = existing.filter((l) => l.id !== linkId && l.slug !== linkId);
    saveLocalLinks(filtered);
  }
}

/**
 * Lookup link by slug (for redirection)
 */
export async function getLinkBySlug(slug: string): Promise<ShortLink | null> {
  const { db, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !db) {
    const existing = getLocalLinks();
    const found = existing.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
    return found || null;
  }

  try {
    // First try direct document get by slug ID
    const directDocRef = doc(db, 'links', slug);
    const snap = await getDoc(directDocRef);
    if (snap.exists()) {
      return snap.data() as ShortLink;
    }

    // Secondary fallback: query where slug == slug
    const q = query(collection(db, 'links'), where('slug', '==', slug));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as ShortLink;
    }

    // Check local fallback just in case
    const localExisting = getLocalLinks();
    const foundLocal = localExisting.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
    return foundLocal || null;
  } catch (err) {
    console.error('Error fetching link by slug:', err);
    const localExisting = getLocalLinks();
    return localExisting.find((l) => l.slug.toLowerCase() === slug.toLowerCase()) || null;
  }
}

/**
 * Increment click count when a short link is visited
 */
export async function trackLinkVisit(linkId: string): Promise<void> {
  const { db, isConfigured } = initializeFirebaseServices();

  if (!isConfigured || !db) {
    const existing = getLocalLinks();
    const updated = existing.map((l) => {
      if (l.id === linkId || l.slug === linkId) {
        return { ...l, clicks: (l.clicks || 0) + 1, lastClickedAt: Date.now() };
      }
      return l;
    });
    saveLocalLinks(updated);
    return;
  }

  try {
    const docRef = doc(db, 'links', linkId);
    await updateDoc(docRef, {
      clicks: increment(1),
      lastClickedAt: Date.now(),
    });
  } catch (err) {
    console.error('Error incrementing clicks:', err);
  }
}
