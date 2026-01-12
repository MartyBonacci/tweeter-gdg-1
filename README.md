# Tweeter

A simplified Twitter clone styled like the 140-character era.

## Features

- User signup and signin (authentication)
- Tweet posting (140 character limit)
- Tweet feed (newest first)
- Delete own tweets
- Like tweets
- User profiles (bio, avatar)
- Profile avatar upload (Cloudinary)
- View other user profiles and their tweets

## Tech Stack

### Frontend
- React Router v7 (framework mode using loaders and actions)
- Programmatic routes (app/routes.ts with RouteConfig - NOT file-based)
- TypeScript
- Functional programming patterns (not OOP)
- Tailwind CSS + Flowbite
- Zod validation
- Remix hook forms
- Mobile responsive

### Backend
- REST APIs
- TypeScript
- Functional programming patterns (not OOP)
- Zod validation
- Programmatic Routes

### Database
- PostgreSQL (via Neon)
- postgres npm package (camelCase ↔ snake_case mapping)
- tables: profiles, tweets, likes
- uuidv7 for IDs

### Security
- @node-rs/argon2 (password hashing)
- Zod (frontend UX + backend security)

### Storage
- Cloudinary (profile avatars)

### Email
- Mailgun (signup email validation for account activation)

## Data Structure

**Profile:**
- id (uuidv7)
- username (unique)
- email (unique)
- password_hash (argon2)
- bio (optional, max 160 chars)
- avatar_url (optional, Cloudinary)
- created_at

**Tweet:**
- id (uuidv7)
- profile_id (FK to profiles)
- content (max 140 chars)
- created_at

**Like:**
- tweet_id (FK to tweets)
- profile_id (FK to profiles)
- created_at
- Unique primary key constraint: (tweet_id, profile_id)

## Programmatic Routes using this pattern

```typescript
// app/routes.ts
const routes: RouteConfig[] = [
  { path: '/', component: Landing },
  { path: '/signup', component: Signup },
    ...
];
```
