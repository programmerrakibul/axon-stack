import type { JWT } from "next-auth/jwt";

/**
 * Module augmentation for NextAuth JWT
 * Extends the JWT token type to include id and role
 */
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "MANAGER" | "CUSTOMER";
    email?: string;
  }
}
