'use client';

import { useState } from 'react';
import { SESSION_PRESETS } from '@/app/constants/hourglassLibrary';

interface SessionPresetsProps {
  onSelectDuration: (minutes: number) => void;
}

export function SessionPresets({ onSelectDuration }: SessionPresetsProps) {
  const [customDuration, setCustomDuration] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomSubmit = () => {
    const minutes = parseInt(customDuration, 10);
    if (minutes > 0 && minutes <= 180) {
      onSelectDuration(minutes);
      setCustomDuration('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 px-4">
      {/* Heading */}
      <div className="text-center">
        <h1 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Get Locked In
        </h1>
        <h2 className="mb-2 text-xl sm:text-2xl font-light tracking-wide text-white">
          Select your focus session
        </h2>
        <p className="text-xs sm:text-sm text-twilight-300">
          Choose a duration to begin
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-md sm:max-w-none">
        {SESSION_PRESETS.map((preset) => (
          <button
            key={preset.duration}
            onClick={() => onSelectDuration(preset.duration)}
            className="glass-strong group relative flex h-24 w-24 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-xl sm:rounded-2xl transition-smooth hover:scale-105 hover:border-twilight-400 focus:ring-2 focus:ring-twilight-400"
            aria-label={`Start ${preset.duration} minute session - ${preset.description}`}
          >
            <div className="text-3xl sm:text-5xl font-light text-white group-hover:text-twilight-200">
              {preset.duration}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs uppercase tracking-wider text-twilight-300">
              minutes
            </div>
            <div className="mt-1 sm:mt-2 text-[9px] sm:text-xs text-twilight-400 hidden sm:block">
              {preset.description}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Duration */}
      <div className="flex flex-col items-center">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="text-sm font-medium text-twilight-300 underline decoration-twilight-400/30 underline-offset-4 transition-smooth hover:text-twilight-200 hover:decoration-twilight-400"
            aria-label="Enter custom duration"
          >
            Custom duration
          </button>
        ) : (
          <div className="glass flex items-center gap-3 rounded-lg px-4 py-3">
            <input
              type="number"
              min="1"
              max="180"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCustomSubmit();
                }
              }}
              placeholder="Minutes"
              className="w-24 bg-transparent text-center text-white placeholder:text-twilight-400 focus:outline-none"
              autoFocus
              aria-label="Custom duration in minutes"
            />
            <button
              onClick={handleCustomSubmit}
              className="rounded bg-twilight-600 px-4 py-1 text-sm font-medium text-white transition-smooth hover:bg-twilight-500"
              aria-label="Start custom duration session"
            >
              Start
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomDuration('');
              }}
              className="text-sm text-twilight-400 hover:text-twilight-300"
              aria-label="Cancel custom duration"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
