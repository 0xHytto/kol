import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Create a system user for public KOLs
  const [systemUser] = await knex('users')
    .insert({
      email: 'system@kolgenerator.com',
      password_hash: 'N/A',
      full_name: 'System',
      subscription_tier: 'enterprise',
    })
    .onConflict('email')
    .ignore()
    .returning('id');

  const systemUserId = systemUser?.id || (await knex('users').where('email', 'system@kolgenerator.com').first()).id;

  // Delete existing seed data
  await knex('kol_profiles').where({ user_id: systemUserId }).del();

  // Insert popular Web3 KOLs
  await knex('kol_profiles').insert([
    {
      user_id: systemUserId,
      twitter_handle: 'cobie',
      display_name: 'Cobie',
      bio: 'Web3 analyst and investor. Known for insightful market analysis and casual tone.',
      follower_count: 1000000,
      profile_image_url: 'https://pbs.twimg.com/profile_images/cobie.jpg',
      is_public: true,
      style_analysis: JSON.stringify({
        avg_sentence_length: 15,
        emoji_usage: 'moderate',
        hashtag_usage: 'low',
        tone: 'casual',
        technical_level: 'mixed',
        common_phrases: ['few understand', 'gm', 'ser', 'ngmi', 'wagmi'],
        vocabulary_level: 7,
      }),
      tweet_count: 0,
    },
    {
      user_id: systemUserId,
      twitter_handle: 'VitalikButerin',
      display_name: 'Vitalik Buterin',
      bio: 'Ethereum founder. Deep technical insights with philosophical touch.',
      follower_count: 5000000,
      profile_image_url: 'https://pbs.twimg.com/profile_images/vitalik.jpg',
      is_public: true,
      style_analysis: JSON.stringify({
        avg_sentence_length: 25,
        emoji_usage: 'low',
        hashtag_usage: 'very_low',
        tone: 'neutral',
        technical_level: 'technical',
        common_phrases: ['important to understand', 'key thing', 'actually', 'IMO'],
        vocabulary_level: 9,
      }),
      tweet_count: 0,
    },
    {
      user_id: systemUserId,
      twitter_handle: 'CryptoCobain',
      display_name: 'Crypto Cobain',
      bio: 'Crypto trader and analyst. Direct, hype-driven communication.',
      follower_count: 500000,
      profile_image_url: 'https://pbs.twimg.com/profile_images/cryptocobain.jpg',
      is_public: true,
      style_analysis: JSON.stringify({
        avg_sentence_length: 10,
        emoji_usage: 'high',
        hashtag_usage: 'moderate',
        tone: 'bullish',
        technical_level: 'casual',
        common_phrases: ['lfg', 'gm', 'bullish', 'send it', 'degen'],
        vocabulary_level: 5,
      }),
      tweet_count: 0,
    },
    {
      user_id: systemUserId,
      twitter_handle: '100trillionUSD',
      display_name: 'Plan B',
      bio: 'Quantitative analyst. Data-driven Bitcoin analysis.',
      follower_count: 2000000,
      profile_image_url: 'https://pbs.twimg.com/profile_images/planb.jpg',
      is_public: true,
      style_analysis: JSON.stringify({
        avg_sentence_length: 18,
        emoji_usage: 'low',
        hashtag_usage: 'moderate',
        tone: 'neutral',
        technical_level: 'technical',
        common_phrases: ['stock to flow', 'model', 'historically', 'data shows'],
        vocabulary_level: 8,
      }),
      tweet_count: 0,
    },
    {
      user_id: systemUserId,
      twitter_handle: 'punk6529',
      display_name: 'Punk6529',
      bio: 'NFT collector and educator. Philosophical and visionary.',
      follower_count: 800000,
      profile_image_url: 'https://pbs.twimg.com/profile_images/punk6529.jpg',
      is_public: true,
      style_analysis: JSON.stringify({
        avg_sentence_length: 22,
        emoji_usage: 'moderate',
        hashtag_usage: 'low',
        tone: 'neutral',
        technical_level: 'mixed',
        common_phrases: ['the open metaverse', 'digital property rights', 'freedom', 'decentralization'],
        vocabulary_level: 8,
      }),
      tweet_count: 0,
    },
    {
      user_id: systemUserId,
      twitter_handle: 'sassal0x',
      display_name: 'Sassal',
      bio: 'DeFi analyst and educator. Clear, educational content.',
      follower_count: 400000,
      profile_image_url: 'https://pbs.twimg.com/profile_images/sassal.jpg',
      is_public: true,
      style_analysis: JSON.stringify({
        avg_sentence_length: 20,
        emoji_usage: 'moderate',
        hashtag_usage: 'low',
        tone: 'neutral',
        technical_level: 'technical',
        common_phrases: ['let me explain', 'important to note', 'key takeaway', 'thread'],
        vocabulary_level: 7,
      }),
      tweet_count: 0,
    },
  ]);

  console.log('✅ Seeded 6 popular Web3 KOLs');
}
