import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import {
  Session,
  UserStats,
  UserPreferences,
  Reflection,
  UserSubscription,
  CustomHourglassRequest,
  TrialState,
} from '@/types';

// ============ Collections ============
const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  REFLECTIONS: 'reflections',
  SUBSCRIPTIONS: 'subscriptions',
  CUSTOM_HOURGLASSES: 'customHourglasses',
};

// ============ User Stats ============
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const stats = {
        totalSessions: data.totalSessions || 0,
        totalMinutes: data.totalMinutes || 0,
        totalHours: Math.floor((data.totalMinutes || 0) / 60),
        totalMinutesVerified: data.totalMinutesVerified || 0,
        last30dMinutesVerified: data.last30dMinutesVerified || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        firstSessionAt: data.firstSessionAt,
        lastSessionAt: data.lastSessionAt,
        milestonesReached: data.milestonesReached || [],
      };
      console.log('📊 Loaded user stats:', stats);
      return stats;
    }
  } catch (error) {
    console.error('❌ Firebase error loading stats:', error);
  }

  // Return default stats for new users or when offline
  console.log('📊 Using default stats (user not found or offline)');
  return {
    totalSessions: 0,
    totalMinutes: 0,
    totalHours: 0,
    totalMinutesVerified: 0,
    last30dMinutesVerified: 0,
    currentStreak: 0,
    longestStreak: 0,
    milestonesReached: [],
  };
}

export async function updateUserStats(
  userId: string,
  sessionDuration: number
): Promise<UserStats> {
  try {
    console.log('🔵 Updating user stats for:', userId, 'duration:', sessionDuration);
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    const now = Timestamp.now();

    if (!userSnap.exists()) {
      // First session ever
      console.log('🆕 Creating new user stats');
      const newStats: UserStats = {
        totalSessions: 1,
        totalMinutes: sessionDuration,
        totalHours: 0,
        totalMinutesVerified: 0,
        last30dMinutesVerified: 0,
        currentStreak: 0,
        longestStreak: 0,
        firstSessionAt: now,
        lastSessionAt: now,
        milestonesReached: [],
      };

      await setDoc(userRef, {
        ...newStats,
        createdAt: now,
        updatedAt: now,
      });

      console.log('✅ User stats created');
      return newStats;
    }

    // Update existing stats
    console.log('🔄 Incrementing existing user stats');
    await updateDoc(userRef, {
      totalSessions: increment(1),
      totalMinutes: increment(sessionDuration),
      lastSessionAt: now,
      updatedAt: now,
    });

    const updatedStats = await getUserStats(userId);
    console.log('✅ User stats updated:', updatedStats);
    return updatedStats;
  } catch (error) {
    console.error('❌ Firebase error updating stats:', error);
    return getUserStats(userId);
  }
}

export async function addMilestoneReached(
  userId: string,
  milestoneId: string
): Promise<void> {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentMilestones = userSnap.data().milestonesReached || [];
    if (!currentMilestones.includes(milestoneId)) {
      await updateDoc(userRef, {
        milestonesReached: [...currentMilestones, milestoneId],
        updatedAt: Timestamp.now(),
      });
    }
  }
}

// ============ Sessions ============
export async function createSession(session: Omit<Session, 'id'>): Promise<string> {
  try {
    console.log('🔵 Creating session:', session);
    const sessionsRef = collection(db, COLLECTIONS.SESSIONS);

    // Remove undefined fields (Firestore doesn't allow undefined)
    const sessionData: any = {
      userId: session.userId,
      duration: session.duration,
      completedAt: Timestamp.now(),
    };

    if (session.hourglassTheme) {
      sessionData.hourglassTheme = session.hourglassTheme;
    }

    if (session.customPrompt) {
      sessionData.customPrompt = session.customPrompt;
    }

    const docRef = await addDoc(sessionsRef, sessionData);
    console.log('✅ Session created:', docRef.id);

    // Update user stats
    await updateUserStats(session.userId, session.duration);

    return docRef.id;
  } catch (error: any) {
    console.error('❌ Firebase error creating session:', {
      message: error.message,
      code: error.code,
      details: error,
    });
    return 'offline-session';
  }
}

export async function getUserSessions(
  userId: string,
  limitCount: number = 50
): Promise<Session[]> {
  const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
  const q = query(
    sessionsRef,
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Session[];
}

// ============ User Preferences ============
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const prefRef = doc(db, COLLECTIONS.USERS, userId, 'preferences', 'main');
    const prefSnap = await getDoc(prefRef);

    if (prefSnap.exists()) {
      return prefSnap.data() as UserPreferences;
    }
  } catch (error) {
    console.log('Firebase offline - using default preferences');
  }

  return null;
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    console.log('🔵 Updating preferences for:', userId, preferences);
    const prefRef = doc(db, COLLECTIONS.USERS, userId, 'preferences', 'main');
    const prefSnap = await getDoc(prefRef);

    if (!prefSnap.exists()) {
      // Create default preferences
      console.log('🆕 Creating new preferences');
      await setDoc(prefRef, {
        userId,
        selectedHourglassId: 'zen-default',
        theme: 'zen',
        enableAnimations: true,
        enableSound: true,
        enableJournaling: false,
        ...preferences,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Preferences created');
    } else {
      console.log('🔄 Updating existing preferences');
      await updateDoc(prefRef, {
        ...preferences,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Preferences updated');
    }
  } catch (error) {
    console.error('❌ Firebase error updating preferences:', error);
  }
}

// ============ Reflections (Phase 4) ============
export async function createReflection(
  reflection: Omit<Reflection, 'id' | 'createdAt'>
): Promise<string> {
  const reflectionsRef = collection(db, COLLECTIONS.REFLECTIONS);
  const docRef = await addDoc(reflectionsRef, {
    ...reflection,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

export async function getUserReflections(
  userId: string,
  limitCount: number = 50
): Promise<Reflection[]> {
  const reflectionsRef = collection(db, COLLECTIONS.REFLECTIONS);
  const q = query(
    reflectionsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reflection[];
}

// ============ Subscriptions (Phase 5) ============
export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  try {
    const subRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, userId);
    const subSnap = await getDoc(subRef);

    if (subSnap.exists()) {
      return subSnap.data() as UserSubscription;
    }
  } catch (error) {
    console.log('Firebase offline - no subscription data');
  }

  return null;
}

export async function updateUserSubscription(
  userId: string,
  subscription: Partial<UserSubscription>
): Promise<void> {
  const subRef = doc(db, COLLECTIONS.SUBSCRIPTIONS, userId);
  await setDoc(subRef, subscription, { merge: true });
}

// ============ Custom Hourglass Requests (Phase 3) ============
export async function createCustomHourglassRequest(
  userId: string,
  customPrompt: string
): Promise<string> {
  const requestsRef = collection(db, COLLECTIONS.CUSTOM_HOURGLASSES);
  const docRef = await addDoc(requestsRef, {
    userId,
    customPrompt,
    status: 'pending',
    createdAt: Timestamp.now(),
  });

  return docRef.id;
}

export async function updateCustomHourglassRequest(
  requestId: string,
  updates: Partial<CustomHourglassRequest>
): Promise<void> {
  const requestRef = doc(db, COLLECTIONS.CUSTOM_HOURGLASSES, requestId);
  await updateDoc(requestRef, {
    ...updates,
    ...(updates.status === 'completed' ? { completedAt: Timestamp.now() } : {}),
  });
}

export async function getUserCustomHourglass(
  userId: string
): Promise<CustomHourglassRequest | null> {
  const requestsRef = collection(db, COLLECTIONS.CUSTOM_HOURGLASSES);
  const q = query(
    requestsRef,
    where('userId', '==', userId),
    where('status', '==', 'completed'),
    orderBy('completedAt', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as CustomHourglassRequest;
  }

  return null;
}

// ============ Trial State (Phase 2) ============
const TRIAL_DURATION_DAYS = 7;
const DAILY_SESSION_LIMIT = 2;

export async function getTrialState(userId: string): Promise<TrialState | null> {
  try {
    const trialRef = doc(db, COLLECTIONS.USERS, userId, 'trial', 'state');
    const trialSnap = await getDoc(trialRef);

    if (trialSnap.exists()) {
      const data = trialSnap.data() as TrialState;
      console.log('📊 Loaded trial state from Firestore:', data);
      return data;
    }

    console.log('📊 No trial state found for user:', userId);
    return null;
  } catch (error) {
    console.error('❌ Error loading trial state:', error);
    return null;
  }
}

export async function initializeTrialState(userId: string): Promise<TrialState> {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  const newState: TrialState = {
    firstUsed: now,
    sessionsToday: 0,
    lastSessionDate: today,
    totalTrialSessions: 0,
    trialExpired: false,
  };

  try {
    const trialRef = doc(db, COLLECTIONS.USERS, userId, 'trial', 'state');
    await setDoc(trialRef, {
      ...newState,
      createdAt: Timestamp.now(),
    });
    console.log('✅ Trial state initialized in Firestore');
  } catch (error) {
    console.error('❌ Error initializing trial state:', error);
  }

  return newState;
}

export async function recordTrialSessionFirestore(userId: string): Promise<TrialState | null> {
  try {
    const trialRef = doc(db, COLLECTIONS.USERS, userId, 'trial', 'state');
    const trialSnap = await getDoc(trialRef);
    const today = new Date().toISOString().split('T')[0];

    if (!trialSnap.exists()) {
      // Initialize trial state if it doesn't exist
      const newState = await initializeTrialState(userId);

      // Record first session
      await updateDoc(trialRef, {
        sessionsToday: 1,
        totalTrialSessions: 1,
        lastSessionDate: today,
        updatedAt: Timestamp.now(),
      });

      return {
        ...newState,
        sessionsToday: 1,
        totalTrialSessions: 1,
      };
    }

    const currentState = trialSnap.data() as TrialState;
    const isNewDay = currentState.lastSessionDate !== today;

    // Update trial state
    const updatedState: Partial<TrialState> = {
      sessionsToday: isNewDay ? 1 : (currentState.sessionsToday || 0) + 1,
      lastSessionDate: today,
      totalTrialSessions: (currentState.totalTrialSessions || 0) + 1,
    };

    await updateDoc(trialRef, {
      ...updatedState,
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Trial session recorded in Firestore');
    return {
      ...currentState,
      ...updatedState,
    };
  } catch (error) {
    console.error('❌ Error recording trial session:', error);
    return null;
  }
}

export async function validateTrialSession(userId: string): Promise<{
  allowed: boolean;
  reason?: 'trial_expired' | 'daily_limit';
  sessionsRemaining?: number;
  daysRemaining?: number;
}> {
  try {
    const trialState = await getTrialState(userId);

    // No trial state = first session, allow it
    if (!trialState) {
      return {
        allowed: true,
        sessionsRemaining: DAILY_SESSION_LIMIT - 1,
        daysRemaining: TRIAL_DURATION_DAYS,
      };
    }

    // Check if trial period has expired (7 days)
    const daysSinceFirst = Math.floor(
      (Date.now() - trialState.firstUsed) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceFirst >= TRIAL_DURATION_DAYS) {
      return {
        allowed: false,
        reason: 'trial_expired',
        daysRemaining: 0,
      };
    }

    // Check daily session limit
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = trialState.lastSessionDate !== today;
    const sessionsToday = isNewDay ? 0 : trialState.sessionsToday;

    if (sessionsToday >= DAILY_SESSION_LIMIT) {
      return {
        allowed: false,
        reason: 'daily_limit',
        sessionsRemaining: 0,
        daysRemaining: TRIAL_DURATION_DAYS - daysSinceFirst,
      };
    }

    return {
      allowed: true,
      sessionsRemaining: DAILY_SESSION_LIMIT - sessionsToday - 1,
      daysRemaining: TRIAL_DURATION_DAYS - daysSinceFirst,
    };
  } catch (error) {
    console.error('❌ Error validating trial session:', error);
    // On error, allow the session (fail open)
    return { allowed: true };
  }
}

export async function clearTrialStateFirestore(userId: string): Promise<void> {
  try {
    const trialRef = doc(db, COLLECTIONS.USERS, userId, 'trial', 'state');
    await updateDoc(trialRef, {
      trialExpired: true,
      clearedAt: Timestamp.now(),
    });
    console.log('✅ Trial state cleared (user signed up)');
  } catch (error) {
    console.error('❌ Error clearing trial state:', error);
  }
}
