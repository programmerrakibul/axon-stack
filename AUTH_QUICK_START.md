# Auth & RBAC Quick Reference

Rapid reference for implementing authenticated and authorized routes.

## 1️⃣ Protected Route (Requires Login)

```typescript
// src/app/api/orders/route.ts
import { requireSessionUser } from "@/shared/server/require";

export async function GET() {
  const user = await requireSessionUser();

  // user: { id, email, role }
  // If not authenticated → throws AuthorizationError → 401 response

  return Response.json({ orders: [], user });
}
```

## 2️⃣ Role-Restricted Route

```typescript
// src/app/api/admin/users/route.ts
import { requireRole } from "@/shared/server/require";

export async function GET() {
  const user = await requireRole("ADMIN");

  // Only ADMIN role reaches here
  // MANAGER or CUSTOMER → throws AuthorizationError → 401 response

  return Response.json({ users: [] });
}
```

## 3️⃣ Multiple Roles Allowed

```typescript
import { requireAnyRole } from "@/shared/server/require";

export async function POST() {
  const user = await requireAnyRole(["ADMIN", "MANAGER"]);

  // Both ADMIN and MANAGER reach here
  // CUSTOMER → throws AuthorizationError
}
```

## 4️⃣ Permission Checking

```typescript
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";

export async function DELETE() {
  const user = await requireSessionUser();

  // Fine-grained permission check
  assertPermission(user.role, "users:delete");

  // If check fails → throws UnauthorizedError → handle or return 403
  return Response.json({ success: true });
}
```

## 5️⃣ Using withAuth Wrapper

```typescript
import { withAuth } from "@/shared/server/require";

export const POST = withAuth(async (_request, user) => {
  // user automatically injected and typed
  // Errors automatically return 401

  return Response.json({
    message: `Hello ${user.email}`,
    role: user.role,
  });
});
```

## 6️⃣ Getting Session in Page

```typescript
// src/app/dashboard/page.tsx (Server Component)
import { auth } from "@/modules/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    return <p>Not logged in</p>;
  }

  return <p>Hello {session.user.email} ({session.user.role})</p>;
}
```

## 7️⃣ Create User with Hashed Password

```typescript
import { hashPassword } from "@/modules/auth";
import { User } from "@/shared/db";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const hash = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash: hash,
    role: "CUSTOMER",
  });

  return Response.json({ success: true });
}
```

## 8️⃣ Client-Side Login

```typescript
"use client";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.ok) {
      // Login successful
      window.location.href = "/dashboard";
    } else {
      // Show error
      console.error("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button>Login</button>
    </form>
  );
}
```

---

## Permission Reference

### Catalog

- `catalog:view` - View products/categories
- `catalog:create` - Create products/categories
- `catalog:edit` - Edit products/categories
- `catalog:delete` - Delete products/categories

### Orders

- `orders:view` - View orders
- `orders:create` - Create orders
- `orders:edit` - Modify orders
- `orders:delete` - Delete orders

### Restock

- `restock:view` - View restock items
- `restock:manage` - Manage restock priority

### Activity

- `activity:view` - View activity logs
- `activity:export` - Export activity logs

### Dashboard

- `dashboard:view` - Access dashboard

### Users

- `users:view` - View users
- `users:create` - Create users
- `users:edit` - Edit users
- `users:delete` - Delete users

---

## Role Permissions Summary

| Permission      | ADMIN | MANAGER | CUSTOMER    |
| --------------- | ----- | ------- | ----------- |
| All catalog ops | ✓     | ✓       | view-only   |
| All order ops   | ✓     | ✓       | create-only |
| All restock     | ✓     | ✓       | -           |
| All activity    | ✓     | ✓       | -           |
| Dashboard       | ✓     | ✓       | ✓           |
| User management | ✓     | -       | -           |

---

## Error Handling

### AuthorizationError

Thrown when user not authenticated

```typescript
try {
  const user = await requireSessionUser();
} catch (error) {
  if (error instanceof AuthorizationError) {
    return Response.json({ error: "401 Unauthorized" }, { status: 401 });
  }
}
```

### UnauthorizedError (RBAC)

Thrown when permission denied

```typescript
try {
  assertPermission(user.role, "admin:panel");
} catch (error) {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: "403 Forbidden" }, { status: 403 });
  }
}
```

---

## Types

### AuthenticatedUser

```typescript
interface AuthenticatedUser {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "CUSTOMER";
}
```

### Session (NextAuth)

```typescript
interface Session {
  user: {
    id: string;
    role: "ADMIN" | "MANAGER" | "CUSTOMER";
    email: string;
    name?: string;
    image?: string;
  };
}
```

### JWT Token

```typescript
interface JWT {
  id: string;
  role: "ADMIN" | "MANAGER" | "CUSTOMER";
  email: string;
  // ... other claims
}
```

---

## Common Patterns

### Pattern: Admin API Endpoint

```typescript
import { requireRole } from "@/shared/server/require";

export async function DELETE() {
  const admin = await requireRole("ADMIN");
  // Delete resource
  return Response.json({ success: true });
}
```

### Pattern: Feature Gate (Multiple Roles)

```typescript
import { requireAnyRole } from "@/shared/server/require";

export async function POST() {
  const user = await requireAnyRole(["ADMIN", "MANAGER"]);
  // Shared feature
  return Response.json({ success: true });
}
```

### Pattern: Permission Matrix

```typescript
import { requireSessionUser } from "@/shared/server/require";
import { hasPermission } from "@/shared/server/rbac";

function canEdit(user: AuthenticatedUser, resourceType: string) {
  const permission = `${resourceType}:edit` as Permission;
  return hasPermission(user.role, permission);
}
```

---

## Import Locations

```typescript
// Authentication & Session
import { auth, signIn, signOut } from "@/modules/auth";
import { hashPassword, verifyPassword } from "@/modules/auth";

// Auth Guards
import {
  requireSessionUser,
  requireRole,
  requireAnyRole,
  requirePermission,
  withAuth,
  AuthorizationError,
} from "@/shared/server/require";

// RBAC
import {
  hasPermission,
  assertPermission,
  getPermissions,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleHierarchy,
  UnauthorizedError,
  type UserRole,
  type Permission,
} from "@/shared/server/rbac";

// Database
import { User } from "@/shared/db";
```

---

## Debugging

### Enable NextAuth debug logging

In `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
export const { handlers, auth } = NextAuth({
  // ...
  debug: true, // Set to true for console logs
});
```

### Check current session

```typescript
const session = await auth();
console.log("Current session:", session);
```

### Verify user permissions

```typescript
import { getPermissions } from "@/shared/server/rbac";

const allPerms = getPermissions("ADMIN");
console.log("Admin permissions:", allPerms);
```

---

**For complete documentation, see `AUTH.md`**
