const TWEET_MAX_LENGTH = 1500;
const THREAD_MAX_TWEETS = 10;

export function validateTweetLength(content: string): {
  valid: boolean;
  length: number;
  maxLength: number;
  error?: string;
} {
  const length = content.length;
  const valid = length > 0 && length <= TWEET_MAX_LENGTH;

  return {
    valid,
    length,
    maxLength: TWEET_MAX_LENGTH,
    error: valid ? undefined : `Tweet must be between 1 and ${TWEET_MAX_LENGTH} characters`,
  };
}

export function validateThreadLength(tweetCount: number): {
  valid: boolean;
  error?: string;
} {
  const valid = tweetCount > 0 && tweetCount <= THREAD_MAX_TWEETS;

  return {
    valid,
    error: valid ? undefined : `Thread must have between 1 and ${THREAD_MAX_TWEETS} tweets`,
  };
}
