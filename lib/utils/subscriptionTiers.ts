import type { SubscriptionTier, UserSubscription, PremiumFeatures } from '@/types';

/**
 * Subscription tier limits and pricing
 */
export const TIER_CONFIG = {
  free: {
    price: 0,
    interval: null,
    videoCredits: 0,
    imageCredits: 0,
    printDiscount: 0,
    features: {
      dashboard: false,
      exportData: false,
      customImages: false,
      studyRooms: false,
      unlimitedImages: false,
      customVideos: false,
      priorityGeneration: false,
      highResExports: false,
      vipBadge: false,
      commercialLicense: false,
      allFutureFeatures: false,
    },
  },
  focus: {
    price: 4.99,
    interval: 'month' as const,
    videoCredits: 0,
    imageCredits: 10,
    printDiscount: 0,
    features: {
      dashboard: true,
      exportData: true,
      customImages: true,
      studyRooms: false,
      unlimitedImages: false,
      customVideos: false,
      priorityGeneration: false,
      highResExports: false,
      vipBadge: false,
      commercialLicense: false,
      allFutureFeatures: false,
    },
  },
  student: {
    price: 29,
    interval: 'year' as const,
    videoCredits: 0,
    imageCredits: Infinity, // Unlimited (soft cap at 100/month)
    printDiscount: 15,
    features: {
      dashboard: true,
      exportData: true,
      customImages: true,
      studyRooms: true,
      unlimitedImages: true,
      customVideos: false,
      priorityGeneration: false,
      highResExports: false,
      vipBadge: false,
      commercialLicense: false,
      allFutureFeatures: false,
    },
  },
  premium: {
    price: 9.99,
    interval: 'month' as const,
    videoCredits: 25, // + rollover up to 50
    imageCredits: Infinity, // Unlimited (soft cap at 200/month)
    printDiscount: 30,
    features: {
      dashboard: true,
      exportData: true,
      customImages: true,
      studyRooms: true,
      unlimitedImages: true,
      customVideos: true,
      priorityGeneration: true,
      highResExports: true,
      vipBadge: true,
      commercialLicense: false,
      allFutureFeatures: false,
    },
  },
  lifetime: {
    price: 299,
    interval: 'once' as const,
    videoCredits: 50, // + rollover up to 100
    imageCredits: Infinity, // Unlimited (soft cap at 500/month)
    printDiscount: 40,
    features: {
      dashboard: true,
      exportData: true,
      customImages: true,
      studyRooms: true,
      unlimitedImages: true,
      customVideos: true,
      priorityGeneration: true,
      highResExports: true,
      vipBadge: true,
      commercialLicense: true,
      allFutureFeatures: true,
    },
  },
} as const;

/**
 * Get features enabled for a subscription tier
 */
export function getTierFeatures(tier: SubscriptionTier): PremiumFeatures {
  const config = TIER_CONFIG[tier];
  return {
    ...config.features,
    printDiscount: config.printDiscount,
  };
}

/**
 * Check if a subscription tier has access to a specific feature
 */
export function hasFeatureAccess(
  subscription: UserSubscription | null | undefined,
  feature: keyof PremiumFeatures
): boolean {
  if (!subscription) {
    // No subscription = free tier
    return getTierFeatures('free')[feature] as boolean;
  }

  const features = getTierFeatures(subscription.tier);
  return features[feature] as boolean;
}

/**
 * Check if user can access the dashboard
 */
export function canAccessDashboard(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;
  return ['focus', 'student', 'premium', 'lifetime'].includes(subscription.tier);
}

/**
 * Check if user can access study rooms
 */
export function canAccessStudyRooms(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;
  return ['student', 'premium', 'lifetime'].includes(subscription.tier);
}

/**
 * Check if user can generate custom images
 */
export function canGenerateImages(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;
  return ['focus', 'student', 'premium', 'lifetime'].includes(subscription.tier);
}

/**
 * Check if user can generate custom videos
 */
export function canGenerateVideos(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;
  return ['premium', 'lifetime'].includes(subscription.tier);
}

/**
 * Get image generation limit for current month
 */
export function getImageGenLimit(subscription?: UserSubscription | null): number {
  if (!subscription) return 0;

  const config = TIER_CONFIG[subscription.tier];
  return config.imageCredits;
}

/**
 * Get video generation limit for current month
 */
export function getVideoGenLimit(subscription?: UserSubscription | null): number {
  if (!subscription) return 0;

  const config = TIER_CONFIG[subscription.tier];
  return config.videoCredits;
}

/**
 * Get max rollover for video credits
 */
export function getVideoRolloverMax(tier: SubscriptionTier): number {
  switch (tier) {
    case 'premium':
      return 50; // 2x monthly
    case 'lifetime':
      return 100; // 2x monthly
    default:
      return 0;
  }
}

/**
 * Check if user has video credits remaining
 */
export function hasVideoCreditsRemaining(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;
  if (!canGenerateVideos(subscription)) return false;

  const limit = getVideoGenLimit(subscription);
  const used = subscription.videoCreditsUsed || 0;
  const rollover = subscription.videoCreditsRollover || 0;

  return (used < limit + rollover);
}

/**
 * Check if user has image credits remaining
 */
export function hasImageCreditsRemaining(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;
  if (!canGenerateImages(subscription)) return false;

  const limit = getImageGenLimit(subscription);

  // Unlimited tiers (student, premium, lifetime)
  if (limit === Infinity) return true;

  const used = subscription.imageCreditsUsed || 0;
  return (used < limit);
}

/**
 * Get remaining credits for display
 */
export function getRemainingCredits(subscription?: UserSubscription | null): {
  videos: number;
  images: number | '∞';
} {
  if (!subscription) {
    return { videos: 0, images: 0 };
  }

  const videoLimit = getVideoGenLimit(subscription);
  const videoUsed = subscription.videoCreditsUsed || 0;
  const videoRollover = subscription.videoCreditsRollover || 0;
  const videoRemaining = videoLimit > 0 ? Math.max(0, videoLimit + videoRollover - videoUsed) : 0;

  const imageLimit = getImageGenLimit(subscription);
  const imageUsed = subscription.imageCreditsUsed || 0;
  const imageRemaining = imageLimit === Infinity ? '∞' : Math.max(0, imageLimit - imageUsed);

  return {
    videos: videoRemaining,
    images: imageRemaining,
  };
}

/**
 * Get print product discount percentage
 */
export function getPrintDiscount(subscription?: UserSubscription | null): number {
  if (!subscription) return 0;

  const config = TIER_CONFIG[subscription.tier];
  return config.printDiscount;
}

/**
 * Format price for display
 */
export function formatTierPrice(tier: SubscriptionTier): string {
  const config = TIER_CONFIG[tier];

  if (config.price === 0) return 'Free';

  if (config.interval === 'once') {
    return `$${config.price} once`;
  }

  return `$${config.price}/${config.interval}`;
}

/**
 * Calculate effective monthly price for comparison
 */
export function getEffectiveMonthlyPrice(tier: SubscriptionTier): number {
  const config = TIER_CONFIG[tier];

  if (config.interval === 'year') {
    return config.price / 12;
  }

  if (config.interval === 'once') {
    return 0; // Lifetime has no monthly cost
  }

  return config.price;
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription?: UserSubscription | null): boolean {
  if (!subscription) return false;

  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Tier comparison: returns true if tier1 >= tier2
 */
export function isTierAtLeast(tier1: SubscriptionTier, tier2: SubscriptionTier): boolean {
  const hierarchy: SubscriptionTier[] = ['free', 'focus', 'student', 'premium', 'lifetime'];
  return hierarchy.indexOf(tier1) >= hierarchy.indexOf(tier2);
}
