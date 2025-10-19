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
