import { SubscriptionTier } from '@kol/shared-types';

export const PRICING = {
  [SubscriptionTier.FREE]: {
    name: 'Free',
    price: 0,
    monthlyCredits: 10,
    features: [
      'Basic tweet generation',
      'Up to 3 KOL profiles',
      'Single tweet generation',
      'Basic image generation',
    ],
  },
  [SubscriptionTier.PRO]: {
    name: 'Pro',
    price: 29,
    monthlyCredits: 100,
    features: [
      'Advanced tweet generation',
      'Up to 50 KOL profiles',
      'Thread generation',
      'Style mixing',
      'Image generation with templates',
      'Tweet scheduling',
      'A/B testing',
      'Analytics dashboard',
    ],
  },
  [SubscriptionTier.ENTERPRISE]: {
    name: 'Enterprise',
    price: 99,
    monthlyCredits: 1000,
    features: [
      'Unlimited KOL profiles',
      'All Pro features',
      'API access',
      'Batch image generation',
      'GIF/animation support',
      'Priority support',
      'Custom templates',
      'Team collaboration',
    ],
  },
} as const;
