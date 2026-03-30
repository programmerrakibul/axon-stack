import mongoose, { Mongoose } from "mongoose";
import { getServerEnv } from "@/shared/env";

/**
 * Global connection cache for Next.js
 * Reuses existing connection instead of creating new ones on every request
 * Prevents connection pool exhaustion in serverless environments
 */
let cachedConnection: Mongoose | null = null;

/**
 * Connect to MongoDB with connection reuse for serverless environments
 * @returns  Promise resolving to Mongoose instance
 */
export async function connectDB(): Promise<Mongoose> {
  // Return cached connection if already established
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const { MONGODB_URI } = getServerEnv();

    const connection = await mongoose.connect(MONGODB_URI, {
      // Prevents "DeprecationWarning: current Server Discovery and Monitoring engine is deprecated"
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
    });

    // Cache the connection for reuse
    cachedConnection = connection;
    console.log("✓ MongoDB connected successfully");

    return connection;
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or during shutdown
 */
export async function disconnectDB(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log("✓ MongoDB disconnected");
  }
}

/**
 * Get the current cached connection
 */
export function getConnection(): Mongoose | null {
  return cachedConnection;
}

/**
 * Reset cached connection (useful for testing)
 */
export function resetConnection(): void {
  cachedConnection = null;
}
