'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  joinRoom,
  leaveRoom,
  updateHeartbeat,
  getUserCurrentRoom,
  generateAnonymousUsername,
} from '@/lib/firebase/studyRooms';
import { RoomPresence } from '@/types';

const HEARTBEAT_INTERVAL = 60 * 1000; // 60 seconds

interface UseRoomPresenceOptions {
  userId: string;
  username?: string;
  totalHours: number;
  enabled: boolean; // Only enable for Student+ tier users
}

interface UseRoomPresenceReturn {
  currentRoom: RoomPresence | null;
  isInRoom: boolean;
  joinStudyRoom: (roomId: string) => Promise<void>;
  leaveStudyRoom: () => Promise<void>;
  updateSessionId: (sessionId: string | null) => Promise<void>;
}

export function useRoomPresence({
  userId,
  username,
  totalHours,
  enabled,
}: UseRoomPresenceOptions): UseRoomPresenceReturn {
  const [currentRoom, setCurrentRoom] = useState<RoomPresence | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);

  // Load current room on mount
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    async function loadCurrentRoom() {
      try {
        const room = await getUserCurrentRoom(userId);
        setCurrentRoom(room);

        // Start heartbeat if in a room
        if (room) {
          startHeartbeat();
        }
      } catch (error) {
        console.error('Error loading current room:', error);
      }
    }

    loadCurrentRoom();

    // Cleanup on unmount
    return () => {
      stopHeartbeat();
    };
  }, [userId, enabled]);

  // Start heartbeat interval
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      return; // Already running
    }

    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        await updateHeartbeat(userId, currentSessionIdRef.current || undefined);
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, HEARTBEAT_INTERVAL);

    console.log('🫀 Heartbeat started');
  }, [userId]);

  // Stop heartbeat interval
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      console.log('🫀 Heartbeat stopped');
    }
  }, []);

  // Join a study room
  const joinStudyRoom = useCallback(
    async (roomId: string) => {
      if (!enabled) {
        throw new Error('Study Rooms require Student tier or higher');
      }

      try {
        // Leave current room if in one
        if (currentRoom) {
          await leaveRoom(userId, currentRoom.roomId);
          stopHeartbeat();
        }

        // Generate username if not provided
        const displayName = username || generateAnonymousUsername();

        // Join new room
        await joinRoom(userId, roomId, displayName, totalHours);

        // Update state
        const newRoom: RoomPresence = {
          userId,
          roomId,
          username: displayName,
          startedAt: new Date() as any,
          lastActiveAt: new Date() as any,
          totalHoursAtJoin: totalHours,
          sessionId: currentSessionIdRef.current || undefined,
        };

        setCurrentRoom(newRoom);

        // Start heartbeat
        startHeartbeat();

        console.log(`✅ Joined room: ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        throw error;
      }
    },
    [userId, username, totalHours, enabled, currentRoom, startHeartbeat, stopHeartbeat]
  );

  // Leave current room
  const leaveStudyRoom = useCallback(async () => {
    if (!currentRoom) {
      return;
    }

    try {
      await leaveRoom(userId, currentRoom.roomId);
      setCurrentRoom(null);
      stopHeartbeat();

      console.log('✅ Left study room');
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }, [userId, currentRoom, stopHeartbeat]);

  // Update session ID in presence
  const updateSessionId = useCallback(
    async (sessionId: string | null) => {
      currentSessionIdRef.current = sessionId;

      if (currentRoom) {
        try {
          await updateHeartbeat(userId, sessionId || undefined);
        } catch (error) {
          console.error('Error updating session ID:', error);
        }
      }
    },
    [userId, currentRoom]
  );

  return {
    currentRoom,
    isInRoom: !!currentRoom,
    joinStudyRoom,
    leaveStudyRoom,
    updateSessionId,
  };
}
