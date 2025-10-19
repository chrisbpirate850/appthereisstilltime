'use client';

import { useEffect, useState } from 'react';

interface HourglassAnimationProps {
  videoUrl: string;
  prefersReducedMotion?: boolean;
}

export function HourglassAnimation({
  videoUrl,
  prefersReducedMotion,
}: HourglassAnimationProps) {
  const [shouldShowVideo, setShouldShowVideo] = useState(true);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      const handleChange = () => {
        setShouldShowVideo(!mediaQuery.matches && !prefersReducedMotion);
      };

      handleChange(); // Initial check

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [prefersReducedMotion]);

  if (!shouldShowVideo) {
    // Show static image for reduced motion
    return (
      <div className="hourglass-video bg-gradient-to-b from-twilight-900/20 to-plum-900/20" />
    );
  }

  return (
    <video
      key={videoUrl} // Force remount when videoUrl changes
      className="hourglass-video"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
}
