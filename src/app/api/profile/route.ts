import {
  requireSessionUser,
  withAuth,
  AuthorizationError,
} from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";

/**
 * Example API route showing auth guard usage
 * GET /api/profile - Requires authentication
 */
export const GET = withErrorHandling(async () => {
  // Require authenticated user
  const user = await requireSessionUser();

  return jsonOk({
    id: user.id,
    email: user.email,
    role: user.role,
  });
});

/**
 * Example route using withAuth wrapper
 * Automatically injects authenticated user
 */
export const adminOnly = withAuth(async (_request, user) => {
  // Verify user has admin role
  if (user.role !== "ADMIN") {
    throw new AuthorizationError("Admin access required!");
  }

  return jsonOk({
    message: "Admin endpoint accessed",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * Example using permission checking
 */
export const POST = withErrorHandling(async (_request: Request) => {
  const user = await requireSessionUser();

  // Check if user has permission using RBAC
  assertPermission(user.role, "users:edit");

  // If we reach here, user has permission
  return jsonOk({
    message: "You have permission to edit users",
  });
});
