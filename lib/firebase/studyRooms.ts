'use client';

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Room, RoomPresence, Leaderboard, LeaderboardEntry } from '@/types';

const COLLECTIONS = {
  ROOMS: 'rooms',
  PRESENCE: 'presence',
  LEADERBOARDS: 'leaderboards',
};

// Predefined study rooms
export const STUDY_ROOMS: Omit<Room, 'activeCount' | 'updatedAt'>[] = [
  {
    id: 'mcat',
    name: 'MCAT',
    emoji: '🧪',
    description: 'Medical College Admission Test prep',
  },
  {
    id: 'lsat',
    name: 'LSAT',
    emoji: '⚖️',
    description: 'Law School Admission Test prep',
  },
  {
    id: 'bar',
    name: 'Bar Exam',
    emoji: '👨‍⚖️',
    description: 'Bar Examination prep',
  },
  {
    id: 'usmle',
    name: 'USMLE',
    emoji: '🩺',
    description: 'United States Medical Licensing Exam',
  },
  {
    id: 'cfa',
    name: 'CFA',
    emoji: '📊',
    description: 'Chartered Financial Analyst prep',
  },
  {
    id: 'gre',
    name: 'GRE',
    emoji: '🎓',
    description: 'Graduate Record Examination prep',
  },
  {
    id: 'gmat',
    name: 'GMAT',
    emoji: '💼',
    description: 'Graduate Management Admission Test',
  },
  {
    id: 'general',
    name: 'General Study',
    emoji: '📚',
    description: 'For all other studying',
  },
];

// ============ Rooms ============

/**
 * Initialize all predefined rooms (run once on app setup)
 */
export async function initializeRooms(): Promise<void> {
  const batch: Promise<void>[] = [];

  for (const room of STUDY_ROOMS) {
    const roomRef = doc(db, COLLECTIONS.ROOMS, room.id);
    batch.push(
      setDoc(
        roomRef,
        {
          ...room,
          activeCount: 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    );
  }

  await Promise.all(batch);
  console.log('✅ Study rooms initialized');
}

/**
 * Get all available study rooms
 */
export async function getRooms(): Promise<Room[]> {
  const roomsRef = collection(db, COLLECTIONS.ROOMS);
  const querySnapshot = await getDocs(roomsRef);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Room[];
}

/**
 * Get a single room by ID
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    return {
      id: roomSnap.id,
      ...roomSnap.data(),
    } as Room;
  }

  return null;
}

/**
 * Subscribe to room updates (real-time)
 */
export function subscribeToRoom(
  roomId: string,
  callback: (room: Room | null) => void
): () => void {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);

  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      callback({
        id: snap.id,
        ...snap.data(),
      } as Room);
    } else {
      callback(null);
    }
  });
}

// ============ Presence ============

/**
 * Join a study room (create presence record)
 */
export async function joinRoom(
  userId: string,
  roomId: string,
  username: string,
  totalHours: number
): Promise<void> {
  const presenceRef = doc(db, COLLECTIONS.PRESENCE, userId);

  await setDoc(presenceRef, {
    userId,
    roomId,
    username,
    startedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    totalHoursAtJoin: totalHours,
    sessionId: null,
  });

  // Increment room active count
  await incrementRoomCount(roomId, 1);

  console.log(`✅ Joined room: ${roomId}`);
}

/**
 * Leave a study room (delete presence record)
 */
export async function leaveRoom(userId: string, roomId: string): Promise<void> {
  const presenceRef = doc(db, COLLECTIONS.PRESENCE, userId);
  await deleteDoc(presenceRef);

  // Decrement room active count
  await incrementRoomCount(roomId, -1);

  console.log(`✅ Left room: ${roomId}`);
}

/**
 * Update heartbeat (keep presence alive)
 */
export async function updateHeartbeat(userId: string, sessionId?: string): Promise<void> {
  const presenceRef = doc(db, COLLECTIONS.PRESENCE, userId);

  await updateDoc(presenceRef, {
    lastActiveAt: serverTimestamp(),
    ...(sessionId ? { sessionId } : {}),
  });
}

/**
 * Get active users in a room
 */
export async function getRoomPresence(roomId: string): Promise<RoomPresence[]> {
  const presenceRef = collection(db, COLLECTIONS.PRESENCE);
  const q = query(
    presenceRef,
    where('roomId', '==', roomId),
    orderBy('totalHoursAtJoin', 'desc'),
    limit(50)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => doc.data() as RoomPresence);
}

/**
 * Subscribe to room presence (real-time)
 */
export function subscribeToRoomPresence(
  roomId: string,
  callback: (users: RoomPresence[]) => void
): () => void {
  const presenceRef = collection(db, COLLECTIONS.PRESENCE);
  const q = query(
    presenceRef,
    where('roomId', '==', roomId),
    orderBy('totalHoursAtJoin', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => doc.data() as RoomPresence);
    callback(users);
  });
}

/**
 * Get user's current room
 */
export async function getUserCurrentRoom(userId: string): Promise<RoomPresence | null> {
  const presenceRef = doc(db, COLLECTIONS.PRESENCE, userId);
  const presenceSnap = await getDoc(presenceRef);

  if (presenceSnap.exists()) {
    return presenceSnap.data() as RoomPresence;
  }

  return null;
}

// ============ Leaderboard ============

/**
 * Get room leaderboard
 */
export async function getRoomLeaderboard(
  roomId: string,
  period: '30d' | 'all-time' = '30d'
): Promise<Leaderboard | null> {
  const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, `${roomId}_${period}`);
  const leaderboardSnap = await getDoc(leaderboardRef);

  if (leaderboardSnap.exists()) {
    return leaderboardSnap.data() as Leaderboard;
  }

  return null;
}

/**
 * Subscribe to leaderboard updates (real-time)
 */
export function subscribeToLeaderboard(
  roomId: string,
  period: '30d' | 'all-time',
  callback: (leaderboard: Leaderboard | null) => void
): () => void {
  const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, `${roomId}_${period}`);

  return onSnapshot(leaderboardRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as Leaderboard);
    } else {
      callback(null);
    }
  });
}

// ============ Helper Functions ============

/**
 * Increment or decrement room active count
 */
async function incrementRoomCount(roomId: string, delta: number): Promise<void> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);

  // Get current count
  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) {
    const currentCount = roomSnap.data().activeCount || 0;
    const newCount = Math.max(0, currentCount + delta);

    await updateDoc(roomRef, {
      activeCount: newCount,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Generate anonymous username
 */
export function generateAnonymousUsername(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Anonymous${randomNum}`;
}

/**
 * Clean up stale presence records (older than 5 minutes)
 * This should be run periodically by a Cloud Function
 */
export async function cleanupStalePresence(): Promise<void> {
  const presenceRef = collection(db, COLLECTIONS.PRESENCE);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const q = query(presenceRef, where('lastActiveAt', '<', Timestamp.fromDate(fiveMinutesAgo)));

  const querySnapshot = await getDocs(q);

  const deletions = querySnapshot.docs.map(async (docSnap) => {
    const presence = docSnap.data() as RoomPresence;
    await deleteDoc(docSnap.ref);
    await incrementRoomCount(presence.roomId, -1);
  });

  await Promise.all(deletions);

  console.log(`🧹 Cleaned up ${deletions.length} stale presence records`);
}
