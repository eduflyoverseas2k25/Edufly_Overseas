# Edufly Overseas

## Overview

Edufly Overseas is an educational travel and tour company that collaborates with schools, colleges, and universities to deliver well-planned, outcome-based educational tours worldwide. The platform provides information about 11 global study destinations (Singapore, India, UK, USA, France, Australia, Germany, Canada, Netherlands, Switzerland, China) with comprehensive place information including culture, history, and "special for you" highlights. Company tagline: "Travel is a university in itself."

**Contact Information:**
- Address: NO 122 G ENAIKARAN STREET, KANCHIPURAM 631502
- Email: eduflyoverseasindia@gmail.com
- Phone: 9094550551 / 9842223864

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with custom brand colors (Orange #ef6e2d, Yellow #fdc22c, Blue #178ab6)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and scroll effects
- **State Management**: TanStack React Query for server state and caching
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Session Management**: Express session with MemoryStore (development) / connect-pg-simple (production)
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: Shared schema in `/shared/schema.ts` using Zod for validation
- **Database**: PostgreSQL (requires `DATABASE_URL` environment variable)

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route-level page components
    hooks/        # Custom React hooks for data fetching
    lib/          # Utility functions and query client
server/           # Express backend
  routes.ts       # API route definitions
  storage.ts      # Database access layer
  db.ts           # Database connection and seed data
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route type definitions
  themes.ts       # Theme configuration (Dark/Light)
```

### Key Design Patterns
- **Shared Types**: Schema definitions are shared between frontend and backend via the `/shared` directory
- **Type-Safe API**: API routes defined in `shared/routes.ts` with Zod schemas for request/response validation
- **Storage Abstraction**: `IStorage` interface in `storage.ts` abstracts database operations
- **Path Aliases**: TypeScript path aliases (`@/`, `@shared/`) configured for clean imports

### Theme System (December 2024 - Updated)
- **2 Theme Modes**: Dark and Light (simplified from 8 seasonal presets)
- **Default Theme**: Dark mode with slate-gray gradient hero (#1e293b to #475569)
- **Theme Configuration**: Located in `shared/themes.ts` with typed theme definitions
- **Admin Theme Selection**: Two large toggle buttons in admin dashboard Settings panel
- **API Endpoint**: POST `/api/admin/settings/apply-theme` applies theme instantly
- **Dynamic Hero Section**: Home page hero uses CSS gradients from selected theme

### Destinations (11 Countries - December 2024)
Each destination has comprehensive place listings with:
- Description, culture, history, and "Special for you" highlights
- Singapore (10 places), India (11 places), UK (10 places), USA (10 places)
- France (8 places), Australia (2 places), Germany (2 places), Canada (2 places)
- Netherlands (9 places), Switzerland (9 places), China (10 places)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations and schema push (`npm run db:push`)

### Third-Party Services
- **Unsplash**: Stock images used as placeholders for destinations and gallery (external URLs)
- **Google Fonts**: Montserrat (headings) and Open Sans (body text)

### Key NPM Packages
- **drizzle-orm / drizzle-zod**: Type-safe ORM with Zod integration
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **lucide-react**: Icon library
- **shadcn/ui ecosystem**: Radix UI primitives, class-variance-authority, tailwind-merge

### Deployment
- Configured for Render deployment via `render.yaml`
- Build command: `npm run build` (bundles client with Vite, server with esbuild)
- Start command: `npm run start` (runs bundled server from `dist/index.cjs`)