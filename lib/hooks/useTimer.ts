import { useState, useRef, useEffect, useCallback } from 'react';
import { TimerState } from '@/types';

interface UseTimerReturn {
  timerState: TimerState;
  startTimer: (durationInMinutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  endTimer: () => void;
  resetTimer: () => void;
  progress: number; // 0-100
}

/**
 * Core timer hook with accurate countdown
 * Handles drift compensation and background tab behavior
 */
export function useTimer(onComplete?: () => void): UseTimerReturn {
  const [timerState, setTimerState] = useState<TimerState>({
    duration: 0,
    remaining: 0,
    isActive: false,
    isPaused: false,
    startedAt: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const expectedEndTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(0);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start timer
  const startTimer = useCallback((durationInMinutes: number) => {
    const durationInSeconds = durationInMinutes * 60;
    const now = Date.now();

    setTimerState({
      duration: durationInSeconds,
      remaining: durationInSeconds,
      isActive: true,
      isPaused: false,
      startedAt: now,
    });

    expectedEndTimeRef.current = now + durationInSeconds * 1000;

    // Start countdown with drift compensation
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const expectedEnd = expectedEndTimeRef.current!;
      const remainingMs = Math.max(0, expectedEnd - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds <= 0) {
        // Timer complete
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        setTimerState((prev) => ({
          ...prev,
          remaining: 0,
          isActive: false,
        }));

        if (onComplete) {
          onComplete();
        }
      } else {
        setTimerState((prev) => ({
          ...prev,
          remaining: remainingSeconds,
        }));
      }
    }, 100); // Update every 100ms for smooth UI, but use Date.now() for accuracy
  }, [onComplete]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerState((prev) => {
      pausedRemainingRef.current = prev.remaining;
      return {
        ...prev,
        isPaused: true,
      };
    });
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    const now = Date.now();
    const remainingSeconds = pausedRemainingRef.current || timerState.remaining;

    expectedEndTimeRef.current = now + remainingSeconds * 1000;

    setTimerState((prev) => ({
      ...prev,
      isPaused: false,
      startedAt: now,
    }));

    // Restart countdown
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const expectedEnd = expectedEndTimeRef.current!;
      const remainingMs = Math.max(0, expectedEnd - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        setTimerState((prev) => ({
          ...prev,
          remaining: 0,
          isActive: false,
        }));

        if (onComplete) {
          onComplete();
        }
      } else {
        setTimerState((prev) => ({
          ...prev,
          remaining: remainingSeconds,
        }));
      }
    }, 100);
  }, [timerState.remaining, onComplete]);

  // End timer early
  const endTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerState({
      duration: 0,
      remaining: 0,
      isActive: false,
      isPaused: false,
      startedAt: null,
    });

    expectedEndTimeRef.current = null;
    pausedRemainingRef.current = 0;
  }, []);

  // Reset to initial state
  const resetTimer = useCallback(() => {
    endTimer();
  }, [endTimer]);

  // Calculate progress (0-100)
  const progress =
    timerState.duration > 0
      ? ((timerState.duration - timerState.remaining) / timerState.duration) * 100
      : 0;

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    endTimer,
    resetTimer,
    progress,
  };
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
