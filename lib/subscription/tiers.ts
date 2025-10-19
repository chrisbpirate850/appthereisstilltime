'use client';

import { UserSubscription, PremiumFeatures, SubscriptionTier } from '@/types';

/**
 * Check if we're in development mode (bypasses subscription checks)
 */
function isDevMode(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === 'true';
}

/**
 * Check if user has access to a specific feature based on their subscription tier
 */
export function hasFeatureAccess(
  subscription: UserSubscription | null,
  feature: keyof PremiumFeatures
): boolean {
  // Development mode: grant access to all features
  if (isDevMode()) {
    return true;
  }

  // Free tier has no premium features
  if (!subscription || subscription.tier === 'free') {
    return false;
  }

  const tier = subscription.tier;

  // Map features to minimum required tier
  const featureTiers: Record<keyof PremiumFeatures, SubscriptionTier[]> = {
    // Focus+ tier ($4.99/mo)
    dashboard: ['focus', 'student', 'premium', 'lifetime'],
    exportData: ['focus', 'student', 'premium', 'lifetime'],
    customImages: ['focus', 'student', 'premium', 'lifetime'],

    // Student tier ($29/year)
    studyRooms: ['student', 'premium', 'lifetime'],
    unlimitedImages: ['student', 'premium', 'lifetime'],
    printDiscount: ['student', 'premium', 'lifetime'],

    // Premium tier ($9.99/mo)
    customVideos: ['premium', 'lifetime'],
    priorityGeneration: ['premium', 'lifetime'],
    highResExports: ['premium', 'lifetime'],
    vipBadge: ['premium', 'lifetime'],

    // Lifetime tier ($299)
    commercialLicense: ['lifetime'],
    allFutureFeatures: ['lifetime'],
  };

  return featureTiers[feature]?.includes(tier) || false;
}

/**
 * Get print discount percentage based on tier
 */
export function getPrintDiscount(subscription: UserSubscription | null): number {
  if (!subscription) return 0;

  const discounts: Record<SubscriptionTier, number> = {
    free: 0,
    focus: 0,
    student: 15,
    premium: 30,
    lifetime: 40,
  };

  return discounts[subscription.tier] || 0;
}

/**
 * Get video credit limits based on tier
 */
export function getVideoCredits(subscription: UserSubscription | null): {
  monthly: number;
  rolloverMax: number;
} {
  if (!subscription) {
    return { monthly: 0, rolloverMax: 0 };
  }

  const credits: Record<SubscriptionTier, { monthly: number; rolloverMax: number }> = {
    free: { monthly: 0, rolloverMax: 0 },
    focus: { monthly: 0, rolloverMax: 0 },
    student: { monthly: 0, rolloverMax: 0 },
    premium: { monthly: 25, rolloverMax: 50 },
    lifetime: { monthly: 50, rolloverMax: 100 },
  };

  return credits[subscription.tier] || { monthly: 0, rolloverMax: 0 };
}

/**
 * Get image credit limits based on tier
 */
export function getImageCredits(subscription: UserSubscription | null): {
  monthly: number;
  unlimited: boolean;
} {
  // Development mode: unlimited credits
  if (isDevMode()) {
    return { monthly: 0, unlimited: true };
  }

  if (!subscription) {
    return { monthly: 0, unlimited: false };
  }

  const credits: Record<SubscriptionTier, { monthly: number; unlimited: boolean }> = {
    free: { monthly: 0, unlimited: false },
    focus: { monthly: 10, unlimited: false },
    student: { monthly: 0, unlimited: true },
    premium: { monthly: 0, unlimited: true },
    lifetime: { monthly: 0, unlimited: true },
  };

  return credits[subscription.tier] || { monthly: 0, unlimited: false };
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    free: 'Free',
    focus: 'Focus+',
    student: 'Student',
    premium: 'Premium',
    lifetime: 'Lifetime',
  };

  return names[tier] || 'Free';
}

/**
 * Check if tier has analytics dashboard access
 */
export function hasAnalyticsAccess(subscription: UserSubscription | null): boolean {
  return hasFeatureAccess(subscription, 'dashboard');
}

/**
 * Check if tier has study rooms access
 */
export function hasStudyRoomsAccess(subscription: UserSubscription | null): boolean {
  return hasFeatureAccess(subscription, 'studyRooms');
}

/**
 * Check if tier has custom video generation
 */
export function hasCustomVideoAccess(subscription: UserSubscription | null): boolean {
  return hasFeatureAccess(subscription, 'customVideos');
}
