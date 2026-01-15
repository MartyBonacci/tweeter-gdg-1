import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('signup', 'routes/signup.tsx'),
  route('login', 'routes/login.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),

  // API routes (catch-all for /api/*)
  route('api/*', 'routes/api/$.tsx'),

  // Protected routes (requires authentication)
  layout('routes/_layout.tsx', [
    route('home', 'routes/home.tsx'),
    route('compose', 'routes/compose.tsx'),
    route('settings', 'routes/settings.tsx'),
    route(':username', 'routes/$username.tsx'),
  ]),
] satisfies RouteConfig;
