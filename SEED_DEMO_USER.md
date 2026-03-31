# Demo User Seeding Script

A secure seed script for creating a demo user account with MANAGER role for
development and testing.

## Overview

The `seed-demo-user.ts` script creates a demo user account with pre-defined
credentials if it doesn't already exist. It's designed for development
environments only and includes safety guards to prevent accidental exposure of
demo credentials.

## Usage

### Running the Seed Script

```bash
# Install dependencies first if needed
npm install

# Run the seed script
npm run seed:demo
```

### What Happens

1. **Environment Validation** - Validates all required environment variables
   (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
2. **Database Connection** - Connects to MongoDB
3. **User Check** - Checks if demo user already exists
4. **User Creation** - If not found, creates demo user with MANAGER role
5. **Credentials Display** - On first creation, displays credentials to console
6. **Cleanup** - Disconnects from database

### Output Examples

**First Run (User Created):**

```
📋 Validating environment variables...
✓ Environment valid
🔌 Connecting to database...
✓ Database connected
👤 Checking for existing demo user (demo@example.com)...
🔐 Creating demo user with MANAGER role...
✓ Demo user created successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DEMO USER CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:  demo@example.com
Password:  DemoPass123!@#
Role:   MANAGER
ID:     507f1f77bcf86cd799439011
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: These credentials are for local development only.
   Do not use in production. Password hash is stored securely.

🔌 Database disconnected
```

**Subsequent Runs (User Exists):**

```
📋 Validating environment variables...
✓ Environment valid
🔌 Connecting to database...
✓ Database connected
👤 Checking for existing demo user (demo@example.com)...
✓ Demo user already exists. ID: 507f1f77bcf86cd799439011. No action taken.
🔌 Database disconnected
```

## Demo User Details

| Field                | Value                                       |
| -------------------- | ------------------------------------------- |
| **Email**            | `demo@example.com`                          |
| **Password**         | `DemoPass123!@#`                            |
| **Role**             | `MANAGER`                                   |
| **Password Storage** | Hashed with bcrypt (never stored plaintext) |

## Security Considerations

### ✅ What's Secure

1. **Password Hashing** - Demo password is hashed with bcrypt before storage
2. **No API Exposure** - Demo password is NOT exposed via any API endpoint
3. **No Client Code** - Demo password is NOT included in client-side code
4. **Script-Only Usage** - Credentials only appear during script execution
5. **Environment Validation** - All env vars validated before execution
6. **Error Logging** - Errors logged safely without exposing sensitive data

### ⚠️ Important Notes

1. **Development Only** - Demo credentials are for LOCAL DEVELOPMENT ONLY
2. **Not for Production** - Do NOT use demo user in production environments
3. **Security Warning** - Console output displays password on first run; save it
   securely
4. **idempotent** - Safe to run multiple times; won't duplicate users
5. **Local Only** - This script should only be in development
   (`NODE_ENV=development`)

## Implementation Details

### Error Handling

The script uses the `toAppError()` function from the global error handling
system to convert any error to a typed `AppError`:

```typescript
try {
  // Validation, connection, user creation
} catch (error) {
  const appError = toAppError(error);

  // Log safely (no stack traces, no env values)
  console.error(`[${appError.name}] ${appError.code}: ${appError.message}`);

  process.exit(1);
}
```

### Environment Validation

Uses `getServerEnv()` from `src/shared/env.ts` to validate:

- ✅ `MONGODB_URI` - Valid MongoDB connection string
- ✅ `NEXTAUTH_SECRET` - At least 32 characters
- ✅ `NEXTAUTH_URL` - Valid URL

If any var is missing or invalid, the script exits with a descriptive error.

### Database Connection

Uses the standard `connectDB()` function:

- ✅ Reuses cached connection if available
- ✅ Configures proper timeouts and retry options
- ✅ Always disconnects in finally block for cleanup

### User Creation

```typescript
const passwordHash = await hashPassword(DEMO_PASSWORD);

const user = await User.create({
  email: DEMO_EMAIL,
  passwordHash,
  role: DEMO_ROLE,
});
```

- Uses bcrypt hashing via `hashPassword()` from `src/modules/auth/password.ts`
- Creates user with default MANAGER role
- Uses MongoDB unique index on email to prevent duplicates

## File Structure

```
scripts/
└── seed-demo-user.ts         # Seed script source

package.json
└── seed:demo script            # Added to scripts section
```

## TypeScript Types

The script is fully typed:

```typescript
// All imports are typed
import { connectDB, disconnectDB, User, UserRole } from "@/shared/db";
import { getServerEnv } from "@/shared/env";
import { hashPassword } from "@/modules/auth/password";
import { toAppError, InternalServerError } from "@/shared/server/errors";

// Type safety throughout
const DEMO_ROLE = UserRole.MANAGER; // Typed enum
const user = await User.create({ ... }); // Typed model
const appError = toAppError(error); // Typed error conversion
```

## Workflow Integration

### Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup .env.local with:
#    - MONGODB_URI=mongodb://...
#    - NEXTAUTH_SECRET=...
#    - NEXTAUTH_URL=http://localhost:3000

# 3. Seed demo user
npm run seed:demo

# 4. Start development server
npm run dev

# 5. Login at http://localhost:3000/login
#    Email: demo@example.com
#    Password: DemoPass123!@#
```

### Testing

The script is idempotent:

```bash
# Run multiple times - no side effects
npm run seed:demo  # Creates user
npm run seed:demo  # Skips (user exists)
npm run seed:demo  # Skips (user exists)
```

## Troubleshooting

### Script Won't Run

```bash
# Check if tsx is installed
npm list tsx

# If not found, install:
npm install -D tsx  # Already in devDependencies
```

### Environment Variables Error

```
❌ Seed operation failed
   Error: MONGODB_URI must be a valid MongoDB connection URL
```

**Solution:** Add valid env vars to `.env.local`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
NEXTAUTH_SECRET=<your-secret-at-least-32-chars>
NEXTAUTH_URL=http://localhost:3000
```

### Database Connection Error

```
❌ Seed operation failed
   Error: Failed to connect to MongoDB
```

**Solution:** Ensure MongoDB is running and `MONGODB_URI` is correct.

### Duplicate Key Error

This shouldn't happen due to the existence check, but if it does:

```typescript
// The error will be caught and logged safely
// The script will exit with code 1
// You can manually delete the demo user:
db.users.deleteOne({ email: "demo@example.com" });
```

## Best Practices

1. **Run After Fresh Clone**

   ```bash
   git clone ...
   npm install
   npm run seed:demo
   npm run dev
   ```

2. **Save Credentials Securely**
   - Copy demo credentials from first run output
   - Save to password manager or secure notes
   - Do NOT commit to git

3. **Use in CI/CD Pipeline** (if needed)

   ```yaml
   - name: Seed Demo User
     run: npm run seed:demo
     env:
       MONGODB_URI: ${{ secrets.MONGODB_URI }}
       NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
       NEXTAUTH_URL: http://localhost:3000
   ```

4. **Keep Script Local**
   - Do NOT run in production
   - Do NOT expose credentials in logs
   - Do NOT commit sensitive data

## API Security

### Demo Password NOT Exposed

The demo password is **never** exposed via:

- ❌ API endpoints (no login endpoint returns password)
- ❌ Client-side code (scripts, React components)
- ❌ Response bodies
- ❌ Database queries (only hashed password stored)
- ❌ Error messages
- ❌ Console logs (only in seed script on creation)

### Login Flow Security

```typescript
// /api/auth/signup validates input but never returns password
return jsonOk({
  id: user._id,
  email: user.email,
  role: user.role,
  // ❌ NO password returned
});

// Login uses NextAuth credentials provider
// Password is hashed before comparison
// ✅ Secure by default
```

## Related Files

- [src/shared/env.ts](src/shared/env.ts) - Environment validation
- [src/shared/db/connect.ts](src/shared/db/connect.ts) - Database connection
- [src/shared/server/errors.ts](src/shared/server/errors.ts) - Error classes
- [src/shared/server/handler.ts](src/shared/server/handler.ts) - toAppError
  function
- [src/modules/auth/password.ts](src/modules/auth/password.ts) - hashPassword
  function
