# Tasks: Modification to Feature 001 - Inline Tweet Composer

**Workflow**: Modify (Impact-Analysis-First)
**Status**: Active
**Created**: 2026-01-12
**Modification**: Move compose tweet form to home feed

---

## Execution Strategy

**Mode**: Sequential with Parallel Opportunities
**Smart Integration**: SpecSwarm Detected (Tech Stack Validation Enabled)

**Parallel Execution**: Tasks marked with [P] can be executed in parallel with other [P] tasks within the same phase.

---

## Phase 1: Impact Assessment Validation

### T001: Review Impact Analysis
**Description**: Validate impact analysis findings and confirm modification approach
**File**: .specswarm/features/001-complete-tweeter-application/impact-analysis.md
**Actions**:
- Review affected components (6 direct dependencies)
- Confirm zero breaking changes
- Approve hybrid backward compatibility strategy (keep /compose as fallback)
- Verify low risk assessment (2/10)
**Validation**: Stakeholder/developer approval to proceed
**Parallel**: No (foundational)
**Status**: ⏳ Pending

---

## Phase 2: Core Implementation

### T002: Update Home Route Action Handler
**Description**: Add tweet creation handling to home route action function
**File**: app/routes/home.tsx
**Changes**:
```typescript
// Update action function to handle multiple intents
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // NEW: Handle tweet composition
  if (intent === 'compose') {
    const result = await handleCreateTweet(request);
    if (result.status === 201) {
      // Success - return success flag to revalidate
      return json({ success: true });
    }
    return result;
  }

  // EXISTING: Handle delete
  if (intent === 'delete' && tweetId) {
    return handleDeleteTweet(request, tweetId);
  }

  // EXISTING: Handle like
  if (intent === 'like' && tweetId) {
    return handleToggleLike(request, tweetId);
  }

  return null;
}
```
**Validation**:
- Action compiles without TypeScript errors
- Intent-based routing logic correct
- Reuses existing handleCreateTweet handler
**Tech Stack Validation**: ✅ Uses React Router actions pattern
**Parallel**: No (required for T003)
**Dependencies**: None
**Status**: ⏳ Pending

---

### T003: Add TweetComposer to Home Page UI
**Description**: Integrate TweetComposer component into home feed at the top
**File**: app/routes/home.tsx
**Changes**:
```typescript
// Add import
import { TweetComposer } from '~/components/tweet/TweetComposer';

// Update component
export default function HomePage() {
  const { tweets, userId } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  return (
    <div className="max-w-2xl mx-auto">
      {/* NEW: Inline Tweet Composer */}
      <div className="mb-6">
        <TweetComposer
          showCancelButton={false}
          redirectOnSuccess={false}
        />
      </div>

      {/* EXISTING: Tweet Feed */}
      <TweetFeed
        tweets={tweets}
        currentUserId={userId ?? undefined}
        onDelete={handleDelete}
        onLike={handleLike}
        showLoadMore={tweets.length >= 20}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
```
**Validation**:
- Component renders without errors
- Composer appears above feed
- Styling matches design (margin-bottom for spacing)
**Tech Stack Validation**: ✅ React component composition
**Parallel**: No (depends on T002)
**Dependencies**: T002
**Status**: ⏳ Pending

---

### T004: Update TweetComposer for Inline Usage
**Description**: Ensure TweetComposer works correctly when embedded inline (form action routing)
**File**: app/components/tweet/TweetComposer.tsx
**Changes**:
- Verify Form component posts to current route (should already work with relative action)
- Add hidden input for intent: `<input type="hidden" name="intent" value="compose" />`
- Optionally: Add prop to clear form after success (form should clear on successful revalidation)
**Validation**:
- Form submits to /home action when on home page
- Intent parameter included in form data
- Form clears after successful tweet creation
**Tech Stack Validation**: ✅ React Router Form component
**Parallel**: [P] (can be done parallel with T005)
**Dependencies**: T002
**Status**: ⏳ Pending

---

### T005: [P] Remove "Compose Tweet" Button from Home Page
**Description**: Remove the link/button that navigated to /compose (replaced by inline composer)
**File**: app/routes/home.tsx
**Changes**:
```typescript
// REMOVE this section:
<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
  <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Feed</h1>
  <a
    href="/compose"
    className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
  >
    Compose Tweet
  </a>
</div>

// Inline composer already provides this functionality
```
**Validation**:
- "Compose Tweet" button no longer visible on home page
- Header "Home Feed" removed (composer provides implicit purpose)
**Parallel**: [P] (independent UI change)
**Dependencies**: T003 (ensure composer is working first)
**Status**: ⏳ Pending

---

## Phase 3: Testing and Validation

### T006: [P] Test Tweet Creation from Home Feed
**Description**: Manually test the complete inline composition workflow
**Test Cases**:
1. Load /home - composer visible at top
2. Type valid tweet (1-140 chars) - counter updates
3. Click "Tweet" button - submit succeeds
4. Verify: Form clears after submission
5. Verify: New tweet appears at top of feed
6. Verify: Feed revalidates automatically
**Expected Results**: All tests pass, smooth UX
**Parallel**: [P] (can test while others work on different tasks)
**Dependencies**: T002, T003, T004
**Status**: ⏳ Pending

---

### T007: [P] Test Character Limit Validation
**Description**: Test character counter and validation
**Test Cases**:
1. Type 1 character - counter shows 139 remaining
2. Type 120 characters - counter shows 20 remaining (yellow)
3. Type 140 characters - counter shows 0 remaining (yellow/red)
4. Type 141+ characters - error shown, submit disabled
5. Delete to <140 - error clears, submit enabled
**Expected Results**: Validation works correctly, submit disabled when invalid
**Parallel**: [P]
**Dependencies**: T002, T003, T004
**Status**: ⏳ Pending

---

### T008: [P] Test Error Handling
**Description**: Test error scenarios and recovery
**Test Cases**:
1. Disconnect network - submit fails with error message
2. Verify: Typed content preserved for retry
3. Reconnect network - retry succeeds
4. Submit empty tweet - validation error shown
5. Submit >140 chars (if server-side validation exists) - error shown
**Expected Results**: Errors handled gracefully, content not lost
**Parallel**: [P]
**Dependencies**: T002, T003, T004
**Status**: ⏳ Pending

---

### T009: [P] Test Mobile Responsive Behavior
**Description**: Test inline composer on mobile viewports
**Test Cases**:
1. Load /home on mobile (375px width)
2. Verify: Composer renders correctly
3. Verify: Textarea is appropriately sized
4. Verify: Submit button is touch-friendly (min 44px height)
5. Tap in textarea - keyboard appears
6. Verify: Keyboard doesn't obscure submit button
7. Type and submit tweet - works via touch
**Expected Results**: Mobile UX is smooth and functional
**Tools**: Browser DevTools responsive mode, or actual mobile device
**Parallel**: [P]
**Dependencies**: T002, T003, T004
**Status**: ⏳ Pending

---

### T010: Verify /compose Route Still Works (Backward Compatibility)
**Description**: Ensure /compose page remains functional as fallback
**Test Cases**:
1. Navigate directly to /compose
2. Verify: Page loads correctly
3. Type and submit tweet from /compose
4. Verify: Redirects to /home with tweet visible
5. Verify: No regressions in /compose functionality
**Expected Results**: /compose works unchanged (hybrid approach)
**Parallel**: No (validates backward compatibility)
**Dependencies**: T002, T003, T004
**Status**: ⏳ Pending

---

### T011: Run TypeScript Type Check
**Description**: Verify no TypeScript errors introduced
**Command**: `npm run typecheck`
**Expected**: Exit code 0, no type errors
**Parallel**: [P] (can run anytime after code changes)
**Dependencies**: T002, T003, T004
**Status**: ⏳ Pending

---

## Phase 4: Optional Enhancements (Phase 2 - Future)

These tasks can be done later after monitoring Phase 1 success:

### T012: [OPTIONAL] Update Navigation Bar "Compose" Link
**Description**: Update or remove "Compose" link in navigation bar
**File**: app/routes/_layout.tsx
**Options**:
- Option A: Change link from `/compose` to `/home` (scroll to composer)
- Option B: Remove "Compose" link entirely
- Option C: Keep as-is (link to /compose still works)
**Recommendation**: Option C initially, revisit based on usage metrics
**Parallel**: [P] (independent)
**Status**: ⏸️ Deferred to Phase 2

---

### T013: [OPTIONAL] Update TweetFeed Empty State
**Description**: Update empty feed message to encourage using inline composer
**File**: app/components/tweet/TweetFeed.tsx
**Current**: "No tweets yet. Be the first to post!" with link to /compose
**Proposed**: "No tweets yet. Use the composer above to post your first tweet!"
**Changes**:
```typescript
// Change from:
<a href="/compose" className="...">Start Tweeting</a>

// To:
<p className="text-sm text-gray-600">
  Use the composer above to post your first tweet!
</p>
```
**Parallel**: [P]
**Status**: ⏸️ Deferred to Phase 2

---

### T014: [OPTIONAL] Add Analytics Tracking
**Description**: Track usage of inline composer vs. /compose page
**Implementation**:
- Add event tracking: "tweet_created_inline" vs. "tweet_created_compose_page"
- Track metrics: time to post, success rate, abandonment rate
**Purpose**: Data-driven decision on whether to deprecate /compose in future
**Parallel**: [P]
**Status**: ⏸️ Deferred (if analytics infrastructure exists)

---

## Phase 5: Deployment and Monitoring

### T015: Code Review
**Description**: Peer review of all changes
**Scope**:
- Review impact analysis and modification spec
- Review code changes in home.tsx and TweetComposer.tsx
- Review manual test results
- Approve for deployment
**Validation**: Code review approved by reviewer
**Parallel**: No (gate before deployment)
**Dependencies**: All Phase 2 and Phase 3 tasks
**Status**: ⏳ Pending

---

### T016: Deploy to Production
**Description**: Deploy changes to production environment
**Actions**:
1. Merge feature branch to main (or deploy branch)
2. Run build: `npm run build`
3. Deploy to production server
4. Verify deployment successful
**Validation**: Production /home page shows inline composer
**Parallel**: No (sequential deployment)
**Dependencies**: T015
**Status**: ⏳ Pending

---

### T017: Post-Deployment Monitoring
**Description**: Monitor system health and user behavior after deployment
**Duration**: 1 week
**Metrics to Monitor**:
- Error rate: Should remain stable (<1% increase)
- Page load time: /home should be <100ms slower
- Tweet creation success rate: Should remain >98%
- User feedback: No complaints about inline composer
- Usage: Track inline vs. /compose posting frequency
**Actions if Issues Detected**:
- Minor bugs: Hot fix
- Major issues: Execute rollback plan
**Parallel**: No (ongoing monitoring)
**Dependencies**: T016
**Status**: ⏳ Pending

---

## Rollback Plan (If Needed)

### R001: Rollback to Previous Version
**Trigger Conditions**:
- Critical bug in inline composer
- Error rate increases >5%
- Multiple user complaints
- Performance degradation (>500ms page load increase)

**Rollback Steps**:
1. Revert changes to app/routes/home.tsx
   - Remove TweetComposer import and component
   - Restore "Compose Tweet" button
   - Remove tweet creation from action handler
2. Redeploy previous version
3. Verify /compose route still works
4. Monitor error rates return to normal

**Estimated Rollback Time**: <10 minutes

**Data Impact**: None (no data changes, users can still post from /compose)

---

## Summary

**Total Tasks**: 17 tasks (14 core + 3 optional)
**Estimated Time**: 3-4 hours development + 1 week monitoring
**Parallel Opportunities**: 7 tasks can execute in parallel (testing phase)
**Breaking Changes**: None
**Migration Required**: No

**Task Breakdown by Phase**:
- Phase 1: Impact validation (1 task) - 15 min
- Phase 2: Core implementation (4 tasks) - 1.5-2 hours
- Phase 3: Testing (6 tasks) - 1 hour (parallel execution)
- Phase 4: Optional enhancements (3 tasks) - Deferred to Phase 2
- Phase 5: Deployment and monitoring (3 tasks) - 10 min deploy + 1 week monitoring

**Success Criteria**:
- ✅ Impact analysis validated
- ✅ Inline composer implemented on home feed
- ✅ Tweet creation works from home page
- ✅ Form clears after successful post
- ✅ New tweet appears in feed immediately
- ✅ Character limit validation works
- ✅ Error handling graceful
- ✅ Mobile responsive
- ✅ Backward compatibility maintained (/compose still works)
- ✅ No TypeScript errors
- ✅ No increase in error rate
- ✅ No performance degradation

---

## Tech Stack Compliance Validation

**Tech Stack File**: .specswarm/tech-stack.md
**Compliance Checks**:
- ✅ React Router v7 loaders/actions used correctly
- ✅ TypeScript strict typing maintained
- ✅ React component patterns followed
- ✅ Tailwind CSS for styling
- ✅ Functional programming patterns (no classes)
- ✅ No new dependencies added

**Validation Tasks**:
- T011: TypeScript type check (ensures type safety)
- All T00X tasks: Follow React Router patterns (actions, forms, loaders)

---

## Metadata

**Workflow**: Modify (Impact-Analysis-First)
**Feature**: 001 - Complete Tweeter Application
**Modification**: Inline Tweet Composition on Home Feed
**Created By**: SpecSwarm Modify Workflow v1.0.0
**Risk Level**: Low (2/10)
**Breaking Changes**: None
**Backward Compatible**: Yes (hybrid approach)
**Estimated Development Time**: 3-4 hours
**Monitoring Period**: 1 week
**Rollback Plan**: Yes (documented above)
