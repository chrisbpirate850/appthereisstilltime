'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TrialState } from '@/types';
import {
  getTrialState,
  recordTrialSessionFirestore,
  validateTrialSession,
  clearTrialStateFirestore
} from '@/lib/firebase/firestore';

const TRIAL_STORAGE_KEY = 'thereisstilltime_trial';
const TRIAL_DURATION_DAYS = 7;
const DAILY_SESSION_LIMIT = 2;

/**
 * Hook to track and enforce trial limits for anonymous (non-signed-in) users
 *
 * Phase 2: Now syncs with Firestore for server-side enforcement
 *
 * Trial Rules:
 * - 2 sessions per day
 * - 7 day trial period from first use
 * - Resets daily at midnight local time
 * - Prompts signup after limit reached
 * - Server-side validation prevents localStorage bypass
 */
export function useTrialLimits(userId?: string) {
  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load trial state from Firestore (with localStorage fallback)
  useEffect(() => {
    async function loadTrialState() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to load from Firestore first
        const firestoreState = await getTrialState(userId);

        if (firestoreState) {
          setTrialState(firestoreState);
          // Sync to localStorage for offline access
          localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(firestoreState));
        } else {
          // Fallback to localStorage (for backward compatibility)
          const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as TrialState;
              setTrialState(parsed);
            } catch (error) {
              console.error('Failed to parse trial state:', error);
              setTrialState(null);
            }
          } else {
            setTrialState(null);
          }
        }
      } catch (error) {
        console.error('Error loading trial state:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as TrialState;
            setTrialState(parsed);
          } catch (e) {
            console.error('Failed to parse trial state:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTrialState();
  }, [userId]);

  // Initialize trial state for first-time users
  const initializeTrialState = useCallback(() => {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    const newState: TrialState = {
      firstUsed: now,
      sessionsToday: 0,
      lastSessionDate: today,
      totalTrialSessions: 0,
      trialExpired: false,
    };

    setTrialState(newState);
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(newState));

    return newState;
  }, []);

  // Check if trial period (7 days) has expired
  const isTrialExpired = useMemo(() => {
    if (!trialState) return false;

    const daysSinceFirst = Math.floor(
      (Date.now() - trialState.firstUsed) / (1000 * 60 * 60 * 24)
    );

    return daysSinceFirst >= TRIAL_DURATION_DAYS;
  }, [trialState]);

  // Calculate sessions remaining today
  const sessionsRemainingToday = useMemo(() => {
    if (!trialState) return DAILY_SESSION_LIMIT;

    const today = new Date().toISOString().split('T')[0];

    // If it's a new day, reset the counter
    if (trialState.lastSessionDate !== today) {
      return DAILY_SESSION_LIMIT;
    }

    return Math.max(0, DAILY_SESSION_LIMIT - trialState.sessionsToday);
  }, [trialState]);

  // Determine if user should be prompted to sign up
  const shouldPromptSignup = useMemo(() => {
    return sessionsRemainingToday === 0 || isTrialExpired;
  }, [sessionsRemainingToday, isTrialExpired]);

  // Days remaining in trial
  const daysRemainingInTrial = useMemo(() => {
    if (!trialState) return TRIAL_DURATION_DAYS;

    const daysSinceFirst = Math.floor(
      (Date.now() - trialState.firstUsed) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, TRIAL_DURATION_DAYS - daysSinceFirst);
  }, [trialState]);

  // Record a session (call this when a session starts)
  const recordTrialSession = useCallback(async () => {
    if (!userId) {
      console.error('Cannot record trial session without userId');
      return;
    }

    try {
      // Record in Firestore (server-side)
      const updatedState = await recordTrialSessionFirestore(userId);

      if (updatedState) {
        setTrialState(updatedState);
        // Sync to localStorage for offline access
        localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(updatedState));
      }
    } catch (error) {
      console.error('Error recording trial session:', error);
      // Fallback to localStorage only
      const today = new Date().toISOString().split('T')[0];

      setTrialState((prev) => {
        const current = prev || {
          firstUsed: Date.now(),
          sessionsToday: 0,
          lastSessionDate: today,
          totalTrialSessions: 0,
          trialExpired: false,
        };

        const isNewDay = current.lastSessionDate !== today;

        const updated: TrialState = {
          ...current,
          sessionsToday: isNewDay ? 1 : current.sessionsToday + 1,
          lastSessionDate: today,
          totalTrialSessions: current.totalTrialSessions + 1,
          trialExpired: isTrialExpired,
        };

        localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [userId, isTrialExpired]);

  // Clear trial state (call this when user signs up)
  const clearTrialState = useCallback(async () => {
    if (userId) {
      try {
        await clearTrialStateFirestore(userId);
      } catch (error) {
        console.error('Error clearing trial state from Firestore:', error);
      }
    }

    localStorage.removeItem(TRIAL_STORAGE_KEY);
    setTrialState(null);
  }, [userId]);

  // Reset trial (admin/debug only)
  const resetTrial = useCallback(() => {
    localStorage.removeItem(TRIAL_STORAGE_KEY);
    setTrialState(null);
  }, []);

  return {
    // State
    trialState,
    isTrialActive: trialState !== null,
    isTrialExpired,
    isLoading,

    // Limits
    sessionsRemainingToday,
    daysRemainingInTrial,
    shouldPromptSignup,

    // Actions
    recordTrialSession,
    clearTrialState,
    resetTrial,

    // Constants
    DAILY_SESSION_LIMIT,
    TRIAL_DURATION_DAYS,
  };
}
