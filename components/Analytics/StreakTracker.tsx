'use client';

import { StreakInfo } from '@/lib/analytics/aggregations';

interface StreakTrackerProps {
  streakInfo: StreakInfo;
}

export function StreakTracker({ streakInfo }: StreakTrackerProps) {
  const { currentStreak, longestStreak, lastSessionDate } = streakInfo;

  return (
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        Streak Tracker
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-4xl font-light text-twilight-300 mb-2">
            {currentStreak}
          </div>
          <div className="text-sm text-twilight-400">
            {currentStreak === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-xs text-twilight-500 mt-1">Current Streak</div>
        </div>

        {/* Longest Streak */}
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-4xl font-light text-twilight-300 mb-2">
            {longestStreak}
          </div>
          <div className="text-sm text-twilight-400">
            {longestStreak === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-xs text-twilight-500 mt-1">Personal Best</div>
        </div>
      </div>

      {/* Streak Status Message */}
      <div className="mt-4 text-center">
        {currentStreak === 0 ? (
          <p className="text-sm text-twilight-400">
            Start a session today to begin your streak!
          </p>
        ) : currentStreak === 1 ? (
          <p className="text-sm text-twilight-300">
            Great start! Keep it going tomorrow.
          </p>
        ) : currentStreak < 7 ? (
          <p className="text-sm text-twilight-300">
            {7 - currentStreak} more {7 - currentStreak === 1 ? 'day' : 'days'} to reach a
            week!
          </p>
        ) : currentStreak < 30 ? (
          <p className="text-sm text-twilight-300">
            Amazing! {30 - currentStreak} more {30 - currentStreak === 1 ? 'day' : 'days'}{' '}
            to hit 30 days.
          </p>
        ) : currentStreak < 100 ? (
          <p className="text-sm text-twilight-300">
            Incredible! {100 - currentStreak} {100 - currentStreak === 1 ? 'day' : 'days'}{' '}
            until the century mark!
          </p>
        ) : (
          <p className="text-sm text-twilight-300">
            🏆 Legendary! You're in the top 1% of users.
          </p>
        )}
      </div>

      {/* Last Session */}
      {lastSessionDate && (
        <div className="mt-4 text-center text-xs text-twilight-500">
          Last session: {new Date(lastSessionDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
