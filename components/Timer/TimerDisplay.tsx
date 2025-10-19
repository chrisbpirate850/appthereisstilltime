'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/hooks/useTimer';
import { ProgressRing } from './ProgressRing';

interface TimerDisplayProps {
  remainingSeconds: number;
  progress: number;
  isActive: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

export function TimerDisplay({
  remainingSeconds,
  progress,
  isActive,
  isPaused,
  onPause,
  onResume,
  onEnd,
}: TimerDisplayProps) {
  // Responsive size for progress ring
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ringSize = isMobile ? 240 : 300;
  const strokeWidth = isMobile ? 6 : 8;

  return (
    <div className="relative flex flex-col items-center justify-center px-4">
      {/* Progress Ring */}
      <div className="relative">
        <ProgressRing progress={progress} size={ringSize} strokeWidth={strokeWidth} />

        {/* Time Display (centered in ring) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-5xl sm:text-7xl font-light tracking-wider text-white"
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatTime(remainingSeconds)}
            </div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium uppercase tracking-widest text-twilight-300">
              {isPaused ? 'Paused' : 'Remaining'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {isActive && (
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
          {/* Pause/Resume Button */}
          <button
            onClick={isPaused ? onResume : onPause}
            className="glass rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-medium uppercase tracking-wider text-white transition-smooth hover:bg-twilight-600/30 focus:ring-2 focus:ring-twilight-400 w-full sm:w-auto"
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          {/* End Session Button */}
          <button
            onClick={onEnd}
            className="rounded-full border border-red-500/30 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-medium uppercase tracking-wider text-red-300 transition-smooth hover:bg-red-500/10 focus:ring-2 focus:ring-red-400 w-full sm:w-auto"
            aria-label="End session early"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  );
}
