import { useNavigate } from 'react-router';
import { redirect } from 'react-router';
import { requireAuth } from '~/lib/auth/session';
import { handleCreateTweet } from '~/api/handlers/tweet.handler';
import { TweetComposer } from '~/components/tweet/TweetComposer';
import type { Route } from './+types/compose';

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireAuth(request);
  const result = await handleCreateTweet(request);

  // If successful (status 201), redirect to home
  if (result.status === 201) {
    return redirect('/home');
  }

  return result;
}

export default function ComposePage() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/home');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Compose Tweet</h1>

      <TweetComposer
        showCancelButton={true}
        onCancel={handleCancel}
      />

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Keep your tweets concise and engaging. You have 140 characters max!
        </p>
      </div>
    </div>
  );
}
