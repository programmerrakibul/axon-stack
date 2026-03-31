/**
 * Seed demo user for testing and development
 *
 * Usage:
 *   npm run seed:demo
 *
 * Creates a demo user with MANAGER role if it doesn't already exist.
 * Demo credentials are logged to console on first creation only.
 * SECURITY: Demo password is NOT exposed in any API or client code.
 */

import { connectDB, disconnectDB, User, UserRole } from "@/shared/db";
import { getServerEnv } from "@/shared/env";
import { hashPassword } from "@/modules/auth/password";
import { toAppError } from "@/shared/server/handler";

// Demo user configuration
// NOTE: This password is ONLY used in this seeding script
// It is NEVER exposed via API endpoints or client code
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "DemoPass123!@#";
const DEMO_ROLE = UserRole.MANAGER;

/**
 * Run the seed script
 */
async function seedDemoUser() {
  try {
    // Validate environment variables
    console.log("📋 Validating environment variables...");
    getServerEnv();
    console.log("✓ Environment valid");

    // Connect to database
    console.log("🔌 Connecting to database...");
    await connectDB();
    console.log("✓ Database connected");

    // Check if demo user already exists
    console.log(`👤 Checking for existing demo user (${DEMO_EMAIL})...`);
    const existingUser = await User.findOne({ email: DEMO_EMAIL });

    if (existingUser) {
      console.log(
        `✓ Demo user already exists. ID: ${existingUser._id}. No action taken.`,
      );
      return;
    }

    // Create demo user
    console.log(`🔐 Creating demo user with ${DEMO_ROLE} role...`);
    const passwordHash = await hashPassword(DEMO_PASSWORD);

    const user = await User.create({
      email: DEMO_EMAIL,
      passwordHash,
      role: DEMO_ROLE,
    });

    console.log("✓ Demo user created successfully");
    console.log("");
    console.log("━".repeat(60));
    console.log("📊 DEMO USER CREDENTIALS");
    console.log("━".repeat(60));
    console.log(`Email:  ${DEMO_EMAIL}`);
    console.log(`Password:  ${DEMO_PASSWORD}`);
    console.log(`Role:   ${DEMO_ROLE}`);
    console.log(`ID:     ${user._id}`);
    console.log("━".repeat(60));
    console.log("");
    console.log(
      "⚠️  IMPORTANT: These credentials are for local development only.",
    );
    console.log(
      "   Do not use in production. Password hash is stored securely.",
    );
    console.log("");
  } catch (error) {
    // Convert any error to AppError for consistent handling
    const appError = toAppError(error);

    // Log only safe information (no stack traces, no env values)
    console.error("");
    console.error("❌ Seed operation failed");
    console.error(`   Error: ${appError.message}`);
    console.error(`   Code: ${appError.code}`);

    // Log details if safe to do so (validation errors, not internal errors)
    if (appError.details && appError.code !== "INTERNAL_SERVER_ERROR") {
      console.error(`   Details:`, appError.details);
    }

    console.error("");

    // Exit with error code
    process.exit(1);
  } finally {
    // Always disconnect from database
    try {
      await disconnectDB();
      console.log("🔌 Database disconnected");
    } catch (disconnectError) {
      console.error("Warning: Failed to disconnect from database");
    }
  }
}

// Run the seed script
seedDemoUser();
