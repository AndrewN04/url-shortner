/**
 * Environment configuration with validation
 */

function getEnvVar(name: string, required: true): string;
function getEnvVar(name: string, required: false): string | undefined;
function getEnvVar(name: string, required: boolean): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  // Database
  databaseUrl: () => getEnvVar("DATABASE_URL", true),

  // Security
  apiKeyPepper: () => getEnvVar("API_KEY_PEPPER", true),

  // Limits
  maxTtlSeconds: () => {
    const value = process.env["MAX_TTL_SECONDS"];
    return value ? parseInt(value, 10) : 30 * 24 * 60 * 60; // 14 days default
  },

  minTtlSeconds: 60, // 1 minute minimum

  // Code generation
  codeLength: 12,
  maxCodeRetries: 5,

  // Rate limiting
  rateLimitWindowMs: 60 * 1000, // 1 minute
  rateLimitMaxRequests: 10, // per window per IP/token

  // Request limits
  maxUrlLength: 2048,
  maxJsonBodySize: "10kb",

  // Environment
  isDev: () => process.env.NODE_ENV !== "production",
} as const;
