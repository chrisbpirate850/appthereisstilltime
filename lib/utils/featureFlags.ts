import { FeatureFlags, UserStats, UserSubscription } from '@/types';

/**
 * Get feature flags based on environment variables and user progress
 * Phases unlock based on user milestones + environment config
 */
export function getFeatureFlags(
  userStats: UserStats,
  subscription?: UserSubscription | null
): FeatureFlags {
  // Get base feature flags from environment
  const envFlags = {
    phase2_symbolicMapping:
      process.env.NEXT_PUBLIC_ENABLE_PHASE_2 === 'true' || false,
    phase3_customAI: process.env.NEXT_PUBLIC_ENABLE_PHASE_3 === 'true' || false,
    phase4_journaling: process.env.NEXT_PUBLIC_ENABLE_PHASE_4 === 'true' || false,
    phase5_premium: process.env.NEXT_PUBLIC_ENABLE_PHASE_5 === 'true' || false,
  };

  // Phase 2: Unlocks after 3 sessions (if enabled in env)
  const phase2Unlocked = envFlags.phase2_symbolicMapping && userStats.totalSessions >= 3;

  // Phase 3: Unlocks after 10 sessions (if enabled in env)
  const phase3Unlocked = envFlags.phase3_customAI && userStats.totalSessions >= 10;

  // Phase 4: Unlocks after 5 sessions (if enabled in env)
  const phase4Unlocked =
    envFlags.phase4_journaling && userStats.totalSessions >= 5;

  // Phase 5: Always available if enabled (premium features gated separately)
  const phase5Unlocked = envFlags.phase5_premium;

  return {
    phase2_symbolicMapping: phase2Unlocked,
    phase3_customAI: phase3Unlocked,
    phase4_journaling: phase4Unlocked,
    phase5_premium: phase5Unlocked,
  };
}

/**
 * Check if user has premium access
 */
export function isPremiumUser(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;

  return (
    subscription.tier === 'premium' &&
    subscription.status === 'active' &&
    (!subscription.currentPeriodEnd ||
      subscription.currentPeriodEnd.toMillis() > Date.now())
  );
}

/**
 * Get available premium features for user
 */
export function getPremiumFeatures(
  subscription?: UserSubscription | null
): {
  symbolicLibraryAccess: boolean;
  journalingThemes: boolean;
  ambientSoundtrack: boolean;
  calendarSync: boolean;
  dataExport: boolean;
  customAIHourglass: boolean;
} {
  const isPremium = isPremiumUser(subscription);

  return {
    symbolicLibraryAccess: isPremium,
    journalingThemes: isPremium,
    ambientSoundtrack: isPremium,
    calendarSync: isPremium,
    dataExport: isPremium,
    customAIHourglass: isPremium,
  };
}

/**
 * Check if a specific hourglass is unlocked for the user
 */
export function isHourglassUnlocked(
  hourglassId: string,
  userStats: UserStats,
  subscription?: UserSubscription | null,
  unlockRequirement?: {
    type: 'sessions' | 'hours' | 'milestone';
    value: number;
  }
): boolean {
  // No requirement = always unlocked
  if (!unlockRequirement) return true;

  // Premium-only content
  if (unlockRequirement.type === 'milestone' && unlockRequirement.value === 0) {
    return isPremiumUser(subscription);
  }

  // Session-based unlocks
  if (unlockRequirement.type === 'sessions') {
    return userStats.totalSessions >= unlockRequirement.value;
  }

  // Hour-based unlocks
  if (unlockRequirement.type === 'hours') {
    return userStats.totalHours >= unlockRequirement.value;
  }

  return false;
}
