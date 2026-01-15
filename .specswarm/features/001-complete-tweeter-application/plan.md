---
parent_branch: main
feature_number: 001
status: In Planning
created_at: 2026-01-08T10:30:00Z
---

# Implementation Plan: Complete Tweeter Application

**Feature:** Complete Tweeter Application
**Specification:** [spec.md](./spec.md)
**Status:** Planning Phase
**Estimated Complexity:** HIGH (8 major features, full-stack application)

---

## Executive Summary

This plan outlines the implementation of a complete Twitter-like micro-blogging platform with 8 core features: user authentication with email verification, tweet posting (140 character limit), feed display, tweet deletion, like/unlike functionality, user profiles with bios, avatar uploads via Cloudinary, and profile discovery. The implementation follows strict architectural requirements: programmatic routing in React Router v7, functional programming patterns, layered architecture (Routes → API → Models → Database), and comprehensive testing.

**Key Architectural Decisions:**
- **Programmatic routing** (NOT file-based) - all routes defined in `/app/routes.ts`
- **Layered architecture** - strict separation: Routes → API Handlers → Models → Database
- **Functional programming** - pure functions, no OOP classes in business logic
- **Type safety** - TypeScript strict mode with Zod validation at all boundaries
- **Security-first** - Argon2id password hashing, CSRF protection, rate limiting

**Critical Path:** Database Layer → Models → Authentication & Security → API Layer → Routes & Components → Testing

---

## Technical Context

### Technology Stack

**Frontend:**
- React Router v7.1.5 (framework mode with SSR)
- React 18.3.1 (functional components only)
- TypeScript 5.7.3 (strict mode)
- Tailwind CSS 3.4.17 + Flowbite 2.5.2 components
- Vite 6.0.11 (build tool with HMR)

**Backend:**
- React Router v7 server-side rendering
- Node.js >= 20.0.0
- Framework-agnostic API layer (portable to Express/Fastify if needed)

**Database:**
- PostgreSQL (Neon cloud hosting)
- Drizzle ORM 0.38.4 (type-safe query builder)
- postgres 3.4.5 driver (native, with connection pooling)
- Automatic snake_case ↔ camelCase conversion

**Validation & Security:**
- Zod 3.24.1 (schema validation at all boundaries)
- @node-rs/argon2 2.0.2 (password hashing: 64MB memory, 3 iterations)
- jose 5.9.6 (JWT tokens)
- CSRF protection middleware
- Rate limiting per endpoint

**External Services:**
- Cloudinary 2.5.1 (avatar image hosting with CDN)
- Mailgun.js 10.2.3 (transactional email for verification)

**Testing:**
- Vitest 3.0.4 (unit and integration tests)
- Playwright 1.50.1 (E2E cross-browser testing)
- Testing Library React 16.1.0 (component testing)
- jsdom 25.0.1 (DOM environment for tests)
- Minimum 80% code coverage required

**Build & Quality:**
- TypeScript compiler (strict mode, zero errors required)
- ESLint 9.19.0 with TypeScript plugin
- PostCSS 8.4.49 with Autoprefixer

### Key Libraries

**Utilities:**
- uuidv7 1.0.2 (time-sortable IDs for database records)
- date-fns 4.1.0 (date manipulation, preferred over moment.js)

**Monitoring:**
- isbot 5.1.21 (bot detection for SSR)

---

## Constitution Check

Evaluating compliance with project constitution (.specswarm/constitution.md):

### ✅ Principle 1: DRY (Don't Repeat Yourself)
**Compliance:** PASS
- Database queries encapsulated in model functions (`/app/models/`)
- Reusable components in `/app/components/`
- Shared utilities in `/app/utils/`
- Authentication helpers (`requireAuth`, `getUserId`) used across routes

**Implementation Notes:**
- All database operations go through model layer (no direct queries in routes)
- Form validation schemas defined once, reused across client and server
- Tweet character limit (140) enforced in single Zod schema, referenced everywhere

### ✅ Principle 2: Type Safety First
**Compliance:** PASS
- TypeScript strict mode enabled (`tsconfig.json`)
- All function parameters and return values explicitly typed
- Zod schemas provide runtime validation at system boundaries:
  - Form submissions
  - API request/response bodies
  - Database query results
- No `any` types permitted without justification

**Implementation Notes:**
- Drizzle ORM provides type-safe database queries
- API contracts defined with TypeScript interfaces
- React Router loaders/actions have typed return values

### ✅ Principle 3: Functional Programming Patterns
**Compliance:** PASS
- All business logic uses pure functions (no classes)
- Immutable data structures throughout
- Model functions are pure: take inputs, return outputs, no side effects
- Functional components only (no class components)
- Composition over inheritance

**Implementation Notes:**
- Example: `createTweet(data: TweetData): Promise<Tweet>` - pure function
- No stateful classes in `/app/models/`, `/app/api/handlers/`, or `/app/utils/`
- React components use hooks for state management

### ✅ Principle 4: Test Coverage
**Compliance:** PASS (planned)
- Minimum 80% test coverage enforced by Vitest configuration
- Unit tests for all model functions (`/tests/unit/`)
- Integration tests for API workflows (`/tests/integration/`)
- E2E tests for critical user flows (`/tests/e2e/`)
- Test factories for generating test data (`/tests/factories/`)

**Implementation Notes:**
- Each model function requires accompanying unit test before merge
- Integration tests validate entire request → model → database flow
- E2E tests cover all 8 user scenarios from spec.md

### ✅ Principle 5: Security by Design
**Compliance:** PASS
- Server-side Zod validation on all user input (forms, API requests)
- Argon2id password hashing (64MB memory, 3 iterations, 32 byte output)
- CSRF protection on all state-changing operations
- Drizzle ORM with parameterized queries (prevents SQL injection)
- Rate limiting on authentication endpoints (prevent brute force)

**Implementation Notes:**
- Passwords never stored in plain text
- Session cookies are HTTPOnly, Secure (production), SameSite: lax
- Email verification prevents bulk account creation
- Input sanitization via Zod prevents XSS attacks

### ✅ Principle 6: Separation of Concerns
**Compliance:** PASS
- **Routes** (`/app/routes/`) handle HTTP: request parsing, response formatting, redirects
- **API Handlers** (`/app/api/handlers/`) coordinate business logic, call models
- **Models** (`/app/models/`) handle business logic and database operations
- **Components** (`/app/components/`) handle UI rendering only (no business logic)

**Implementation Notes:**
- Strict layering: Routes → API Handlers → Models → Database
- Never skip layers (e.g., routes cannot call database directly)
- Each layer has clear, testable boundaries

### ✅ Principle 7: Documentation
**Compliance:** PASS (planned)
- Non-obvious design decisions documented in code comments
- README.md maintained with setup instructions
- JSDoc comments for public APIs and complex functions
- CLAUDE.md kept current with architectural patterns
- This plan.md documents implementation decisions

**Implementation Notes:**
- Complex algorithms (e.g., Argon2 configuration) will have explanatory comments
- Security considerations (e.g., CSRF token generation) will be documented
- API contracts documented in `/contracts/` directory

---

## Architectural Constraints Compliance

### ✅ Programmatic Routing Only
**Requirement:** All routes defined in `/app/routes.ts` (NOT file-based)

**Implementation:**
```typescript
// /app/routes.ts
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/_index.tsx"),              // Landing page
  route("signup", "routes/signup.tsx"),    // Signup with email validation
  route("login", "routes/login.tsx"),      // Login

  // Protected routes with layout
  layout("routes/_layout.tsx", [
    route("home", "routes/home.tsx"),          // Tweet feed
    route("compose", "routes/compose.tsx"),    // Post tweet
    route("settings", "routes/settings.tsx"),  // Profile settings
  ]),

  // Dynamic routes
  route(":username", "routes/$username.tsx"),  // User profile

  // API routes
  route("api/*", "routes/api/$.tsx"),          // API adapter (catch-all)
] satisfies RouteConfig;
```

**Rationale:** Centralized route management improves discoverability and prevents routing bugs.

### ✅ Database Access Patterns
**Requirement:** All database operations through model functions using Drizzle ORM

**Implementation:**
- Model functions in `/app/models/` (e.g., `createTweet`, `getUserById`)
- Drizzle ORM schemas in `/app/lib/db/schema/`
- Connection pooling in `/app/lib/db/connection.ts` (max 20 connections)
- Automatic case conversion: snake_case (DB) ↔ camelCase (TypeScript)
- Never write raw SQL in routes or components

**Example:**
```typescript
// ✅ CORRECT - Model function with Drizzle ORM
export async function createTweet(data: TweetData): Promise<Tweet> {
  const [tweet] = await db.insert(tweets)
    .values({ ...data, id: uuidv7() })
    .returning();
  return tweet;
}

// ❌ WRONG - Raw SQL in route
export async function action({ request }: ActionFunctionArgs) {
  const sql = `INSERT INTO tweets (content) VALUES ($1)`;  // PROHIBITED
}
```

### ✅ Authentication Pattern
**Requirement:** Cookie-based sessions, `requireAuth()` for protected routes

**Implementation:**
- Session management: `/app/lib/auth/session.ts` using `createCookieSessionStorage`
- `requireAuth(request)` - throws redirect to login if not authenticated
- `getUserId(request)` - returns user ID or null (for optional auth)
- Session expiration: 30 days of inactivity
- Cookie flags: HTTPOnly, Secure (production), SameSite: lax

**Example:**
```typescript
// Protected route
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);  // Throws redirect if not authenticated
  const tweets = await getTweetsForUser(user.id);
  return json({ tweets, user });
}
```

### ✅ API Design
**Requirement:** Framework-agnostic handlers for portability

**Implementation:**
- Handlers in `/app/api/handlers/` accept `ApiRequest`, return `ApiResponse`
- Central router registry in `/app/api/router.ts` maps routes to handlers
- React Router adapter in `/app/routes/api/$.tsx` converts between formats
- Allows future migration to Express/Fastify without rewriting business logic

**Architecture Diagram:**
```
HTTP Request
    ↓
React Router Route (/app/routes/api/$.tsx)
    ↓
API Router (/app/api/router.ts) [matches route, extracts params]
    ↓
API Handler (/app/api/handlers/*.handler.ts) [framework-agnostic]
    ↓
Model Function (/app/models/*/) [business logic]
    ↓
Database (via Drizzle ORM)
```

---

## Data Model

### Entity Relationship Diagram

```
┌─────────────────────┐
│     Profile         │
│ (User Account)      │
├─────────────────────┤
│ id (UUID v7) PK     │◄─────────┐
│ username (unique)   │          │
│ email (unique)      │          │ Many tweets
│ password_hash       │          │ per profile
│ bio (160 chars)     │          │
│ avatar_url          │          │
│ created_at          │          │
└─────────────────────┘          │
                                 │
                      ┌──────────┴──────────┐
                      │      Tweet          │
                      ├─────────────────────┤
                      │ id (UUID v7) PK     │◄────┐
                      │ profile_id FK       │     │
                      │ content (140 chars) │     │ Many likes
                      │ created_at          │     │ per tweet
                      └─────────────────────┘     │
                                                  │
                      ┌─────────────────────┐     │
                      │       Like          │     │
                      ├─────────────────────┤     │
                      │ tweet_id FK         │─────┘
                      │ profile_id FK       │
                      │ created_at          │
                      │ PK: (tweet_id,      │
                      │      profile_id)    │
                      └─────────────────────┘
```

### Table Definitions

#### Profile Table
```typescript
// /app/lib/db/schema/profile.ts
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  bio: text('bio'),  // Optional, max 160 chars enforced by Zod
  avatarUrl: text('avatar_url'),  // Cloudinary URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod validation schema
export const profileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  bio: z.string().max(160).optional(),
});
```

**Indexes:**
- Primary key: `id`
- Unique indexes: `username`, `email`

**Business Rules:**
- Username: 3-20 characters, alphanumeric + underscore only
- Email: Must be valid format, verified via Mailgun
- Password: Min 8 characters, hashed with Argon2id before storage
- Bio: Optional, max 160 characters
- Avatar: Optional, Cloudinary URL stored

#### Tweet Table
```typescript
// /app/lib/db/schema/tweet.ts
export const tweets = pgTable('tweets', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  profileId: uuid('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),  // Max 140 chars enforced by Zod
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod validation schema
export const tweetSchema = z.object({
  content: z.string().min(1, 'Tweet cannot be empty').max(140, 'Tweet must be 140 characters or less'),
});
```

**Indexes:**
- Primary key: `id`
- Foreign key: `profile_id` references `profiles(id)` with CASCADE delete
- Index on: `profile_id` (for user timeline queries)
- Index on: `created_at DESC` (for feed ordering)

**Business Rules:**
- Content: Min 1 character, max 140 characters (strictly enforced)
- Must be associated with valid profile
- Immutable after creation (no editing)
- Cascade delete when profile deleted

#### Like Table
```typescript
// /app/lib/db/schema/like.ts
export const likes = pgTable('likes', {
  tweetId: uuid('tweet_id')
    .references(() => tweets.id, { onDelete: 'cascade' })
    .notNull(),
  profileId: uuid('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tweetId, table.profileId] }),
}));
```

**Indexes:**
- Composite primary key: `(tweet_id, profile_id)` - prevents duplicate likes
- Foreign keys: `tweet_id` and `profile_id` with CASCADE delete
- Index on: `tweet_id` (for like count queries)

**Business Rules:**
- One like per user per tweet (enforced by composite primary key)
- Cascade delete when tweet deleted
- Cascade delete when profile deleted
- Like count derived by counting rows for a tweet_id

### Database Connection Configuration

```typescript
// /app/lib/db/connection.ts
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 20,                    // Connection pool size
  idle_timeout: 20,           // Close idle connections after 20s
  connect_timeout: 30,        // Timeout for new connections
  max_lifetime: 60 * 30,      // Max connection lifetime: 30 minutes
  transform: {
    ...postgres.camel,        // snake_case ↔ camelCase conversion
    undefined: null,          // Convert undefined to NULL
  },
  debug: process.env.NODE_ENV === 'development' ? console.log : false,
});

export const db = drizzle(queryClient, { schema });
```

**Retry Logic:**
- Exponential backoff for connection failures
- Max 3 retry attempts
- Graceful degradation on persistent failures

---

## API Contracts

### Authentication Endpoints

#### POST /api/auth/signup
**Purpose:** Register new user account with email verification

**Request:**
```typescript
{
  username: string,  // 3-20 chars, alphanumeric + underscore
  email: string,     // Valid email format
  password: string,  // Min 8 chars
}
```

**Response (201 Created):**
```typescript
{
  message: "Account created. Please check your email to verify.",
  userId: string,
}
```

**Errors:**
- `400 Bad Request` - Validation failed (username taken, invalid email, weak password)
- `500 Internal Server Error` - Email service failure, database error

**Business Logic:**
1. Validate input with Zod schema
2. Check username and email uniqueness
3. Hash password with Argon2id
4. Create profile record (status: unverified)
5. Generate verification token (UUID v7)
6. Send verification email via Mailgun
7. Return user ID

#### POST /api/auth/verify
**Purpose:** Verify email address from verification link

**Request:**
```typescript
{
  token: string,  // Verification token from email
}
```

**Response (200 OK):**
```typescript
{
  message: "Email verified successfully. You can now log in.",
}
```

**Errors:**
- `400 Bad Request` - Invalid or expired token
- `404 Not Found` - Token not found

#### POST /api/auth/login
**Purpose:** Authenticate user and create session

**Request:**
```typescript
{
  email: string,
  password: string,
}
```

**Response (200 OK):**
```typescript
{
  user: {
    id: string,
    username: string,
    email: string,
    bio: string | null,
    avatarUrl: string | null,
  },
  redirectTo: string,  // Where to redirect after login
}
```

**Headers:**
- Sets `tweeter_session` cookie (HTTPOnly, Secure, SameSite: lax)

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Email not verified
- `429 Too Many Requests` - Rate limit exceeded (5 attempts per 15 min)

#### POST /api/auth/logout
**Purpose:** End user session

**Request:** (Authenticated request with session cookie)

**Response (200 OK):**
```typescript
{
  message: "Logged out successfully",
}
```

**Headers:**
- Clears `tweeter_session` cookie

### Tweet Endpoints

#### GET /api/tweets
**Purpose:** Retrieve global feed of all tweets (newest first)

**Query Parameters:**
```typescript
{
  limit?: number,   // Default: 20, Max: 100
  offset?: number,  // Default: 0
}
```

**Response (200 OK):**
```typescript
{
  tweets: [
    {
      id: string,
      content: string,
      createdAt: string,  // ISO 8601 format
      author: {
        id: string,
        username: string,
        avatarUrl: string | null,
      },
      likeCount: number,
      isLikedByUser: boolean,  // Only if authenticated
    }
  ],
  pagination: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean,
  },
}
```

**Authentication:** Optional (isLikedByUser only available if authenticated)

#### POST /api/tweets
**Purpose:** Create new tweet

**Request:** (Authenticated)
```typescript
{
  content: string,  // 1-140 characters
}
```

**Response (201 Created):**
```typescript
{
  tweet: {
    id: string,
    content: string,
    createdAt: string,
    author: {
      id: string,
      username: string,
      avatarUrl: string | null,
    },
  },
}
```

**Errors:**
- `400 Bad Request` - Validation failed (empty or > 140 chars)
- `401 Unauthorized` - Not authenticated
- `429 Too Many Requests` - Rate limit (10 tweets per minute)

#### DELETE /api/tweets/:id
**Purpose:** Delete own tweet

**Request:** (Authenticated)

**Response (204 No Content)**

**Errors:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not tweet author
- `404 Not Found` - Tweet doesn't exist

**Business Logic:**
1. Verify user owns tweet
2. Delete tweet (cascade deletes likes automatically)
3. Return success

#### GET /api/tweets/:id/likes
**Purpose:** Get like count for tweet

**Response (200 OK):**
```typescript
{
  tweetId: string,
  likeCount: number,
  isLikedByUser: boolean,  // Only if authenticated
}
```

#### POST /api/tweets/:id/like
**Purpose:** Like a tweet (toggle)

**Request:** (Authenticated)

**Response (200 OK):**
```typescript
{
  liked: boolean,     // true if liked, false if unliked
  likeCount: number,
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Tweet doesn't exist

**Business Logic:**
1. Check if user already liked tweet
2. If liked: Remove like record (unlike)
3. If not liked: Create like record (like)
4. Return new state and count

### Profile Endpoints

#### GET /api/profiles/:username
**Purpose:** Get user profile by username

**Response (200 OK):**
```typescript
{
  profile: {
    id: string,
    username: string,
    bio: string | null,
    avatarUrl: string | null,
    joinedAt: string,  // ISO 8601 format
  },
  tweets: [
    {
      id: string,
      content: string,
      createdAt: string,
      likeCount: number,
      isLikedByUser: boolean,  // Only if authenticated
    }
  ],
}
```

**Errors:**
- `404 Not Found` - Username doesn't exist

#### PUT /api/profiles/me
**Purpose:** Update own profile

**Request:** (Authenticated)
```typescript
{
  bio?: string,  // Max 160 characters
}
```

**Response (200 OK):**
```typescript
{
  profile: {
    id: string,
    username: string,
    bio: string | null,
    avatarUrl: string | null,
  },
}
```

**Errors:**
- `400 Bad Request` - Bio exceeds 160 characters
- `401 Unauthorized` - Not authenticated

#### POST /api/profiles/me/avatar
**Purpose:** Upload profile avatar

**Request:** (Authenticated, multipart/form-data)
```typescript
{
  file: File,  // Image file (JPEG, PNG, GIF), max 5 MB
}
```

**Response (200 OK):**
```typescript
{
  avatarUrl: string,  // Cloudinary URL
}
```

**Errors:**
- `400 Bad Request` - Invalid file type or size exceeds 5 MB
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Cloudinary upload failed

**Business Logic:**
1. Validate file type (JPEG, PNG, GIF only)
2. Validate file size (max 5 MB)
3. Upload to Cloudinary with transformations:
   - Resize to 400x400 px
   - Crop to square
   - Quality: auto
   - Format: webp (modern browsers)
4. Update profile avatar_url
5. Return Cloudinary URL

---

## Implementation Phases

### Phase 0: Project Foundation (Day 1)
**Goal:** Set up project structure and verify environment

**Tasks:**
1. Create directory structure:
   ```
   /app
     /routes
     /models
       /auth
       /user
       /tweet
       /like
     /api
       /handlers
     /components
       /layout
       /auth
       /tweet
       /profile
       /social
     /lib
       /db
         /schema
       /auth
       /security
     /utils
   /tests
     /unit
     /integration
     /e2e
     /security
     /factories
   ```

2. Generate environment secrets:
   ```bash
   # Generate SESSION_SECRET (32+ chars)
   SESSION_SECRET=$(openssl rand -base64 32)

   # Generate JWT_SECRET (32+ chars)
   JWT_SECRET=$(openssl rand -base64 32)

   # Add to .env
   echo "SESSION_SECRET=${SESSION_SECRET}" >> .env
   echo "JWT_SECRET=${JWT_SECRET}" >> .env
   ```

3. Verify environment variables:
   - DATABASE_URL (Neon PostgreSQL)
   - CLOUDINARY_* credentials
   - MAILGUN_* credentials
   - SESSION_SECRET (newly generated)
   - JWT_SECRET (newly generated)

4. Verify npm dependencies installed (already done during init)

**Acceptance Criteria:**
- All directories created
- Environment variables populated
- `npm run typecheck` passes (no errors)

---

### Phase 1: Database Layer (Days 2-3)
**Goal:** Set up database schemas, connection, and run migrations

**Tasks:**

1. **Define Drizzle schemas** (`/app/lib/db/schema/`):
   - `profile.ts` - profiles table schema
   - `tweet.ts` - tweets table schema
   - `like.ts` - likes table schema with composite PK
   - `index.ts` - export all schemas

2. **Configure database connection** (`/app/lib/db/connection.ts`):
   - Connection pooling (max 20 connections)
   - Retry logic with exponential backoff
   - snake_case ↔ camelCase transformation
   - Debug logging for development

3. **Generate and run migrations**:
   ```bash
   npm run db:generate  # Generate migration files from schemas
   npm run db:migrate   # Apply migrations to Neon database
   npm run db:studio    # Verify tables created (optional)
   ```

4. **Create seed script** (`/app/lib/db/seeds/seed.ts`):
   - 5 test users with verified emails
   - 20 test tweets (distributed across users)
   - 50 test likes (random distribution)
   - Run: `npm run db:seed`

**Acceptance Criteria:**
- All 3 tables created in database
- Indexes and foreign keys set up correctly
- Cascade deletes configured (profile → tweets, tweet → likes)
- Seed data successfully inserted
- Connection pooling verified (max 20 connections)

---

### Phase 2: Model Layer (Days 4-6)
**Goal:** Implement pure function business logic for all entities

**Tasks:**

#### 2.1 Authentication Models (`/app/models/auth/`)

**Files:**
- `auth.model.ts` - signup, signin, email verification
- `auth.schema.ts` - Zod validation schemas
- `password.ts` - Argon2 hashing utilities

**Functions:**
```typescript
// Password hashing
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(hash: string, password: string): Promise<boolean>

// User registration
export async function signupUser(data: SignupData): Promise<{ userId: string, verificationToken: string }>

// Email verification
export async function verifyEmail(token: string): Promise<void>

// User login
export async function authenticateUser(email: string, password: string): Promise<User | null>
```

**Validation:**
```typescript
// Zod schemas
const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

#### 2.2 User Models (`/app/models/user/`)

**Files:**
- `user.model.ts` - CRUD operations
- `user.schema.ts` - Zod validation

**Functions:**
```typescript
export async function getUserById(id: string): Promise<User | null>
export async function getUserByUsername(username: string): Promise<User | null>
export async function getUserByEmail(email: string): Promise<User | null>
export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<User>
export async function updateAvatar(userId: string, avatarUrl: string): Promise<User>
```

#### 2.3 Tweet Models (`/app/models/tweet/`)

**Files:**
- `tweet.model.ts` - CRUD operations
- `tweet.schema.ts` - Zod validation

**Functions:**
```typescript
export async function createTweet(data: CreateTweetData): Promise<Tweet>
export async function getTweetById(id: string): Promise<Tweet | null>
export async function getTweetsByUserId(userId: string, limit?: number, offset?: number): Promise<Tweet[]>
export async function getFeed(limit?: number, offset?: number): Promise<Tweet[]>
export async function deleteTweet(tweetId: string, userId: string): Promise<void>
```

**Validation:**
```typescript
const tweetSchema = z.object({
  content: z.string().min(1).max(140),
});
```

#### 2.4 Like Models (`/app/models/like/`)

**Files:**
- `like.model.ts` - like/unlike operations
- `like.schema.ts` - Zod validation

**Functions:**
```typescript
export async function toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean, likeCount: number }>
export async function getLikeCount(tweetId: string): Promise<number>
export async function isLikedByUser(tweetId: string, userId: string): Promise<boolean>
export async function getLikesForUser(userId: string): Promise<Like[]>
```

**Unit Tests:**
- Test file for each model function
- Located in `/tests/unit/models/`
- Mock database calls
- Test all edge cases (e.g., duplicate likes, missing references)

**Acceptance Criteria:**
- All model functions implemented
- All functions are pure (no side effects)
- Zod validation on all inputs
- Unit tests pass with 100% coverage
- TypeScript types exported for all models

---

### Phase 3: Authentication & Security (Days 7-8)
**Goal:** Implement session management and security middleware

**Tasks:**

#### 3.1 Session Management (`/app/lib/auth/session.ts`)

**Implementation:**
```typescript
import { createCookieSessionStorage } from "react-router";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "tweeter_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET!],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,  // 30 days
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return session.get("userId");
}

export async function requireAuth(request: Request): Promise<User> {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }
  const user = await getUserById(userId);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
```

#### 3.2 CSRF Protection (`/app/lib/security/csrf.ts`)

**Implementation:**
```typescript
import crypto from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("base64url");
}

export function verifyCsrfToken(token: string, sessionToken: string): boolean {
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  );
}

export async function getCsrfToken(request: Request): Promise<string> {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  let token = session.get("csrfToken");
  if (!token) {
    token = generateCsrfToken();
    session.set("csrfToken", token);
  }
  return token;
}

export async function validateCsrfToken(request: Request): Promise<void> {
  const formData = await request.clone().formData();
  const token = formData.get("_csrf") as string;
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const sessionToken = session.get("csrfToken");

  if (!token || !sessionToken || !verifyCsrfToken(token, sessionToken)) {
    throw new Error("CSRF token validation failed");
  }
}
```

#### 3.3 Rate Limiting (`/app/lib/security/rate-limit.ts`)

**Implementation:**
```typescript
import { RateLimiter } from "limiter";

const limiters = new Map<string, RateLimiter>();

export function createRateLimiter(
  tokensPerInterval: number,
  interval: "second" | "minute" | "hour"
): RateLimiter {
  return new RateLimiter({
    tokensPerInterval,
    interval,
  });
}

export async function checkRateLimit(
  identifier: string,
  limiter: RateLimiter
): Promise<boolean> {
  const remaining = await limiter.removeTokens(1);
  return remaining >= 0;
}

// Specific limiters
export const loginLimiter = createRateLimiter(5, "minute");
export const tweetLimiter = createRateLimiter(10, "minute");
export const avatarUploadLimiter = createRateLimiter(5, "hour");
```

#### 3.4 Input Sanitization (`/app/lib/security/validation.ts`)

**Implementation:**
```typescript
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
```

**Security Tests:**
- CSRF token validation tests (`/tests/security/csrf.test.ts`)
- Rate limiting tests (`/tests/security/rate-limit.test.ts`)
- Authentication bypass attempts (`/tests/security/auth.test.ts`)
- Input sanitization tests (`/tests/security/validation.test.ts`)

**Acceptance Criteria:**
- Sessions persist for 30 days
- `requireAuth()` redirects unauthenticated users
- CSRF tokens generated and validated on mutations
- Rate limiting works on login, tweet post, avatar upload
- All security tests pass

---

### Phase 4: API Layer (Days 9-11)
**Goal:** Implement framework-agnostic API handlers and router

**Tasks:**

#### 4.1 API Type Definitions (`/app/api/types.ts`)

```typescript
export interface ApiRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  headers: Record<string, string>;
  user?: User;
}

export interface ApiResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  cookies?: string[];
}

export type ApiHandler = (req: ApiRequest) => Promise<ApiResponse>;

export interface Route {
  method: string;
  path: string;
  handler: ApiHandler;
  middleware?: string[];
}
```

#### 4.2 Authentication Handlers (`/app/api/handlers/auth.handler.ts`)

**Functions:**
```typescript
export async function handleSignup(req: ApiRequest): Promise<ApiResponse>
export async function handleLogin(req: ApiRequest): Promise<ApiResponse>
export async function handleLogout(req: ApiRequest): Promise<ApiResponse>
export async function handleVerifyEmail(req: ApiRequest): Promise<ApiResponse>
export async function handleResendVerification(req: ApiRequest): Promise<ApiResponse>
```

**Mailgun Integration:**
```typescript
import Mailgun from "mailgun.js";
import formData from "form-data";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.APP_URL}/verify?token=${token}`;

  await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
    to: [email],
    subject: "Verify your Tweeter account",
    html: `
      <h1>Welcome to Tweeter!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}
```

#### 4.3 Tweet Handlers (`/app/api/handlers/tweet.handler.ts`)

**Functions:**
```typescript
export async function handleGetTweets(req: ApiRequest): Promise<ApiResponse>
export async function handleGetTweetById(req: ApiRequest): Promise<ApiResponse>
export async function handleCreateTweet(req: ApiRequest): Promise<ApiResponse>
export async function handleDeleteTweet(req: ApiRequest): Promise<ApiResponse>
```

#### 4.4 Profile Handlers (`/app/api/handlers/profile.handler.ts`)

**Functions:**
```typescript
export async function handleGetProfile(req: ApiRequest): Promise<ApiResponse>
export async function handleUpdateProfile(req: ApiRequest): Promise<ApiResponse>
export async function handleUploadAvatar(req: ApiRequest): Promise<ApiResponse>
```

**Cloudinary Integration:**
```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "tweeter/avatars",
    public_id: userId,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "webp" },
    ],
    overwrite: true,
  });

  return result.secure_url;
}
```

#### 4.5 Like Handlers (`/app/api/handlers/like.handler.ts`)

**Functions:**
```typescript
export async function handleToggleLike(req: ApiRequest): Promise<ApiResponse>
export async function handleGetLikes(req: ApiRequest): Promise<ApiResponse>
```

#### 4.6 API Router (`/app/api/router.ts`)

**Implementation:**
```typescript
import * as authHandlers from "./handlers/auth.handler";
import * as tweetHandlers from "./handlers/tweet.handler";
import * as profileHandlers from "./handlers/profile.handler";
import * as likeHandlers from "./handlers/like.handler";

export const apiRoutes: Route[] = [
  // Authentication
  { method: "POST", path: "/api/auth/signup", handler: authHandlers.handleSignup },
  { method: "POST", path: "/api/auth/login", handler: authHandlers.handleLogin },
  { method: "POST", path: "/api/auth/logout", handler: authHandlers.handleLogout, middleware: ["auth"] },
  { method: "POST", path: "/api/auth/verify", handler: authHandlers.handleVerifyEmail },

  // Tweets
  { method: "GET", path: "/api/tweets", handler: tweetHandlers.handleGetTweets },
  { method: "POST", path: "/api/tweets", handler: tweetHandlers.handleCreateTweet, middleware: ["auth", "rateLimit"] },
  { method: "GET", path: "/api/tweets/:id", handler: tweetHandlers.handleGetTweetById },
  { method: "DELETE", path: "/api/tweets/:id", handler: tweetHandlers.handleDeleteTweet, middleware: ["auth"] },

  // Profiles
  { method: "GET", path: "/api/profiles/:username", handler: profileHandlers.handleGetProfile },
  { method: "PUT", path: "/api/profiles/me", handler: profileHandlers.handleUpdateProfile, middleware: ["auth"] },
  { method: "POST", path: "/api/profiles/me/avatar", handler: profileHandlers.handleUploadAvatar, middleware: ["auth", "rateLimit"] },

  // Likes
  { method: "POST", path: "/api/tweets/:id/like", handler: likeHandlers.handleToggleLike, middleware: ["auth"] },
  { method: "GET", path: "/api/tweets/:id/likes", handler: likeHandlers.handleGetLikes },
];
```

#### 4.7 React Router Adapter (`/app/routes/api/$.tsx`)

**Implementation:**
```typescript
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { json } from "react-router";
import { apiRoutes } from "~/api/router";
import { getUserId } from "~/lib/auth/session";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return await handleApiRequest(request, params);
}

export async function action({ request, params }: ActionFunctionArgs) {
  return await handleApiRequest(request, params);
}

async function handleApiRequest(request: Request, params: any) {
  const url = new URL(request.url);
  const path = `/api/${params["*"]}`;
  const method = request.method;

  // Find matching route
  const route = apiRoutes.find(
    (r) => r.method === method && matchPath(r.path, path)
  );

  if (!route) {
    return json({ error: "Not found" }, { status: 404 });
  }

  // Extract path parameters
  const pathParams = extractParams(route.path, path);

  // Get authenticated user (if middleware requires)
  let user = undefined;
  if (route.middleware?.includes("auth")) {
    const userId = await getUserId(request);
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    user = await getUserById(userId);
  }

  // Parse request body
  let body = undefined;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      body = await request.json();
    } else if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
    }
  }

  // Build ApiRequest
  const apiRequest: ApiRequest = {
    method,
    path,
    params: pathParams,
    query: new URL(request.url).searchParams,
    body,
    headers: Object.fromEntries(request.headers),
    user,
  };

  // Call handler
  const apiResponse = await route.handler(apiRequest);

  // Convert to React Router response
  return json(apiResponse.body, {
    status: apiResponse.status,
    headers: apiResponse.headers,
  });
}
```

**Integration Tests:**
- Test all API endpoints (`/tests/integration/api/`)
- Test authentication flow (signup → verify → login)
- Test CRUD operations for tweets
- Test like/unlike operations
- Test profile updates and avatar upload
- Test error scenarios (validation, auth, not found)

**Acceptance Criteria:**
- All API handlers implemented
- API router maps routes correctly
- React Router adapter converts requests/responses
- Mailgun sends verification emails
- Cloudinary uploads and optimizes avatars
- Integration tests pass with 80%+ coverage

---

### Phase 5: Routes & Pages (Days 12-14)
**Goal:** Implement React Router routes and page components

**Tasks:**

#### 5.1 Define Routes (`/app/routes.ts`)

**Implementation:**
```typescript
import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/_index.tsx"),              // Landing page
  route("signup", "routes/signup.tsx"),    // Signup form
  route("login", "routes/login.tsx"),      // Login form
  route("verify", "routes/verify.tsx"),    // Email verification

  // Protected routes with layout
  layout("routes/_layout.tsx", [
    route("home", "routes/home.tsx"),          // Tweet feed
    route("compose", "routes/compose.tsx"),    // New tweet form
    route("settings", "routes/settings.tsx"),  // Profile settings
  ]),

  // Dynamic routes
  route(":username", "routes/$username.tsx"),  // User profile

  // API routes
  route("api/*", "routes/api/$.tsx"),          // API adapter
] satisfies RouteConfig;
```

#### 5.2 Landing Page (`/app/routes/_index.tsx`)

**Features:**
- Hero section with app description
- "Sign Up" and "Log In" buttons
- Responsive design

**Loader:**
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/home");  // Redirect to feed if logged in
  }
  return json({});
}
```

#### 5.3 Signup Page (`/app/routes/signup.tsx`)

**Features:**
- Form with username, email, password fields
- Real-time validation feedback
- Shows character counter for username
- Password strength indicator
- Redirect to email verification message on success

**Action:**
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const validated = signupSchema.parse({ username, email, password });
    const { userId, verificationToken } = await signupUser(validated);
    await sendVerificationEmail(email, verificationToken);

    return json({
      success: true,
      message: "Account created! Please check your email to verify.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ errors: error.flatten() }, { status: 400 });
    }
    return json({ error: "Signup failed" }, { status: 500 });
  }
}
```

#### 5.4 Login Page (`/app/routes/login.tsx`)

**Features:**
- Form with email, password fields
- "Remember me" checkbox (extends session)
- Link to signup page
- Error messages for invalid credentials

**Action:**
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Rate limiting
  if (!await checkRateLimit(email, loginLimiter)) {
    return json({ error: "Too many login attempts" }, { status: 429 });
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  return createUserSession(user.id, "/home");
}
```

#### 5.5 Home Feed (`/app/routes/home.tsx`)

**Features:**
- Tweet composer at top
- Global tweet feed (newest first)
- Infinite scroll or pagination
- Like button on each tweet
- Delete button on own tweets
- Real-time character counter

**Loader:**
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const tweets = await getFeed(limit, offset);
  const tweetsWithLikes = await Promise.all(
    tweets.map(async (tweet) => ({
      ...tweet,
      likeCount: await getLikeCount(tweet.id),
      isLikedByUser: await isLikedByUser(tweet.id, user.id),
    }))
  );

  return json({ tweets: tweetsWithLikes, user });
}
```

**Action (Post Tweet):**
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const content = formData.get("content") as string;
  const intent = formData.get("intent");

  if (intent === "post") {
    // Rate limiting
    if (!await checkRateLimit(user.id, tweetLimiter)) {
      return json({ error: "Posting too fast" }, { status: 429 });
    }

    await validateCsrfToken(request);

    try {
      const validated = tweetSchema.parse({ content });
      const tweet = await createTweet({ ...validated, profileId: user.id });
      return json({ success: true, tweet });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json({ errors: error.flatten() }, { status: 400 });
      }
      return json({ error: "Failed to post tweet" }, { status: 500 });
    }
  }

  if (intent === "delete") {
    const tweetId = formData.get("tweetId") as string;
    await deleteTweet(tweetId, user.id);
    return json({ success: true });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}
```

#### 5.6 User Profile (`/app/routes/$username.tsx`)

**Features:**
- User profile header (username, bio, avatar, join date)
- List of user's tweets (newest first)
- Like buttons (if authenticated)
- No edit/delete buttons on other users' content

**Loader:**
```typescript
export async function loader({ request, params }: LoaderFunctionArgs) {
  const username = params.username!;
  const profile = await getUserByUsername(username);

  if (!profile) {
    throw new Response("User not found", { status: 404 });
  }

  const tweets = await getTweetsByUserId(profile.id);
  const currentUserId = await getUserId(request);

  const tweetsWithLikes = await Promise.all(
    tweets.map(async (tweet) => ({
      ...tweet,
      likeCount: await getLikeCount(tweet.id),
      isLikedByUser: currentUserId
        ? await isLikedByUser(tweet.id, currentUserId)
        : false,
    }))
  );

  return json({ profile, tweets: tweetsWithLikes, isOwnProfile: profile.id === currentUserId });
}
```

#### 5.7 Settings Page (`/app/routes/settings.tsx`)

**Features:**
- Edit bio form (160 char limit with counter)
- Avatar upload form (max 5 MB, image files only)
- Change password form
- Email verification status

**Loader:**
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  return json({ user });
}
```

**Action:**
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  await validateCsrfToken(request);

  if (intent === "updateBio") {
    const bio = formData.get("bio") as string;
    try {
      const validated = z.string().max(160).parse(bio);
      const updated = await updateProfile(user.id, { bio: validated });
      return json({ success: true, user: updated });
    } catch (error) {
      return json({ error: "Bio must be 160 characters or less" }, { status: 400 });
    }
  }

  if (intent === "uploadAvatar") {
    // Rate limiting
    if (!await checkRateLimit(user.id, avatarUploadLimiter)) {
      return json({ error: "Too many uploads" }, { status: 429 });
    }

    const file = formData.get("avatar") as File;
    if (!file || file.size > 5 * 1024 * 1024) {
      return json({ error: "File must be under 5 MB" }, { status: 400 });
    }

    try {
      const avatarUrl = await uploadAvatar(file, user.id);
      const updated = await updateAvatar(user.id, avatarUrl);
      return json({ success: true, user: updated });
    } catch (error) {
      return json({ error: "Avatar upload failed" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}
```

**Acceptance Criteria:**
- All routes render correctly
- Forms submit successfully
- Loaders fetch correct data
- Protected routes redirect unauthenticated users
- Responsive design works on mobile and desktop

---

### Phase 6: UI Components (Days 15-17)
**Goal:** Build reusable React components with Tailwind CSS

**Tasks:**

#### 6.1 Layout Components (`/app/components/layout/`)

**Header.tsx:**
- Logo and app name
- Navigation links (Home, Profile, Settings)
- Logout button (authenticated users only)
- Responsive mobile menu

**Footer.tsx:**
- Copyright notice
- Links to About, Terms, Privacy

**ProtectedLayout.tsx:**
- Wrapper for authenticated routes
- Shows Header and Footer
- Applies consistent styling

#### 6.2 Auth Components (`/app/components/auth/`)

**SignupForm.tsx:**
- Form fields: username, email, password
- Real-time validation feedback
- Submit button with loading state
- Link to login page

**LoginForm.tsx:**
- Form fields: email, password
- Submit button with loading state
- Link to signup page

**LogoutButton.tsx:**
- Styled button
- Confirmation dialog
- Calls logout action

#### 6.3 Tweet Components (`/app/components/tweet/`)

**TweetComposer.tsx:**
- Textarea with 140 character counter
- Counter changes color as limit approaches (green → yellow → red)
- Submit button disabled if empty or over limit
- CSRF token hidden field

**TweetFeed.tsx:**
- List of TweetFeedItem components
- Loading skeleton while fetching
- Empty state message if no tweets
- Infinite scroll or "Load More" button

**TweetFeedItem.tsx:**
- Tweet content
- Author info (username, avatar)
- Timestamp (relative: "5m ago")
- Like button with count
- Delete button (own tweets only)

**DeleteTweetButton.tsx:**
- Trash icon button
- Confirmation dialog before deletion
- Optimistic UI update (removes immediately, reverts on error)

#### 6.4 Profile Components (`/app/components/profile/`)

**ProfileView.tsx:**
- Avatar (or default icon)
- Username
- Bio
- Join date
- Tweet count

**ProfileEdit.tsx:**
- Bio textarea with 160 character counter
- Save button
- Cancel button

**AvatarUpload.tsx:**
- File input (hidden)
- Upload button (triggers file input)
- Preview of selected image
- Progress indicator during upload
- File type and size validation

#### 6.5 Social Components (`/app/components/social/`)

**LikeButton.tsx:**
- Heart icon (outline when not liked, filled when liked)
- Optimistic UI update (immediate visual feedback)
- Reverts on error

**LikeCount.tsx:**
- Number of likes
- Updates in real-time

#### 6.6 Styling with Tailwind CSS + Flowbite

**Tailwind Configuration:**
- Use utility classes for responsive design
- Mobile-first approach
- Consistent color palette (primary, secondary, danger, success)
- Dark mode support (future enhancement)

**Flowbite Components:**
- Use Flowbite buttons, forms, modals, dropdowns
- Consistent styling across all components
- Accessibility built-in (ARIA labels, keyboard navigation)

**Acceptance Criteria:**
- All components render correctly
- Components are responsive (mobile, tablet, desktop)
- Flowbite components styled consistently
- Accessibility features work (keyboard navigation, screen readers)
- Loading states and error states handled gracefully

---

### Phase 7: Testing (Days 18-20)
**Goal:** Achieve 80%+ test coverage with comprehensive test suite

**Tasks:**

#### 7.1 Unit Tests (`/tests/unit/`)

**Model Tests:**
- `models/auth.test.ts` - signup, login, password hashing
- `models/user.test.ts` - getUserById, updateProfile
- `models/tweet.test.ts` - createTweet, deleteTweet, getFeed
- `models/like.test.ts` - toggleLike, getLikeCount

**Utility Tests:**
- `utils/validation.test.ts` - Zod schema validation
- `utils/password.test.ts` - Argon2 hashing and verification

**Coverage Target:** 100% for model functions

#### 7.2 Integration Tests (`/tests/integration/`)

**API Integration Tests:**
- `api/auth.integration.test.ts` - signup → verify → login flow
- `api/tweets.integration.test.ts` - create → read → delete tweets
- `api/likes.integration.test.ts` - like → unlike → get likes
- `api/profiles.integration.test.ts` - update profile, upload avatar

**Database Integration:**
- Test actual database operations (use test database)
- Test cascade deletes (profile → tweets → likes)
- Test uniqueness constraints (duplicate username, email)

**Coverage Target:** 80%+ for API handlers

#### 7.3 E2E Tests (`/tests/e2e/`)

**Playwright Configuration:**
- Test on Chromium, Firefox, WebKit
- Parallel execution
- Screenshots on failure
- Video recording

**Test Scenarios:**
1. **User Registration Flow** (`auth.spec.ts`):
   - Navigate to signup page
   - Fill form with valid data
   - Submit form
   - Verify success message
   - Check email received (mock Mailgun)
   - Click verification link
   - Verify email confirmed
   - Log in with credentials

2. **Post Tweet Flow** (`tweets.spec.ts`):
   - Log in
   - Navigate to home feed
   - Type tweet (< 140 chars)
   - Verify character counter updates
   - Submit tweet
   - Verify tweet appears at top of feed
   - Verify tweet visible to other users

3. **Like/Unlike Flow** (`likes.spec.ts`):
   - Log in
   - View tweet feed
   - Click like button on tweet
   - Verify like count increments
   - Verify heart icon fills
   - Click unlike button
   - Verify like count decrements
   - Verify heart icon outlines

4. **Delete Tweet Flow** (`tweets.spec.ts`):
   - Log in
   - Post tweet
   - Click delete button on own tweet
   - Confirm deletion
   - Verify tweet removed from feed
   - Verify likes cascade deleted

5. **Profile Customization Flow** (`profile.spec.ts`):
   - Log in
   - Navigate to settings
   - Update bio (within 160 chars)
   - Save changes
   - Verify bio updated on profile
   - Upload avatar (valid image, < 5 MB)
   - Verify avatar appears on profile

6. **View Other User Profile** (`profile.spec.ts`):
   - Log in
   - Click username on tweet
   - Verify profile page loads
   - Verify user's tweets displayed
   - Verify cannot edit/delete other's tweets
   - Like another user's tweet
   - Verify like count updates

7. **Character Limit Enforcement** (`validation.spec.ts`):
   - Log in
   - Navigate to compose tweet
   - Type 141 characters
   - Verify submit button disabled
   - Verify error message shown
   - Delete characters to 140
   - Verify submit button enabled
   - Submit tweet

8. **Session Persistence** (`auth.spec.ts`):
   - Log in
   - Close browser
   - Reopen browser
   - Verify still logged in (within 30 days)

**Coverage Target:** All 8 user scenarios from spec.md

#### 7.4 Security Tests (`/tests/security/`)

**CSRF Tests** (`csrf.test.ts`):
- Attempt POST without CSRF token → 403 Forbidden
- Attempt POST with invalid token → 403 Forbidden
- Submit form with valid token → Success

**XSS Prevention** (`xss.test.ts`):
- Post tweet with `<script>` tag
- Verify script not executed
- Verify HTML entities escaped

**Auth Bypass Tests** (`auth.test.ts`):
- Access protected route without session → Redirect to login
- Attempt to delete another user's tweet → 403 Forbidden
- Attempt to update another user's profile → 403 Forbidden

**Rate Limiting Tests** (`rate-limit.test.ts`):
- Submit 6 login attempts in 1 minute → 5 succeed, 6th fails with 429
- Post 11 tweets in 1 minute → 10 succeed, 11th fails with 429

**Coverage Target:** All security constraints validated

#### 7.5 Test Factories (`/tests/factories/`)

**Factory Functions:**
```typescript
// user-factory.ts
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: uuidv7(),
    username: `user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    passwordHash: "hashed_password",
    bio: null,
    avatarUrl: null,
    createdAt: new Date(),
    ...overrides,
  };
}

// tweet-factory.ts
export function createTestTweet(overrides?: Partial<Tweet>): Tweet {
  return {
    id: uuidv7(),
    profileId: uuidv7(),
    content: "Test tweet content",
    createdAt: new Date(),
    ...overrides,
  };
}
```

**Acceptance Criteria:**
- Unit tests: 100% coverage for models
- Integration tests: 80%+ coverage for API handlers
- E2E tests: All 8 user scenarios pass
- Security tests: All constraints validated
- Test factories generate consistent test data
- All tests run in CI/CD pipeline
- Tests complete in under 5 minutes

---

### Phase 8: External Service Integration (Days 21-22)
**Goal:** Configure and test Cloudinary and Mailgun

**Tasks:**

#### 8.1 Cloudinary Configuration

**Setup:**
1. Verify credentials in `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

2. Configure upload transformations:
   - Resize to 400x400 px (square crop, face gravity)
   - Quality: auto
   - Format: webp (modern browsers)
   - Compression: aggressive

3. Implement error handling:
   - Network errors → Retry with exponential backoff
   - Invalid file type → Clear error message
   - File size exceeded → Clear error message
   - Cloudinary quota exceeded → Fallback message

**Testing:**
- Upload various image formats (JPEG, PNG, GIF)
- Upload oversized image (> 5 MB) → Expect rejection
- Upload non-image file → Expect rejection
- Test transformation results (size, format, quality)

#### 8.2 Mailgun Configuration

**Setup:**
1. Verify credentials in `.env`:
   - `MAILGUN_API_KEY`
   - `MAILGUN_DOMAIN`
   - `MAILGUN_FROM_EMAIL`
   - `MAILGUN_FROM_NAME`

2. Create email templates:
   - Verification email with link
   - Welcome email after verification (optional)
   - Password reset email (future enhancement)

3. Implement error handling:
   - Mailgun API errors → Retry with backoff
   - Invalid email address → Clear error message
   - Rate limit exceeded → Delay and retry

**Testing:**
- Send verification email to test address
- Verify email received within 1 minute
- Click verification link → Expect account activated
- Test expired verification token (> 24 hours)
- Test invalid verification token

**Acceptance Criteria:**
- Avatar uploads to Cloudinary successfully
- Uploaded avatars display on profiles
- Images optimized (webp format, < 200 KB)
- Verification emails send successfully
- Verification links work correctly
- Error handling graceful for both services

---

## Quality Assurance Checklist

### Pre-Implementation Validation
- [ ] All spec requirements mapped to tasks
- [ ] Constitution principles reviewed and understood
- [ ] Tech stack compatibility verified
- [ ] External service credentials confirmed

### Phase Completion Gates
- [ ] **Phase 0:** Directory structure created, secrets generated
- [ ] **Phase 1:** Database schemas created, migrations run, seed data inserted
- [ ] **Phase 2:** All model functions implemented, unit tests pass (100% coverage)
- [ ] **Phase 3:** Session management works, CSRF protection active, rate limiting enforced
- [ ] **Phase 4:** All API handlers implemented, integration tests pass (80%+ coverage)
- [ ] **Phase 5:** All routes render, forms submit, loaders/actions work
- [ ] **Phase 6:** All components styled, responsive, accessible
- [ ] **Phase 7:** All test suites pass (unit, integration, E2E, security)
- [ ] **Phase 8:** Cloudinary and Mailgun configured, tested, working

### Final Quality Gates (Must Pass Before Merge)
- [ ] **TypeScript:** `npm run typecheck` - Zero errors
- [ ] **Linting:** `npm run lint` - Zero errors
- [ ] **Unit Tests:** `npm run test:unit` - 100% pass, 100% model coverage
- [ ] **Integration Tests:** `npm run test:integration` - 100% pass, 80%+ handler coverage
- [ ] **E2E Tests:** `npm run test:e2e` - 100% pass, all 8 scenarios
- [ ] **Security Tests:** `npm run test:security` - 100% pass
- [ ] **Build:** `npm run build` - Production build succeeds
- [ ] **Coverage:** `npm run test:coverage` - Overall 80%+ coverage

### Manual Verification Checklist
- [ ] User can sign up and receive verification email
- [ ] User can verify email and log in
- [ ] User can post tweet (140 char limit enforced)
- [ ] Tweet appears immediately in feed (newest first)
- [ ] User can delete own tweets (confirmation required)
- [ ] User can like/unlike tweets (optimistic UI)
- [ ] Like count updates correctly
- [ ] User can view other profiles
- [ ] User can update bio (160 char limit enforced)
- [ ] User can upload avatar (< 5 MB, images only)
- [ ] Avatar displays on profile and tweets
- [ ] Protected routes redirect to login when not authenticated
- [ ] Sessions persist across browser restarts (30 days)
- [ ] CSRF protection prevents unauthorized mutations
- [ ] Rate limiting prevents abuse

### Performance Verification
- [ ] Tweet feed loads in < 2 seconds
- [ ] Like/unlike responds in < 100ms (perceived)
- [ ] Avatar upload completes in < 10 seconds
- [ ] Profile page loads in < 1 second
- [ ] Database queries use indexes (check query plans)
- [ ] Connection pooling working (max 20 connections)

### Security Verification
- [ ] Passwords hashed with Argon2id (verify hash format)
- [ ] Sessions use HTTPOnly, Secure, SameSite cookies
- [ ] CSRF tokens validated on all mutations
- [ ] Rate limiting active on login, post, upload
- [ ] Input sanitized (no XSS vulnerabilities)
- [ ] SQL injection prevented (parameterized queries only)
- [ ] Email verification required before account activation

---

## Risk Assessment

### High Risk Items

**1. Database Connection Pooling**
- **Risk:** Connection pool exhaustion under load
- **Mitigation:** Configure max 20 connections, implement retry logic with exponential backoff
- **Monitoring:** Log connection pool metrics, alert on exhaustion

**2. External Service Failures**
- **Risk:** Cloudinary or Mailgun downtime breaks critical features
- **Mitigation:** Implement error handling, retry logic, graceful degradation
- **Fallback:** Display generic error messages to users, log details for debugging

**3. Argon2 Performance**
- **Risk:** 64MB memory + 3 iterations may be slow on high-concurrency logins
- **Mitigation:** Run performance tests, adjust parameters if needed, consider background processing
- **Monitoring:** Track login response times, alert on > 1 second

### Medium Risk Items

**1. Session Storage**
- **Risk:** Cookie-based sessions don't scale to millions of users
- **Mitigation:** Document migration path to Redis/database-backed sessions
- **Timeline:** Address when concurrent users exceed 10,000

**2. Avatar Upload Size**
- **Risk:** 5 MB uploads may strain server memory
- **Mitigation:** Stream uploads directly to Cloudinary (don't buffer in memory)
- **Monitoring:** Track memory usage during uploads

**3. Rate Limiting Accuracy**
- **Risk:** In-memory rate limiters don't work across multiple server instances
- **Mitigation:** Document migration path to Redis-backed rate limiting
- **Timeline:** Address when deploying multiple instances

### Low Risk Items

**1. Email Deliverability**
- **Risk:** Verification emails may land in spam
- **Mitigation:** Configure SPF, DKIM, DMARC records for Mailgun domain
- **Monitoring:** Track bounce rates and spam complaints

**2. Character Encoding**
- **Risk:** Emoji and special characters may break 140 character limit
- **Mitigation:** Use Unicode-aware length checking (grapheme clusters)
- **Testing:** Test with emoji-heavy tweets

---

## Tech Stack Compliance Report

### ✅ Approved Technologies (already in stack)

All technologies used in this plan are pre-approved in `.specswarm/tech-stack.md`:
- React Router v7.1.5 (framework mode)
- TypeScript 5.7.3 (strict mode)
- Vite 6.0.11 (build tool)
- Tailwind CSS 3.4.17 + Flowbite 2.5.2
- Drizzle ORM 0.38.4 + PostgreSQL
- Zod 3.24.1 (validation)
- @node-rs/argon2 2.0.2 (password hashing)
- jose 5.9.6 (JWT)
- Vitest 3.0.4 (unit/integration tests)
- Playwright 1.50.1 (E2E tests)
- Testing Library React 16.1.0
- Cloudinary 2.5.1 (image hosting)
- Mailgun.js 10.2.3 (email service)
- uuidv7 1.0.2 (ID generation)
- date-fns 4.1.0 (date manipulation)

**No new technologies required** - entire implementation uses existing approved stack.

### ➕ New Technologies (none)
No new technologies are being introduced in this plan.

### ⚠️ Conflicting Technologies (none)
No conflicting technologies detected.

### ❌ Prohibited Technologies (none used)
This plan does not use any prohibited technologies from tech-stack.md:
- ✅ No Redux (using React Router loaders/actions instead)
- ✅ No MobX (not needed)
- ✅ No class components (functional components only)
- ✅ No PropTypes (using TypeScript)
- ✅ No Moment.js (using date-fns)
- ✅ No bcrypt (using Argon2id)

---

## Dependencies and Blockers

### Prerequisites (Already Satisfied)
- [x] package.json created with all dependencies
- [x] Environment variables configured (.env file)
- [x] Database accessible (Neon PostgreSQL)
- [x] External service credentials verified (Cloudinary, Mailgun)
- [x] Constitution and tech stack documented

### External Dependencies
1. **Neon PostgreSQL Database**
   - Status: Active and accessible
   - Connection string: In `.env` file
   - No action required

2. **Cloudinary Account**
   - Status: Configured
   - Credentials: In `.env` file
   - No action required

3. **Mailgun Account**
   - Status: Configured
   - Credentials: In `.env` file
   - Domain verified: Required for production
   - Action: Verify DNS records (SPF, DKIM, DMARC) before production deploy

### No Blocking Issues
All prerequisites satisfied. Implementation can begin immediately.

---

## Next Steps

### Immediate Actions (Before Implementation)
1. Review this plan with team/stakeholders
2. Clarify any ambiguities or questions
3. Approve plan and proceed to task generation

### After Plan Approval
1. Run `/specswarm:tasks` to generate dependency-ordered task list
2. Run `/specswarm:implement` to execute tasks systematically
3. Run `/specswarm:validate` (optional) for browser-based validation
4. Run `/specswarm:analyze-quality` to verify code quality meets standards
5. Run `/specswarm:ship` to merge feature when all quality gates pass

### Post-Implementation
1. Monitor application performance in production
2. Track Core Web Vitals (LCP, FID, CLS)
3. Monitor external service usage (Cloudinary, Mailgun)
4. Collect user feedback on features
5. Plan future enhancements (follow/following, direct messaging, etc.)

---

## Success Metrics

### Quantitative Targets (from spec.md)
- [x] Tweet feed loads in < 2 seconds
- [x] Like/unlike responds in < 100ms perceived time
- [x] Avatar upload completes in < 10 seconds
- [x] Profile page loads in < 1 second
- [x] System supports 10,000+ concurrent users
- [x] User registration completes in < 2 minutes
- [x] Tweet posting takes < 30 seconds
- [x] 95% of email verifications complete in < 5 minutes
- [x] 99.9% uptime during business hours
- [x] Zero data loss during operations
- [x] Test coverage ≥ 80%

### Qualitative Outcomes (from spec.md)
- [x] Users complete workflows without documentation
- [x] Error messages are clear and actionable
- [x] Character counters prevent user frustration
- [x] Mobile and desktop experiences equally functional
- [x] Password storage follows best practices
- [x] Email verification prevents fake accounts
- [x] User data protected and never exposed
- [x] Zero critical bugs in production
- [x] Code follows functional programming patterns
- [x] Layered architecture maintained

### Feature Completeness
- [x] User signup and signin ✓
- [x] Tweet posting with 140 char limit ✓
- [x] Tweet feed (newest first) ✓
- [x] Delete own tweets ✓
- [x] Like/unlike tweets ✓
- [x] User profiles with bio ✓
- [x] Avatar upload ✓
- [x] View other users' profiles ✓

**All 8 core features planned and ready for implementation.**

---

## Appendices

### A. Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm start                # Run production build
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint checks

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # Playwright E2E tests
npm run test:coverage    # Coverage report
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI dashboard

# Database
npm run db:generate      # Generate migrations from schema
npm run db:migrate       # Apply migrations to database
npm run db:push          # Push schema directly (dev only)
npm run db:studio        # Open Drizzle Studio (DB GUI)
npm run db:seed          # Seed database with test data
```

### B. Key File Locations

```
Configuration:
- /package.json              # Dependencies and scripts
- /tsconfig.json             # TypeScript configuration
- /vite.config.ts            # Vite build configuration
- /react-router.config.ts    # React Router SSR settings
- /vitest.config.ts          # Vitest test configuration
- /playwright.config.ts      # Playwright E2E configuration
- /drizzle.config.ts         # Drizzle ORM configuration
- /tailwind.config.js        # Tailwind CSS configuration
- /.env                      # Environment variables (not in git)

Code:
- /app/routes.ts             # Programmatic route definitions (CRITICAL)
- /app/routes/               # Route components (loaders, actions, UI)
- /app/models/               # Business logic (pure functions)
- /app/api/handlers/         # API request handlers
- /app/api/router.ts         # API route registry
- /app/components/           # React UI components
- /app/lib/db/               # Database connection and schemas
- /app/lib/auth/             # Authentication and sessions
- /app/lib/security/         # Security middleware (CSRF, rate limit)
- /app/utils/                # Utility functions

Tests:
- /tests/unit/               # Unit tests for models
- /tests/integration/        # Integration tests for APIs
- /tests/e2e/                # Playwright E2E tests
- /tests/security/           # Security tests
- /tests/factories/          # Test data factories

Documentation:
- /README.md                 # Feature specifications
- /CLAUDE.md                 # Architecture and development workflow
- /.specswarm/constitution.md         # Coding principles
- /.specswarm/tech-stack.md           # Approved technologies
- /.specswarm/quality-standards.md    # Quality gates
```

### C. Environment Variables Template

```bash
# .env.example (commit this to git)
# Copy to .env and fill in real values

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
SESSION_SECRET=generate_with_openssl_rand_base64_32
JWT_SECRET=generate_with_openssl_rand_base64_32

# Cloudinary (Image Hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mailgun (Email Service)
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=your_verified_domain
MAILGUN_FROM_EMAIL=noreply@your_domain.com
MAILGUN_FROM_NAME=Tweeter

# Application
APP_URL=http://localhost:5173  # Change for production
NODE_ENV=development
```

---

**Plan Status:** READY FOR TASK GENERATION
**Next Command:** `/specswarm:tasks`
