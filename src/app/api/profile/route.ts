import {
  requireSessionUser,
  withAuth,
  AuthorizationError,
} from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";

/**
 * Example API route showing auth guard usage
 * GET /api/profile - Requires authentication
 */
export async function GET() {
  try {
    // Require authenticated user
    const user = await requireSessionUser();

    return Response.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return Response.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Example route using withAuth wrapper
 * Automatically injects authenticated user
 */
export const adminOnly = withAuth(async (_request, user) => {
  // Verify user has admin role
  if (user.role !== "ADMIN") {
    throw new AuthorizationError("Admin access required");
  }

  return Response.json({
    success: true,
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
export async function POST(_request: Request) {
  try {
    const user = await requireSessionUser();

    // Check if user has permission using RBAC
    assertPermission(user.role, "users:edit");

    // If we reach here, user has permission
    return Response.json({
      success: true,
      message: "You have permission to edit users",
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return Response.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
