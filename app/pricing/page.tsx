'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { PricingTiers } from '@/components/Subscription/PricingTiers';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { getUserSubscription } from '@/lib/firebase/firestore';

// Map tier IDs to Stripe Price IDs
const PRICE_IDS = {
  focus_plus_monthly: 'price_1SJsGwAMPuVRYVCmhWwWBkvl',  // $4.99/month
  focus_plus_yearly: 'price_1SJsIMAMPuVRYVCm5OhkzLQr',   // $49/year
  student_yearly: 'price_1SJsTFAMPuVRYVCm1T4eubDy',      // $29/year
  premium_monthly: 'price_1SJsYRAMPuVRYVCm2p7auWjC',     // $9.99/month
  lifetime: 'price_1SJscsAMPuVRYVCmViib9rZM',            // $299 one-time
};

export default function PricingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user && !user.isAnonymous) {
        // Load subscription to determine current tier
        const subscription = await getUserSubscription(user.uid);
        if (subscription) {
          // Determine tier from subscription metadata
          setCurrentTier(subscription.metadata?.tier || 'free');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectTier = async (tier: any) => {
    if (!currentUser) {
      alert('Please sign in to upgrade');
      router.push('/');
      return;
    }

    if (tier.id === 'free') {
      return; // Can't "buy" free tier
    }

    setLoading(true);

    try {
      // Determine which price ID to use
      let priceId = '';

      if (tier.id === 'focus_plus') {
        priceId = PRICE_IDS.focus_plus_monthly; // Default to monthly
      } else if (tier.id === 'student') {
        priceId = PRICE_IDS.student_yearly;
      } else if (tier.id === 'premium') {
        priceId = PRICE_IDS.premium_monthly;
      } else if (tier.id === 'lifetime') {
        priceId = PRICE_IDS.lifetime;
      }

      // Create checkout session
      const checkoutUrl = await createCheckoutSession(
        currentUser.uid,
        priceId,
        tier.id === 'lifetime' ? 'payment' : 'subscription'
      );

      // Redirect to Stripe Checkout
      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-twilight-900 via-twilight-800 to-twilight-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="text-twilight-300 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Timer
        </button>
      </div>

      {/* Pricing Tiers */}
      <PricingTiers
        currentTier={currentTier}
        onSelectTier={handleSelectTier}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-strong rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twilight-400 mx-auto mb-4"></div>
            <p className="text-white">Redirecting to checkout...</p>
          </div>
        </div>
      )}
    </div>
  );
}
