'use client';

interface ShareableStatsCardProps {
  durationMinutes: number;
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
}

export function ShareableStatsCard({
  durationMinutes,
  totalSessions,
  totalHours,
  currentStreak,
}: ShareableStatsCardProps) {
  return (
    <div className="relative w-full aspect-[1.91/1] bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hourglass icon in background */}
      <div className="absolute top-8 right-8 text-white/5 transform rotate-12">
        <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">🎯</div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Session Complete!
              </h3>
              <p className="text-violet-200 text-sm">
                {durationMinutes} minutes of deep focus
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total Hours */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">
              {totalHours >= 1 ? `${Math.floor(totalHours)}h` : `${Math.round(totalHours * 60)}m`}
            </div>
            <div className="text-violet-200 text-sm font-medium uppercase tracking-wide">
              Total Focused
            </div>
          </div>

          {/* Total Sessions */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">
              {totalSessions}
            </div>
            <div className="text-violet-200 text-sm font-medium uppercase tracking-wide">
              Sessions
            </div>
          </div>

          {/* Current Streak */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">
              {currentStreak}
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-violet-200 text-sm font-medium uppercase tracking-wide">
              Day Streak
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-light text-white tracking-wide mb-1">
              There Is Still Time
            </div>
            <div className="text-violet-300 text-xs">
              Get Locked In and Achieve
            </div>
          </div>

          <div className="text-right">
            <div className="text-violet-200 text-sm font-mono">
              app.thereisstilltime.com
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}
