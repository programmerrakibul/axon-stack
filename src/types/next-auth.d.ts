import type { DefaultSession } from "next-auth";

/**
 * Module augmentation for NextAuth
 * Extends the Session type to include user.id and user.role
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MANAGER" | "CUSTOMER";
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "ADMIN" | "MANAGER" | "CUSTOMER";
  }
}
