'use client';

import { useState } from 'react';

interface CustomHourglassModalProps {
  onSubmit: (prompt: string, style: string) => void;
  onClose: () => void;
  isGenerating: boolean;
  creditsRemaining: number | 'unlimited';
}

const STYLES = [
  { id: 'photographic', name: 'Photographic', emoji: '📸', desc: 'Realistic and detailed' },
  { id: 'artistic', name: 'Artistic', emoji: '🎨', desc: 'Painterly and expressive' },
  { id: 'minimalist', name: 'Minimalist', emoji: '⚪', desc: 'Clean and simple' },
  { id: 'abstract', name: 'Abstract', emoji: '🌀', desc: 'Creative and symbolic' },
];

export function CustomHourglassModal({
  onSubmit,
  onClose,
  isGenerating,
  creditsRemaining,
}: CustomHourglassModalProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photographic');

  const handleSubmit = () => {
    if (customPrompt.trim()) {
      onSubmit(customPrompt, selectedStyle);
    }
  };

  const hasCredits = creditsRemaining === 'unlimited' || creditsRemaining > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-hourglass-title"
    >
      <div className="glass-strong w-full max-w-lg rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h2 id="custom-hourglass-title" className="text-2xl font-light text-white">
              AI Custom Hourglass
            </h2>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-twilight-400 hover:text-white transition-smooth disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-twilight-300">
            Generate a unique hourglass image with AI
          </p>

          {/* Credits Display */}
          <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs bg-twilight-700/50">
            {creditsRemaining === 'unlimited' ? (
              <span className="text-twilight-300">✨ Unlimited credits</span>
            ) : (
              <span className="text-twilight-300">
                {creditsRemaining} credit{creditsRemaining !== 1 ? 's' : ''} remaining this month
              </span>
            )}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label htmlFor="custom-prompt-input" className="mb-3 block text-sm font-medium text-twilight-200">
            Describe your hourglass
          </label>
          <textarea
            id="custom-prompt-input"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="flowing golden sand through crystal glass, peaceful zen garden atmosphere"
            maxLength={200}
            rows={3}
            disabled={isGenerating || !hasCredits}
            className="w-full rounded-lg bg-slate-900/50 px-4 py-3 text-white placeholder:text-twilight-400 focus:outline-none focus:ring-2 focus:ring-twilight-400 disabled:opacity-50 resize-none"
            autoFocus
          />
          <div className="mt-2 text-right text-xs text-twilight-400">
            {customPrompt.length}/200 characters
          </div>
        </div>

        {/* Style Selector */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium text-twilight-200">
            Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                disabled={isGenerating || !hasCredits}
                className={`
                  glass rounded-lg p-3 text-left transition-smooth
                  ${selectedStyle === style.id
                    ? 'ring-2 ring-twilight-400 bg-twilight-600/30'
                    : 'hover:bg-twilight-700/30'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="text-2xl mb-1">{style.emoji}</div>
                <div className="text-sm text-white font-medium">{style.name}</div>
                <div className="text-xs text-twilight-400">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        {!hasCredits ? (
          <div className="mb-6 rounded-lg bg-red-900/20 border border-red-500/30 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-sm text-red-300">
                <p className="font-medium mb-1">No credits remaining</p>
                <p className="text-xs text-red-400">
                  Your monthly image credits have been used. Upgrade to Student tier for unlimited images, or wait until next month.
                </p>
              </div>
            </div>
          </div>
        ) : (
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
                  AI will generate a unique hourglass image based on your description.
                </p>
                <p className="text-xs text-twilight-400">
                  Generation takes ~10-15 seconds. You can save and use it as your timer background.
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={!customPrompt.trim() || isGenerating || !hasCredits}
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
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Generate Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
