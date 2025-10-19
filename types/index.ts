import { Timestamp } from 'firebase/firestore';

// ============ Core Timer Types ============
export type SessionDuration = 25 | 50 | 90;
export type CustomDuration = number; // Premium feature: any duration

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
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  hourglassTheme?: string;
  customPrompt?: string;
  reflection?: string;
  roomId?: string; // Study room (Phase 5)
  verified: boolean; // True if completed cleanly
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  totalMinutesVerified: number; // For leaderboards
  last30dMinutesVerified: number; // Rolling 30-day window
  currentStreak: number; // Consecutive days with sessions
  longestStreak: number; // Personal record
  firstSessionAt?: Timestamp;
  lastSessionAt?: Timestamp;
  lastSessionDate?: string; // YYYY-MM-DD for streak tracking
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
export type SubscriptionTier = 'free' | 'focus' | 'student' | 'premium' | 'lifetime';

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: Timestamp;
  currentPeriodEnd?: Timestamp;
  cancelAtPeriodEnd?: boolean;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Usage tracking
  videoCreditsUsed: number; // This month
  videoCreditsLimit: number; // Based on tier
  videoCreditsRollover: number; // Unused from previous months
  imageCreditsUsed: number; // This month
  imageCreditsLimit: number; // Based on tier
  lastResetAt: Timestamp; // Monthly reset
  // Privacy settings (for Study Rooms)
  displayName?: string; // Custom name or "Anonymous####"
  displayAnon: boolean; // Show as anonymous
  showOnLeaderboard: boolean; // Opt-in to leaderboards
  preferredRoomId?: string; // Auto-rejoin room
}

export interface PremiumFeatures {
  // Tier: Basic ($4.99/mo)
  dashboard: boolean;
  exportData: boolean;
  customImages: boolean;
  // Tier: Student ($29/year)
  studyRooms: boolean;
  unlimitedImages: boolean;
  printDiscount: number; // 0, 15, 30, 40 (percent)
  // Tier: Premium ($9.99/mo)
  customVideos: boolean;
  priorityGeneration: boolean;
  highResExports: boolean;
  vipBadge: boolean;
  // Tier: Lifetime ($299 once)
  commercialLicense: boolean;
  allFutureFeatures: boolean;
}

// ============ Trial Tracking (Anonymous Users) ============
export interface TrialState {
  firstUsed: number; // Timestamp of first session
  sessionsToday: number; // Count for today
  lastSessionDate: string; // "YYYY-MM-DD"
  totalTrialSessions: number; // Total since first use
  trialExpired: boolean; // After 7 days
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

// ============ Study Rooms (Phase 5) ============
export interface Room {
  id: string; // "mcat", "lsat", "bar", "usmle", "cfa", "gre"
  name: string; // "MCAT"
  emoji: string; // "🧪"
  description?: string;
  activeCount: number; // Denormalized counter (maintained by Cloud Functions)
  updatedAt: Timestamp;
}

export interface RoomPresence {
  userId: string;
  roomId: string;
  username: string; // Display name or "Anonymous####"
  startedAt: Timestamp;
  lastActiveAt: Timestamp; // Heartbeat timestamp
  totalHoursAtJoin: number; // Snapshot of user's total hours
  sessionId?: string; // Current active session
}

export interface Leaderboard {
  roomId: string;
  period: '30d' | 'all-time';
  top: LeaderboardEntry[];
  updatedAt: Timestamp;
}

export interface LeaderboardEntry {
  userId: string;
  username: string; // Display name or "Anonymous####"
  rank: number;
  minutes: number; // For the period
  badge?: 'vip' | 'founder' | 'top10';
}

// ============ UI State ============
export interface AppState {
  currentPhase: 1 | 2 | 3 | 4 | 5;
  featureFlags: FeatureFlags;
  userStats: UserStats;
  userPreferences: UserPreferences;
  activeSession: Session | null;
  timerState: TimerState;
  subscription: UserSubscription | null;
  trialState: TrialState | null;
}
