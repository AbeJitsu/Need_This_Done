export const metadata = {
  title: 'Documentation',
  description: 'Getting started with the full-stack template',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-12">
          Documentation
        </h1>

        <div className="space-y-12">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Getting Started
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                1. Clone the Repository
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded mb-4 overflow-x-auto text-sm">
                <code>git clone &lt;repository-url&gt;</code>
              </pre>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                2. Install Dependencies
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded mb-4 overflow-x-auto text-sm">
                <code>npm install</code>
              </pre>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                3. Set Up Environment Variables
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded mb-4 overflow-x-auto text-sm">
                <code>{`cp .env.example .env.local
# Edit .env.local with your Supabase and Redis credentials`}</code>
              </pre>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                4. Start Development Server
              </h3>
              <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
                <code>npm run dev</code>
              </pre>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Technology Stack
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: 'Next.js 14', desc: 'React framework with server components' },
                { name: 'TypeScript', desc: 'Type-safe JavaScript' },
                { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
                { name: 'Supabase', desc: 'PostgreSQL database and auth' },
                { name: 'Redis', desc: 'In-memory caching' },
                { name: 'Vitest', desc: 'Unit and integration tests' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {tech.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{tech.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Demos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Try the Demos
            </h2>
            <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 border border-blue-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-gray-100 mb-4">
                This template includes interactive demos showing real features:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>📊 <strong>Speed Demo:</strong> See caching in action</li>
                <li>💾 <strong>Database Demo:</strong> Real data persistence</li>
                <li>🔐 <strong>Auth Demo:</strong> User authentication</li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Learn More
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Check out the "How It Works" section to understand the architecture and technology decisions.
              </p>
              <a
                href="/how-it-works"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Learn How It Works →
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
