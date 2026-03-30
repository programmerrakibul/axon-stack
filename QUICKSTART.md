# AxonStack Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

The dashboard will load automatically with sample data.

---

## 📋 Available Routes

| Route                      | Description                        |
| -------------------------- | ---------------------------------- |
| `/`                        | Home (auto-redirects to dashboard) |
| `/dashboard`               | Main dashboard overview            |
| `/dashboard/categories`    | Product categories management      |
| `/dashboard/products`      | Inventory & products list          |
| `/dashboard/orders`        | Customer orders tracking           |
| `/dashboard/restock-queue` | Low stock items & restocking       |
| `/dashboard/activity`      | System activity log                |

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm start               # Run production server

# Code Quality
npm run lint            # Check code with ESLint
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without writing
```

---

## 🎨 Customization

### Theme Colors

Edit CSS variables in `src/app/globals.css`:

- Light mode: Lines 3-14
- Dark mode: Lines 26-32

### Add New Pages

1. Create folder: `src/app/dashboard/new-page`
2. Create file: `src/app/dashboard/new-page/page.tsx`
3. Add route to sidebar in `src/components/layout/sidebar.tsx`

### Modify Components

- UI components: `src/components/ui/`
- Layout components: `src/components/layout/`

---

## 📦 Key Technologies

- **Next.js 16** - App Router, Fast Refresh, Optimizations
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling
- **TanStack Query** - Server state management
- **Sonner** - Toast notifications
- **ESLint & Prettier** - Code quality

---

## 🌙 Dark Mode

Click the sun/moon icon in the top-right header to toggle dark mode.

---

## 🐛 Troubleshooting

### Port 3000 in use?

```bash
npm run dev -- -p 3001
```

### Clear cache

```bash
rm -rf .next node_modules
npm install
```

### Type errors?

```bash
npm run build
```

---

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)

---

## ✅ What's Included

✓ Modern Next.js 16+ project structure
✓ TypeScript with strict mode
✓ Tailwind CSS with indigo + slate theme
✓ Responsive sidebar navigation
✓ 6 feature-complete dashboard pages
✓ Dark mode support
✓ ESLint & Prettier configured
✓ TanStack Query setup
✓ Sonner toast notifications
✓ Production-ready build

---

**Happy coding! 🎉**
