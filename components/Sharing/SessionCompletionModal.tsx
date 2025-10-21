'use client';

import { useState, useRef } from 'react';
import { ShareableStatsCard } from './ShareableStatsCard';

interface SessionCompletionModalProps {
  durationMinutes: number;
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
  onClose: () => void;
  onContinue: () => void;
}

export function SessionCompletionModal({
  durationMinutes,
  totalSessions,
  totalHours,
  currentStreak,
  onClose,
  onContinue,
}: SessionCompletionModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Philosophical quotes based on session count
  const quotes = [
    "Time is finite. You just used yours wisely.",
    "Every focused moment is an act of love toward your future.",
    "There is still time to become who you're meant to be.",
    "Presence is the greatest gift you can give yourself.",
    "You showed up. That's what matters.",
    "Focus is a superpower. You just exercised it.",
    "Time consciousness leads to life consciousness.",
    "Love everyone. Start with loving your commitment to growth.",
  ];

  const quote = quotes[totalSessions % quotes.length];

  const handleShare = async (platform: 'twitter' | 'instagram' | 'tiktok' | 'download') => {
    setIsSharing(true);

    try {
      if (platform === 'download') {
        // Download the shareable image
        await downloadShareableImage();
      } else if (platform === 'twitter') {
        // Download image first, then provide Twitter share instructions
        await downloadShareableImage();

        // Open Twitter with pre-filled text
        const text = `Just completed a ${durationMinutes}-minute focus session! 🎯\n\n${Math.floor(totalHours) > 0 ? `${Math.floor(totalHours)}h` : `${Math.round(totalHours * 60)}m`} total focused · ${totalSessions} sessions\n\nGet locked in and achieve with`;
        const url = 'https://app.thereisstilltime.com';

        // Show helpful message
        setTimeout(() => {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
          alert('✅ Stats image downloaded!\n\nTwitter will open in a new tab. Click "Add photos" to attach your downloaded stats card.');
        }, 500);
      } else if (platform === 'instagram') {
        // For Instagram, we'll download the image and show instructions
        await downloadShareableImage();
        alert('✅ Stats image downloaded!\n\nOpen Instagram and add it to your story.');
      } else if (platform === 'tiktok') {
        // For TikTok, download image and provide instructions
        await downloadShareableImage();
        alert('✅ Stats image downloaded!\n\nOpen TikTok, create a video, and add your downloaded stats card as an image overlay or end screen!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const downloadShareableImage = async () => {
    // Use html2canvas to convert the stats card to an image
    const html2canvas = (await import('html2canvas')).default;

    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `there-is-still-time-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://app.thereisstilltime.com');
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main content */}
        <div className="glass-strong rounded-3xl p-8 sm:p-12">
          {/* Celebration message */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Session Complete!
            </h2>
            <p className="text-lg sm:text-xl text-twilight-100 italic font-light px-4">
              "{quote}"
            </p>
          </div>

          {/* Shareable Stats Card (hidden for screenshot) */}
          <div ref={cardRef} className="mb-8">
            <ShareableStatsCard
              durationMinutes={durationMinutes}
              totalSessions={totalSessions}
              totalHours={totalHours}
              currentStreak={currentStreak}
            />
          </div>

          {/* Share buttons */}
          <div className="space-y-4 mb-6">
            <p className="text-center text-twilight-300 text-sm font-medium uppercase tracking-wide">
              Share Your Achievement
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Twitter/X */}
              <button
                onClick={() => handleShare('twitter')}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold py-3 px-4 rounded-xl transition-smooth disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="hidden sm:inline">Twitter</span>
              </button>

              {/* Instagram */}
              <button
                onClick={() => handleShare('instagram')}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-smooth disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="hidden sm:inline">Instagram</span>
              </button>

              {/* TikTok */}
              <button
                onClick={() => handleShare('tiktok')}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl transition-smooth disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="hidden sm:inline">TikTok</span>
              </button>

              {/* Download */}
              <button
                onClick={() => handleShare('download')}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 bg-twilight-600 hover:bg-twilight-500 text-white font-semibold py-3 px-4 rounded-xl transition-smooth disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>

            {/* Copy link button */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 glass hover:bg-twilight-600/30 text-twilight-200 font-medium py-3 px-6 rounded-xl transition-smooth"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Link
            </button>
          </div>

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-smooth shadow-lg hover:shadow-xl"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
