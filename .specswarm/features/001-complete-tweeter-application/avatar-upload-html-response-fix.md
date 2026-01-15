# Avatar Upload HTML Response Fix

## Issue
Avatar uploads were failing with "Unexpected response format. Please try again." error. The API endpoint `/api/profile/avatar` was returning HTML instead of JSON, even though the handler code was explicitly calling `Response.json()`.

## Root Cause
React Router v7 was treating the API catch-all route (`app/routes/api/$.tsx`) as a **component route** because it had:
1. A default export component (even though it returned `null`)
2. An ErrorBoundary export

When these exports are present, React Router applies Server-Side Rendering (SSR) to the route, which wraps responses in HTML documents. This caused JSON responses to be converted to HTML before reaching the client.

## Investigation Timeline

### Discovery Process
1. **Initial symptom**: Client received `text/html` content type instead of `application/json`
2. **Server logs showed**: Handler correctly returned JSON with `application/json` content type
3. **Browser testing confirmed**: Even with Status 200 and proper `Response.json()` calls, HTML was being returned
4. **Key insight**: The presence of component exports signals React Router to treat the route as a UI route requiring SSR

### Testing Evidence
```javascript
// Client-side fetch test showed:
{
  status: 200,
  contentType: "text/html", // Wrong!
  body: "<!DOCTYPE html><html..." // HTML instead of JSON
}

// Server logs showed:
[API Router] Handler returned response: 200 application/json // Correct!
```

The mismatch between server logs and client response indicated React Router was transforming the response between handler return and client delivery.

## Solution
Remove all component-related exports from `app/routes/api/$.tsx`, keeping only the data handling functions (`loader` and `action`). This signals to React Router that this is a **pure data route** that should not be rendered as HTML.

### Changes Made

#### app/routes/api/$.tsx
**Removed:**
```typescript
// This component should never render (API routes don't render UI)
export default function ApiRoute() {
  return null;
}

// Prevent error boundary from rendering HTML for API routes
export function ErrorBoundary({ error }: { error: Error }) {
  // ...error handling code
}
```

**Result**: The file now only exports `loader` and `action` functions, with no default export or ErrorBoundary.

## Verification

### Build Test
```bash
npm run build
```
✅ Build succeeded with no errors

### Browser Automation Test
Using Playwright:
1. Navigated to Settings page
2. Clicked "Change Avatar" button
3. Uploaded test image file
4. **Result**: No error message appeared, API returned proper JSON

### API Response Test
```javascript
// Direct fetch test from browser console:
const formData = new FormData();
formData.append('avatar', file);
const response = await fetch('/api/profile/avatar', {
  method: 'POST',
  body: formData
});
console.log(response.headers.get('content-type'));
// Before: "text/html"
// After: "application/json" ✅
```

### Server Logs Confirmation
```
[API Router] Action called: POST /api/profile/avatar
[API Router] Route matched, calling handler
[handleUploadAvatar] Called
[handleUploadAvatar] User authenticated: 019bb44b-4200-7a05-91a4-bbd4422bb467
[handleUploadAvatar] File received: yes
[API Router] Handler returned response: 200 application/json ✅
```

## Technical Details

### React Router v7 Route Behavior
- **Routes with default export + ErrorBoundary**: Treated as UI routes → SSR applied → HTML response
- **Routes with only loader/action exports**: Treated as data routes → Direct response → JSON preserved

### Why This Matters
In React Router v7 framework mode:
- UI routes automatically get Server-Side Rendering
- Data routes bypass SSR and return raw responses
- The presence of component exports is the signal React Router uses to determine route type

This is by design - React Router v7 assumes routes with components should render HTML pages, while routes with only data functions should return raw data.

## Related Files
- `app/routes/api/$.tsx` - API catch-all router (modified)
- `app/components/profile/AvatarUpload.tsx` - Client-side upload component (unchanged - previous error handling remains valid)
- `app/api/handlers/profile.handler.ts` - Server-side handler (unchanged)

## Impact
- ✅ Avatar uploads now work correctly
- ✅ All API routes return proper JSON responses
- ✅ No breaking changes to API handler code
- ✅ Error handling still works (thrown Response objects and caught errors both return JSON)

## Lessons Learned
1. **React Router v7 route types**: Component exports signal UI routes, data-only exports signal API routes
2. **SSR applies automatically**: Any route with a default export gets SSR, even if it returns `null`
3. **Test with browser automation**: Direct browser testing revealed the issue that server logs alone couldn't show
4. **Response transformation**: Framework middleware can transform responses between handler and client

## Status
✅ **FIXED** - Avatar upload now returns JSON correctly, error resolved
