/**
 * Authentication module exports
 * Central location for auth-related imports
 */

// Schemas and types
export {
  credentialsSchema,
  type Credentials,
  authorizedUserSchema,
  type AuthorizedUser,
  registerSchema,
  type RegisterInput,
} from "./schemas";

// Password utilities
export {
  hashPassword,
  verifyPassword,
  generateRandomPassword,
} from "./password";

// NextAuth configuration and helpers
export { auth, signIn, signOut } from "@/app/api/auth/[...nextauth]/route";
