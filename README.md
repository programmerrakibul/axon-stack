# AxonStack - Modern Inventory Management Dashboard

A powerful, modern inventory management system built with **Next.js 16+ App Router**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**. Features a beautiful indigo + slate theme with comprehensive dashboard functionality.

## 🚀 Features

- **Next.js 16+** with App Router for optimal performance and SEO
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS v4** with comprehensive indigo + slate theme
- **shadcn/ui** components for consistent, accessible UI
- **TanStack Query** for efficient server state management
- **Sonner** for beautiful toast notifications
- **Responsive Design** with mobile-first approach
- **Dark Mode Support** with theme toggle
- **ESLint & Prettier** configured for code quality
- **Turbopack** enabled for faster development builds

## 📊 Dashboard Pages

- **Dashboard** - Overview with key metrics and statistics
- **Categories** - Manage product categories
- **Products** - View and manage inventory items
- **Orders** - Track customer orders and status
- **Restock Queue** - Monitor low stock items and restocking needs
- **Activity** - System activity log and audit trail

## 🛠️ Tech Stack

| Technology     | Version         | Purpose                         |
| -------------- | --------------- | ------------------------------- |
| Next.js        | 16.2.1          | React framework with App Router |
| React          | 19.2.4          | UI library                      |
| TypeScript     | Latest          | Type safety                     |
| Tailwind CSS   | 4               | Styling                         |
| TanStack Query | 5.95.2          | Server state management         |
| Sonner         | 2.0.7           | Toast notifications             |
| Radix UI       | Core dependency | Accessible UI primitives        |
| Lucide Icons   | Latest          | Icon library                    |

## 📋 Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── categories/           # Categories management
│   │   ├── products/             # Products inventory
│   │   ├── orders/               # Orders tracking
│   │   ├── restock-queue/        # Restock management
│   │   ├── activity/             # Activity log
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects to dashboard)
│   └── globals.css               # Global styles with theme variables
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── header.tsx            # Top header with theme toggle
│   └── providers.tsx             # React Query provider
├── lib/
│   └── utils.ts                  # Utility functions (cn helper)
└── public/                       # Static assets
```

## 🎨 Theme Configuration

The project uses custom CSS variables for theming with indigo + slate colors:

**Light Mode:**

- Primary: Indigo (#6366f1)
- Secondary: Slate (#64748b)
- Accents: Success, Warning, Destructive states

**Dark Mode:**

- Primary: Lighter Indigo (#818cf8)
- Secondary: Light Slate (#cbd5e1)
- Maintains contrast and accessibility

Theme variables are defined in `src/app/globals.css` and can be customized.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (v20 recommended)
- npm, yarn, pnpm, or bun

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

3. **Open in browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

The dashboard will automatically redirect from the home page. Hot module reloading is enabled for instant updates.

## 📝 Available Scripts

### Development

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run ESLint checks
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without writing
npm run format:check
```

## 🎯 Coding Standards

### Linting Configuration

The project uses **ESLint** with Next.js configuration and Prettier integration:

- File: `.prettierrc` - Prettier configuration
- File: `eslint.config.mjs` - ESLint configuration
- File: `.prettierignore` - Files excluded from formatting

### Code Formatting Rules

- **Semi-colons**: Always included
- **Quotes**: Double quotes for JSX and strings
- **Print Width**: 80 characters
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 compatible

### ESLint Rules

- Next.js core web vitals
- TypeScript strict mode
- React best practices
- Accessibility (a11y) checks
- Prettier integration to avoid conflicts

## 🔧 Configuration Files

### `.prettierrc`

Prettier formatting configuration with opinionated defaults for React/Next.js projects.

### `eslint.config.mjs`

Modern ESLint configuration (flat config) including:

- Next.js core web vitals
- TypeScript support
- Prettier integration

### `postcss.config.mjs`

PostCSS configuration for Tailwind CSS v4.

### `tsconfig.json`

TypeScript configuration with:

- Strict mode enabled
- Path aliases (`@/*`)
- React and Next.js types

### `next.config.ts`

Next.js configuration with optimizations.

## 🎨 Component Structure

### UI Components (`src/components/ui/`)

Reusable, styled components built with Tailwind and CVA (Class Variance Authority):

- **Button** - Flexible button component with variants
- **Card** - Container component with header, footer, content sections

All components follow the shadcn/ui pattern for consistency and maintainability.

### Layout Components (`src/components/layout/`)

- **Sidebar** - Responsive navigation with mobile menu
- **Header** - Top navigation bar with theme toggle

## 🌙 Dark Mode

The application includes built-in dark mode support:

1. Click the sun/moon icon in the header to toggle
2. Preference is managed via `data-theme` attribute on `html` element
3. Falls back to system preference if no user preference is set
4. All colors automatically adapt through CSS variables

## 📦 Dependencies

### Core Dependencies

- **next** - React framework
- **react** - UI library
- **react-dom** - React DOM rendering
- **@tanstack/react-query** - Server state management
- **sonner** - Toast notifications
- **lucide-react** - Icon library
- **clsx** - Class name utilities
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Tailwind CSS class merging

### Dev Dependencies

- **typescript** - Type checking
- **@tailwindcss/postcss** - Tailwind processing
- **eslint** - Code linting
- **prettier** - Code formatting
- **@types/react** - React type definitions
- **@types/node** - Node type definitions

## 🚀 Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Environment variables are auto-detected
4. Deploy with zero configuration

```bash
npm run build
# Vercel runs this automatically
```

### Self-Hosted

```bash
# Build
npm run build

# Start production server
npm start
# Server runs on http://localhost:3000
```

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)

## 🤝 Best Practices

### Component Development

1. Use TypeScript for type safety
2. Follow the shadcn/ui component pattern
3. Use Tailwind classes for styling
4. Leverage CSS variables for theming
5. Keep components small and focused

### Code Quality

1. Run linting before commits: `npm run lint:fix`
2. Format code regularly: `npm run format`
3. Write descriptive commit messages
4. Test responsive design on mobile

### Performance

1. Use Next.js Image component for images
2. Implement code splitting with dynamic imports
3. Optimize bundle size with tree-shaking
4. Use TanStack Query for efficient data fetching

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Port 3000 Already in Use

```bash
# Use a different port
npm run dev -- -p 3001
```

### Type Errors

```bash
# Regenerate types
npm run build
```

## 📄 License

This project is open source and available under the MIT license.

## 🎉 Quick Start Commands

```bash
# Clone and install
git clone <repo>
cd axon-stack
npm install

# Development
npm run dev

# Code quality
npm run lint:fix
npm run format

# Build for production
npm run build
npm start
```

## 📞 Support

For issues, questions, or contributions, please visit the project repository.

---

**Built with ❤️ using modern web technologies**
