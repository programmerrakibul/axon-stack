import { getServerEnv } from "@/shared/env";
import { connectDB, User } from "@/shared/db";
import Credentials from "next-auth/providers/credentials";
import { credentialsSchema, verifyPassword } from "@/modules/auth";
import type { NextAuthOptions } from "next-auth";

/**
 * NextAuth configuration
 * Implements Credentials provider with bcrypt password verification
 * and JWT callbacks to include user role and id
 */
export const authOptions: NextAuthOptions = {
  secret: getServerEnv().NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials against Zod schema
          console.log(`Attempting login for email: ${credentials?.email}`);
          const parsed = credentialsSchema.parse(credentials);

          // Connect to database
          await connectDB();

          // Fetch user by email
          const user = await User.findOne({ email: parsed.email });

          if (!user) {
            console.warn(
              `Login attempt with non-existent email: ${parsed.email}`,
            );

            return null;
          }

          // Verify password
          const passwordMatch = await verifyPassword(
            parsed.password,
            user.passwordHash,
          );

          if (!passwordMatch) {
            console.warn(`Failed login attempt for user: ${parsed.email}`);
            return null;
          }

          // Return authenticated user object
          // This includes id and role which will be included in JWT
          return {
            id: user._id?.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    /**
     * JWT callback - called when creating/updating JWT token
     * Add user id and role to the token
     */
    async jwt({ token, user }) {
      if (user) {
        // First sign in
        token.id = user.id || "";
        token.role = (user as any).role || "CUSTOMER";
        token.email = user.email || "";
      }
      return token;
    },

    /**
     * Session callback - called when session is checked
     * Add user id and role to the session object
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "MANAGER" | "CUSTOMER";
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  // Suppress warnings in development
  debug: process.env.NODE_ENV === "development",
};
