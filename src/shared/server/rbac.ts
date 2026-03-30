/**
 * Role-Based Access Control (RBAC) system
 * Defines roles, permissions, and permission checks
 */

export type UserRole = "ADMIN" | "MANAGER" | "CUSTOMER";

/**
 * Permissions represent specific actions or resources
 */
export type Permission =
  | "catalog:view"
  | "catalog:create"
  | "catalog:edit"
  | "catalog:delete"
  | "orders:view"
  | "orders:create"
  | "orders:edit"
  | "orders:delete"
  | "restock:view"
  | "restock:manage"
  | "activity:view"
  | "activity:export"
  | "dashboard:view"
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete";

/**
 * Role-to-Permissions mapping
 * Defines what each role is allowed to do
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Full access to everything
    "catalog:view",
    "catalog:create",
    "catalog:edit",
    "catalog:delete",
    "orders:view",
    "orders:create",
    "orders:edit",
    "orders:delete",
    "restock:view",
    "restock:manage",
    "activity:view",
    "activity:export",
    "dashboard:view",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
  ],
  MANAGER: [
    // Can manage catalog and orders, view activity
    "catalog:view",
    "catalog:create",
    "catalog:edit",
    "catalog:delete",
    "orders:view",
    "orders:edit", // Cannot delete orders fully
    "restock:view",
    "restock:manage",
    "activity:view",
    "activity:export",
    "dashboard:view",
    "users:view", // Can view but not edit users
  ],
  CUSTOMER: [
    // Limited access - primarily ordering
    "catalog:view",
    "orders:view",
    "orders:create", // Can only create orders, not edit/delete
    "dashboard:view", // Basic dashboard access
  ],
};

/**
 * Check if a user role has a specific permission
 * @param role User role
 * @param permission Permission to check
 * @returns boolean - True if the role has the permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

/**
 * Assert that a user role has a specific permission
 * Throws UnauthorizedError if permission is not granted
 * @param role User role
 * @param permission Permission to check
 * @throws {UnauthorizedError} If permission is not granted
 */
export function assertPermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new UnauthorizedError(
      `Permission denied: ${role} does not have ${permission}`,
    );
  }
}

/**
 * Get all permissions for a user role
 * @param role User role
 * @returns Permission[] - Array of all permissions for the role
 */
export function getPermissions(role: UserRole): Permission[] {
  return rolePermissions[role];
}

/**
 * Check if a role has any of the given permissions
 * Useful for conditional UI rendering
 * @param role User role
 * @param permissions Array of permissions to check
 * @returns boolean - True if role has at least one permission
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has all of the given permissions
 * @param role User role
 * @param permissions Array of permissions to check
 * @returns boolean - True if role has all permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Custom error class for unauthorized access
 */
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Role hierarchy (for future elevated access checks)
 * Admin > Manager > Customer
 */
export const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 3,
  MANAGER: 2,
  CUSTOMER: 1,
};

/**
 * Check if a user role has equal or higher hierarchy than another role
 * @param userRole The user's role
 * @param requiredRole The required role level
 * @returns boolean - True if user role >= required role
 */
export function hasRoleHierarchy(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
