'use client';

import { useTrialLimits } from '@/lib/hooks/useTrialLimits';

interface TrialBannerProps {
  onSignupClick: () => void;
}

/**
 * Trial Banner
 *
 * Shows trial status for anonymous users:
 * - Sessions remaining today
 * - Days remaining in trial
 * - Signup prompt when appropriate
 */
export function TrialBanner({ onSignupClick }: TrialBannerProps) {
  const {
    isTrialActive,
    sessionsRemainingToday,
    daysRemainingInTrial,
    DAILY_SESSION_LIMIT,
  } = useTrialLimits();

  // Don't show if user is not in trial (signed up)
  if (!isTrialActive) return null;

  const sessionsUsedToday = DAILY_SESSION_LIMIT - sessionsRemainingToday;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4">
      <div className="glass-strong rounded-lg px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          {/* Trial Status */}
          <div className="flex-1">
            <p className="text-sm text-white font-medium">
              Trial: {sessionsUsedToday} of {DAILY_SESSION_LIMIT} sessions today
            </p>
            <p className="text-xs text-twilight-400 mt-0.5">
              {daysRemainingInTrial} {daysRemainingInTrial === 1 ? 'day' : 'days'} remaining
            </p>
          </div>

          {/* Signup Button */}
          <button
            onClick={onSignupClick}
            className="px-4 py-2 bg-twilight-600 hover:bg-twilight-500 text-white text-sm font-medium rounded-lg transition-smooth flex-shrink-0"
          >
            Sign Up Free
          </button>
        </div>
      </div>
    </div>
  );
}
