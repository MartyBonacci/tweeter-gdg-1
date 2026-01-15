# Project Constitution

**Project:** tweeter
**Created:** 2026-01-08
**Last Updated:** 2026-01-08

## Purpose

This document defines the governance structure, coding principles, and development philosophy for the **tweeter** project. All contributors and automated workflows must adhere to these principles.

## Core Principles

### 1. DRY (Don't Repeat Yourself)
- Eliminate code duplication through abstraction and composition
- Create reusable utilities, components, and functions
- If you write the same logic twice, refactor it into a shared module
- Example: Database queries should be encapsulated in model functions, not repeated in routes

### 2. Type Safety First
- Use TypeScript strict mode for all code
- Define explicit types for function parameters and return values
- Leverage Zod for runtime validation at system boundaries
- Never use `any` type without explicit justification
- Example: All API responses must have defined TypeScript interfaces

### 3. Functional Programming Patterns
- Prefer pure functions over stateful classes
- Use immutable data structures (avoid mutations)
- Compose functions for complex operations
- Avoid OOP patterns (classes, inheritance) in business logic
- Example: Model functions should be pure, taking inputs and returning outputs without side effects

### 4. Test Coverage
- Maintain minimum 80% test coverage for all new code
- Write unit tests for business logic (models, utilities)
- Write integration tests for API workflows
- Write E2E tests for critical user flows
- Example: Every new model function must have accompanying unit tests

### 5. Security by Design
- Validate all user input server-side with Zod schemas
- Hash passwords with Argon2 (never store plaintext)
- Implement CSRF protection on all mutations
- Use parameterized queries (Drizzle ORM) to prevent SQL injection
- Example: All form submissions must be validated server-side, not just client-side

### 6. Separation of Concerns
- Routes handle HTTP (request/response)
- Models handle business logic and database operations
- Components handle UI rendering only
- Keep each layer focused and testable
- Example: Database queries should never appear in route files

### 7. Documentation
- Document non-obvious design decisions in code comments
- Maintain up-to-date README.md with setup instructions
- Use JSDoc comments for public APIs and complex functions
- Keep CLAUDE.md current with architectural patterns
- Example: Complex algorithms or security considerations deserve explanatory comments

## Architectural Constraints

### Programmatic Routing Only
- All routes must be defined in `/app/routes.ts`
- File-based routing is prohibited
- This ensures centralized route management and visibility

### Database Access Patterns
- All database operations must go through model functions
- Never write raw SQL queries in routes or components
- Use Drizzle ORM for type-safe queries
- Maintain snake_case in database, camelCase in TypeScript (automatic conversion)

### Authentication Pattern
- Use `requireAuth(request)` for protected routes
- Use `getUserId(request)` for optional authentication
- Session-based authentication via React Router cookies
- No client-side JWT storage

### API Design
- Framework-agnostic handlers in `/app/api/handlers/`
- Central route registry in `/app/api/router.ts`
- React Router adapter in `/app/routes/api/$.tsx`
- This allows portability to other frameworks

## Enforcement

### Automated Checks
- `/specswarm:ship` validates adherence to this constitution before merge
- TypeScript compiler enforces type safety
- ESLint enforces code quality rules
- Vitest enforces test coverage thresholds

### Code Review Guidelines
- All PRs must be reviewed by at least one team member
- Reviewers should verify adherence to these principles
- Automated checks must pass before merge

## Exceptions

Exceptions to these principles require:
1. Documented justification in the PR description
2. Team consensus (or lead developer approval)
3. Addition to this document's "Known Exceptions" section

### Known Exceptions
*None currently documented*

## Amendment Process

This constitution can be amended by:
1. Proposing changes via pull request
2. Team discussion and consensus
3. Updating this document with rationale

## Related Documents

- `.specswarm/tech-stack.md` - Approved technologies and prohibited patterns
- `.specswarm/quality-standards.md` - Quality gates and performance budgets
- `CLAUDE.md` - Architectural guidance for Claude Code
