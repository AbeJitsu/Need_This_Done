export const dynamic = 'force-dynamic';

import AuthDemo from '@/components/AuthDemo';

export const metadata = {
  title: 'Authentication Demo',
  description: 'Real user authentication with Supabase',
};

export default function AuthDemoPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Authentication Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See how secure user authentication works. Create an account, sign in, and understand the security measures protecting user data.
          </p>
        </div>
        <AuthDemo />
    </div>
  );
}
