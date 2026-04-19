import { getServerSession } from "next-auth";
import { UnauthorizedError } from "./errors";
import { authOptions } from "@/lib/authOptions";

/**
 * Authenticated user object returned by requireSessionUser()
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "CUSTOMER";
}

/**
 * Custom error for authorization failures
 * Extends UnauthorizedError for API compatibility
 * @deprecated Use UnauthorizedError or ForbiddenError from errors.ts instead
 */
export class AuthorizationError extends UnauthorizedError {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthorizationError";
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Require authenticated session in server-only route handlers
 * Returns typed user object or throws AuthorizationError
 *
 * Usage in App Router route handler:
 * ```typescript
 * import { requireSessionUser } from "@/shared/server/require";
 *
 * export async function POST(request: Request) {
 *   const user = await requireSessionUser();
 *   // user is now typed and guaranteed to exist
 *   console.log(user.id, user.email, user.role);
 * }
 * ```
 *
 * @returns Promise<AuthenticatedUser> - Authenticated user with id, email, role
 * @throws {AuthorizationError} If user is not authenticated
 */
export async function requireSessionUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AuthorizationError("Authentication required");
  }

  // After NextAuth type augmentation, these are guaranteed to exist
  const userId = session.user.id;
  const userEmail = session.user.email;
  const userRole = session.user.role;

  if (!userId || !userEmail || !userRole) {
    throw new AuthorizationError("Invalid session data");
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
  };
}

/**
 * Require a specific role
 * Throws AuthorizationError if user doesn't have the required role
 *
 * Usage:
 * ```typescript
 * const user = await requireRole("ADMIN");
 * ```
 *
 * @param requiredRole Role that is required
 * @returns Promise<AuthenticatedUser> - If role matches
 * @throws {AuthorizationError} If user lacks required role
 */
export async function requireRole(
  requiredRole: "ADMIN" | "MANAGER" | "CUSTOMER",
): Promise<AuthenticatedUser> {
  const user = await requireSessionUser();

  if (user.role !== requiredRole) {
    throw new AuthorizationError(
      `This resource requires ${requiredRole} role, but you are ${user.role}`,
    );
  }

  return user;
}

/**
 * Require one of multiple roles
 *
 * Usage:
 * ```typescript
 * const user = await requireAnyRole(["ADMIN", "MANAGER"]);
 * ```
 *
 * @param allowedRoles Array of roles that are accepted
 * @returns Promise<AuthenticatedUser> - If user has one of the roles
 * @throws {AuthorizationError} If user lacks all required roles
 */
export async function requireAnyRole(
  allowedRoles: ("ADMIN" | "MANAGER" | "CUSTOMER")[],
): Promise<AuthenticatedUser> {
  const user = await requireSessionUser();

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `This resource requires one of these roles: ${allowedRoles.join(", ")}`,
    );
  }

  return user;
}

/**
 * Require a specific permission (requires RBAC import)
 *
 * Usage:
 * ```typescript
 * import { requirePermission } from "@/shared/server/require";
 *
 * const user = await requirePermission("users:edit");
 * ```
 *
 * @param permission Permission string to check
 * @returns Promise<AuthenticatedUser> - If user has permission
 * @throws {AuthorizationError} If user lacks permission
 */
export async function requirePermission(
  permission: string,
): Promise<AuthenticatedUser> {
  const user = await requireSessionUser();

  // Dynamically import RBAC to avoid circular dependencies
  const { hasPermission } = await import("./rbac");

  if (!hasPermission(user.role, permission as any)) {
    throw new AuthorizationError(
      `Permission denied: You do not have permission to ${permission}`,
    );
  }

  return user;
}

/**
 * Wrap route handlers to automatically handle auth errors
 * Returns appropriate HTTP responses for auth failures
 *
 * Usage:
 * ```typescript
 * export const POST = withAuth(async (request, user) => {
 *   // user is automatically injected and typed
 *   return Response.json({ data: "Hello " + user.email });
 * });
 * ```
 *
 * @param handler Route handler receiving (request, user)
 * @returns Wrapped handler with automatic error handling
 */
export function withAuth(
  handler: (request: Request, user: AuthenticatedUser) => Promise<Response>,
) {
  return async (request: Request): Promise<Response> => {
    try {
      const user = await requireSessionUser();
      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return Response.json({ error: error.message }, { status: 401 });
      }
      console.error("Auth error:", error);
      return Response.json({ error: "Authentication failed" }, { status: 500 });
    }
  };
}
