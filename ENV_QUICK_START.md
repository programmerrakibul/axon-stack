# Environment Variables Quick Reference

## 🚀 Quick Start

### 1. Copy `.env.example` to create `.env.local`

```bash
cp .env.example .env.local
```

### 2. Fill in required values

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
NEXTAUTH_SECRET=your-32-character-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Generate a secure NEXTAUTH_SECRET

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([byte[]]::new(32) | ForEach-Object { Get-Random -Max 256 })
```

### 4. Start the app

```bash
npm run dev
```

## 📋 Checklists

### Development Setup

- [ ] Create `.env.local` from `.env.example`
- [ ] Fill in all required environment variables
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Run `npm run dev` and check for errors
- [ ] Test the app works correctly

### Production Deployment

- [ ] Generate new secrets (don't reuse dev secrets!)
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Use production MongoDB connection string
- [ ] Set environment variables in production platform
- [ ] Never commit `.env.local` to git
- [ ] Test build with production variables
- [ ] Verify app runs without errors

## 🔒 Security Rules

| Do                                      | Don't                                |
| --------------------------------------- | ------------------------------------ |
| ✅ Generate new secrets per environment | ❌ Reuse dev secrets in production   |
| ✅ Use 32+ character random secrets     | ❌ Use weak or predictable secrets   |
| ✅ Keep `.env.local` in `.gitignore`    | ❌ Commit `.env.local` to git        |
| ✅ Use HTTPS in production URLs         | ❌ Use HTTP in production            |
| ✅ Rotate secrets regularly             | ❌ Keep the same secret indefinitely |
| ✅ Reference `.env.example`             | ❌ Hardcode values in code           |

## 🧪 Testing

```bash
# Test with valid config
npm run build    # Should succeed

# Test with missing variable
# (comment out a required var in .env.local)
npm run build    # Should fail with clear error

# Verify env vars are loaded
curl http://localhost:3000/api/env-check
```

## 🚨 Troubleshooting

| Error                                            | Fix                                                 |
| ------------------------------------------------ | --------------------------------------------------- |
| `MONGODB_URI: Required`                          | Add valid MongoDB connection string to `.env.local` |
| `NEXTAUTH_SECRET must be at least 32 characters` | Generate new secret with `openssl rand -base64 32`  |
| `NEXTAUTH_URL must be a valid URL`               | Use proper URL format: `http://localhost:3000`      |
| Changes not reflected                            | Restart dev server after changing `.env.local`      |

## 📝 Environment Variables

### MONGODB_URI

- **What:** MongoDB database connection
- **Format:** `mongodb+srv://user:pass@host/db`
- **Where:** `.env.local`
- **Exposed:** No (server-only)

### NEXTAUTH_SECRET

- **What:** Session encryption key
- **Format:** 32+ random characters
- **Where:** `.env.local`
- **Exposed:** No (server-only)
- **Generate:** `openssl rand -base64 32`

### NEXTAUTH_URL

- **What:** Your app's main URL
- **Format:** `http://localhost:3000` or `https://yourdomain.com`
- **Where:** `.env.local`
- **Exposed:** No (server-only)

### NODE_ENV

- **What:** Environment type
- **Options:** `development`, `production`, `test`
- **Default:** `development`
- **Where:** `.env.local` (optional)

## 📚 Documentation

- Full guide: [ENV_SECURITY.md](./ENV_SECURITY.md)
- Zod schema: [src/shared/env.ts](./src/shared/env.ts)
- Example template: [.env.example](./.env.example)

## 🔗 Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check environment variables
curl http://localhost:3000/api/env-check
```

## 💡 Pro Tips

1. **Keep dev secrets weak** - They're for local development only
2. **Use environment-specific URLs** - Dev needs localhost, prod needs your
   domain
3. **Rotate production secrets** - Do this regularly for security
4. **Check for .env.local in .gitignore** - Prevent accidental commits
5. **Monitor deployment logs** - Catch env var issues early

## 🆘 Need Help?

1. Check `.env.example` for the correct format
2. Read the full guide in `ENV_SECURITY.md`
3. Look at the error message - it tells you exactly what's wrong
4. Verify variables in `.env.local` match the example
5. Restart the dev server after making changes

---

**Remember:** Never commit `.env.local` to git! It's already in `.gitignore` for
your safety.
