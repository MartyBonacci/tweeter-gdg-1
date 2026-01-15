# Technology Stack

**Project:** tweeter
**Last Updated:** 2026-01-08
**Auto-Generated:** Yes (from package.json)

## Overview

This document defines the approved technologies, versions, and patterns for the **tweeter** project. All code must use these technologies unless explicitly exempted.

## Core Technologies

### Frontend Framework
- **React Router v7.1.5** (framework mode)
  - Purpose: Full-stack React framework with SSR support
  - Notes: Uses programmatic routing (NOT file-based). All routes defined in `/app/routes.ts`
  - Pattern: Functional components with hooks only (no class components)

### Language
- **TypeScript 5.7.3**
  - Purpose: Type-safe JavaScript with strict mode enabled
  - Configuration: `strict: true` in tsconfig.json
  - Notes: Never use `any` type without justification

### Build Tool
- **Vite 6.0.11**
  - Purpose: Fast development server and production bundler
  - Plugin: `@react-router/dev` for React Router integration
  - Notes: HMR enabled for rapid development

## UI & Styling

### CSS Framework
- **Tailwind CSS 3.4.17**
  - Purpose: Utility-first CSS framework
  - Plugin: Flowbite 2.5.2 for component library
  - Integration: Flowbite React 0.10.2 for React components
  - Notes: Use Tailwind utilities over custom CSS

### PostCSS
- **PostCSS 8.4.49**
  - Autoprefixer 10.4.20 for browser compatibility

## Backend & Database

### Database
- **PostgreSQL**
  - Driver: `postgres` 3.4.5 (native PostgreSQL client)
  - Host: Neon (cloud PostgreSQL)
  - Notes: Uses connection pooling with automatic snake_case ↔ camelCase conversion

### ORM
- **Drizzle ORM 0.38.4**
  - Purpose: Type-safe SQL query builder
  - Schema: `/app/lib/db/schema/`
  - Migrations: `/app/lib/db/migrations/`
  - Tool: drizzle-kit 0.31.0 for schema management

## Validation & Security

### Validation
- **Zod 3.24.1**
  - Purpose: Runtime type validation and schema definition
  - Usage: Validate all user input (client and server)
  - Pattern: Define schemas in model directories

### Password Hashing
- **@node-rs/argon2 2.0.2**
  - Algorithm: Argon2id (memory-hard, GPU-resistant)
  - Configuration: 64MB memory, 3 iterations
  - Notes: Never use bcrypt or weaker algorithms

### JWT & Sessions
- **jose 5.9.6**
  - Purpose: JWT token creation and validation
  - Notes: Used in conjunction with React Router cookie sessions

## Testing

### Unit & Integration Testing
- **Vitest 3.0.4**
  - Purpose: Fast unit and integration tests
  - Environment: jsdom 25.0.1 for DOM testing
  - UI: @vitest/ui 3.0.4 for test dashboard
  - Coverage: @vitest/coverage-v8 3.0.4

### Component Testing
- **Testing Library React 16.1.0**
  - Purpose: Test React components with user-centric queries
  - Matchers: @testing-library/jest-dom 6.6.3

### End-to-End Testing
- **Playwright 1.50.1**
  - Purpose: Cross-browser E2E testing
  - Browsers: Chromium, Firefox, WebKit
  - Configuration: `playwright.config.ts`

## Code Quality

### Linting
- **ESLint 9.19.0**
  - TypeScript: @typescript-eslint/eslint-plugin 8.20.0
  - Parser: @typescript-eslint/parser 8.20.0
  - Notes: Run `npm run lint` before committing

## Key Libraries

### Utilities
- **date-fns 4.1.0** - Date manipulation (preferred over moment.js)
- **uuidv7 1.0.2** - Time-sortable UUIDs for database IDs

### External Services
- **Cloudinary 2.5.1** - Image hosting and transformation for profile avatars
- **Mailgun.js 10.2.3** - Email service for account verification
- **form-data 4.0.1** - Multipart form data handling

### Runtime Utilities
- **isbot 5.1.21** - Bot detection for SSR
- **tsx 4.19.2** - TypeScript execution for scripts

## Approved Patterns

### Routing Pattern
```typescript
// app/routes.ts - Programmatic route definition
export default [
  route("path", "routes/file.tsx"),
  layout("routes/_layout.tsx", [
    route("protected-route", "routes/protected.tsx"),
  ]),
] satisfies RouteConfig;
```

### Data Loading Pattern
```typescript
// Loader for GET requests
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const data = await modelFunction(user.id);
  return json({ data });
}

// Action for POST/PUT/DELETE requests
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const validated = schema.parse(formData);
  await modelMutation(validated);
  return redirect("/success");
}
```

### Database Query Pattern
```typescript
// Model function (pure, testable)
export async function findUserById(id: string): Promise<User | null> {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}
```

### Validation Pattern
```typescript
// Define Zod schema
const tweetSchema = z.object({
  content: z.string().min(1).max(140),
});

// Validate in handler
const validated = tweetSchema.parse(formData);
```

## Prohibited Technologies & Patterns

### State Management
- ❌ **Redux** - Too complex; use Zustand or React Context
- ❌ **MobX** - Use simpler alternatives

### Deprecated Patterns
- ❌ **Class components** - Use functional components with hooks
- ❌ **PropTypes** - Use TypeScript instead
- ❌ **Moment.js** - Use date-fns (smaller bundle size)
- ❌ **File-based routing** - Use programmatic routes in `/app/routes.ts`
- ❌ **Raw SQL in routes** - Use model functions with Drizzle ORM
- ❌ **Client-side JWT storage** - Use HTTPOnly cookies

### Security Anti-Patterns
- ❌ **bcrypt** - Use Argon2 instead (more secure)
- ❌ **Client-only validation** - Always validate server-side
- ❌ **Storing secrets in code** - Use environment variables
- ❌ **SQL string concatenation** - Use parameterized queries

## Version Pinning Strategy

- **Patch updates**: Auto-update (e.g., `^3.4.5` → `3.4.6`)
- **Minor updates**: Review and test (e.g., `^3.4.0` → `3.5.0`)
- **Major updates**: Requires impact assessment (e.g., `^3.0.0` → `4.0.0`)

## External Services

### Required Environment Variables
```bash
DATABASE_URL              # Neon PostgreSQL connection string
SESSION_SECRET            # Session cookie signing key (32+ chars)
JWT_SECRET               # JWT token signing key (32+ chars)
CLOUDINARY_CLOUD_NAME    # Cloudinary account
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
MAILGUN_API_KEY          # Mailgun email service
MAILGUN_DOMAIN
MAILGUN_FROM_EMAIL
MAILGUN_FROM_NAME
```

## Technology Upgrade Process

1. Check breaking changes in release notes
2. Update `.specswarm/tech-stack.md` with new version
3. Run full test suite (`npm test`)
4. Test E2E flows (`npm run test:e2e`)
5. Update `package.json` and install dependencies
6. Create PR with upgrade notes

## Notes

- This file was auto-detected from package.json and created by `/specswarm:init`
- Update this document when adding new technologies or changing versions
- Run `/specswarm:upgrade` for guided dependency upgrades
- Enforced by `/specswarm:ship` before merge to main

## Related Documents

- `.specswarm/constitution.md` - Coding principles and governance
- `.specswarm/quality-standards.md` - Quality gates and performance budgets
- `CLAUDE.md` - Architectural patterns and development workflow
