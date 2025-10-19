'use client';

import { useState } from 'react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  stripePriceId?: string;
  popular?: boolean;
}

interface PricingTiersProps {
  currentTier?: string;
  onSelectTier: (tier: PricingTier) => void;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Build your focus habit',
    features: [
      'Unlimited timer sessions',
      'Default 5 Zen hourglasses',
      'Basic session counter',
      'Total hours & sessions',
    ],
  },
  {
    id: 'focus_plus',
    name: 'Focus+',
    price: 4.99,
    interval: 'month',
    description: 'Track your progress',
    features: [
      'Full analytics dashboard',
      'Daily streak & weekly charts',
      '90-day calendar view',
      'Unlimited session history',
      'CSV export',
      '10 custom AI images/month',
    ],
    popular: true,
  },
  {
    id: 'student',
    name: 'Student',
    price: 29,
    interval: 'year',
    description: 'Perfect for exam prep',
    features: [
      'Everything in Focus+',
      'Join Study Rooms',
      'Real-time presence tracking',
      'Optional leaderboard',
      'Unlimited custom images',
      '15% off print products',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    description: 'For power users',
    features: [
      'Everything in Student',
      '25 custom videos/month',
      'Rollover to 50 videos',
      'Unlimited images',
      '30% off prints',
      'VIP badge in rooms',
      'Priority generation',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 299,
    interval: 'month',
    description: 'Forever access',
    features: [
      'Everything in Premium forever',
      '50 video credits/month',
      'Rollover to 100 videos',
      'Commercial use license',
      '40% off prints for life',
      'Founding member badge',
      'All future features',
    ],
  },
];

export function PricingTiers({ currentTier, onSelectTier }: PricingTiersProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-white mb-4">
          Choose Your Focus Journey
        </h1>
        <p className="text-lg text-twilight-300 mb-8">
          Invest in yourself. Start with what you need, upgrade as you grow.
        </p>

        {/* Billing Toggle (Future: Annual discount) */}
        {/* <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-twilight-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-7 rounded-full transition-colors"
            style={{ backgroundColor: isAnnual ? '#8B7FD8' : '#4A4458' }}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${isAnnual ? 'text-white' : 'text-twilight-400'}`}>
            Annual (Save 20%)
          </span>
        </div> */}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_TIERS.map((tier) => {
          const isCurrent = currentTier === tier.id;
          const isFree = tier.id === 'free';

          return (
            <div
              key={tier.id}
              className={`
                relative glass-strong rounded-2xl p-6 transition-smooth
                ${tier.popular ? 'ring-2 ring-twilight-400 scale-105' : ''}
                ${isCurrent ? 'ring-2 ring-green-500' : ''}
                hover:scale-105
              `}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-twilight-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-twilight-300 mb-4">
                  {tier.description}
                </p>
                <div className="mb-4">
                  <span className="text-4xl font-light text-white">
                    ${tier.price}
                  </span>
                  <span className="text-twilight-300 text-sm">
                    {tier.id === 'lifetime' ? ' one-time' : `/${tier.interval}`}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-twilight-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => onSelectTier(tier)}
                disabled={isCurrent || isFree}
                className={`
                  w-full py-3 rounded-lg font-medium transition-smooth
                  ${
                    isCurrent
                      ? 'bg-green-500/20 text-green-300 cursor-default'
                      : isFree
                      ? 'bg-twilight-600/50 text-twilight-400 cursor-default'
                      : tier.popular
                      ? 'bg-twilight-500 text-white hover:bg-twilight-400'
                      : 'bg-twilight-700 text-white hover:bg-twilight-600'
                  }
                `}
              >
                {isCurrent
                  ? 'Current Plan'
                  : isFree
                  ? 'Active Trial'
                  : `Get ${tier.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 text-center text-sm text-twilight-300">
        <p>
          🔒 Secure payment via Stripe • Cancel anytime • 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
