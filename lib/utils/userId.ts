import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const USER_ID_KEY = 'thereisstilltime_user_id';

// Sign in user anonymously on first load
let authInitialized = false;
if (typeof window !== 'undefined' && !authInitialized) {
  authInitialized = true;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log('🔑 No user signed in, signing in anonymously...');
      try {
        const result = await signInAnonymously(auth);
        console.log('✅ Signed in anonymously:', result.user.uid);
        localStorage.setItem(USER_ID_KEY, result.user.uid);
      } catch (error) {
        console.error('❌ Error signing in anonymously:', error);
      }
    } else {
      console.log('✅ User already signed in:', user.uid);
      localStorage.setItem(USER_ID_KEY, user.uid);
    }
  });
}

/**
 * Get or create an anonymous user ID
 * This persists across sessions until the user clears localStorage
 * Can later be upgraded to Firebase Auth UID
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  // Return the Firebase Auth UID if available
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser.uid;
  }

  // Fallback to localStorage while auth is initializing
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = `anon_${uuidv4()}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Set user ID (used when upgrading from anonymous to authenticated)
 */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(USER_ID_KEY, userId);
}

/**
 * Check if user is authenticated (vs anonymous)
 */
export function isAnonymousUser(userId: string): boolean {
  return userId.startsWith('anon_');
}
