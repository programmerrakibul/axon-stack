# Authentication & RBAC System Documentation

Complete authentication layer with NextAuth.js, bcrypt password hashing, and
role-based access control (RBAC).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  (Browser Components calling signIn/signOut)                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/NextAuth Client
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              NextAuth API Routes                             │
│  GET/POST /api/auth/[...nextauth]                           │
│  - Credentials Provider                                      │
│  - JWT Callback (token.role, token.id)                      │
│  - Session Callback (session.user.role, session.user.id)   │
└────────────────────────┬────────────────────────────────────┘
                         │ Validate Credentials
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Database Layer (MongoDB)                            │
│  User.findOne({ email }) → Compare bcrypt hash              │
│  Return: { id, email, role }                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Auth Guard & RBAC Helpers                            │
│  requireSessionUser() → Returns authenticated user           │
│  requireRole(role) → Enforces role requirement              │
│  requirePermission(perm) → Enforces permission              │
│  assertPermission() → Check permission (for routes)         │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
src/
├── modules/
│   └── auth/
│       ├── index.ts                    # Exports
│       ├── schemas.ts                  # Zod validation schemas
│       └── password.ts                 # bcrypt utilities
├── app/
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts            # NextAuth config & route
│       └── profile/
│           └── route.ts                # Example protected route
├── shared/server/
│   ├── rbac.ts                         # Role-permission mapping
│   └── require.ts                      # Auth guard helpers
└── types/
    ├── next-auth.d.ts                  # Session/User type augmentation
    └── next-auth-jwt.d.ts              # JWT type augmentation
```

## Core Components

### 1. Credentials Schema (`src/modules/auth/schemas.ts`)

Zod schemas for type-safe validation:

```typescript
// Shared between client and server
const credentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
});

type Credentials = z.infer<typeof credentialsSchema>;
```

### 2. Password Utilities (`src/modules/auth/password.ts`)

```typescript
// Hash password on registration
const hashed = await hashPassword("myPassword123");

// Verify password on login
const matches = await verifyPassword("myPassword123", hashed);
```

### 3. NextAuth Configuration (`src/app/api/auth/[...nextauth]/route.ts`)

- **Provider:** Credentials (email + password)
- **Database:** MongoDB User model
- **Password:** bcrypt comparison
- **Session:** JWT-based (24-hour expiration)
- **Callbacks:**
  - JWT callback adds `user.id` and `user.role` to token
  - Session callback adds `id` and `role` to `session.user`

```typescript
// Login flow:
const result = await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: false,
});

if (result?.ok) {
  // User authenticated
}
```

### 4. RBAC System (`src/shared/server/rbac.ts`)

**Roles:**

- `ADMIN` - Full system access
- `MANAGER` - Manage products, orders, restock
- `CUSTOMER` - Browse catalog, create orders

**Permissions:**

- `catalog:view|create|edit|delete`
- `orders:view|create|edit|delete`
- `restock:view|manage`
- `activity:view|export`
- `dashboard:view`
- `users:view|create|edit|delete`

**Usage:**

```typescript
import { hasPermission, assertPermission } from "@/shared/server/rbac";

// Check if user can perform action
if (hasPermission(userRole, "orders:edit")) {
  // Show edit button
}

// Assert permission (throws error if not granted)
assertPermission(userRole, "users:delete"); // Throws UnauthorizedError
```

### 5. Auth Guard Helpers (`src/shared/server/require.ts`)

#### `requireSessionUser()`

Returns authenticated user or throws `AuthorizationError`:

```typescript
export async function POST(request: Request) {
  const user = await requireSessionUser();
  // user: { id, email, role }
}
```

#### `requireRole(role)`

Enforces specific role:

```typescript
const user = await requireRole("ADMIN");
// Throws if user is MANAGER or CUSTOMER
```

#### `requireAnyRole(roles)`

Accepts multiple roles:

```typescript
const user = await requireAnyRole(["ADMIN", "MANAGER"]);
```

#### `requirePermission(permission)`

Checks RBAC permission:

```typescript
const user = await requirePermission("users:edit");
```

#### `withAuth(handler)`

Wrapper that automatically injects user:

```typescript
export const POST = withAuth(async (request, user) => {
  console.log(user.email); // Automatically provided
  return Response.json({ success: true });
});
```

### 6. Type Augmentation

**NextAuth Session Types** (`src/types/next-auth.d.ts`):

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MANAGER" | "CUSTOMER";
    } & DefaultSession["user"];
  }
}
```

**JWT Types** (`src/types/next-auth-jwt.d.ts`):

```typescript
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "MANAGER" | "CUSTOMER";
  }
}
```

## Usage Examples

### 1. Client-Side Login

```typescript
"use client";

import { signIn } from "next-auth/react";

export function LoginForm() {
  const handleSubmit = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      redirectTo: "/dashboard",
    });

    if (!result?.ok) {
      // Show error message
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(email, password);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### 2. Server-Side Route Protection

```typescript
// src/app/api/users/route.ts
import { requireRole } from "@/shared/server/require";

export async function GET() {
  const user = await requireRole("ADMIN");

  // Only admins reach here
  return Response.json({
    message: `Hello ${user.email}`,
  });
}
```

### 3. Permission Checking

```typescript
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";

export async function DELETE(request: Request) {
  const user = await requireSessionUser();

  // Check permission
  assertPermission(user.role, "users:delete");

  // Perform deletion...
  return Response.json({ success: true });
}
```

### 4. Getting Current Session

```typescript
// Server Component or Server Action
import { auth } from "@/modules/auth";

export async function Header() {
  const session = await auth();

  if (!session?.user) {
    return <LoginButton />;
  }

  return (
    <div>
      <p>Hello {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### 5. Creating User with Hashed Password

```typescript
import { hashPassword } from "@/modules/auth";
import { User } from "@/shared/db";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const hashed = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash: hashed,
    role: "CUSTOMER",
  });

  return Response.json({ success: true });
}
```

## Enums & Constants

### UserRole

```typescript
type UserRole = "ADMIN" | "MANAGER" | "CUSTOMER";
```

### Permission Union Type

```typescript
type Permission =
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
```

### Role Hierarchy

```typescript
ADMIN(3) > MANAGER(2) > CUSTOMER(1);
```

## Security Considerations

1. **Password Hashing:** bcrypt with 10-round salt
2. **JWT Secret:** Stored in `NEXTAUTH_SECRET` from `.env.local`
3. **HTTPS:** Required in production (Next.js enforces via `NEXTAUTH_URL`)
4. **Session Duration:** 24-hour max age
5. **Credential Validation:** Zod schema validation on server
6. **Role Enforcement:** Server-side only (cannot be bypassed from client)
7. **Type Safety:** Full TypeScript inference throughout

## Error Handling

### AuthorizationError

```typescript
throw new AuthorizationError("User not authenticated");
// Returns: 401 Unauthorized
```

### UnauthorizedError (RBAC)

```typescript
throw new UnauthorizedError("Permission denied");
// Returns: 403 Forbidden (if caught in route)
```

## Environment Variables Required

```env
# From .env.local (already configured)
NEXTAUTH_SECRET=<32+ character secret>
NEXTAUTH_URL=http://localhost:3000 (or production domain)
MONGODB_URI=<MongoDB connection string>
```

## Best Practices

1. ✅ **Always use `requireSessionUser()`** in protected routes
2. ✅ **Use `assertPermission()`** for granular control
3. ✅ **Store passwords hashed** - never store plaintext
4. ✅ **Use JWT strategy** for serverless scalability
5. ✅ **Type session with augmentation** - avoid `?` nullchecks
6. ✅ **Check role on server** - never trust client-side role
7. ✅ **Use dedicated sign-in page** - don't embed in other forms
8. ✅ **Validate credentials** - use Zod schema

## Troubleshooting

### Session not updating after role change

- JWT is cached for 24 hours
- User must re-login or JWT must be invalidated via signOut()

### TypeScript errors with `session.user.role`

- Ensure `src/types/next-auth.d.ts` exists
- Run `npm run build` to regenerate types

### Credentials provider not working

- Verify `NEXTAUTH_SECRET` is set and same in dev/prod
- Check MongoDB connection and User model
- Enable `debug: true` in NextAuth config (dev only)

### Password comparison always fails

- Ensure password was hashed with `hashPassword()`
- Use `verifyPassword()` - don't use `===` comparison
- Check character encoding in password storage

## Database Schema

The User model used by NextAuth:

```typescript
interface IUser {
  _id: ObjectId;
  email: string; // Unique, lowercase
  passwordHash: string; // bcrypt hashed
  role: "ADMIN" | "MANAGER" | "CUSTOMER";
  createdAt: Date;
  updatedAt: Date;
}
```

## Related Documentation

- See `DATABASE.md` for User model details
- See `.env.example` for environment configuration
- See NextAuth.js docs for advanced callback customization
