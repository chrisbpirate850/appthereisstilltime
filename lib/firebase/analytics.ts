import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from './config';
import { AnalyticsEvent } from '@/types';

// ============ Analytics Helper ============
export function logEvent(
  eventName: AnalyticsEvent['eventName'],
  properties: Record<string, any> = {},
  userId?: string
): void {
  // Only log in browser and if analytics is initialized
  if (typeof window === 'undefined' || !analytics) {
    return;
  }

  try {
    firebaseLogEvent(analytics, eventName, {
      ...properties,
      userId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// ============ Specific Event Loggers ============

export function logSessionStarted(
  userId: string,
  duration: number,
  hourglassId: string
): void {
  logEvent(
    'session_started',
    {
      session_duration: duration,
      hourglass_id: hourglassId,
    },
    userId
  );
}

export function logSessionCompleted(
  userId: string,
  duration: number,
  hourglassId: string,
  actualDuration: number
): void {
  logEvent(
    'session_completed',
    {
      planned_duration: duration,
      actual_duration: actualDuration,
      hourglass_id: hourglassId,
      completion_rate: (actualDuration / duration) * 100,
    },
    userId
  );
}

export function logSessionPaused(
  userId: string,
  remainingTime: number,
  hourglassId: string
): void {
  logEvent(
    'session_paused',
    {
      remaining_time: remainingTime,
      hourglass_id: hourglassId,
    },
    userId
  );
}

export function logSessionEndedEarly(
  userId: string,
  remainingTime: number,
  hourglassId: string
): void {
  logEvent(
    'session_ended_early',
    {
      remaining_time: remainingTime,
      hourglass_id: hourglassId,
    },
    userId
  );
}

export function logMilestoneReached(
  userId: string,
  milestoneId: string,
  milestoneType: 'sessions' | 'hours',
  value: number
): void {
  logEvent(
    'milestone_reached',
    {
      milestone_id: milestoneId,
      milestone_type: milestoneType,
      value,
    },
    userId
  );
}

export function logHourglassChanged(
  userId: string,
  previousId: string,
  newId: string
): void {
  logEvent(
    'hourglass_changed',
    {
      previous_hourglass: previousId,
      new_hourglass: newId,
    },
    userId
  );
}

export function logCustomHourglassRequested(
  userId: string,
  promptLength: number
): void {
  logEvent(
    'custom_hourglass_requested',
    {
      prompt_length: promptLength,
    },
    userId
  );
}

export function logReflectionSubmitted(
  userId: string,
  sessionId: string,
  reflectionLength: number,
  guidedTheme?: string
): void {
  logEvent(
    'reflection_submitted',
    {
      session_id: sessionId,
      reflection_length: reflectionLength,
      guided_theme: guidedTheme,
    },
    userId
  );
}

export function logPremiumUpgrade(userId: string, tier: string): void {
  logEvent(
    'premium_upgrade',
    {
      tier,
    },
    userId
  );
}

export function logThemeChanged(
  userId: string,
  previousTheme: string,
  newTheme: string
): void {
  logEvent(
    'theme_changed',
    {
      previous_theme: previousTheme,
      new_theme: newTheme,
    },
    userId
  );
}
