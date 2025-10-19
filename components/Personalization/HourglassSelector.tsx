'use client';

import { HourglassVideo } from '@/types';

interface HourglassSelectorProps {
  availableHourglasses: HourglassVideo[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function HourglassSelector({
  availableHourglasses,
  selectedId,
  onSelect,
  onClose,
}: HourglassSelectorProps) {
  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  // Group by theme
  const groupedByTheme = availableHourglasses.reduce(
    (acc, hourglass) => {
      if (!acc[hourglass.theme]) {
        acc[hourglass.theme] = [];
      }
      acc[hourglass.theme].push(hourglass);
      return acc;
    },
    {} as Record<string, HourglassVideo[]>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hourglass-selector-title"
    >
      <div className="glass-strong max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 id="hourglass-selector-title" className="text-2xl font-light text-white">
              There is still time to...
            </h2>
            <p className="mt-1 text-sm text-twilight-300">
              Choose a symbolic hourglass for your session
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-twilight-300 hover:text-white"
            aria-label="Close selector"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Hourglasses grouped by theme */}
        <div className="space-y-8">
          {Object.entries(groupedByTheme).map(([theme, hourglasses]) => (
            <div key={theme}>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-twilight-400">
                {theme} collection
              </h3>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {hourglasses.map((hourglass) => (
                  <button
                    key={hourglass.id}
                    onClick={() => handleSelect(hourglass.id)}
                    className={`glass group relative flex flex-col items-start rounded-xl p-4 text-left transition-smooth hover:border-twilight-400 ${
                      selectedId === hourglass.id
                        ? 'border-twilight-400 bg-twilight-600/20'
                        : ''
                    }`}
                    aria-pressed={selectedId === hourglass.id}
                  >
                    {/* Thumbnail */}
                    <div className="mb-3 h-24 w-full overflow-hidden rounded-lg bg-slate-900/50">
                      {hourglass.thumbnailUrl ? (
                        <img
                          src={hourglass.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-smooth"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-twilight-400">
                          <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <div className="mb-1 font-medium text-white">
                        ...{hourglass.promptText}
                      </div>
                      <div className="text-xs text-twilight-400">
                        {hourglass.symbolism}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedId === hourglass.id && (
                      <div className="absolute right-3 top-3">
                        <svg
                          className="h-5 w-5 text-twilight-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
