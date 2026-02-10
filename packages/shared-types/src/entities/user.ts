import { SubscriptionTier } from '../enums/subscription-tier';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  twitterHandle: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: string;
  subscriptionEndsAt: Date | null;
  stripeCustomerId: string | null;
  apiAccessEnabled: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  avatarUrl?: string;
  twitterHandle?: string;
}
