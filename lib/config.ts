/**
 * Application configuration
 * Centralizes environment variables and app settings
 */

export const config = {
  // API Keys
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Authentication
  auth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.NEXTAUTH_SECRET || '',
  },

  // OAuth Providers
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      id: process.env.GITHUB_ID || '',
      secret: process.env.GITHUB_SECRET || '',
    },
  },

  // YouTube API
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    clientId: process.env.YOUTUBE_CLIENT_ID || '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '',
  },

  // Error Monitoring
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },

  // Storage
  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      bucket: process.env.AWS_S3_BUCKET || '',
      region: process.env.AWS_REGION || 'us-east-1',
    },
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // App Settings
  app: {
    name: 'Shorts Studio',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },

  // Rate Limiting
  rateLimit: {
    max: 100, // Max requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  // AI Models
  models: {
    topicGeneration: 'claude-sonnet-4-20250514',
    scriptGeneration: 'claude-sonnet-4-20250514',
    batchPlan: 'claude-3-haiku-20240307',
  },
} as const;

// Validation helper
export function validateConfig() {
  const errors: string[] = [];

  if (!config.anthropic.apiKey) {
    errors.push('ANTHROPIC_API_KEY is required');
  }

  if (config.app.environment === 'production') {
    if (!config.auth.secret) {
      errors.push('NEXTAUTH_SECRET is required in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
