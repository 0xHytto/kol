import mongoose from 'mongoose';
import { KolProfile } from '../models/kol-profile.model';
import { initDatabase } from '../config/database';
import { logger } from '../utils/logger';

const kolData = [
  {
    userId: 'system',
    twitterHandle: 'cobie',
    displayName: 'Cobie',
    bio: 'Web3 analyst and investor. Known for insightful market analysis and casual tone.',
    followerCount: 1000000,
    profileImageUrl: 'https://pbs.twimg.com/profile_images/cobie.jpg',
    isPublic: true,
    styleAnalysis: {
      avg_sentence_length: 15,
      emoji_usage: 'moderate',
      hashtag_usage: 'low',
      tone: 'casual',
      technical_level: 'mixed',
      common_phrases: ['few understand', 'gm', 'ser', 'ngmi', 'wagmi'],
      vocabulary_level: 7,
    },
    tweetCount: 0,
  },
  {
    userId: 'system',
    twitterHandle: 'VitalikButerin',
    displayName: 'Vitalik Buterin',
    bio: 'Ethereum founder. Deep technical insights with philosophical touch.',
    followerCount: 5000000,
    profileImageUrl: 'https://pbs.twimg.com/profile_images/vitalik.jpg',
    isPublic: true,
    styleAnalysis: {
      avg_sentence_length: 25,
      emoji_usage: 'low',
      hashtag_usage: 'very_low',
      tone: 'neutral',
      technical_level: 'technical',
      common_phrases: ['important to understand', 'key thing', 'actually', 'IMO'],
      vocabulary_level: 9,
    },
    tweetCount: 0,
  },
  {
    userId: 'system',
    twitterHandle: 'CryptoCobain',
    displayName: 'Crypto Cobain',
    bio: 'Crypto trader and analyst. Direct, hype-driven communication.',
    followerCount: 500000,
    profileImageUrl: 'https://pbs.twimg.com/profile_images/cryptocobain.jpg',
    isPublic: true,
    styleAnalysis: {
      avg_sentence_length: 10,
      emoji_usage: 'high',
      hashtag_usage: 'moderate',
      tone: 'bullish',
      technical_level: 'casual',
      common_phrases: ['lfg', 'gm', 'bullish', 'send it', 'degen'],
      vocabulary_level: 5,
    },
    tweetCount: 0,
  },
  {
    userId: 'system',
    twitterHandle: '100trillionUSD',
    displayName: 'Plan B',
    bio: 'Quantitative analyst. Data-driven Bitcoin analysis.',
    followerCount: 2000000,
    profileImageUrl: 'https://pbs.twimg.com/profile_images/planb.jpg',
    isPublic: true,
    styleAnalysis: {
      avg_sentence_length: 18,
      emoji_usage: 'low',
      hashtag_usage: 'moderate',
      tone: 'neutral',
      technical_level: 'technical',
      common_phrases: ['stock to flow', 'model', 'historically', 'data shows'],
      vocabulary_level: 8,
    },
    tweetCount: 0,
  },
  {
    userId: 'system',
    twitterHandle: 'punk6529',
    displayName: 'Punk6529',
    bio: 'NFT collector and educator. Philosophical and visionary.',
    followerCount: 800000,
    profileImageUrl: 'https://pbs.twimg.com/profile_images/punk6529.jpg',
    isPublic: true,
    styleAnalysis: {
      avg_sentence_length: 22,
      emoji_usage: 'moderate',
      hashtag_usage: 'low',
      tone: 'neutral',
      technical_level: 'mixed',
      common_phrases: ['the open metaverse', 'digital property rights', 'freedom', 'decentralization'],
      vocabulary_level: 8,
    },
    tweetCount: 0,
  },
  {
    userId: 'system',
    twitterHandle: 'sassal0x',
    displayName: 'Sassal',
    bio: 'DeFi analyst and educator. Clear, educational content.',
    followerCount: 400000,
    profileImageUrl: 'https://pbs.twimg.com/profile_images/sassal.jpg',
    isPublic: true,
    styleAnalysis: {
      avg_sentence_length: 20,
      emoji_usage: 'moderate',
      hashtag_usage: 'low',
      tone: 'neutral',
      technical_level: 'technical',
      common_phrases: ['let me explain', 'important to note', 'key takeaway', 'thread'],
      vocabulary_level: 7,
    },
    tweetCount: 0,
  },
];

async function seed() {
  try {
    await initDatabase();

    logger.info('Clearing existing KOL profiles...');
    await KolProfile.deleteMany({ userId: 'system' });

    logger.info('Inserting KOL profiles...');
    await KolProfile.insertMany(kolData);

    logger.info(`✅ Successfully seeded ${kolData.length} KOL profiles`);

    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
