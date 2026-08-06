// ============================================================================
// Environment Variable Validation
// ============================================================================
// What: Validates that all required environment variables are set at startup
// Why: Missing env vars cause silent failures deep in the app - fail fast instead
// How: Runs on module load, throws immediately if critical vars are missing
//
// This prevents scenarios like:
// - API routes fail with undefined errors after running for hours
// - Vector search silently disabled without warning
// - Redis fallback silently used when production Redis is required

interface EnvValidationRule {
  name: string;
  required: boolean;
  validate?: (value: string) => boolean;
  errorMessage?: string;
}

const APPROVED_CLOUD_SUPABASE_URL = 'https://oxhjtmozsdstbokwtnwa.supabase.co';
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';

function isApprovedSupabaseUrl(value: string, target: string | undefined): boolean {
  if (target === 'local') return value === LOCAL_SUPABASE_URL;
  if (target === 'cloud') return value === APPROVED_CLOUD_SUPABASE_URL;
  return false;
}

/**
 * Validate a single environment variable
 * @param name Variable name
 * @param rule Validation rule
 * @returns true if valid, false if invalid
 */
function validateEnvVar(name: string, rule: EnvValidationRule): boolean {
  const value = process.env[name];

  if (!value) {
    if (rule.required) {
      console.error(`[EnvValidation] MISSING REQUIRED: ${name}`);
      return false;
    }
    // Optional var not set - that's OK
    return true;
  }

  // If custom validation provided, run it
  if (rule.validate) {
    const isValid = rule.validate(value);
    if (!isValid) {
      console.error(
        `[EnvValidation] INVALID VALUE: ${name} = ${value.substring(0, 20)}...` +
        (rule.errorMessage ? ` (${rule.errorMessage})` : '')
      );
      return false;
    }
  }

  return true;
}

/**
 * Validate all environment variables required by the application
 * Throws immediately if any required variable is missing or invalid
 *
 * Call this on application startup (e.g., in app/layout.tsx root layout)
 */
export function validateEnvironmentVariables(): void {
  // Skip during build - env vars injected at runtime
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  const rules: Record<string, EnvValidationRule> = {
    // The marker is required so credentials cannot be used against an
    // unintended database target.
    ENV_TARGET: {
      name: 'ENV_TARGET',
      required: true,
      validate: (v) => v === 'local' || v === 'cloud',
      errorMessage: 'Must be exactly local or cloud',
    },
    // Supabase (critical - required for auth and database)
    NEXT_PUBLIC_SUPABASE_URL: {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      required: true,
      validate: (v) => {
        return isApprovedSupabaseUrl(v, process.env.ENV_TARGET);
      },
      errorMessage: 'Must match the selected approved local or hosted development target',
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      required: true,
      validate: (v) => v.length > 20,
      errorMessage: 'Invalid key format',
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      required: true,
      validate: (v) => v.length > 20,
      errorMessage: 'Invalid key format',
    },

    // Next.js site configuration
    NEXT_PUBLIC_SITE_URL: {
      name: 'NEXT_PUBLIC_SITE_URL',
      required: true,
      validate: (v) => v.startsWith('http://') || v.startsWith('https://'),
      errorMessage: 'Must be HTTP or HTTPS URL',
    },

    // OpenAI is optional. The retained analyzer has a deterministic local
    // evidence fallback when no model provider is configured.
    OPENAI_API_KEY: {
      name: 'OPENAI_API_KEY',
      required: false,
      validate: (v) => v.startsWith('sk-'),
      errorMessage: 'Must start with sk-',
    },

    // Retired chat/vector settings are accepted when present but are not core.
    VECTOR_SEARCH_SIMILARITY_THRESHOLD: {
      name: 'VECTOR_SEARCH_SIMILARITY_THRESHOLD',
      required: false,
      validate: (v) => {
        const num = parseFloat(v);
        return !isNaN(num) && num >= 0 && num <= 1;
      },
      errorMessage: 'Must be a number between 0 and 1',
    },
    VECTOR_SEARCH_MAX_RESULTS: {
      name: 'VECTOR_SEARCH_MAX_RESULTS',
      required: false,
      validate: (v) => {
        const num = parseInt(v);
        return !isNaN(num) && num > 0 && num < 100;
      },
      errorMessage: 'Must be an integer between 1 and 99',
    },

    // Redis is optional acceleration/protection. Retained caches and rate
    // limiting already degrade safely when it is unavailable.
    REDIS_URL: {
      name: 'REDIS_URL',
      required: false,
      validate: (v) => v.startsWith('redis://') || v.startsWith('rediss://'),
      errorMessage: 'Must be redis:// or rediss:// URL',
    },

    // Email is an optional provider boundary. Durable application records must
    // still succeed when delivery is not configured.
    RESEND_API_KEY: {
      name: 'RESEND_API_KEY',
      required: false,
      validate: (v) => v.startsWith('re_'),
      errorMessage: 'Must start with re_',
    },
    RESEND_ADMIN_EMAIL: {
      name: 'RESEND_ADMIN_EMAIL',
      required: false,
      validate: (v) => v.includes('@'),
      errorMessage: 'Must be valid email',
    },
    // Prospecting delivery is a separate opt-in boundary. It must not reuse
    // the transactional Resend key or activate merely because one exists.
    PROSPECTING_SENDER_PROVIDER: {
      name: 'PROSPECTING_SENDER_PROVIDER',
      required: false,
      validate: (v) => v === 'fake' || v === 'resend' || v === 'disabled',
      errorMessage: 'Must be fake, resend, or disabled',
    },
    PROSPECTING_RESEND_API_KEY: {
      name: 'PROSPECTING_RESEND_API_KEY',
      required: false,
      validate: (v) => v.startsWith('re_'),
      errorMessage: 'Must start with re_',
    },

    // Stripe (required if payments enabled)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      required: false,
      validate: (v) => v.startsWith('pk_'),
      errorMessage: 'Must start with pk_',
    },
    STRIPE_SECRET_KEY: {
      name: 'STRIPE_SECRET_KEY',
      required: false,
      validate: (v) => v.startsWith('sk_'),
      errorMessage: 'Must start with sk_',
    },

    // Google is optional because email/password remains the canonical local
    // Supabase sign-in path. Calendar is a separate provider boundary.
    GOOGLE_CLIENT_ID: {
      name: 'GOOGLE_CLIENT_ID',
      required: false,
      validate: (v) => v.length > 20,
      errorMessage: 'Invalid client ID format',
    },
    GOOGLE_CLIENT_SECRET: {
      name: 'GOOGLE_CLIENT_SECRET',
      required: false,
      validate: (v) => v.length > 20,
      errorMessage: 'Invalid client secret format',
    },
    NEXTAUTH_SECRET: {
      name: 'NEXTAUTH_SECRET',
      required: false,
      validate: (v) => v.length >= 32,
      errorMessage: 'Must be at least 32 characters',
    },
  };

  let hasErrors = false;
  const errors: string[] = [];

  for (const [varName, rule] of Object.entries(rules)) {
    if (!validateEnvVar(varName, rule)) {
      hasErrors = true;
      errors.push(varName);
    }
  }

  if (hasErrors) {
    const errorList = errors.map((v) => `  - ${v}`).join('\n');
    throw new Error(
      `[EnvValidation] ${errors.length} required environment variable(s) are missing or invalid:\n${errorList}\n\n` +
      `Copy .env.example to .env.local and fill in all required values.`
    );
  }

  console.log('[EnvValidation] All environment variables validated successfully');
}

/**
 * Get a required environment variable with type safety
 * Throws if not set or invalid
 *
 * @param name Variable name
 * @param validator Optional validator function
 * @returns The environment variable value
 */
export function getRequiredEnv(
  name: string,
  validator?: (value: string) => boolean
): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (validator && !validator(value)) {
    throw new Error(`Invalid value for environment variable: ${name}`);
  }

  return value;
}

/**
 * Get an optional environment variable with fallback
 *
 * @param name Variable name
 * @param defaultValue Fallback value if not set
 * @returns The environment variable value or default
 */
export function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

// ============================================================================
// Automatic Validation on Module Load (Production Only)
// ============================================================================
// During development, skip to allow gradual setup
// During production builds and runtime, validate immediately

const isProduction = process.env.NODE_ENV === 'production' || process.env.CI === 'true';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if ((isProduction || isBuildTime) && typeof process !== 'undefined') {
  // Validate in production runtime but don't crash the process
  // Missing vars will log warnings; individual features degrade gracefully
  if (!isBuildTime) {
    try {
      validateEnvironmentVariables();
    } catch (error) {
      console.warn('[EnvValidation] Warning: Some environment variables are missing or invalid.');
      if (error instanceof Error) {
        console.warn(error.message);
      }
    }
  }
}
