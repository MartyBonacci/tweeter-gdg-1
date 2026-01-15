import { redirect } from 'react-router';
import { getUserId } from '~/lib/auth/session';
import type { Route } from './+types/_index';

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);

  // If already logged in, redirect to home
  if (userId) {
    return redirect('/home');
  }

  return null;
}

export default function IndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-6xl font-extrabold text-white mb-8">
          Welcome to Tweeter
        </h1>
        <p className="text-2xl text-blue-100 mb-12">
          Share your thoughts in 140 characters or less
        </p>

        <div className="space-x-4">
          <a
            href="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Sign up
          </a>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition"
          >
            Log in
          </a>
        </div>

        <div className="mt-16 text-blue-100">
          <p className="text-lg font-semibold mb-4">Features:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-blue-600 bg-opacity-50 p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-2">📝 Quick Tweets</h3>
              <p className="text-sm">Share your thoughts in 140 characters</p>
            </div>
            <div className="bg-blue-600 bg-opacity-50 p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-2">❤️ Like & Engage</h3>
              <p className="text-sm">Show appreciation for great content</p>
            </div>
            <div className="bg-blue-600 bg-opacity-50 p-6 rounded-lg">
              <h3 className="font-semibold text-white mb-2">👤 Custom Profiles</h3>
              <p className="text-sm">Personalize your presence with bio and avatar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
