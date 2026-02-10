export const API = {
  VERSION: 'v1',
  BASE_PATH: '/api',
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  KOL_PROFILES: {
    LIST: '/kol-profiles',
    CREATE: '/kol-profiles',
    GET: '/kol-profiles/:id',
    UPDATE: '/kol-profiles/:id',
    DELETE: '/kol-profiles/:id',
    ANALYZE: '/kol-profiles/:id/analyze',
  },
  TWEET_GENERATOR: {
    GENERATE: '/tweet-generator/generate',
    GENERATE_THREAD: '/tweet-generator/generate-thread',
    LIST: '/tweet-generator/generations',
    GET: '/tweet-generator/generations/:id',
  },
  IMAGE_GENERATOR: {
    GENERATE: '/image-generator/generate',
    BATCH: '/image-generator/batch-generate',
    LIST: '/image-generator/generations',
    GET: '/image-generator/generations/:id',
  },
} as const;
