import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { findRoute } from '~/api/router';

/**
 * API catch-all route - handles all /api/* requests
 * This is a programmatic API router that dispatches requests to handlers
 */

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Find matching route
  const match = findRoute('GET', path);

  if (!match) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    // Call handler with request and extracted params
    return await match.route.handler(request, ...match.params);
  } catch (error) {
    // If error is already a Response (e.g., redirect from requireAuth), return it
    if (error instanceof Response) {
      return error;
    }

    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  console.log('[API Router] Action called:', method, path);

  // Find matching route
  const match = findRoute(method, path);

  if (!match) {
    console.log('[API Router] No route match found');
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  console.log('[API Router] Route matched, calling handler');

  try {
    // Call handler with request and extracted params
    const response = await match.route.handler(request, ...match.params);
    console.log('[API Router] Handler returned response:', response.status, response.headers.get('content-type'));
    return response;
  } catch (error) {
    // If error is already a Response (e.g., redirect from requireAuth), return it
    if (error instanceof Response) {
      console.log('[API Router] Caught Response error:', error.status);
      return error;
    }

    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
