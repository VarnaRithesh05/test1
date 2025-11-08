# AutoPatcher - AI DevOps Assistant

## Overview

AutoPatcher is an AI-powered DevOps productivity tool designed to streamline Docker and GitHub workflows. The application provides intelligent YAML analysis, real-time webhook monitoring, code explanation, and automated YAML generation capabilities. Built as a full-stack web application, it targets technical audiences requiring clarity, efficiency, and professional credibility in their DevOps operations.

The platform leverages Google's Gemini AI to:
1. **Analyze YAML files** (Docker Compose, GitHub Actions) for errors, misconfigurations, and best practice violations, providing side-by-side comparisons of problematic code and AI-generated corrections with detailed explanations
2. **Generate production-ready YAML files** from natural language descriptions (e.g., "I need a Dockerfile for a Node.js app with Express")

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, optimized for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (alternatives: React Router was avoided for minimal bundle size)

**UI Component System:**
- shadcn/ui components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design system
- Design philosophy: "New York" style variant emphasizing clean, developer-focused interfaces inspired by Linear, GitHub, and Vercel aesthetics
- Custom CSS variables for theming (light/dark mode support via HSL color system)

**State Management:**
- TanStack Query (React Query) for server state management and API data fetching
- Query client configured with conservative caching (staleTime: Infinity, no automatic refetching)
- Local React state for UI-specific interactions

**Pros:** Vite provides excellent developer experience with instant server startup and fast builds. shadcn/ui offers flexibility without runtime overhead. TanStack Query prevents unnecessary network requests and provides built-in loading/error states.

**Cons:** Wouter is less feature-rich than React Router. The extensive shadcn/ui component library increases initial project complexity.

### Backend Architecture

**Server Framework:**
- Express.js on Node.js with TypeScript for type safety across the stack
- ESM (ECMAScript Modules) exclusively for modern JavaScript features
- Custom middleware for request logging with response time tracking and JSON payload capture

**API Design:**
- RESTful endpoints with `/api` prefix convention
- File upload handling via Multer with in-memory storage (buffer-based)
- AI-powered endpoints:
  - `POST /api/analyze-yml`: Analyzes uploaded YAML files for errors and best practices
  - `POST /api/generate-yml`: Generates YAML files from natural language prompts
  - `POST /api/github-webhook`: GitHub webhook endpoint for automated YAML checking on push events
    - Verifies webhook signatures using HMAC-SHA256 with raw request body
    - Extracts YAML files from commit payloads
    - Fetches file content from GitHub API
    - Reuses AI analysis logic for consistency
    - Requires `GITHUB_WEBHOOK_SECRET` environment variable for signature verification
    - Optionally uses `GITHUB_TOKEN` for private repository access

**Development vs. Production:**
- Development: Vite dev server integrated as Express middleware with HMR support
- Production: Static files served from compiled `dist/public` directory
- Build process: Vite for client bundle, esbuild for server bundle

**Pros:** Express provides flexibility and extensive middleware ecosystem. TypeScript compilation catches errors before runtime. Separation of dev/prod server logic allows optimal performance in each environment.

**Cons:** Manual middleware setup required (no opinionated framework structure). Memory-based file storage not suitable for large files or high concurrency.

### Data Storage Solutions

**Database Configuration:**
- PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- Drizzle ORM for type-safe database operations
- Schema-first approach with migrations managed in `./migrations` directory

**Current Schema:**
- `users` table with UUID primary keys, username (unique), and password fields
- Schema defined in shared directory for client/server type consistency

**Storage Implementation:**
- In-memory storage (`MemStorage`) class as development/fallback layer
- Interface-based design (`IStorage`) allows swapping storage backends without changing business logic

**Rationale:** PostgreSQL chosen for production-grade reliability. Neon serverless eliminates connection pooling concerns. Drizzle provides better TypeScript inference than traditional ORMs like Prisma while maintaining SQL-like syntax familiarity.

**Alternatives Considered:** Supabase (more batteries-included but less control), Prisma (heavier runtime, slower type generation).

### Authentication and Authorization

**Current State:**
- User schema exists with username/password fields
- No active authentication middleware implemented
- Session management infrastructure prepared (connect-pg-simple for PostgreSQL session store)

**Planned Architecture:**
- Session-based authentication using Express sessions
- Password hashing (bcrypt or similar) before database storage
- Cookie-based session tokens with HTTP-only flags

**Security Considerations:**
- Credentials stored with `credentials: "include"` in fetch requests
- CSRF protection needed for production deployment

### External Dependencies

**AI Service Integration:**
- **Google Gemini API** (`@google/generative-ai` v0.24.1)
  - Model: `gemini-2.5-flash` for fast inference (updated from deprecated 1.5 models as of 2025)
  - Usage: YAML analysis with structured JSON response parsing
  - API key configuration via environment variables (`GEMINI_API_KEY`)
  - Error handling: Regex-based JSON extraction from potentially verbose AI responses, plus specific error messages for quota and authentication issues
  - Reusable analysis function `analyzeYAMLContent` for consistency across endpoints

**GitHub Integration:**
- **Webhook Support** for automated YAML checking on push events
  - Secure signature verification using HMAC-SHA256
  - Raw body parsing to match GitHub's signing algorithm
  - Extracts YAML files (.yml, .yaml) from commit changes
  - Fetches file content via GitHub Contents API
  - Optional authentication with `GITHUB_TOKEN` for private repositories
  - Returns comprehensive analysis results for each modified YAML file

**Database Service:**
- **Neon Serverless PostgreSQL**
  - Connection string via `DATABASE_URL` environment variable
  - Automatic connection management (no manual pooling required)
  - WebSocket-based protocol for edge compatibility

**UI Component Libraries:**
- **Radix UI** primitives for 20+ accessible component types (dialogs, dropdowns, tooltips, etc.)
- **Lucide React** for icon system (tree-shakeable, consistent design language)
- **Font Awesome** (CDN-loaded) for additional iconography in marketing pages

**Development Tools:**
- **Replit-specific plugins** for vite:
  - `@replit/vite-plugin-runtime-error-modal`: Development error overlay
  - `@replit/vite-plugin-cartographer`: Visual routing inspector
  - `@replit/vite-plugin-dev-banner`: Development environment indicator

**Form & Validation:**
- React Hook Form (`react-hook-form`) with Zod resolvers (`@hookform/resolvers`)
- Drizzle-Zod for automatic schema-to-validation conversion
- Date handling via `date-fns` for formatting and manipulation

**Build & Compilation:**
- esbuild for server-side bundling (ESM output, external packages)
- TypeScript compiler for type checking (non-emitting mode)
- PostCSS with Tailwind CSS and Autoprefixer for CSS processing

**Pros:** Google Gemini provides state-of-the-art language understanding at competitive pricing. Neon's serverless model eliminates cold start issues typical of traditional RDS. Radix UI ensures WCAG accessibility compliance out of the box.

**Cons:** Dependence on external AI service creates potential for rate limiting and cost concerns at scale. Regex-based JSON parsing from AI responses is fragile if response format changes.