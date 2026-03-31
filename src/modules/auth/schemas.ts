import { z } from "zod";

/**
 * Credentials validation schema
 * Shared between client and server for type safety
 */
export const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password too short"),
});

export type Credentials = z.infer<typeof credentialsSchema>;

/**
 * Authorized user payload returned after successful authentication
 */
export const authorizedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "CUSTOMER"]),
});

export type AuthorizedUser = z.infer<typeof authorizedUserSchema>;

/**
 * User signup schema for registration
 * Enforces strong password requirements and confirmation matching
 */
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * @deprecated Use signupSchema instead
 */
export const registerSchema = signupSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
