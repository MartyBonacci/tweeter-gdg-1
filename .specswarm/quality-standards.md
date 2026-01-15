# Quality Standards

**Project:** tweeter
**Last Updated:** 2026-01-08
**Quality Level:** Standard (80% thresholds)

## Overview

This document defines the quality gates, performance budgets, and code standards that must be met before merging code to the main branch. These standards are enforced by `/specswarm:ship`.

## Quality Gates

### Code Quality Score
- **Minimum Score:** 80/100
- **Enforcement:** Enabled
- **Scope:** All new and modified code

Quality score is calculated based on:
- Code complexity (cyclomatic complexity < 10)
- Code duplication (< 5% duplicate lines)
- Code smells (no critical issues)
- Test coverage (see below)

### Test Coverage
- **Minimum Coverage:** 80%
- **Enforcement:** Enabled
- **Scope:** All business logic (models, utilities, handlers)

Coverage requirements:
- **Unit tests:** All model functions and utilities
- **Integration tests:** API workflows and database operations
- **E2E tests:** Critical user flows (signup, login, post tweet, delete tweet)

Exempt from coverage requirements:
- Configuration files (`*.config.ts`, `*.config.js`)
- Type definitions (`*.d.ts`)
- Test files themselves
- Migration files

### TypeScript Strict Mode
- **Required:** Yes
- **Enforcement:** Build-time via `tsc --noEmit`

All TypeScript must compile without errors:
- No implicit `any`
- No unused variables
- Strict null checks enabled
- Strict function types enabled

## Performance Budgets

### Bundle Size
- **Maximum Total Bundle:** 500 KB (gzipped)
- **Maximum Initial Load:** 200 KB (gzipped)
- **Maximum Route Chunk:** 100 KB (gzipped)
- **Enforcement:** CI/CD build warnings

### Page Performance
- **Lighthouse Score:** ≥ 90/100
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Total Blocking Time (TBT):** < 300ms
- **Cumulative Layout Shift (CLS):** < 0.1

### API Performance
- **Average Response Time:** < 200ms (p95)
- **Maximum Response Time:** < 1000ms (p99)
- **Database Query Time:** < 100ms (average)

## Code Standards

### Complexity Thresholds
- **Cyclomatic Complexity:** ≤ 10 per function
- **Maximum File Length:** 300 lines
- **Maximum Function Length:** 50 lines
- **Maximum Function Parameters:** 5 parameters

Functions exceeding these limits should be refactored into smaller, composable functions.

### Code Organization
- **One component per file** (React components)
- **Colocate tests** with implementation files where practical
- **Consistent naming:**
  - Components: PascalCase (`TweetCard.tsx`)
  - Functions: camelCase (`findUserById`)
  - Constants: UPPER_SNAKE_CASE (`MAX_TWEET_LENGTH`)
  - Database columns: snake_case (`user_id`)

### Imports
- **No circular dependencies**
- **Barrel exports discouraged** (hurts tree-shaking)
- **Absolute imports** using `~/` alias

## Testing Requirements

### Unit Tests
- **Required:** Yes, for all business logic
- **Coverage:** ≥ 80% for model functions and utilities
- **Framework:** Vitest
- **Pattern:** One test file per implementation file

Example:
```
app/models/tweet/tweet.model.ts
tests/unit/models/tweet/tweet.model.test.ts
```

### Integration Tests
- **Required:** Yes, for API workflows
- **Coverage:** All API endpoints
- **Framework:** Vitest
- **Pattern:** Test complete workflows (e.g., create user → create tweet → fetch feed)

### E2E Tests
- **Required:** Yes, for critical flows
- **Framework:** Playwright
- **Minimum Flows:**
  - User registration and email verification
  - User login and logout
  - Create, view, and delete tweets
  - Like/unlike tweets
  - View other user profiles
  - Upload profile avatar

### Test Patterns
- Use **test factories** for generating test data
- **Mock external services** (Cloudinary, Mailgun) in tests
- **Seed test database** with known state
- **Clean up after tests** (delete test data)

## Security Requirements

### Input Validation
- **All user input** must be validated server-side with Zod schemas
- **Client-side validation** is for UX only, not security
- **Sanitize input** to prevent XSS attacks

### Authentication & Authorization
- **Protected routes** must use `requireAuth(request)`
- **Authorization checks** in every mutation
- **Session timeouts** enforced (30 days max)

### Secrets Management
- **No secrets in code** - use environment variables
- **No secrets in git** - `.env` in `.gitignore`
- **Rotate secrets regularly** (every 90 days)

### Dependency Security
- **No critical vulnerabilities** in dependencies
- **Run `npm audit`** before merging
- **Auto-update patch versions** weekly

## Code Review Requirements

### PR Guidelines
- **Minimum reviewers:** 1
- **Required checks:** All CI/CD tests must pass
- **Description required:** Explain what and why
- **Link to issue/ticket** if applicable

### Review Checklist
- [ ] Code follows constitution principles
- [ ] Tests are comprehensive and passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Performance budgets respected
- [ ] Security best practices followed
- [ ] Documentation updated if needed

## CI/CD Requirements

### Pre-Merge Checks
- [ ] TypeScript compilation (`npm run typecheck`)
- [ ] ESLint linting (`npm run lint`)
- [ ] Unit tests (`npm run test:unit`)
- [ ] Integration tests (`npm run test:integration`)
- [ ] E2E tests (`npm run test:e2e`)
- [ ] Test coverage ≥ 80%
- [ ] Build succeeds (`npm run build`)

### Merge Policy
- **Block merge on test failure:** Yes
- **Block merge on lint errors:** Yes
- **Block merge on type errors:** Yes
- **Block merge on low coverage:** Yes

## Performance Monitoring

### Core Web Vitals
- Monitor LCP, FID, CLS in production
- Set up alerts for degradation
- Monthly performance audits

### Database Performance
- Monitor slow queries (> 100ms)
- Optimize indexes based on query patterns
- Connection pool monitoring

## Accessibility Standards

### Requirements
- **WCAG 2.1 Level AA compliance**
- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **Color contrast ratio** ≥ 4.5:1 for normal text
- **Focus indicators** visible on all interactive elements

### Testing
- **Automated:** axe-core in E2E tests
- **Manual:** Screen reader testing (NVDA, VoiceOver)

## Custom Project Checks

### Tweeter-Specific Rules
- **Tweet character limit:** 140 characters (enforced server-side)
- **Bio character limit:** 160 characters
- **Avatar image size:** ≤ 5 MB, optimized via Cloudinary
- **Rate limiting:**
  - Post tweet: 10 per minute per user
  - Profile update: 5 per hour per user
  - Login attempts: 5 per 15 minutes per IP

## Exemptions

### When to Request Exemptions
- Performance budgets cannot be met due to external dependencies
- Legacy code refactoring is too risky
- Third-party libraries violate complexity rules

### Exemption Process
1. Document exemption request in PR description
2. Explain why exemption is necessary
3. Get approval from tech lead
4. Add exemption to "Granted Exemptions" section below

### Granted Exemptions
*No exemptions currently granted*

## Quality Metrics Dashboard

Track these metrics over time:
- Test coverage percentage (trend)
- Average bundle size (trend)
- Average API response time (p95)
- Number of TypeScript errors
- Number of ESLint warnings
- Lighthouse scores (production)

## Enforcement

### Automated Enforcement
- `/specswarm:ship` command validates all gates before merge
- CI/CD pipeline blocks merge on failures
- Pre-commit hooks run linting and type checking

### Manual Review
- Code reviewers verify adherence to standards
- Tech lead approves exemptions
- Monthly quality audits

## Amendment Process

These standards can be amended by:
1. Proposing changes via pull request to this file
2. Team discussion and consensus
3. Updating thresholds based on project maturity

## Notes

- Quality level: **Standard (80%)**
- Created by `/specswarm:init`
- Enforced by `/specswarm:ship` before merge
- Review and adjust these standards based on team feedback and project needs

## Related Documents

- `.specswarm/constitution.md` - Coding principles and governance
- `.specswarm/tech-stack.md` - Approved technologies and patterns
- `CLAUDE.md` - Development workflow and architecture
