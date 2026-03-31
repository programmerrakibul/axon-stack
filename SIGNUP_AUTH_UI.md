# Signup and Authentication UI

A complete signup and login system with shared Zod schemas, typed error
handling, and responsive UI with Next Auth integration.

## Architecture

### 1. Shared Schemas (`src/modules/auth/schemas.ts`)

All validation shared between client and server for type safety:

```typescript
// Credentials for login
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

// Signup with password confirmation
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
```

### 2. Client API Wrapper (`src/shared/client/api.ts`)

Type-safe API client with automatic error handling:

```typescript
export class ApiClientError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: unknown,
  ) {}

  isCode(code: string): boolean {
    return this.code === code;
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T>;
```

- Returns typed data on success
- Throws `ApiClientError` on failure
- Provides `isCode()` method to check error type
- Handles `ApiResponse<T>` shape automatically

**Usage:**

```typescript
try {
  const user = await apiFetch<User>("/api/user", {
    method: "GET",
  });
} catch (err) {
  if (err instanceof ApiClientError) {
    if (err.isCode("CONFLICT")) {
      toast.error("Email already in use");
    } else {
      toast.error(err.message);
    }
  }
}
```

### 3. Server Route: POST /api/auth/signup

Handles user registration with validation and duplicate email checking:

```typescript
export const POST = withErrorHandling(async (request: Request) => {
  await connectDB();

  const body = await request.json();

  // Validate using shared schema (auto-converts to ValidationError)
  const { email, password } = signupSchema.parse(body);

  // Check for duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("Email already in use");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with default CUSTOMER role
  const user = await User.create({
    email,
    passwordHash,
  });

  // Return response in ApiResponse shape
  return jsonOk(
    {
      id: user._id?.toString(),
      email: user.email,
      role: user.role,
    },
    { status: 201 },
  );
});
```

**Response on success (201):**

```json
{
  "ok": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

**Response on duplicate email (409 ConflictError):**

```json
{
  "ok": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already in use"
  }
}
```

**Response on validation error (400 ValidationError):**

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "issues": [
        {
          "field": "password",
          "code": "invalid_string",
          "message": "Password must contain an uppercase letter"
        }
      ]
    }
  }
}
```

### 4. Signup Page (`src/app/signup/page.tsx`)

Client-side signup form using React Hook Form + Zod:

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/modules/auth/schemas";
import { apiFetch, ApiClientError } from "@/shared/client/api";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      // 1. Create account via API
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });

      toast.success("Account created successfully!");

      // 2. Sign in automatically
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);

        // Show validation details if available
        if (error.isCode("VALIDATION_ERROR") && error.details) {
          const details = error.details as any;
          if (Array.isArray(details.issues)) {
            details.issues.forEach((issue: any) => {
              console.error(`${issue.field}: ${issue.message}`);
            });
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/10 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="text-3xl font-bold">Create Account</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                disabled={isLoading}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                disabled={isLoading}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must contain uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                disabled={isLoading}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Features:**

- ✅ Client-side validation with Zod
- ✅ Real-time error display
- ✅ Password strength guidance
- ✅ Automatic sign-in after signup
- ✅ Responsive and theme-safe
- ✅ Loading state feedback

### 5. Login Page (`src/app/login/page.tsx` + `src/app/login/content.tsx`)

Client-side login form using NextAuth credentials provider:

```typescript
// login/page.tsx
"use client";

import { Suspense } from "react";
import LoginPageContent from "./content";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

// login/content.tsx
"use client";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Wrapped in Suspense
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const { register, handleSubmit, formState: { errors } } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
  });

  const onSubmit = async (data: Credentials) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.ok) {
      toast.success("Signed in successfully!");
      router.push(callbackUrl);
    } else if (result?.error) {
      toast.error(result.error || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/10 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Features:**

- ✅ Callback URL support (redirects to original page after login)
- ✅ NextAuth Credentials provider integration
- ✅ Suspense boundary for useSearchParams
- ✅ Responsive and theme-safe

## Error Handling Flow

### Signup Error Flow

```
User submits form
    ↓
React Hook Form validates with Zod (client-side)
    ↓
Valid → apiFetch POST /api/auth/signup
    ↓
    ├─ Server validates with signupSchema
    │  ├─ Invalid → ValidationError (400)
    │  ├─ Duplicate email → ConflictError (409)
    │  └─ Success → jsonOk (201)
    ├─ Success → data returned, sign in automatically
    └─ Error → ApiClientError thrown
       ├─ Catch → Check isCode()
       └─ Display toast.error(message)
```

### Login Error Flow

```
User submits form
    ↓
React Hook Form validates with Zod (client-side)
    ↓
Valid → signIn('credentials', { redirect: false })
    ↓
    ├─ Success → toast.success() → router.push(callbackUrl)
    ├─ Invalid credentials → toast.error(result.error)
    └─ Error → toast.error()
```

## Schema Reuse

Both pages use the **exact same** schemas from `src/modules/auth/schemas.ts`:

```typescript
// src/modules/auth/schemas.ts
export const credentialsSchema = z.object({ ... });
export const signupSchema = z.object({ ... });

// In signup page
const form = useForm<SignupInput>({
  resolver: zodResolver(signupSchema),
});

// In login page
const form = useForm<Credentials>({
  resolver: zodResolver(credentialsSchema),
});
```

This ensures:

- ✅ No schema duplication
- ✅ Client and server validation matches
- ✅ Type safety end-to-end
- ✅ Easy to update rules (change once, updates everywhere)

## Type Safety Benefits

### Server to Client

```typescript
// Server validates with signupSchema.parse()
// Server errors include typed details

// Client catches ApiClientError with:
error.code: string              // "VALIDATION_ERROR", "CONFLICT", etc.
error.message: string           // User-friendly message
error.details?: unknown         // Structured error info
error.isCode(code: string)      // Type-safe error checking
```

### Form Validation

```typescript
// Zod infers types
const SignupInput = z.infer<typeof signupSchema>;

const form = useForm<SignupInput>({
  resolver: zodResolver(signupSchema),
});

const data = form.getValues(); // Type: SignupInput
```

## Responsive Design

All pages use:

- ✅ Flexbox center with `flex items-center justify-center`
- ✅ Gradient background: `bg-gradient-to-b from-background to-secondary/10`
- ✅ Mobile padding: `px-4`
- ✅ Max width container: `max-w-sm`
- ✅ CSS variables via Theme Provider for light/dark mode

## Common Patterns

### Handling Validation Errors

```typescript
try {
  await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isCode("VALIDATION_ERROR")) {
      const issues = (error.details as any)?.issues || [];
      issues.forEach((issue) => {
        console.log(`${issue.field}: ${issue.message}`);
      });
    } else if (error.isCode("CONFLICT")) {
      // Handle duplicate email
      setEmailError("Email already in use");
    }
    toast.error(error.message);
  }
}
```

### Redirect After Login

```typescript
// Login page automatically uses callbackUrl
const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

if (result?.ok) {
  router.push(callbackUrl);
}

// Usage: /login?callbackUrl=/dashboard/products
```

### Disabling Inputs During Submit

```typescript
const [isLoading, setIsLoading] = useState(false);

const onSubmit = async (data: Data) => {
  setIsLoading(true);
  try {
    // API call
  } finally {
    setIsLoading(false);
  }
};

<Input disabled={isLoading} />
<Button disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

## Testing Checklist

- [ ] Signup with valid credentials → redirects to dashboard
- [ ] Signup with invalid email → shows validation error
- [ ] Signup with short password → shows password requirements
- [ ] Signup with mismatched passwords → shows "Passwords don't match"
- [ ] Signup with duplicate email → shows "Email already in use"
- [ ] Login with valid credentials → redirects to dashboard
- [ ] Login with invalid credentials → shows "Invalid credentials"
- [ ] Login with callback URL → redirects to original page
- [ ] Light/dark theme toggle works on both pages
- [ ] Form is responsive on mobile (px-4 padding)
