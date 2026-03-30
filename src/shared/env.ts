import { z } from "zod";

/**
 * Server-side environment variable schema.
 * This validates all required server environment variables at startup.
 *
 * IMPORTANT: Do NOT use NEXT_PUBLIC_ prefix for secrets.
 * Only NEXT_PUBLIC_ variables are safe to expose to the browser.
 */
const serverEnvSchema = z.object({
  // Database
  MONGODB_URI: z
    .string()
    .url("MONGODB_URI must be a valid MongoDB connection URL")
    .min(1, "MONGODB_URI is required"),

  // NextAuth Configuration
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters")
    .min(1, "NEXTAUTH_SECRET is required"),

  NEXTAUTH_URL: z
    .string()
    .url("NEXTAUTH_URL must be a valid URL")
    .min(1, "NEXTAUTH_URL is required"),

  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Validate server environment variables
 * This function checks that all required env vars are present and valid
 *
 * Throws a descriptive error if validation fails
 */
function validateServerEnv() {
  const serverEnv = {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  const result = serverEnvSchema.safeParse(serverEnv);

  if (!result.success) {
    const missingVars = result.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n❌ Invalid or missing environment variables:\n${missingVars}\n\n` +
        "Please check your .env.local file and ensure all required variables are set correctly.\n" +
        "See .env.example for reference.\n",
    );
  }

  return result.data;
}

/**
 * Parse and validate server environment variables
 * Use this in server-side code only (layout.tsx, API routes, etc.)
 */
let validatedEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (!validatedEnv) {
    validatedEnv = validateServerEnv();
  }
  return validatedEnv;
}

/**
 * Initialize and validate server environment variables
 * Call this in the root layout to ensure env vars are validated early
 * This function validates once at startup and caches the result
 */
export function initEnv() {
  return getServerEnv();
}

/**
 * Export validated environment variables for server-side use
 * These are only available on the server and during build time
 */
export const serverEnv = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === "toJSON") {
        return () => "[PROTECTED]";
      }
      const env = getServerEnv();
      return env[prop as keyof typeof env];
    },
  },
) as z.infer<typeof serverEnvSchema>;

// Validate environment variables at module load time (server startup)
if (typeof window === "undefined") {
  // This runs on the server during startup
  try {
    validateServerEnv();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    // Exit process with error code
    process.exit(1);
  }
}
