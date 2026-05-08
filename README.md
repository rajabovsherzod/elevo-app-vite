# 🎓 Elevo - Multilevel Language Learning Platform (Vite)

> **Note:** This is the Vite version of Elevo, migrated from Next.js for better performance and faster development.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
# or
bun install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

### Development

```bash
# Start dev server
npm run dev
# or
pnpm dev
# or
bun dev
```

App will be available at `http://localhost:5173`

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
elevo-app-vite/
├── src/
│   ├── components/          # React components
│   │   ├── application/     # App-level components (modals, tables, etc.)
│   │   ├── base/           # Base UI components (buttons, inputs, etc.)
│   │   ├── elevo/          # Elevo-specific components
│   │   ├── foundations/    # Foundation components (logos, icons)
│   │   ├── marketing/      # Marketing components
│   │   └── shared-assets/  # Shared assets (illustrations, patterns)
│   │
│   ├── pages/              # Page components (routes)
│   │   ├── home-screen.tsx
│   │   ├── not-found.tsx
│   │   └── ...
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── auth/          # Authentication hooks
│   │   ├── reading/       # Reading module hooks
│   │   ├── listening/     # Listening module hooks
│   │   ├── speaking/      # Speaking module hooks
│   │   └── shared/        # Shared hooks
│   │
│   ├── lib/               # Libraries and utilities
│   │   ├── api/          # API client and endpoints
│   │   ├── payment/      # Payment logic
│   │   ├── query/        # React Query setup
│   │   ├── schemas/      # Validation schemas
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   │
│   ├── providers/         # React context providers
│   │   ├── query-provider.tsx
│   │   ├── router-provider.tsx
│   │   ├── splash-provider.tsx
│   │   ├── telegram-auto-auth.tsx
│   │   └── theme-provider.tsx
│   │
│   ├── schemas/           # Zod validation schemas
│   ├── services/          # Business logic services
│   ├── store/            # Zustand state management
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── main.tsx          # App entry point
│
├── public/               # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies

```

## 🎨 Design System

This app uses a custom design system based on Material Design 3 with Elevo branding:

- **Primary Color:** Indigo (`#4f46e5`, `#6366f1`)
- **Theme:** Light/Dark mode support
- **Typography:** Inter font family
- **Components:** Custom Tailwind CSS components

### Theme Classes

```tsx
// Surfaces
bg-surface                  // Base surface
bg-surface-container        // Container surface
bg-surface-container-high   // Elevated surface

// Text
text-on-surface            // Primary text
text-on-surface-variant    // Secondary text
text-primary               // Brand primary color

// Utilities
elevo-card                 // Card with shadow
elevo-glass                // Glass effect
elevo-mesh                 // Mesh gradient background
elevo-border-glow          // Gradient border glow
```

## 🔧 Key Technologies

- **Framework:** React 19 + Vite 8
- **Routing:** React Router 7
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **UI Components:** React Aria Components
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Audio:** Plyr, WaveSurfer.js

## 📱 Telegram Integration

This app is designed to run as a Telegram Mini App:

```tsx
// Telegram WebApp SDK is loaded in index.html
const tg = window.Telegram?.WebApp;

// Auto-expand and fullscreen
tg.ready();
tg.expand();
tg.requestFullscreen();
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 Migration Status

See [ELEVO_MIGRATION_PLAN.md](./ELEVO_MIGRATION_PLAN.md) for detailed migration progress from Next.js to Vite.

**Current Status:** ~30% complete
- ✅ Styles, base components, layout
- ✅ Theme system (light/dark mode)
- ⏳ API client, types, services
- ⏳ Reading, Listening, Speaking, Writing modules
- ⏳ Authentication, user management

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ by the Elevo Team**
# elevo-app-vite
