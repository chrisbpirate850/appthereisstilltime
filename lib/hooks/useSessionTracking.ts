import { useState, useEffect, useCallback } from 'react';
import { getUserStats, createSession } from '@/lib/firebase/firestore';
import { logSessionCompleted } from '@/lib/firebase/analytics';
import { getUserId } from '@/lib/utils/userId';
import { UserStats, Session } from '@/types';
import { MILESTONES } from '@/app/constants/hourglassLibrary';

interface UseSessionTrackingReturn {
  userStats: UserStats | null;
  loading: boolean;
  recordSession: (
    durationMinutes: number,
    hourglassTheme?: string,
    customPrompt?: string
  ) => Promise<void>;
  checkNewMilestones: (newStats: UserStats) => Array<{
    id: string;
    message: string;
    reward?: any;
  }>;
}

export function useSessionTracking(): UseSessionTrackingReturn {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  // Load user stats on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await getUserStats(userId);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
        // Set default stats on error
        setUserStats({
          totalSessions: 0,
          totalMinutes: 0,
          totalHours: 0,
          totalMinutesVerified: 0,
          last30dMinutesVerified: 0,
          currentStreak: 0,
          longestStreak: 0,
          milestonesReached: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [userId]);

  // Record a completed session
  const recordSession = useCallback(
    async (
      durationMinutes: number,
      hourglassTheme?: string,
      customPrompt?: string
    ) => {
      try {
        // Create session record
        const sessionData: Omit<Session, 'id'> = {
          userId,
          duration: durationMinutes,
          completedAt: null as any, // Will be set by createSession
          hourglassTheme,
          customPrompt,
        };

        await createSession(sessionData);

        // Reload stats
        const newStats = await getUserStats(userId);
        setUserStats(newStats);

        // Log analytics
        logSessionCompleted(userId, durationMinutes, hourglassTheme || 'default', durationMinutes);
      } catch (error) {
        console.error('Error recording session:', error);
      }
    },
    [userId]
  );

  // Check for new milestones
  const checkNewMilestones = useCallback(
    (newStats: UserStats) => {
      if (!userStats) return [];

      const previousMilestones = userStats.milestonesReached || [];
      const newMilestones: Array<{
        id: string;
        message: string;
        reward?: any;
      }> = [];

      // Check each milestone
      MILESTONES.forEach((milestone) => {
        // Skip if already reached
        if (previousMilestones.includes(milestone.id)) {
          return;
        }

        let isReached = false;

        if (milestone.type === 'sessions') {
          isReached = newStats.totalSessions >= milestone.value;
        } else if (milestone.type === 'hours') {
          isReached = newStats.totalHours >= milestone.value;
        }

        if (isReached) {
          newMilestones.push({
            id: milestone.id,
            message: milestone.message,
            reward: milestone.reward,
          });
        }
      });

      return newMilestones;
    },
    [userStats]
  );

  return {
    userStats,
    loading,
    recordSession,
    checkNewMilestones,
  };
}
