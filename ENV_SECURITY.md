# Environment Variable Security & Configuration

## Overview

The AxonStack application implements **secure environment variable validation**
using Zod schema validation. This ensures all required server-side secrets are
present and correctly formatted at startup, providing early error detection and
preventing production deployments with missing configuration.

## Key Features

✅ **Type-Safe Environment Variables** - Full TypeScript support with Zod
validation ✅ **Server-Only Secrets** - No exposure of sensitive data to the
browser ✅ **Early Validation** - Errors thrown at app startup, not runtime ✅
**Clear Error Messages** - Specific guidance on what's wrong and how to fix it
✅ **Git-Safe Configuration** - `.env.local` automatically ignored by git ✅
**Production Ready** - Works seamlessly in both development and production

## Configuration Files

### `src/shared/env.ts`

Core environment variable validation module. Contains:

- **`serverEnvSchema`** - Zod schema defining all required environment variables
- **`validateServerEnv()`** - Validation function with detailed error reporting
- **`getServerEnv()`** - Getter function for accessing validated env vars
- **`initEnv()`** - Initialization function called at app startup
- **Automatic validation** - Runs on server startup via module-level code

### `.env.local`

Development environment configuration file (Git-ignored).

```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### `.env.example`

Template file showing required environment variables and their format. Used as
reference for creating `.env.local`.

### `.gitignore`

Already configured to ignore:

- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`

## Required Environment Variables

### `MONGODB_URI` (Required)

- **Type:** String (URL)
- **Description:** MongoDB connection string
- **Example:** `mongodb+srv://username:password@cluster.mongodb.net/database`
- **Validation:** Must be a valid URL
- **Exposed to Client:** ❌ No (Server-only)

### `NEXTAUTH_SECRET` (Required)

- **Type:** String (Secret)
- **Description:** NextAuth authentication secret for session encryption
- **Requirements:**
  - Minimum 32 characters
  - Use a cryptographically secure random value
- **Generation:**

  ```bash
  # macOS/Linux
  openssl rand -base64 32

  # Windows PowerShell
  [Convert]::ToBase64String([byte[]]::new(32) | ForEach-Object { Get-Random -Max 256 })

  # Or use: https://generate-secret.vercel.app/32
  ```

- **Exposed to Client:** ❌ No (Server-only)

### `NEXTAUTH_URL` (Required)

- **Type:** String (URL)
- **Description:** Canonical URL of your site for NextAuth
- **Requirements:**
  - Must be a valid URL
  - Must match your deployment URL exactly
  - In production, use HTTPS
- **Examples:**
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`
- **Exposed to Client:** ❌ No (Server-only)

### `NODE_ENV` (Optional)

- **Type:** Enum: `"development"` | `"production"` | `"test"`
- **Default:** `"development"`
- **Used For:** Build-time optimizations and logging
- **Exposed to Client:** ✅ Implicitly (Next.js handles this)

## Security Best Practices

### ✅ DO

- ✅ Generate a new `NEXTAUTH_SECRET` for each environment (dev, staging,
  production)
- ✅ Use strong, random values for secrets
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Rotate secrets regularly in production
- ✅ Use environment-specific values for each deployment
- ✅ Keep `.env.example` in version control as a reference
- ✅ Review environment variable access in code

### ❌ DON'T

- ❌ Commit `.env.local` to git
- ❌ Use the same `NEXTAUTH_SECRET` across environments
- ❌ Use weak or predictable secrets
- ❌ Prefix sensitive data with `NEXT_PUBLIC_`
- ❌ Hardcode secrets in code
- ❌ Share `.env.local` via insecure channels
- ❌ Use placeholder values in production

## Usage in Code

### Importing in Server Components

```typescript
import { getServerEnv } from "@/shared/env";

export default function MyServerComponent() {
  const env = getServerEnv();

  // Type-safe access with full TypeScript support
  console.log(env.MONGODB_URI);
  console.log(env.NEXTAUTH_SECRET);

  return <div>Server component</div>;
}
```

### Using the `serverEnv` Proxy

```typescript
import { serverEnv } from "@/shared/env";

// Direct access (less recommended, use getServerEnv() instead)
const mongoUrl = serverEnv.MONGODB_URI;
```

### In API Routes

```typescript
// src/app/api/your-route/route.ts
import { getServerEnv } from "@/shared/env";

export async function GET() {
  const env = getServerEnv();

  // Connect to MongoDB using MONGODB_URI
  const client = await connectToDatabase(env.MONGODB_URI);

  // Use NEXTAUTH_SECRET for session management
  // Use NEXTAUTH_URL for redirect URLs

  return Response.json({ success: true });
}
```

### In Server-Side Functions

```typescript
// Server-side utility function
export async function getData() {
  const env = getServerEnv();

  // All env vars are automatically validated at this point
  const db = await connectDB(env.MONGODB_URI);

  // Safe to use - guaranteed to exist and be valid
  return await db.collection("items").find({}).toArray();
}
```

## Environment Variable Validation Process

### 1. **Application Startup**

```
App loads → src/app/layout.tsx imports initEnv()
  ↓
initEnv() calls getServerEnv()
  ↓
getServerEnv() validates all env vars with Zod
  ↓
If validation fails → Clear error message + process.exit(1)
  ↓
If validation succeeds → App starts normally
```

### 2. **Build Time**

```
npm run build
  ↓
Next.js loads root layout
  ↓
Environment variables are validated
  ↓
If missing → Build fails immediately
  ↓
If valid → Build continues
```

### 3. **Runtime**

```
Server starts (npm run dev or npm start)
  ↓
Module-level validation runs (env.ts)
  ↓
If any var is missing → Server exits with error
  ↓
If all valid → Server ready to accept requests
```

## Error Messages

### Missing Required Variable

```
❌ Invalid or missing environment variables:
  • MONGODB_URI: Required

Please check your .env.local file and ensure all required variables are set correctly.
See .env.example for reference.
```

### Invalid URL Format

```
❌ Invalid or missing environment variables:
  • NEXTAUTH_URL: NEXTAUTH_URL must be a valid URL

Please check your .env.local file and ensure all required variables are set correctly.
See .env.example for reference.
```

### Secret Too Short

```
❌ Invalid or missing environment variables:
  • NEXTAUTH_SECRET: NEXTAUTH_SECRET must be at least 32 characters

Please check your .env.local file and ensure all required variables are set correctly.
See .env.example for reference.
```

## Deployment Checklist

### Before Deploying to Production

- [ ] Generate a new `NEXTAUTH_SECRET` (not using the dev one)
- [ ] Set correct `NEXTAUTH_URL` for your production domain
- [ ] Create production MongoDB connection string
- [ ] Set `NODE_ENV=production`
- [ ] Verify `.env.local` is NOT committed to git
- [ ] Test deployment in staging environment first
- [ ] Verify all env vars are present in production environment
- [ ] Monitor logs for env validation errors

### Verifying Environment Variables

**Development:**

```bash
npm run dev
# Look for: "- Environments: .env.local"
# Look for: "✓ Ready in X.Xs"
```

**Production Build:**

```bash
npm run build
# Should complete without env validation errors
# Check for: "✓ Compiled successfully"
```

**Test API Endpoint:**

```bash
curl http://localhost:3000/api/env-check
# Returns JSON with validation status and config info
```

## Testing Environment Variable Validation

### Test 1: Valid Configuration

```bash
# .env.local has all required vars
npm run build
# Expected: Build succeeds
```

### Test 2: Missing MONGODB_URI

```bash
# Comment out MONGODB_URI in .env.local
npm run build
# Expected: Build fails with clear error about MONGODB_URI
```

### Test 3: Invalid NEXTAUTH_URL

```bash
# Set NEXTAUTH_URL=not-a-valid-url
npm run build
# Expected: Build fails with "must be a valid URL"
```

### Test 4: Short NEXTAUTH_SECRET

```bash
# Set NEXTAUTH_SECRET=tooshort
npm run build
# Expected: Build fails with "must be at least 32 characters"
```

## Troubleshooting

### "MONGODB_URI is required"

**Problem:** `.env.local` doesn't have MONGODB_URI **Solution:** Add MongoDB
connection string to `.env.local`

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### "NEXTAUTH_SECRET is required"

**Problem:** `.env.local` doesn't have NEXTAUTH_SECRET **Solution:** Generate
and add NEXTAUTH_SECRET

```bash
openssl rand -base64 32  # Then copy to .env.local
```

### "NEXTAUTH_URL must be a valid URL"

**Problem:** NEXTAUTH_URL is not a valid URL format **Solution:** Use proper URL
format

```bash
# ❌ Wrong
NEXTAUTH_URL=localhost:3000

# ✅ Correct
NEXTAUTH_URL=http://localhost:3000
```

### App Crashes on Startup

**Problem:** Environment variables validation failed **Solution:** Check error
message and ensure all required vars are in `.env.local`

```bash
# Check what's required
cat .env.example

# Update .env.local with missing values
nano .env.local
```

### Changes to `.env.local` Not Reflected

**Problem:** Server is still using old values **Solution:** Restart the
development server

```bash
# Stop current server (Ctrl+C)
npm run dev  # Restart
```

## Type Safety

All environment variable access is fully type-safe:

```typescript
import { getServerEnv } from "@/shared/env";

const env = getServerEnv();

// ✅ TypeScript knows these are strings
env.MONGODB_URI;
env.NEXTAUTH_SECRET;
env.NEXTAUTH_URL;

// ✅ TypeScript catches typos
env.MONGO_URI; // ❌ Type error: property doesn't exist
env.nextAuthSecret; // ❌ Type error: case mismatch
```

## Production Environment Setup

### Using Environment Variables in Production

**Vercel:**

```
Settings → Environment Variables
Add variables for Production environment
```

**Docker:**

```dockerfile
ENV MONGODB_URI=your_production_uri
ENV NEXTAUTH_SECRET=your_production_secret
ENV NEXTAUTH_URL=https://yourdomain.com
```

**systemd Service:**

```ini
Environment="MONGODB_URI=mongodb+srv://..."
Environment="NEXTAUTH_SECRET=..."
Environment="NEXTAUTH_URL=https://yourdomain.com"
```

**CI/CD (GitHub Actions):**

```yaml
env:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
```

## API Endpoint for Verification

A debug endpoint is available at `/api/env-check`:

```bash
curl http://localhost:3000/api/env-check
```

**Response (safe - no secrets exposed):**

```json
{
  "success": true,
  "message": "Environment variables are properly configured",
  "config": {
    "database": {
      "mongodbConfigured": true,
      "mongodbUrl": "mongodb+srv://dev:devpassword@dev-cluste..."
    },
    "auth": {
      "nextAuthConfigured": true,
      "nextAuthSecretLength": 32,
      "nextAuthUrl": "http://localhost:3000"
    },
    "environment": "development"
  },
  "security": {
    "secretsNotExposed": true,
    "allRequiredVarsPresent": true
  }
}
```

## References

- [Zod Documentation](https://zod.dev/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/initialization)
- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
