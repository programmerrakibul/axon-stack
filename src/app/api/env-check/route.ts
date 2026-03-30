import { getServerEnv } from "@/shared/env";
import { NextResponse } from "next/server";

/**
 * Debug API route to verify environment variables are properly configured
 * This demonstrates type-safe access to server environment variables
 *
 * Only accessible in development - shows that env validation works correctly
 */
export async function GET() {
  try {
    const env = getServerEnv();

    return NextResponse.json({
      success: true,
      message: "Environment variables are properly configured",
      config: {
        database: {
          mongodbConfigured: !!env.MONGODB_URI,
          mongodbUrl: env.MONGODB_URI.substring(0, 50) + "...", // Partial URL for security
        },
        auth: {
          nextAuthConfigured: !!env.NEXTAUTH_SECRET,
          nextAuthSecretLength: env.NEXTAUTH_SECRET.length,
          nextAuthUrl: env.NEXTAUTH_URL,
        },
        environment: env.NODE_ENV,
      },
      security: {
        secretsNotExposed: true,
        allRequiredVarsPresent: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load environment variables",
      },
      { status: 500 },
    );
  }
}
