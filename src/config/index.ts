export const APP_CONFIG = {
  APP_NAME: 'Mini Motion',
  APP_DESCRIPTION: 'AI Video Content Automation',
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  POLLING: {
    INTERVAL_MS: 5000,
  },
  MIN_SCRIPT_LENGTH: 50,
} as const;
