import { Timestamp } from 'firebase/firestore';

// ============ Core Timer Types ============
export type SessionDuration = 25 | 50 | 90 | number;

export interface TimerState {
  duration: number; // in seconds
  remaining: number;
  isActive: boolean;
  isPaused: boolean;
  startedAt: number | null;
}

// ============ Session Tracking ============
export interface Session {
  id: string;
  userId: string; // Anonymous ID or authenticated UID
  duration: number; // in minutes
  completedAt: Timestamp;
  hourglassTheme?: string;
  customPrompt?: string;
  reflection?: string;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  firstSessionAt?: Timestamp;
  lastSessionAt?: Timestamp;
  milestonesReached: string[];
}

// ============ Hourglass Library (Phase 2) ============
export interface HourglassVideo {
  id: string;
  promptKey: string;
  promptText: string;
  symbolism: string; // e.g., "clarity", "focus", "flow"
  videoUrl: string;
  thumbnailUrl?: string;
  theme: 'zen' | 'dusk' | 'midnight';
  unlockRequirement?: {
    type: 'sessions' | 'hours' | 'milestone';
    value: number;
  };
}

// ============ Milestones (Phase 4) ============
export interface Milestone {
  id: string;
  type: 'sessions' | 'hours';
  value: number;
  message: string;
  reward?: {
    type: 'hourglass' | 'theme' | 'feature';
    id: string;
  };
}

// ============ User Preferences ============
export interface UserPreferences {
  userId: string;
  selectedHourglassId: string;
  theme: 'zen' | 'dusk' | 'midnight';
  enableAnimations: boolean;
  enableSound: boolean;
  enableJournaling: boolean;
  updatedAt: Timestamp;
}

// ============ Journaling (Phase 4) ============
export interface Reflection {
  id: string;
  userId: string;
  sessionId: string;
  text: string;
  createdAt: Timestamp;
  guidedTheme?: string; // Premium feature
}

// ============ Premium/Monetization (Phase 5) ============
export interface UserSubscription {
  userId: string;
  tier: 'free' | 'premium';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Timestamp;
  status: 'active' | 'canceled' | 'past_due';
}

export interface PremiumFeatures {
  symbolicLibraryAccess: boolean;
  journalingThemes: boolean;
  ambientSoundtrack: boolean;
  calendarSync: boolean;
  dataExport: boolean;
  customAIHourglass: boolean;
}

// ============ Custom AI Video Generation (Phase 3) ============
export interface CustomHourglassRequest {
  id: string;
  userId: string;
  customPrompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  errorMessage?: string;
}

export interface VideoGenerationProvider {
  name: 'runway' | 'gemini' | 'replicate' | 'stable-diffusion';
  apiKey: string;
  endpoint: string;
}

// ============ Analytics Events (Phase 4) ============
export interface AnalyticsEvent {
  eventName:
    | 'session_started'
    | 'session_completed'
    | 'session_paused'
    | 'session_ended_early'
    | 'milestone_reached'
    | 'hourglass_changed'
    | 'custom_hourglass_requested'
    | 'reflection_submitted'
    | 'premium_upgrade'
    | 'theme_changed';
  properties: Record<string, any>;
  timestamp: number;
  userId: string;
}

// ============ Feature Flags ============
export interface FeatureFlags {
  phase2_symbolicMapping: boolean;
  phase3_customAI: boolean;
  phase4_journaling: boolean;
  phase5_premium: boolean;
}

// ============ UI State ============
export interface AppState {
  currentPhase: 1 | 2 | 3 | 4 | 5;
  featureFlags: FeatureFlags;
  userStats: UserStats;
  userPreferences: UserPreferences;
  activeSession: Session | null;
  timerState: TimerState;
}
