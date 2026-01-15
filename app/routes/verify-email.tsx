import { Link } from 'react-router';
import type { Route } from './+types/verify-email';
import { verifyEmail } from '~/models/auth/auth.model';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return { success: false, error: 'No verification token provided' };
  }

  try {
    // Verify the email directly
    await verifyEmail(token);
    return { success: true, message: 'Email verified successfully. You can now log in.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify email';
    return { success: false, error: errorMessage };
  }
}

export default function VerifyEmail({ loaderData }: Route.ComponentProps) {
  const { success, error, message } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {success ? (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Go to Login
              </Link>
            </>
          ) : (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Link
                  to="/signup"
                  className="block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Sign Up Again
                </Link>
                <Link
                  to="/login"
                  className="block text-blue-500 hover:text-blue-600 transition"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
