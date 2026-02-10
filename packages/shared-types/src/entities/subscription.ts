import { SubscriptionTier } from '../enums/subscription-tier';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  creditsRemaining: number | null;
  creditsTotal: number | null;
  createdAt: Date;
  updatedAt: Date;
}
