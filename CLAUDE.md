# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Tweeter is a Twitter clone (140-character era) built with React Router v7 framework mode. The architecture emphasizes programmatic routing, functional programming patterns, type safety, and comprehensive security.

## Key Commands

### Development
```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm start                # Run production build
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint checks
```

### Testing
```bash
npm test                 # Run all tests (Vitest)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # Playwright E2E tests
npm run test:coverage    # Coverage report
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI dashboard
```

### Database
```bash
npm run db:generate      # Generate migrations from schema changes
npm run db:migrate       # Apply migrations to database
npm run db:push          # Push schema directly to database (dev only)
npm run db:studio        # Open Drizzle Studio (DB GUI)
npm run db:seed          # Seed database with test data
```

## Architecture

### Programmatic Routing (CRITICAL)

**This project uses programmatic routing, NOT file-based routing.** All routes are defined centrally in `/app/routes.ts`:

```typescript
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("register", "routes/register.tsx"),
  route("login", "routes/login.tsx"),

  // Protected routes wrapped in layout
  layout("routes/_layout.tsx", [
    route("timeline", "routes/timeline.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),

  // Dynamic routes
  route(":username", "routes/$username.tsx"),

  // API routes
  route("api/*", "routes/api/$.tsx"), // Catch-all API router
] satisfies RouteConfig;
```

To add a new route:
1. Create component file in `/app/routes/`
2. Add route definition to `/app/routes.ts`
3. Export loader/action functions from component file

### Route Structure Pattern

Each route file can export:
- `loader()` - Server-side data fetching (GET requests)
- `action()` - Form submissions and mutations (POST/PUT/DELETE)
- `default export` - React component

```typescript
// Example route: app/routes/timeline.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const tweets = await getTweetsForUser(user.id);
  return json({ tweets, user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const content = formData.get("content");
  await createTweet({ userId: user.id, content });
  return redirect("/timeline");
}

export default function Timeline() {
  const { tweets } = useLoaderData<typeof loader>();
  return <TweetsList tweets={tweets} />;
}
```

### Database Layer

- **ORM**: Drizzle ORM (type-safe queries)
- **Connection**: `/app/lib/db/connection.ts` (pooled, with retry logic)
- **Schemas**: `/app/lib/db/schema/` (users, tweets, likes, follows)
- **ID Strategy**: UUID v7 (time-sortable)
- **Case Conversion**: Automatic snake_case ↔ camelCase

Database queries always go through models in `/app/models/` - never query directly in routes.

### Authentication & Sessions

- **Strategy**: Cookie-based sessions via React Router's `createCookieSessionStorage`
- **Location**: `/app/lib/auth/session.ts`
- **Password Hashing**: Argon2id (64MB memory, 3 iterations)
- **Protected Routes**: Use `requireAuth(request)` in loaders/actions
- **Optional Auth**: Use `getUserId(request)` - returns null if not authenticated

```typescript
// Protected route pattern
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request); // Throws redirect if not authenticated
  // Safe to use user data here
}
```

### API Architecture

Framework-agnostic API layer in `/app/api/` designed for portability:

1. **Handlers** (`/app/api/handlers/`) - Pure functions that process requests
2. **Router** (`/app/api/router.ts`) - Central registry of all API routes
3. **Adapter** (`/app/routes/api/$.tsx`) - React Router catch-all that adapts framework-agnostic handlers to React Router format

Example API handler:
```typescript
// /app/api/handlers/tweets.handler.ts
export async function handleGetTweets(req: ApiRequest): Promise<ApiResponse> {
  const tweets = await findAllTweets();
  return { status: 200, body: { tweets } };
}
```

Registered in `/app/api/router.ts`:
```typescript
{ method: 'GET', path: '/api/tweets', handler: tweetHandlers.handleGetTweets }
```

### Business Logic (Models)

All business logic lives in `/app/models/` organized by domain:

- `/app/models/tweet/` - Tweet CRUD operations
- `/app/models/user/` - User management
- `/app/models/auth/` - Registration, login, password handling
- `/app/models/like/` - Like/unlike functionality
- `/app/models/follow/` - Follow/unfollow relationships

Models encapsulate database queries and business rules. Routes/handlers should only call model functions.

### Validation

Zod schemas define validation at multiple layers:

1. **Client-side** - Form validation for UX
2. **Server-side** - Validation in loaders/actions for security
3. **Model layer** - Business rule validation

Example:
```typescript
// /app/models/tweet/tweet.schema.ts
const tweetSchema = z.object({
  content: z.string().min(1).max(140),
});

export type TweetData = z.infer<typeof tweetSchema>;
```

### Security Features

Located in `/app/lib/security/`:

- **CSRF Protection** - Token validation on mutations
- **Session Security** - IP/User-Agent binding, timeout handling
- **Rate Limiting** - Per-endpoint limits (`/app/lib/middleware/rate-limit.ts`)
- **Input Sanitization** - XSS prevention via Zod validation
- **Error Handling** - Generic client messages, detailed server logs

### Testing Structure

- **Unit tests** - `/tests/unit/` - Test individual functions
- **Integration tests** - `/tests/integration/` - Test workflows across layers
- **E2E tests** - `/tests/e2e/` - Playwright browser tests
- **Security tests** - `/tests/security/` - CSRF, validation, auth
- **Test factories** - `/tests/factories/` - Generate test data

Mocks are configured in `/tests/setup.ts`. All environment-dependent modules (DB, sessions) are mocked in tests.

## Development Patterns

### Functional Programming

This codebase uses functional programming patterns:

- Pure functions in models and utilities
- Immutable data structures
- No OOP classes in business logic
- Composition over inheritance

### Adding a New Feature

1. **Database schema** - Add table/columns to `/app/lib/db/schema/`
2. **Run migration** - `npm run db:generate && npm run db:migrate`
3. **Model layer** - Create functions in `/app/models/feature/`
4. **Validation** - Define Zod schemas
5. **API handler** - Add to `/app/api/handlers/`
6. **Register route** - Update `/app/api/router.ts`
7. **React component** - Create in `/app/components/feature/`
8. **Add route** - Update `/app/routes.ts` and create route file
9. **Tests** - Write unit/integration tests
10. **Verify** - `npm run typecheck && npm test && npm run build`

### Code Organization Principles

- **Routes** handle HTTP (request/response)
- **Models** handle business logic and database
- **Components** handle UI rendering
- **API handlers** bridge routes and models
- **Utilities** provide cross-cutting concerns

## Environment Setup

Required environment variables (see `.env`):

```bash
# Database
DATABASE_URL=postgresql://...          # Neon PostgreSQL connection string

# Authentication
SESSION_SECRET=...                     # Session signing key (32+ chars)
JWT_SECRET=...                         # JWT signing key (32+ chars)

# External Services
CLOUDINARY_CLOUD_NAME=...              # Image hosting
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

MAILGUN_API_KEY=...                    # Email service
MAILGUN_DOMAIN=...
MAILGUN_FROM_EMAIL=...
MAILGUN_FROM_NAME=...
```

## Tech Stack Summary

- **Frontend**: React 18 + React Router v7 + TypeScript + Tailwind CSS
- **Backend**: React Router v7 framework mode (Node.js)
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Validation**: Zod (client + server)
- **Auth**: Argon2 password hashing + cookie sessions
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Build**: Vite + TypeScript strict mode

## Important Notes

- Always use `requireAuth(request)` in protected loaders/actions
- Never query the database directly from routes - use models
- All mutations must be validated server-side with Zod
- Route files are in `/app/routes/` but routing config is in `/app/routes.ts`
- Database uses snake_case, JavaScript uses camelCase (automatic conversion)
- IDs are UUID v7 (time-sortable, use `uuidv7()` from `uuidv7` package)
- Tweet content limit is 140 characters (enforced by schema)
- Sessions expire after 30 days of inactivity
