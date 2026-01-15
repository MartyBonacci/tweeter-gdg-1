import { Outlet, useLoaderData } from 'react-router';
import { requireAuth } from '~/lib/auth/session';
import { getUserById } from '~/models/user/user.model';
import type { Route } from './+types/_layout';

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireAuth(request);

  // Get user profile for header
  const user = await getUserById(userId);

  return { user };
}

export default function ProtectedLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="/home" className="text-2xl font-bold text-blue-600">
                Tweeter
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href={`/${user?.username}`}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium">{user?.username}</span>
              </a>

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            &copy; 2026 Tweeter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
