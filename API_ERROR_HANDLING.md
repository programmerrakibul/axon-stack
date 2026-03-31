# Global Error Handling System

A type-safe, centralized error handling system for all API routes with
consistent error responses, automatic error conversion, and safe server-side
logging.

## Architecture

The system consists of three core modules:

### 1. Error Classes (`src/shared/server/errors.ts`)

Typed error hierarchy with proper HTTP status codes:

- **`AppError`** - Base class for all application errors
  - Properties: `code` (string), `message`, `status` (HTTP), `details?` (object)
  - All custom errors inherit from this

- **Error Subclasses:**
  - `BadRequestError` - 400 Bad Request (malformed requests)
  - `ValidationError` - 400 Invalid input (from Zod or validation)
  - `UnauthorizedError` - 401 Unauthenticated (invalid/missing auth)
  - `ForbiddenError` - 403 Forbidden (lacks permission)
  - `NotFoundError` - 404 Not Found (resource missing)
  - `ConflictError` - 409 Conflict (violates constraints)
  - `InternalServerError` - 500 Server error (unexpected)

### 2. API Response Shape (`src/shared/server/apiResponse.ts`)

Discriminated union types for type-safe client handling:

```typescript
// Success response
type ApiSuccess<T> = {
  ok: true;
  data: T;
};

// Failure response
type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

// Either one
type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
```

### 3. Handler Helpers (`src/shared/server/handler.ts`)

Utilities for creating responses and wrapping handlers:

- **`toAppError(err: unknown): AppError`**
  - Converts any error to AppError
  - Zod errors → ValidationError with structured issues
  - Unknown errors → InternalServerError
  - Never exposes stack traces to clients

- **`jsonOk<T>(data: T, init?: ResponseInit): Response`**
  - Creates successful response with ApiSuccess shape
  - Returns status 200 by default (override with init)

- **`jsonError(error: AppError, init?: ResponseInit): Response`**
  - Creates error response with ApiFailure shape
  - Uses error's HTTP status code automatically
  - Sanitizes details before sending

- **`withErrorHandling(handler: Handler): Handler`**
  - Wraps route handlers with automatic error catching
  - Converts errors using `toAppError()`
  - Logs non-sensitive details server-side
  - Returns proper ApiFailure response
  - **Prevents information leakage** - never exposes internals to client

## Usage Examples

### Basic Handler

```typescript
import { withErrorHandling, jsonOk, jsonError } from "@/shared/server/handler";
import { BadRequestError } from "@/shared/server/errors";

export const GET = withErrorHandling(async (request: Request) => {
  const data = await fetchData();
  return jsonOk(data);
});
```

### Validation Errors

```typescript
import { credentialsSchema } from "@/modules/auth/schemas";

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();

  // Zod parse error is auto-converted to ValidationError
  // with structured issues in details
  const validated = credentialsSchema.parse(body);

  return jsonOk({ success: true });
});
```

**Response on validation error:**

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "issues": [
        {
          "field": "email",
          "code": "invalid_string",
          "message": "Invalid email"
        }
      ]
    }
  }
}
```

### Explicit Error Throwing

```typescript
import { NotFoundError, BadRequestError } from "@/shared/server/errors";

export const DELETE = withErrorHandling(async (request: Request) => {
  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    throw new BadRequestError("Missing ID parameter");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError("Product");
  }

  await product.deleteOne();
  return jsonOk({ id });
});
```

### Authentication & Authorization

```typescript
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";

export const POST = withErrorHandling(async (request: Request) => {
  // Throws UnauthorizedError if not authenticated
  const user = await requireSessionUser();

  // Throws ForbiddenError if lacks permission
  assertPermission(user.role, "users:edit");

  const body = await request.json();
  // ... process request

  return jsonOk({ success: true });
});
```

## Response Examples

### Success Response

```json
{
  "ok": true,
  "data": {
    "id": "123",
    "name": "Product",
    "price": 99.99
  }
}
```

### Validation Failed

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "issues": [
        {
          "field": "email",
          "code": "invalid_string",
          "message": "Invalid email"
        }
      ]
    }
  }
}
```

### Unauthorized

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Forbidden (No Permission)

```json
{
  "ok": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Permission denied: CUSTOMER does not have users:edit"
  }
}
```

### Not Found

```json
{
  "ok": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

### Server Error

```json
{
  "ok": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

## Integration with Updated Routes

All API routes now use the error handling system:

- **`/api/products`** - GET/POST with validation
- **`/api/profile`** - GET (auth required), POST (permission check)
- **`/api/env-check`** - GET (env validation)

Example updated route:

```typescript
export const GET = withErrorHandling(async (request: Request) => {
  await connectDB();
  const products = await Product.find({ isActive: true });
  return jsonOk({
    products: products.map(mapProductToDTO),
    count: products.length,
  });
});
```

## TypeScript Client Code

The discriminated union allows perfect type safety on the client:

```typescript
const response = await fetch("/api/products").then((r) => r.json());

if (response.ok) {
  // Type: ApiSuccess<...>
  console.log(response.data.products);
} else {
  // Type: ApiFailure
  console.error(`[${response.error.code}] ${response.error.message}`);
  if (response.error.details) {
    console.log(response.error.details);
  }
}
```

## Security Properties

1. **No Stack Traces** - Server errors never expose implementation details
2. **Safe Logging** - Errors logged server-side only, not sent to client
3. **Sanitized Details** - Only whitelisted details in error responses
4. **Zod Error Safety** - Validation issues exposed safely (field, code, message
   only)
5. **Env Secret Protection** - Environment variables never leak in error
   messages

## Extending the System

### Creating Custom Errors

```typescript
// src/shared/server/errors.ts
export class RateLimitError extends AppError {
  constructor(remainingTime: number) {
    super("RATE_LIMIT", `Too many requests. Retry in ${remainingTime}s`, 429, {
      retryAfter: remainingTime,
    });
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
```

### Using in Route

```typescript
if (requestCount > LIMIT) {
  throw new RateLimitError(secondsUntilWindowReset);
}
```

## Common Patterns

### Conditional Errors Based on State

```typescript
const user = await User.findById(id);

if (!user) {
  throw new NotFoundError("User");
}

if (user.isDeleted) {
  throw new ConflictError("User has been deleted");
}

if (user.role !== "ADMIN") {
  throw new ForbiddenError("Admin access required");
}
```

### Wrapping Legacy Error Handling

If you have existing routes, migrate them incrementally:

```typescript
// Before: manual error handling
export async function GET(request: Request) {
  try {
    // ... logic
  } catch (error) {
    return Response.json({ success: false, error: "..." }, { status: 500 });
  }
}

// After: automatic handling
export const GET = withErrorHandling(async (request: Request) => {
  // ... same logic, errors handled automatically
  return jsonOk(data);
});
```

## Debugging

Errors are logged server-side with context:

```
[AppError] BAD_REQUEST: Missing required fields {
  required: ["name", "categoryId"],
  provided: ["name"]
}

[ValidationError] VALIDATION_ERROR: Validation failed {
  issues: [...]
}

[InternalServerError] INTERNAL_SERVER_ERROR: Internal server error {
  // No details logged for true internal errors
}
```

Check server logs for implementation details while clients receive safe error
messages.
