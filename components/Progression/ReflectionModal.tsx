'use client';

import { useState } from 'react';
import { JOURNALING_THEMES } from '@/app/constants/hourglassLibrary';

interface ReflectionModalProps {
  sessionId: string;
  onSubmit: (reflection: string, guidedTheme?: string) => void;
  onSkip: () => void;
  isPremium: boolean;
}

export function ReflectionModal({
  sessionId,
  onSubmit,
  onSkip,
  isPremium,
}: ReflectionModalProps) {
  const [reflection, setReflection] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | undefined>();

  const handleSubmit = () => {
    if (reflection.trim()) {
      onSubmit(reflection, selectedTheme);
    }
  };

  const selectedThemeData = JOURNALING_THEMES.find((t) => t.id === selectedTheme);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflection-title"
    >
      <div className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2
            id="reflection-title"
            className="mb-2 text-2xl font-light text-white"
          >
            Session complete
          </h2>
          <p className="text-sm text-twilight-300">
            Take a moment to reflect (optional)
          </p>
        </div>

        {/* Guided Themes (Premium) */}
        {isPremium && (
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-twilight-200">
              Reflection theme
            </label>
            <div className="flex flex-wrap gap-2">
              {JOURNALING_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                    selectedTheme === theme.id
                      ? 'bg-twilight-600 text-white'
                      : 'glass text-twilight-300 hover:bg-twilight-700/30'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            {selectedThemeData && (
              <p className="mt-3 text-sm italic text-twilight-400">
                {selectedThemeData.prompt}
              </p>
            )}
          </div>
        )}

        {/* Reflection Input */}
        <div className="mb-6">
          <label htmlFor="reflection-input" className="sr-only">
            Your reflection
          </label>
          <textarea
            id="reflection-input"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={
              selectedThemeData
                ? selectedThemeData.prompt
                : 'What did you accomplish or learn in this session?'
            }
            rows={6}
            className="w-full resize-none rounded-lg bg-slate-900/50 px-4 py-3 text-white placeholder:text-twilight-400 focus:outline-none focus:ring-2 focus:ring-twilight-400"
          />
          <div className="mt-2 text-right text-xs text-twilight-400">
            {reflection.length} characters
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={onSkip}
            className="px-6 py-2 text-sm font-medium text-twilight-300 transition-smooth hover:text-white"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reflection.trim()}
            className="rounded-full bg-twilight-600 px-8 py-3 text-sm font-medium text-white transition-smooth hover:bg-twilight-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save reflection
          </button>
        </div>
      </div>
    </div>
  );
}
