'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();

  const [currentTime, setCurrentTime] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    }, 1000);

    return () => clearInterval(timer);
  }, [session, status]);

  const handleCopyPassword = async () => {
    if (session?.user?.generatedPassword) {
      await navigator.clipboard.writeText(session.user.generatedPassword);
      alert('Password copied to clipboard!');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Dashboard</h2>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Session Information:</h3>
            <pre className="text-left text-sm whitespace-pre-wrap">
              {JSON.stringify(session, null, 2)}
            </pre>
            <div>
            {session.user?.isNewGoogleUser && session.user?.generatedPassword && showPassword && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-400 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important: Save Your Password</h3>
              <p className="text-sm text-yellow-700 mb-2">
                This password will only be shown once. Please save it securely:
              </p>
              <div className="flex items-center justify-between bg-white p-2 rounded">
                <code className="text-sm">{session.user.generatedPassword}</code>
                <button
                  onClick={handleCopyPassword}
                  className="ml-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => setShowPassword(false)}
                className="mt-2 text-sm text-yellow-800 hover:text-yellow-900"
              >
                I've saved it, hide this message
              </button>
            </div>
          )}
            </div>
          </div>
          <p className="mt-4 text-gray-600">
            Logged in as: {session.user?.name}<br/>
            Email: {session.user?.email}<br/>
            User ID: {session.user?.id}
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => signOut()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}