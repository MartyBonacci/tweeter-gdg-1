---
parent_branch: main
feature_number: 001
status: Ready for Implementation
created_at: 2026-01-08T10:35:00Z
---

# Task Breakdown: Complete Tweeter Application

**Feature:** Complete Tweeter Application
**Specification:** [spec.md](./spec.md)
**Implementation Plan:** [plan.md](./plan.md)
**Total Tasks:** 68 tasks
**Estimated Duration:** 22 days

<!-- Tech Stack Validation: PASSED -->
<!-- Validated against: .specswarm/tech-stack.md v1.0.0 -->
<!-- No prohibited technologies found -->
<!-- All technologies pre-approved -->

---

## Task Organization Strategy

This task breakdown organizes implementation by **user story** (functional requirement) to enable:
- **Independent implementation** - Each story can be completed and tested independently
- **Incremental delivery** - Features can be deployed as they're completed
- **Parallel execution** - Multiple stories can be worked on simultaneously
- **Clear testing** - Each story has its own acceptance criteria

**User Story Priority Order:**
1. **Phase 1-2:** Setup & Foundational (blocking prerequisites)
2. **Phase 3:** FR-1 User Authentication (CRITICAL) - Must complete first
3. **Phase 4:** FR-2 Tweet Creation (CRITICAL) + FR-8 Feed Display (CRITICAL) - Core functionality
4. **Phase 5:** FR-3 Tweet Management (HIGH) - Delete functionality
5. **Phase 6:** FR-4 Like/Unlike (HIGH) - Social engagement
6. **Phase 7:** FR-5 User Profiles (HIGH) - Profile viewing and editing
7. **Phase 8:** FR-6 Avatar Upload (MEDIUM) - Enhanced profiles
8. **Phase 9:** FR-7 Profile Discovery (MEDIUM) - User discovery
9. **Phase 10:** Integration & Polish - Cross-cutting concerns

---

## Phase 1: Project Setup (Day 1)

**Goal:** Initialize project structure and verify environment

### T001: Create directory structure [P]
**File:** Multiple directories
**Description:** Create all required directories for the application
```bash
mkdir -p app/routes app/models/auth app/models/user app/models/tweet app/models/like
mkdir -p app/api/handlers app/components/layout app/components/auth app/components/tweet
mkdir -p app/components/profile app/components/social app/lib/db/schema app/lib/auth
mkdir -p app/lib/security app/utils tests/unit tests/integration tests/e2e tests/security tests/factories
```
**Acceptance Criteria:** All directories exist and are accessible

### T002: Generate session secrets [P]
**File:** `.env`
**Description:** Generate SESSION_SECRET and JWT_SECRET using openssl
```bash
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
echo "SESSION_SECRET=${SESSION_SECRET}" >> .env
echo "JWT_SECRET=${JWT_SECRET}" >> .env
```
**Acceptance Criteria:** Both secrets exist in .env with 32+ character values

### T003: Verify environment configuration [P]
**File:** `.env`
**Description:** Verify all required environment variables are present
- DATABASE_URL (Neon PostgreSQL)
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL, MAILGUN_FROM_NAME
- SESSION_SECRET, JWT_SECRET (from T002)
**Acceptance Criteria:** All environment variables present and valid format

### T004: Verify npm dependencies [P]
**File:** `package.json`
**Description:** Run `npm install` and verify all 670 dependencies are installed correctly
**Acceptance Criteria:** `node_modules/` populated, `npm run typecheck` passes

**Phase 1 Checkpoint:** ✅ Project structure ready, environment configured

---

## Phase 2: Foundational Layer (Days 2-3)

**Goal:** Database schemas, connection, and migrations - required by ALL user stories

### T005: Define profiles table schema [P]
**File:** `app/lib/db/schema/profile.ts`
**Description:** Create Drizzle schema for profiles table with UUID v7 primary key
```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```
**Acceptance Criteria:** Schema compiles without TypeScript errors

### T006: Define tweets table schema [P]
**File:** `app/lib/db/schema/tweet.ts`
**Description:** Create Drizzle schema for tweets table with foreign key to profiles
```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { profiles } from './profile';

export const tweets = pgTable('tweets', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  profileId: uuid('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```
**Acceptance Criteria:** Schema compiles, foreign key relationship defined

### T007: Define likes table schema [P]
**File:** `app/lib/db/schema/like.ts`
**Description:** Create Drizzle schema for likes table with composite primary key
```typescript
import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { profiles } from './profile';
import { tweets } from './tweet';

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
**Acceptance Criteria:** Composite key prevents duplicate likes

### T008: Create schema index file
**File:** `app/lib/db/schema/index.ts`
**Description:** Export all schemas from single entry point
```typescript
export * from './profile';
export * from './tweet';
export * from './like';
```
**Dependencies:** T005, T006, T007
**Acceptance Criteria:** All schemas exported, no TypeScript errors

### T009: Configure database connection
**File:** `app/lib/db/connection.ts`
**Description:** Set up PostgreSQL connection with pooling (max 20), retry logic, case conversion
```typescript
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  transform: {
    column: {
      to: postgres.toCamel,
      from: postgres.toSnake,
    },
  },
});

export default sql;
```
**Acceptance Criteria:** Connection established, pooling configured, case conversion works

### T010: Generate database migrations
**File:** `drizzle/migrations/`
**Description:** Run `npm run db:generate` to create migration files from schemas
**Dependencies:** T008
**Acceptance Criteria:** Migration SQL files generated in drizzle/migrations/

### T011: Run database migrations
**File:** Database
**Description:** Run `npm run db:migrate` to apply migrations to Neon database
**Dependencies:** T010
**Acceptance Criteria:** All 3 tables created with correct columns, indexes, foreign keys

### T012: Create database seed script [P]
**File:** `app/lib/db/seeds/seed.ts`
**Description:** Create seed data: 5 test users, 20 tweets, 50 likes
**Dependencies:** T011
**Acceptance Criteria:** `npm run db:seed` successfully populates test data

**Phase 2 Checkpoint:** ✅ Database layer complete, migrations run, seed data available

---

## Phase 3: FR-1 User Authentication (Days 4-6) [CRITICAL]

**User Story:** As a new user, I want to sign up with email verification and log in securely, so that I can access the platform.

**Acceptance Criteria:**
- User can complete registration in under 2 minutes
- Email verification link expires after 24 hours
- Failed login attempts are rate limited
- Sessions persist for 30 days

### T013: Create password hashing utilities [P]
**File:** `app/models/auth/password.ts`
**Description:** Implement Argon2id password hashing (64MB memory, 3 iterations)
```typescript
import { hash, verify } from '@node-rs/argon2';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 65536, // 64MB
    timeCost: 3,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return verify(hash, password);
}
```
**Acceptance Criteria:** Hashing takes ~100-300ms, verification works correctly

### T014: Create auth Zod validation schemas [P]
**File:** `app/models/auth/auth.schema.ts`
**Description:** Define validation schemas for signup and login
```typescript
import { z } from 'zod';

export const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```
**Acceptance Criteria:** Schemas validate input correctly, reject invalid data

### T015: Implement signup model function
**File:** `app/models/auth/auth.model.ts`
**Description:** Create signupUser function with email verification token generation
```typescript
export async function signupUser(data: SignupData): Promise<{ userId: string, verificationToken: string }> {
  // 1. Validate input with Zod
  // 2. Check username/email uniqueness
  // 3. Hash password
  // 4. Insert into profiles table
  // 5. Generate verification token (JWT, 24hr expiry)
  // 6. Return userId and token
}
```
**Dependencies:** T013, T014
**Acceptance Criteria:** User created, verification token generated, duplicates rejected

### T016: Implement email verification model function
**File:** `app/models/auth/auth.model.ts`
**Description:** Create verifyEmail function to validate token and activate account
```typescript
export async function verifyEmail(token: string): Promise<void> {
  // 1. Decode and verify JWT token
  // 2. Check expiry (24 hours)
  // 3. Mark user as verified (add emailVerified boolean to schema)
}
```
**Dependencies:** T015
**Acceptance Criteria:** Valid tokens activate account, expired tokens rejected

### T017: Implement login model function
**File:** `app/models/auth/auth.model.ts`
**Description:** Create authenticateUser function for email/password login
```typescript
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // 1. Validate input with Zod
  // 2. Find user by email
  // 3. Verify password hash
  // 4. Check email verification status
  // 5. Return user object or null
}
```
**Dependencies:** T013, T014
**Acceptance Criteria:** Valid credentials return user, invalid return null

### T018: Create session management utilities
**File:** `app/lib/auth/session.ts`
**Description:** Set up cookie-based session storage (30 day expiration)
```typescript
import { createCookieSessionStorage } from 'react-router';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function createUserSession(userId: string, redirectTo: string) { /* ... */ }
export async function getUserId(request: Request): Promise<string | null> { /* ... */ }
export async function requireAuth(request: Request): Promise<string> { /* ... */ }
export async function logout(request: Request) { /* ... */ }
```
**Acceptance Criteria:** Sessions persist 30 days, secure in production

### T019: Implement CSRF protection
**File:** `app/lib/security/csrf.ts`
**Description:** Create CSRF token generation and validation middleware
```typescript
export function generateCsrfToken(): string { /* ... */ }
export async function validateCsrfToken(request: Request): Promise<boolean> { /* ... */ }
```
**Acceptance Criteria:** Tokens prevent cross-site attacks

### T020: Implement rate limiting
**File:** `app/lib/security/rate-limit.ts`
**Description:** Create rate limiter for login attempts (5 per 15 min per IP)
```typescript
export function createRateLimiter(options: RateLimitOptions) { /* ... */ }
export const loginRateLimiter = createRateLimiter({ max: 5, window: 15 * 60 * 1000 });
```
**Acceptance Criteria:** Rate limiting blocks excessive attempts

### T021: Create Mailgun email service
**File:** `app/lib/email/mailgun.ts`
**Description:** Set up Mailgun client and sendVerificationEmail function
```typescript
import Mailgun from 'mailgun.js';

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // Send email with verification link
}
```
**Acceptance Criteria:** Emails sent successfully with verification links

### T022: Create signup API handler
**File:** `app/api/handlers/auth.handler.ts`
**Description:** POST /api/auth/signup - Handle user registration with email verification
```typescript
export async function handleSignup(request: Request): Promise<Response> {
  // 1. Parse and validate request body
  // 2. Call signupUser model
  // 3. Send verification email
  // 4. Return success response
}
```
**Dependencies:** T015, T021
**Acceptance Criteria:** Returns 201 on success, sends verification email

### T023: Create login API handler
**File:** `app/api/handlers/auth.handler.ts`
**Description:** POST /api/auth/login - Handle user login with session creation
```typescript
export async function handleLogin(request: Request): Promise<Response> {
  // 1. Parse and validate credentials
  // 2. Call authenticateUser model
  // 3. Create user session
  // 4. Return redirect response
}
```
**Dependencies:** T017, T018, T020
**Acceptance Criteria:** Creates session, rate limits excessive attempts

### T024: Create logout API handler
**File:** `app/api/handlers/auth.handler.ts`
**Description:** POST /api/auth/logout - Handle user logout and session destruction
**Dependencies:** T018
**Acceptance Criteria:** Destroys session, redirects to login

### T025: Create email verification API handler
**File:** `app/api/handlers/auth.handler.ts`
**Description:** GET /api/auth/verify?token=xxx - Handle email verification
**Dependencies:** T016
**Acceptance Criteria:** Activates account on valid token, shows error on invalid

### T026: Create signup page route
**File:** `app/routes/signup.tsx`
**Description:** Signup form with username, email, password fields and validation
```typescript
export async function action({ request }: ActionFunctionArgs) {
  // Call handleSignup API handler
}
export default function SignupPage() {
  // Render signup form with client-side validation
}
```
**Dependencies:** T022
**Acceptance Criteria:** Form validates input, shows errors, submits to API

### T027: Create login page route
**File:** `app/routes/login.tsx`
**Description:** Login form with email and password fields
**Dependencies:** T023
**Acceptance Criteria:** Form submits credentials, creates session on success

### T028: Create protected layout wrapper
**File:** `app/routes/_layout.tsx`
**Description:** Layout component that requires authentication using requireAuth
**Dependencies:** T018
**Acceptance Criteria:** Redirects to login if not authenticated

### T029: Create SignupForm component [P]
**File:** `app/components/auth/SignupForm.tsx`
**Description:** Reusable signup form with Tailwind styling
**Acceptance Criteria:** Validates input, shows errors, responsive design

### T030: Create LoginForm component [P]
**File:** `app/components/auth/LoginForm.tsx`
**Description:** Reusable login form with Tailwind styling
**Acceptance Criteria:** Validates input, shows errors, responsive design

### T031: Create LogoutButton component [P]
**File:** `app/components/auth/LogoutButton.tsx`
**Description:** Logout button that calls logout API
**Acceptance Criteria:** Destroys session on click

### T032: Update routes.ts with auth routes
**File:** `app/routes.ts`
**Description:** Add signup, login, and protected layout routes programmatically
```typescript
export default [
  index("routes/_index.tsx"),
  route("signup", "routes/signup.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/_layout.tsx", [
    // Protected routes go here
  ]),
] satisfies RouteConfig;
```
**Dependencies:** T026, T027, T028
**Acceptance Criteria:** Routes accessible, authentication enforced

**Phase 3 Checkpoint:** ✅ User authentication complete - Users can signup, verify email, login, logout

---

## Phase 4: FR-2 Tweet Creation + FR-8 Feed Display (Days 7-9) [CRITICAL]

**User Stories:**
- FR-2: As an authenticated user, I want to post tweets up to 140 characters, so that I can share my thoughts
- FR-8: As a user, I want to view all tweets in a feed (newest first), so that I can see what others are posting

**Combined Acceptance Criteria:**
- Character counter updates in real-time
- Tweets appear immediately after posting
- Feed loads within 2 seconds
- Feed displays 20 tweets initially with pagination/infinite scroll

### T033: Create tweet Zod validation schema [P]
**File:** `app/models/tweet/tweet.schema.ts`
**Description:** Define validation for tweet content (1-140 chars)
```typescript
export const tweetSchema = z.object({
  content: z.string().min(1).max(140),
});
```
**Acceptance Criteria:** Schema rejects empty and >140 char tweets

### T034: Implement createTweet model function
**File:** `app/models/tweet/tweet.model.ts`
**Description:** Create tweet with profileId and content validation
```typescript
export async function createTweet(data: CreateTweetData): Promise<Tweet> {
  // 1. Validate content with Zod
  // 2. Insert into tweets table with UUID v7
  // 3. Return created tweet
}
```
**Dependencies:** T033
**Acceptance Criteria:** Tweet created with correct profileId, content length enforced

### T035: Implement getFeed model function
**File:** `app/models/tweet/tweet.model.ts`
**Description:** Fetch all tweets ordered by createdAt DESC with pagination
```typescript
export async function getFeed(limit = 20, offset = 0): Promise<Tweet[]> {
  // 1. Query tweets with profiles (join)
  // 2. Order by created_at DESC
  // 3. Limit and offset for pagination
  // 4. Return tweets with author info
}
```
**Acceptance Criteria:** Returns tweets newest first, includes author data

### T036: Implement getTweetsByUserId model function
**File:** `app/models/tweet/tweet.model.ts`
**Description:** Fetch tweets for specific user (for profile page)
```typescript
export async function getTweetsByUserId(userId: string, limit = 20, offset = 0): Promise<Tweet[]> {
  // Query tweets filtered by profile_id
}
```
**Acceptance Criteria:** Returns only user's tweets, newest first

### T037: Create tweet creation API handler
**File:** `app/api/handlers/tweet.handler.ts`
**Description:** POST /api/tweets - Create new tweet
```typescript
export async function handleCreateTweet(request: Request): Promise<Response> {
  // 1. Require authentication
  // 2. Validate content
  // 3. Call createTweet model
  // 4. Return created tweet
}
```
**Dependencies:** T034
**Acceptance Criteria:** Authenticated users can post, 140 char limit enforced

### T038: Create feed fetch API handler
**File:** `app/api/handlers/tweet.handler.ts`
**Description:** GET /api/tweets - Fetch feed with pagination
```typescript
export async function handleGetFeed(request: Request): Promise<Response> {
  // Parse limit and offset from query params
  // Call getFeed model
  // Return tweets array
}
```
**Dependencies:** T035
**Acceptance Criteria:** Returns paginated tweets, newest first

### T039: Create home feed page route
**File:** `app/routes/home.tsx`
**Description:** Display tweet feed with infinite scroll/pagination
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const tweets = await getFeed();
  return json({ tweets });
}
export default function HomePage() {
  // Render TweetFeed component with tweets
}
```
**Dependencies:** T035
**Acceptance Criteria:** Protected route, displays tweets, loads within 2 seconds

### T040: Create compose tweet page route
**File:** `app/routes/compose.tsx`
**Description:** Dedicated page for composing tweets
```typescript
export async function action({ request }: ActionFunctionArgs) {
  // Call handleCreateTweet API handler
}
export default function ComposePage() {
  // Render TweetComposer component
}
```
**Dependencies:** T037
**Acceptance Criteria:** Form with 140 char counter, validates on submit

### T041: Create TweetComposer component
**File:** `app/components/tweet/TweetComposer.tsx`
**Description:** Form with character counter (140 - current length)
```typescript
export function TweetComposer() {
  const [content, setContent] = useState('');
  const remaining = 140 - content.length;
  // Render textarea, counter, submit button
}
```
**Acceptance Criteria:** Real-time counter, disables submit at 140 chars, responsive

### T042: Create TweetFeed component
**File:** `app/components/tweet/TweetFeed.tsx`
**Description:** List of TweetFeedItem components with loading states
**Acceptance Criteria:** Renders tweets, shows loading indicator, responsive

### T043: Create TweetFeedItem component
**File:** `app/components/tweet/TweetFeedItem.tsx`
**Description:** Individual tweet display with author, content, timestamp, like count
```typescript
export function TweetFeedItem({ tweet }: { tweet: Tweet }) {
  // Display avatar, username, content, timestamp, like count
}
```
**Acceptance Criteria:** Shows all tweet metadata, clickable username, relative timestamp

### T044: Add home and compose routes to routes.ts
**File:** `app/routes.ts`
**Description:** Add protected routes for home feed and compose
```typescript
layout("routes/_layout.tsx", [
  route("home", "routes/home.tsx"),
  route("compose", "routes/compose.tsx"),
]),
```
**Dependencies:** T039, T040
**Acceptance Criteria:** Routes accessible when authenticated

**Phase 4 Checkpoint:** ✅ Core tweeting functionality complete - Users can post and view tweets

---

## Phase 5: FR-3 Tweet Management (Days 10-11) [HIGH]

**User Story:** As a user, I want to delete my own tweets, so that I can remove content I no longer want public.

**Acceptance Criteria:**
- Delete button visible only on own tweets
- Confirmation dialog prevents accidental deletion
- Associated likes are cascade deleted
- Feed updates immediately after deletion

### T045: Implement deleteTweet model function
**File:** `app/models/tweet/tweet.model.ts`
**Description:** Delete tweet with authorization check (cascade deletes likes)
```typescript
export async function deleteTweet(tweetId: string, userId: string): Promise<void> {
  // 1. Verify tweet belongs to user
  // 2. Delete tweet (cascades to likes automatically)
  // 3. Throw error if unauthorized
}
```
**Acceptance Criteria:** Only author can delete, likes automatically removed

### T046: Create tweet deletion API handler
**File:** `app/api/handlers/tweet.handler.ts`
**Description:** DELETE /api/tweets/:id - Delete tweet with auth check
```typescript
export async function handleDeleteTweet(request: Request, tweetId: string): Promise<Response> {
  const userId = await requireAuth(request);
  await deleteTweet(tweetId, userId);
  return json({ success: true });
}
```
**Dependencies:** T045
**Acceptance Criteria:** Returns 200 on success, 403 if unauthorized

### T047: Create DeleteButton component
**File:** `app/components/tweet/DeleteButton.tsx`
**Description:** Button with confirmation dialog
```typescript
export function DeleteButton({ tweetId }: { tweetId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  // Render delete button and confirmation modal
}
```
**Acceptance Criteria:** Shows confirmation, calls API, shows loading state

### T048: Update TweetFeedItem to show DeleteButton
**File:** `app/components/tweet/TweetFeedItem.tsx`
**Description:** Conditionally render DeleteButton if current user is author
**Dependencies:** T047
**Acceptance Criteria:** Delete button only visible to tweet author

**Phase 5 Checkpoint:** ✅ Tweet deletion complete - Users can delete own tweets

---

## Phase 6: FR-4 Like/Unlike Functionality (Days 12-13) [HIGH]

**User Story:** As a user, I want to like and unlike tweets, so that I can show appreciation for content I enjoy.

**Acceptance Criteria:**
- Like actions feel instant (<100ms perceived)
- Like button changes visual state (filled vs outline heart)
- Duplicate likes prevented at database level
- Optimistic updates revert on failure

### T049: Implement toggleLike model function
**File:** `app/models/like/like.model.ts`
**Description:** Toggle like status (insert if not exists, delete if exists)
```typescript
export async function toggleLike(tweetId: string, userId: string): Promise<{ liked: boolean, likeCount: number }> {
  // 1. Check if like exists
  // 2. If exists: delete like
  // 3. If not: insert like (composite key prevents duplicates)
  // 4. Return new like state and count
}
```
**Acceptance Criteria:** Toggles correctly, composite key prevents duplicates

### T050: Implement getLikeCount model function [P]
**File:** `app/models/like/like.model.ts`
**Description:** Count likes for a tweet
```typescript
export async function getLikeCount(tweetId: string): Promise<number> {
  // Count rows in likes table for tweet_id
}
```
**Acceptance Criteria:** Returns accurate count

### T051: Implement isLikedByUser model function [P]
**File:** `app/models/like/like.model.ts`
**Description:** Check if user has liked a tweet
```typescript
export async function isLikedByUser(tweetId: string, userId: string): Promise<boolean> {
  // Check if like record exists
}
```
**Acceptance Criteria:** Returns correct boolean

### T052: Create like toggle API handler
**File:** `app/api/handlers/like.handler.ts`
**Description:** POST /api/tweets/:id/like - Toggle like status
```typescript
export async function handleToggleLike(request: Request, tweetId: string): Promise<Response> {
  const userId = await requireAuth(request);
  const result = await toggleLike(tweetId, userId);
  return json(result);
}
```
**Dependencies:** T049
**Acceptance Criteria:** Returns new like state and count

### T053: Create LikeButton component
**File:** `app/components/social/LikeButton.tsx`
**Description:** Heart button with optimistic UI updates
```typescript
export function LikeButton({ tweetId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const handleClick = async () => {
    // Optimistic update
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));

    try {
      const result = await fetch(`/api/tweets/${tweetId}/like`, { method: 'POST' });
      const { liked: actualLiked, likeCount: actualCount } = await result.json();
      setLiked(actualLiked);
      setCount(actualCount);
    } catch {
      // Revert on error
      setLiked(liked);
      setCount(count);
    }
  };
}
```
**Acceptance Criteria:** Instant visual feedback, reverts on failure, shows filled/outline heart

### T054: Create LikeCount component [P]
**File:** `app/components/social/LikeCount.tsx`
**Description:** Display like count with proper formatting
**Acceptance Criteria:** Shows count, handles 0/1/many correctly

### T055: Update TweetFeedItem to include LikeButton
**File:** `app/components/tweet/TweetFeedItem.tsx`
**Description:** Add LikeButton and LikeCount to tweet display
**Dependencies:** T053, T054
**Acceptance Criteria:** Like functionality works in feed

### T056: Update getFeed to include like data
**File:** `app/models/tweet/tweet.model.ts`
**Description:** Modify getFeed to join likes table and include isLikedByUser and likeCount
**Dependencies:** T050, T051
**Acceptance Criteria:** Feed includes like data for all tweets

**Phase 6 Checkpoint:** ✅ Like functionality complete - Users can like/unlike tweets

---

## Phase 7: FR-5 User Profiles (Days 14-15) [HIGH]

**User Story:** As a user, I want to view and edit my profile, so that I can customize my presence on the platform.

**Acceptance Criteria:**
- Profile pages load within 1 second
- Bio enforces 160 character limit
- Profile changes reflect immediately
- Default avatar shown if none uploaded

### T057: Implement user model functions [P]
**File:** `app/models/user/user.model.ts`
**Description:** CRUD operations for user profiles
```typescript
export async function getUserById(id: string): Promise<User | null>
export async function getUserByUsername(username: string): Promise<User | null>
export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<User>
```
**Acceptance Criteria:** Functions query correctly, return user data

### T058: Create profile Zod validation schema [P]
**File:** `app/models/user/user.schema.ts`
**Description:** Validate bio (max 160 chars)
```typescript
export const profileUpdateSchema = z.object({
  bio: z.string().max(160).optional(),
});
```
**Acceptance Criteria:** Schema enforces 160 char limit

### T059: Create profile view API handler
**File:** `app/api/handlers/profile.handler.ts`
**Description:** GET /api/profiles/:username - Fetch user profile
```typescript
export async function handleGetProfile(request: Request, username: string): Promise<Response> {
  const user = await getUserByUsername(username);
  if (!user) return new Response('Not Found', { status: 404 });
  const tweets = await getTweetsByUserId(user.id);
  return json({ user, tweets });
}
```
**Dependencies:** T057, T036
**Acceptance Criteria:** Returns user data and tweets

### T060: Create profile update API handler
**File:** `app/api/handlers/profile.handler.ts`
**Description:** PATCH /api/profiles/me - Update own profile
```typescript
export async function handleUpdateProfile(request: Request): Promise<Response> {
  const userId = await requireAuth(request);
  const data = await request.json();
  const updated = await updateProfile(userId, data);
  return json(updated);
}
```
**Dependencies:** T057, T058
**Acceptance Criteria:** Only user can update own profile, bio validated

### T061: Create profile view page route
**File:** `app/routes/$username.tsx`
**Description:** Display user profile with tweets
```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params;
  // Fetch profile and tweets
  return json({ user, tweets });
}
export default function ProfilePage() {
  // Render ProfileView component
}
```
**Dependencies:** T059
**Acceptance Criteria:** Shows profile info, user's tweets, works for any username

### T062: Create profile settings page route
**File:** `app/routes/settings.tsx`
**Description:** Edit profile form (bio)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireAuth(request);
  const user = await getUserById(userId);
  return json({ user });
}
export async function action({ request }: ActionFunctionArgs) {
  // Call handleUpdateProfile
}
export default function SettingsPage() {
  // Render ProfileEdit component
}
```
**Dependencies:** T060
**Acceptance Criteria:** Protected route, shows current bio, 160 char counter

### T063: Create ProfileView component
**File:** `app/components/profile/ProfileView.tsx`
**Description:** Display user profile (avatar, username, bio, join date, tweets)
**Acceptance Criteria:** Shows all profile data, responsive layout

### T064: Create ProfileEdit component
**File:** `app/components/profile/ProfileEdit.tsx`
**Description:** Form to edit bio with character counter
**Acceptance Criteria:** 160 char counter, validates on submit, shows errors

### T065: Add profile routes to routes.ts
**File:** `app/routes.ts`
**Description:** Add settings to protected layout and username as public route
```typescript
layout("routes/_layout.tsx", [
  route("home", "routes/home.tsx"),
  route("compose", "routes/compose.tsx"),
  route("settings", "routes/settings.tsx"),
]),
route(":username", "routes/$username.tsx"),
```
**Dependencies:** T061, T062
**Acceptance Criteria:** Settings protected, profile view public

**Phase 7 Checkpoint:** ✅ Profile functionality complete - Users can view and edit profiles

---

## Phase 8: FR-6 Avatar Upload (Days 16-17) [MEDIUM]

**User Story:** As a user, I want to upload a profile picture, so that I can personalize my profile.

**Acceptance Criteria:**
- Only image files accepted (JPEG, PNG, GIF)
- Max file size 5 MB validated before upload
- Images optimized to under 200 KB
- Upload completes within 10 seconds

### T066: Create Cloudinary service
**File:** `app/lib/cloudinary/cloudinary.ts`
**Description:** Set up Cloudinary SDK and upload function
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadAvatar(file: File): Promise<string> {
  // 1. Validate file type (jpeg, png, gif)
  // 2. Validate file size (max 5 MB)
  // 3. Upload to Cloudinary with transformation (resize, compress)
  // 4. Return optimized image URL
}
```
**Acceptance Criteria:** Uploads work, images optimized to <200KB

### T067: Implement updateAvatar model function
**File:** `app/models/user/user.model.ts`
**Description:** Update user's avatar_url in database
```typescript
export async function updateAvatar(userId: string, avatarUrl: string): Promise<User> {
  // Update profiles table with new avatar_url
}
```
**Acceptance Criteria:** Avatar URL saved to database

### T068: Create avatar upload API handler
**File:** `app/api/handlers/profile.handler.ts`
**Description:** POST /api/profiles/me/avatar - Upload avatar via Cloudinary
```typescript
export async function handleUploadAvatar(request: Request): Promise<Response> {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const file = formData.get('avatar') as File;

  const avatarUrl = await uploadAvatar(file);
  const updated = await updateAvatar(userId, avatarUrl);

  return json({ avatarUrl });
}
```
**Dependencies:** T066, T067
**Acceptance Criteria:** Validates file, uploads to Cloudinary, saves URL

### T069: Create AvatarUpload component
**File:** `app/components/profile/AvatarUpload.tsx`
**Description:** File input with preview and upload progress
```typescript
export function AvatarUpload({ currentAvatar }: { currentAvatar?: string }) {
  const [preview, setPreview] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Validate file type and size
    // Show preview
  };

  const handleUpload = async () => {
    // Upload to /api/profiles/me/avatar
    // Show progress
  };
}
```
**Acceptance Criteria:** Validates before upload, shows progress, displays preview

### T070: Add AvatarUpload to settings page
**File:** `app/routes/settings.tsx`
**Description:** Include AvatarUpload component in settings
**Dependencies:** T069
**Acceptance Criteria:** Avatar upload works from settings page

### T071: Create Avatar display component [P]
**File:** `app/components/profile/Avatar.tsx`
**Description:** Display avatar with fallback to default
```typescript
export function Avatar({ url, username, size = 'md' }: AvatarProps) {
  // Show Cloudinary URL or default avatar
  // Handle different sizes (sm, md, lg)
}
```
**Acceptance Criteria:** Shows avatar or default, responsive sizes

### T072: Update components to use Avatar
**File:** Multiple components
**Description:** Replace inline avatar images with Avatar component in TweetFeedItem, ProfileView
**Dependencies:** T071
**Acceptance Criteria:** Avatars display consistently across app

**Phase 8 Checkpoint:** ✅ Avatar upload complete - Users can customize profile pictures

---

## Phase 9: FR-7 Profile Discovery (Days 18-19) [MEDIUM]

**User Story:** As a user, I want to click on usernames to view profiles, so that I can discover other users.

**Acceptance Criteria:**
- All usernames clickable throughout app
- Navigation seamless (no broken links)
- Profile pages publicly accessible
- Cannot edit/delete other users' content

### T073: Create UsernameLink component
**File:** `app/components/profile/UsernameLink.tsx`
**Description:** Clickable username that navigates to profile
```typescript
import { Link } from 'react-router';

export function UsernameLink({ username }: { username: string }) {
  return <Link to={`/${username}`} className="font-semibold hover:underline">{username}</Link>;
}
```
**Acceptance Criteria:** Links to correct profile page, styled consistently

### T074: Update TweetFeedItem to use UsernameLink
**File:** `app/components/tweet/TweetFeedItem.tsx`
**Description:** Replace plain username text with UsernameLink component
**Dependencies:** T073
**Acceptance Criteria:** Usernames clickable in feed

### T075: Update ProfileView to use UsernameLink
**File:** `app/components/profile/ProfileView.tsx`
**Description:** Make username clickable in profile header
**Dependencies:** T073
**Acceptance Criteria:** Username clickable on profile page

### T076: Add conditional rendering for edit/delete buttons
**File:** `app/components/tweet/TweetFeedItem.tsx`
**Description:** Only show DeleteButton if tweet.profileId === currentUserId
**Acceptance Criteria:** Delete button hidden on other users' tweets

**Phase 9 Checkpoint:** ✅ Profile discovery complete - Users can navigate to profiles via usernames

---

## Phase 10: Integration & Polish (Days 20-22)

**Goal:** Cross-cutting concerns, testing, and final quality checks

### T077: Create Header layout component [P]
**File:** `app/components/layout/Header.tsx`
**Description:** Navigation header with logo and nav links (Home, Compose, Settings, Logout)
**Acceptance Criteria:** Shows user info, nav links work, responsive

### T078: Create Footer layout component [P]
**File:** `app/components/layout/Footer.tsx`
**Description:** Simple footer with copyright
**Acceptance Criteria:** Displays at bottom, responsive

### T079: Update _layout.tsx with Header and Footer
**File:** `app/routes/_layout.tsx`
**Description:** Wrap protected routes with Header and Footer
**Dependencies:** T077, T078
**Acceptance Criteria:** Layout consistent across protected pages

### T080: Create landing page
**File:** `app/routes/_index.tsx`
**Description:** Landing page with signup/login CTAs
**Acceptance Criteria:** Redirects to home if authenticated

### T081: Add API catch-all route
**File:** `app/routes/api/$.tsx`
**Description:** React Router adapter to call API handlers
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  // Route to appropriate handler based on path and method
}
```
**Acceptance Criteria:** All API routes accessible via /api/*

### T082: Implement input sanitization utilities [P]
**File:** `app/lib/security/validation.ts`
**Description:** XSS prevention for user-generated content
**Acceptance Criteria:** Sanitizes HTML, prevents script injection

### T083: Create test factories [P]
**File:** `tests/factories/index.ts`
**Description:** Helper functions to generate test data (users, tweets, likes)
**Acceptance Criteria:** Factories create valid test objects

### T084: Write unit tests for auth models [P]
**File:** `tests/unit/models/auth.test.ts`
**Description:** Test signupUser, authenticateUser, verifyEmail, password hashing
**Dependencies:** T083
**Acceptance Criteria:** All model functions tested, edge cases covered

### T085: Write unit tests for tweet models [P]
**File:** `tests/unit/models/tweet.test.ts`
**Description:** Test createTweet, getFeed, getTweetsByUserId, deleteTweet
**Dependencies:** T083
**Acceptance Criteria:** All tweet operations tested

### T086: Write unit tests for like models [P]
**File:** `tests/unit/models/like.test.ts`
**Description:** Test toggleLike, getLikeCount, isLikedByUser
**Dependencies:** T083
**Acceptance Criteria:** Like logic tested, duplicate prevention verified

### T087: Write unit tests for user models [P]
**File:** `tests/unit/models/user.test.ts`
**Description:** Test getUserById, getUserByUsername, updateProfile, updateAvatar
**Dependencies:** T083
**Acceptance Criteria:** User CRUD operations tested

### T088: Write integration tests for auth API [P]
**File:** `tests/integration/api/auth.test.ts`
**Description:** Test signup → verify → login → logout flow
**Acceptance Criteria:** Complete auth workflow tested with database

### T089: Write integration tests for tweet API [P]
**File:** `tests/integration/api/tweet.test.ts`
**Description:** Test create → fetch → delete tweet workflow
**Acceptance Criteria:** Tweet CRUD tested end-to-end

### T090: Write integration tests for like API [P]
**File:** `tests/integration/api/like.test.ts`
**Description:** Test like → unlike → like again workflow
**Acceptance Criteria:** Like toggle tested with database

### T091: Write E2E test: Signup and login flow
**File:** `tests/e2e/auth.spec.ts`
**Description:** Playwright test for complete signup → email verification → login
**Acceptance Criteria:** User can register and login successfully

### T092: Write E2E test: Post and delete tweet
**File:** `tests/e2e/tweet.spec.ts`
**Description:** Playwright test for posting tweet with 140 char limit and deleting it
**Acceptance Criteria:** Tweet posting and deletion works in browser

### T093: Write E2E test: Like and unlike tweet
**File:** `tests/e2e/like.spec.ts`
**Description:** Playwright test for liking and unliking tweets with optimistic UI
**Acceptance Criteria:** Like button updates immediately, count changes

### T094: Write E2E test: Profile edit and avatar upload
**File:** `tests/e2e/profile.spec.ts`
**Description:** Playwright test for updating bio and uploading avatar
**Acceptance Criteria:** Profile updates work in browser

### T095: Write security tests [P]
**File:** `tests/security/security.spec.ts`
**Description:** Test CSRF protection, XSS prevention, rate limiting, auth bypass attempts
**Acceptance Criteria:** Security measures prevent attacks

### T096: Run test coverage report
**File:** N/A (command)
**Description:** Run `npm run test:coverage` and verify ≥80% coverage
**Dependencies:** T084-T095
**Acceptance Criteria:** Coverage report shows ≥80% across all categories

### T097: Final TypeScript typecheck
**File:** N/A (command)
**Description:** Run `npm run typecheck` and fix any remaining errors
**Acceptance Criteria:** Zero TypeScript errors in strict mode

### T098: Final ESLint check
**File:** N/A (command)
**Description:** Run `npm run lint` and fix any warnings/errors
**Acceptance Criteria:** ESLint passes with no errors

### T099: Production build test
**File:** N/A (command)
**Description:** Run `npm run build` and verify production build succeeds
**Acceptance Criteria:** Build completes without errors, bundle size reasonable

### T100: Manual smoke test
**File:** N/A (manual)
**Description:** Manually test all 8 features in dev mode:
1. Signup with email verification
2. Login and logout
3. Post tweet with 140 char limit
4. View feed (newest first)
5. Delete own tweet
6. Like and unlike tweets
7. View and edit profile
8. Upload avatar
**Acceptance Criteria:** All features work as expected, no console errors

**Phase 10 Checkpoint:** ✅ Integration complete - All features tested and working

---

## Dependency Graph

```
Phase 1 (Setup)
  T001, T002, T003, T004 [All parallel]
  └─> Phase 2 (Foundational)

Phase 2 (Foundational)
  T005, T006, T007 [Parallel schemas]
  └─> T008 (Index) → T009 (Connection) [Parallel]
  └─> T010 (Generate) → T011 (Migrate) → T012 (Seed)
  └─> Phase 3+ (All user stories)

Phase 3 (FR-1: Authentication) - MUST COMPLETE BEFORE OTHER STORIES
  T013, T014 [Parallel] → T015, T017 → T018 → T019, T020, T021 [Parallel]
  → T022, T023, T024, T025 [Parallel handlers]
  → T026, T027, T028 [Parallel routes]
  → T029, T030, T031 [Parallel components]
  → T032 (Update routes)

Phase 4 (FR-2 + FR-8: Tweets + Feed) - DEPENDS ON PHASE 3
  T033 [Parallel] → T034, T035, T036 [Parallel models]
  → T037, T038 [Parallel handlers]
  → T039, T040 [Parallel routes]
  → T041, T042, T043 [Parallel components]
  → T044 (Update routes)

Phase 5 (FR-3: Delete) - DEPENDS ON PHASE 4
  T045 → T046 → T047 → T048

Phase 6 (FR-4: Likes) - DEPENDS ON PHASE 4
  T049, T050, T051 [Parallel models]
  → T052 → T053, T054 [Parallel components]
  → T055 → T056

Phase 7 (FR-5: Profiles) - DEPENDS ON PHASE 3
  T057, T058 [Parallel] → T059, T060 [Parallel handlers]
  → T061, T062 [Parallel routes]
  → T063, T064 [Parallel components]
  → T065

Phase 8 (FR-6: Avatar) - DEPENDS ON PHASE 7
  T066, T067 [Parallel] → T068 → T069 → T070
  T071 [Parallel] → T072

Phase 9 (FR-7: Discovery) - DEPENDS ON PHASE 7
  T073 → T074, T075 [Parallel] → T076

Phase 10 (Polish) - DEPENDS ON ALL PHASES
  T077, T078 [Parallel] → T079 → T080, T081, T082 [Parallel]
  T083 [Parallel] → T084-T095 [All tests parallel]
  → T096 → T097, T098, T099 [Parallel checks]
  → T100 (Manual test)
```

---

## Parallel Execution Opportunities

Within each phase, tasks marked [P] can be executed in parallel:

**Phase 1:** All 4 tasks can run simultaneously
**Phase 2:** T005, T006, T007 parallel; T009 parallel with T008
**Phase 3:** Multiple component creation tasks can run in parallel
**Phase 4:** Model functions, handlers, and components can be parallelized
**Phase 10:** All tests (T084-T095) can run in parallel, final checks (T097-T099) can run in parallel

**Estimated parallelization savings:** 30-40% reduction in sequential time

---

## MVP Scope Recommendation

For fastest time-to-market, implement **Phase 1-4 only** (Days 1-9):
- ✅ Phase 1: Setup
- ✅ Phase 2: Foundational
- ✅ Phase 3: Authentication
- ✅ Phase 4: Tweet posting and feed

This delivers a functional micro-blogging platform where users can:
- Sign up with email verification
- Log in and out
- Post tweets (140 char limit)
- View a global feed

**Defer to later releases:**
- Delete tweets (Phase 5)
- Likes (Phase 6)
- Profiles (Phase 7-8)
- Discovery (Phase 9)

---

## Implementation Strategy

1. **Sequential Dependencies:** Complete Phases 1-3 sequentially (authentication blocks everything)
2. **Parallel User Stories:** After Phase 3, Phases 4-9 can be parallelized:
   - Team A: Tweets + Feed (Phase 4) → Delete (Phase 5)
   - Team B: Profiles (Phase 7) → Avatar (Phase 8) → Discovery (Phase 9)
   - Team C: Likes (Phase 6)
3. **Testing in Parallel:** Write tests alongside implementation (TDD approach)
4. **Integration Last:** Phase 10 runs after all stories complete

---

## Quality Gates

Before marking any phase complete:
- [ ] All tasks in phase completed
- [ ] TypeScript compiles with zero errors (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Manual verification of phase features

Before shipping to production:
- [ ] All phases complete (T001-T100)
- [ ] Test coverage ≥ 80% (`npm run test:coverage`)
- [ ] Production build succeeds (`npm run build`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Manual smoke test complete (T100)
- [ ] Security tests pass (T095)

---

## Task Execution Notes

- Each task includes file path for easy navigation
- Dependencies listed explicitly
- Acceptance criteria define "done"
- [P] marker indicates parallelizable tasks
- Code snippets provided for complex implementations
- All tasks follow project architecture (programmatic routing, functional patterns, layered architecture)

**Total Estimated Time:** 22 days (individual developer) or 12-15 days (with parallelization)

**Next Step:** Begin Phase 1 with `/specswarm:implement`
