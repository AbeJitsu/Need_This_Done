// ============================================================================
// Home Page - The Landing Page
// ============================================================================
// This is what visitors see when they go to your root URL (/)
// This is your starting point - replace this with your actual UI
//
// Think of it as the front dining area of your restaurant
// This is where people get their first impression

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        {/* Main Heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Full-Stack Template
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-700 mb-8">
          A production-ready template with Nginx, Next.js, Redis, and Supabase
        </p>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 my-12">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3">🚀 Fast</h2>
            <p className="text-gray-600">
              Redis caching and Nginx optimization for lightning-fast performance
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3">🔒 Secure</h2>
            <p className="text-gray-600">
              HTTPS by default, secure sessions, and production-ready security headers
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3">📦 Complete</h2>
            <p className="text-gray-600">
              Everything you need: database, caching, authentication, and deployment
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3">🐳 Dockerized</h2>
            <p className="text-gray-600">
              Runs identically on your laptop and in production - no surprises
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12">
          <p className="text-gray-700 mb-6">
            Ready to build something amazing? Check out the README for setup instructions.
          </p>
          <a
            href="https://github.com/yourusername/fullstack-template"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View on GitHub
          </a>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-gray-300">
          <p className="text-gray-600 mb-4">Quick Links:</p>
          <div className="space-x-4">
            <a href="/api/health" className="text-blue-600 hover:text-blue-700">
              Health Check
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Documentation
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              API Reference
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
