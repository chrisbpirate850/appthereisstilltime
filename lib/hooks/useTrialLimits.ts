'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TrialState } from '@/types';

const TRIAL_STORAGE_KEY = 'thereisstilltime_trial';
const TRIAL_DURATION_DAYS = 7;
const DAILY_SESSION_LIMIT = 2;

/**
 * Hook to track and enforce trial limits for anonymous (non-signed-in) users
 *
 * Trial Rules:
 * - 2 sessions per day
 * - 7 day trial period from first use
 * - Resets daily at midnight local time
 * - Prompts signup after limit reached
 */
export function useTrialLimits() {
  const [trialState, setTrialState] = useState<TrialState | null>(null);

  // Load trial state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TrialState;
        setTrialState(parsed);
      } catch (error) {
        console.error('Failed to parse trial state:', error);
        // Initialize new trial state if parsing fails
        initializeTrialState();
      }
    } else {
      // No trial state yet - will be initialized on first session
      setTrialState(null);
    }
  }, []);

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
  const recordTrialSession = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];

    setTrialState((prev) => {
      const current = prev || {
        firstUsed: Date.now(),
        sessionsToday: 0,
        lastSessionDate: today,
        totalTrialSessions: 0,
        trialExpired: false,
      };

      // If it's a new day, reset today's counter
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
  }, [isTrialExpired]);

  // Clear trial state (call this when user signs up)
  const clearTrialState = useCallback(() => {
    localStorage.removeItem(TRIAL_STORAGE_KEY);
    setTrialState(null);
  }, []);

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
