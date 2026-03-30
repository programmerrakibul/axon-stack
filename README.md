# AxonStack

A modern, fully responsive dashboard application built with Next.js 15 App
Router, TypeScript, Tailwind CSS, shadcn/ui, and more.

## Features

- ✨ **Responsive Design**: Desktop sidebar + mobile Sheet drawer navigation
- 🎨 **Dark Mode Support**: Light/dark theme using shadcn CSS variables +
  next-themes
- 📱 **Mobile-First**: Optimized for all screen sizes (mobile, tablet, desktop)
- 🎯 **Modern UI Components**: shadcn/ui components with Radix UI primitives
- ⚡ **Type-Safe**: Full TypeScript support
- 🔔 **Toast Notifications**: Sonner toast notifications
- 🔄 **Data Fetching**: TanStack Query for server state management
- 🎭 **Theme Toggle**: Easy theme switching in the topbar

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + tailwindcss-animate
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: TanStack Query
- **Notifications**: Sonner
- **Theming**: next-themes with CSS variables
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── categories/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── restock/
│   │   │   ├── activity/
│   │   │   └── users/
│   │   └── layout.tsx                # Dashboard layout (sidebar + topbar)
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles & CSS variables
│   └── page.tsx                      # Home (redirects to /dashboard)
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── container.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty-state.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── page-header.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   └── table.tsx
│   ├── sidebar.tsx                   # Navigation sidebar
│   ├── topbar.tsx                    # Header with nav toggle
│   ├── theme-provider.tsx            # Next-themes provider
│   └── theme-toggle.tsx              # Theme switcher
└── lib/
    └── utils.ts                      # Utility functions (cn)
```

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**:

   ```bash
   cd d:\Projects\axon-stack
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**: Navigate to
   [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Components Guide

### Shared UI Primitives

#### Container

Responsive max-width container with padding.

```tsx
import { Container } from "@/components/ui/container";

<Container>
  <p>Your content here</p>
</Container>;
```

#### PageHeader

Page title with description and optional action.

```tsx
import { PageHeader } from "@/components/ui/page-header";

<PageHeader
  title="Products"
  description="Manage your products"
  action={<Button>Add Product</Button>}
/>;
```

#### EmptyState

Empty state display with icon, title, description, and action.

```tsx
import { EmptyState } from "@/components/ui/empty-state";

<EmptyState
  icon={<Icon />}
  title="No items found"
  description="Get started by creating your first item"
  action={<Button>Create Item</Button>}
/>;
```

#### Skeleton

Loading skeleton component with variants.

```tsx
import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/ui/skeleton"

<Skeleton className="h-12 w-full" />
<SkeletonCard />
<SkeletonTable />
```

#### DataTable

Responsive table component (use `Table`, `TableHeader`, `TableBody`, `TableRow`,
`TableCell`).

#### ThemeToggle

Theme switcher dropdown in the topbar.

## Pages

- `/dashboard` - Dashboard home with statistics
- `/dashboard/categories` - Manage product categories
- `/dashboard/products` - Manage products
- `/dashboard/orders` - View orders
- `/dashboard/restock` - Manage restocking
- `/dashboard/activity` - System activity logs
- `/dashboard/users` - Manage users

## Theme System

The application uses CSS variables for theming:

- **Light Mode** (default or system preference): Light backgrounds, dark text
- **Dark Mode**: Dark backgrounds, light text
- **System**: Respects OS theme preference

### CSS Variables

Located in `src/app/globals.css`:

- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--accent` / `--accent-foreground`
- `--muted` / `--muted-foreground`
- `--destructive` / `--destructive-foreground`
- `--border`, `--input`, `--ring`

## Responsive Design

The application is fully responsive:

- **Mobile**: < 640px - Sheet drawer navigation
- **Tablet**: 640px - 1024px - Compact sidebar (hidden)
- **Desktop**: > 1024px - Visible sidebar

Breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Adding New Components

To add a new shadcn/ui component:

1. Use the shadcn/ui CLI (if installed globally):

   ```bash
   npx shadcn-ui@latest add <component-name>
   ```

2. Or manually create the component in `src/components/ui/`

## Customization

### Colors

Edit CSS variables in `src/app/globals.css`:

- Light theme variables in `:root`
- Dark theme variables in `.dark`

### Fonts

Edit font imports in `src/app/layout.tsx`

### Navigation Items

Edit the `navItems` array in `src/components/sidebar.tsx`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Next.js Image Optimization
- CSS-in-JS with Tailwind (zero runtime)
- Server Components by default
- Code splitting with App Router
- Optimized bundle size

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader support

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and shadcn/ui
