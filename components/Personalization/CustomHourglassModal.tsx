'use client';

import { useState } from 'react';

interface CustomHourglassModalProps {
  onSubmit: (prompt: string) => void;
  onClose: () => void;
  isGenerating: boolean;
}

export function CustomHourglassModal({
  onSubmit,
  onClose,
  isGenerating,
}: CustomHourglassModalProps) {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleSubmit = () => {
    if (customPrompt.trim()) {
      onSubmit(customPrompt);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-hourglass-title"
    >
      <div className="glass-strong w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 id="custom-hourglass-title" className="mb-2 text-2xl font-light text-white">
            Create your symbolic hourglass
          </h2>
          <p className="text-sm text-twilight-300">
            What do you need more time for?
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label htmlFor="custom-prompt-input" className="mb-3 block text-sm font-medium text-twilight-200">
            There is still time to...
          </label>
          <input
            id="custom-prompt-input"
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isGenerating) {
                handleSubmit();
              }
            }}
            placeholder="rediscover myself"
            maxLength={100}
            disabled={isGenerating}
            className="w-full rounded-lg bg-slate-900/50 px-4 py-3 text-white placeholder:text-twilight-400 focus:outline-none focus:ring-2 focus:ring-twilight-400 disabled:opacity-50"
            autoFocus
          />
          <div className="mt-2 text-right text-xs text-twilight-400">
            {customPrompt.length}/100 characters
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 rounded-lg bg-twilight-900/30 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-twilight-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-twilight-300">
              <p className="mb-2">
                AI will generate a unique hourglass animation symbolizing your intention.
              </p>
              <p className="text-xs text-twilight-400">
                This may take 30-60 seconds. You'll be notified when it's ready.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-2 text-sm font-medium text-twilight-300 transition-smooth hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!customPrompt.trim() || isGenerating}
            className="rounded-full bg-twilight-600 px-8 py-3 text-sm font-medium text-white transition-smooth hover:bg-twilight-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
