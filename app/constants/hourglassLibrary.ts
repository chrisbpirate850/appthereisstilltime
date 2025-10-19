import { HourglassVideo, Milestone } from '@/types';

// ============ Default Hourglass (Phase 1) ============
export const DEFAULT_HOURGLASS_ID = 'zen-default';

// ============ Hourglass Library (Phase 2) ============
// Note: Video URLs will be updated once uploaded to Firebase Storage
export const HOURGLASS_LIBRARY: HourglassVideo[] = [
  // === Always Available (Phase 1) ===
  {
    id: 'zen-default',
    promptKey: 'default',
    promptText: 'focus',
    symbolism: 'clarity',
    videoUrl: '/assets/hourglasses/zen-default.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/zen-default.jpg',
    theme: 'zen',
  },

  // === Unlocked after 3 sessions (Phase 2) ===
  {
    id: 'breathe',
    promptKey: 'breathe',
    promptText: 'breathe',
    symbolism: 'calm',
    videoUrl: '/assets/hourglasses/breathe.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/breathe.jpg',
    theme: 'zen',
    unlockRequirement: {
      type: 'sessions',
      value: 3,
    },
  },
  {
    id: 'study-mcat',
    promptKey: 'study_mcat',
    promptText: 'study for the MCAT',
    symbolism: 'dedication',
    videoUrl: '/assets/hourglasses/study-mcat.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/study-mcat.jpg',
    theme: 'zen',
    unlockRequirement: {
      type: 'sessions',
      value: 3,
    },
  },
  {
    id: 'focus-matters',
    promptKey: 'focus_matters',
    promptText: 'focus on what matters',
    symbolism: 'priority',
    videoUrl: '/assets/hourglasses/focus-matters.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/focus-matters.jpg',
    theme: 'zen',
    unlockRequirement: {
      type: 'sessions',
      value: 3,
    },
  },
  {
    id: 'remember-goals',
    promptKey: 'remember_goals',
    promptText: 'remember your goals',
    symbolism: 'vision',
    videoUrl: '/assets/hourglasses/remember-goals.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/remember-goals.jpg',
    theme: 'zen',
    unlockRequirement: {
      type: 'sessions',
      value: 3,
    },
  },

  // === Unlocked after 10 sessions ===
  {
    id: 'new-beginnings',
    promptKey: 'new_beginnings',
    promptText: 'start fresh',
    symbolism: 'renewal',
    videoUrl: '/assets/hourglasses/new-beginnings.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/new-beginnings.jpg',
    theme: 'dusk',
    unlockRequirement: {
      type: 'sessions',
      value: 10,
    },
  },
  {
    id: 'trust-process',
    promptKey: 'trust_process',
    promptText: 'trust the process',
    symbolism: 'faith',
    videoUrl: '/assets/hourglasses/trust-process.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/trust-process.jpg',
    theme: 'dusk',
    unlockRequirement: {
      type: 'sessions',
      value: 10,
    },
  },
  {
    id: 'be-present',
    promptKey: 'be_present',
    promptText: 'be present',
    symbolism: 'mindfulness',
    videoUrl: '/assets/hourglasses/be-present.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/be-present.jpg',
    theme: 'dusk',
    unlockRequirement: {
      type: 'sessions',
      value: 10,
    },
  },

  // === Unlocked after 50 hours total ===
  {
    id: 'galaxy',
    promptKey: 'galaxy',
    promptText: 'reach for the stars',
    symbolism: 'ambition',
    videoUrl: '/assets/hourglasses/galaxy.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/galaxy.jpg',
    theme: 'midnight',
    unlockRequirement: {
      type: 'hours',
      value: 50,
    },
  },
  {
    id: 'ocean-waves',
    promptKey: 'ocean_waves',
    promptText: 'flow like water',
    symbolism: 'adaptability',
    videoUrl: '/assets/hourglasses/ocean-waves.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/ocean-waves.jpg',
    theme: 'midnight',
    unlockRequirement: {
      type: 'hours',
      value: 50,
    },
  },

  // === Unlocked after 100 hours total ===
  {
    id: 'aurora',
    promptKey: 'aurora',
    promptText: 'embrace transformation',
    symbolism: 'growth',
    videoUrl: '/assets/hourglasses/aurora.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/aurora.jpg',
    theme: 'midnight',
    unlockRequirement: {
      type: 'hours',
      value: 100,
    },
  },
  {
    id: 'phoenix',
    promptKey: 'phoenix',
    promptText: 'rise again',
    symbolism: 'resilience',
    videoUrl: '/assets/hourglasses/phoenix.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/phoenix.jpg',
    theme: 'midnight',
    unlockRequirement: {
      type: 'hours',
      value: 100,
    },
  },

  // === Premium Only (Phase 5) ===
  {
    id: 'cosmic-love',
    promptKey: 'cosmic_love',
    promptText: 'cultivate love',
    symbolism: 'compassion',
    videoUrl: '/assets/hourglasses/cosmic-love.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/cosmic-love.jpg',
    theme: 'midnight',
    unlockRequirement: {
      type: 'milestone',
      value: 0, // Premium tier required
    },
  },
  {
    id: 'inner-peace',
    promptKey: 'inner_peace',
    promptText: 'find inner peace',
    symbolism: 'serenity',
    videoUrl: '/assets/hourglasses/inner-peace.mp4',
    thumbnailUrl: '/assets/hourglasses/thumbnails/inner-peace.jpg',
    theme: 'midnight',
    unlockRequirement: {
      type: 'milestone',
      value: 0, // Premium tier required
    },
  },
];

// ============ Milestones (Phase 4) ============
export const MILESTONES: Milestone[] = [
  // Session-based milestones
  {
    id: 'first-session',
    type: 'sessions',
    value: 1,
    message: 'Great start! You have completed your first focus session.',
  },
  {
    id: 'three-sessions',
    type: 'sessions',
    value: 3,
    message: 'You have unlocked symbolic hourglasses! Choose one that resonates with you.',
    reward: {
      type: 'feature',
      id: 'phase2_unlock',
    },
  },
  {
    id: 'ten-sessions',
    type: 'sessions',
    value: 10,
    message: 'Ten sessions! You are building a meaningful practice.',
    reward: {
      type: 'hourglass',
      id: 'new-beginnings',
    },
  },
  {
    id: 'twentyfive-sessions',
    type: 'sessions',
    value: 25,
    message: '25 sessions of dedication. Look how far you have come!',
  },
  {
    id: 'fifty-sessions',
    type: 'sessions',
    value: 50,
    message: 'Incredible! 50 sessions completed. Your commitment is inspiring.',
  },
  {
    id: 'hundred-sessions',
    type: 'sessions',
    value: 100,
    message: '100 sessions! You have unlocked the Aurora and Phoenix hourglasses.',
    reward: {
      type: 'hourglass',
      id: 'aurora',
    },
  },
  {
    id: 'twofifty-sessions',
    type: 'sessions',
    value: 250,
    message: '250 sessions of focused time. You are embodying discipline and purpose.',
  },

  // Hour-based milestones
  {
    id: 'ten-hours',
    type: 'hours',
    value: 10,
    message: '10 hours focused! That is real progress.',
  },
  {
    id: 'twentyfive-hours',
    type: 'hours',
    value: 25,
    message: '25 hours of dedication. Time well spent.',
  },
  {
    id: 'fifty-hours',
    type: 'hours',
    value: 50,
    message: '50 hours! You have unlocked new cosmic hourglasses.',
    reward: {
      type: 'hourglass',
      id: 'galaxy',
    },
  },
  {
    id: 'hundred-hours',
    type: 'hours',
    value: 100,
    message: '100 hours of deep work. You are investing in yourself beautifully.',
  },
  {
    id: 'twofifty-hours',
    type: 'hours',
    value: 250,
    message: '250 hours focused. This is transformation in action.',
  },
  {
    id: 'fivehundred-hours',
    type: 'hours',
    value: 500,
    message: '500 hours. You have created something extraordinary through consistency.',
  },
];

// ============ Session Presets ============
export const SESSION_PRESETS = [
  { duration: 25, label: '25 min', description: 'Pomodoro sprint' },
  { duration: 50, label: '50 min', description: 'Deep work session' },
  { duration: 90, label: '90 min', description: 'Extended focus' },
];

// ============ Theme Configurations ============
export const THEMES = {
  zen: {
    name: 'Zen',
    description: 'Calm and minimal',
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
  },
  dusk: {
    name: 'Dusk',
    description: 'Warm twilight hues',
    gradient: 'from-purple-900 via-pink-800 to-orange-900',
  },
  midnight: {
    name: 'Midnight',
    description: 'Deep cosmic darkness',
    gradient: 'from-black via-indigo-950 to-black',
  },
};

// ============ Guided Journaling Themes (Phase 5 Premium) ============
export const JOURNALING_THEMES = [
  {
    id: 'love',
    name: 'Love',
    prompt: 'What did you learn about compassion or connection today?',
  },
  {
    id: 'trust',
    name: 'Trust',
    prompt: 'What step did you take in faith, even when uncertain?',
  },
  {
    id: 'clarity',
    name: 'Clarity',
    prompt: 'What became clearer to you during this session?',
  },
  {
    id: 'growth',
    name: 'Growth',
    prompt: 'How did you grow or challenge yourself today?',
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    prompt: 'What are you grateful for in this moment?',
  },
];
