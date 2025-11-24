'use client';

import { useState } from 'react';

// ============================================================================
// How It Works Component - Simple Visual Diagram
// ============================================================================
// Explains the architecture in simple terms with a visual flow diagram.
// Shows how data moves from the user through the system.

export default function HowItWorks() {
  const [expandDeveloper, setExpandDeveloper] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          How It Works
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Here's the simple flow from your visitor's browser to data storage and back.
        </p>
      </div>

      {/* Desktop Flow Diagram */}
      <div className="hidden md:block mb-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          {/* Visitor Browser */}
          <div className="flex-1">
            <div className="p-4 bg-blue-50 dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 rounded-lg text-center">
              <div className="text-2xl mb-2" role="img" aria-label="Web browser">🌐</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Visitor's Browser</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Chrome, Safari, Firefox</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400" aria-hidden="true">→</div>

          {/* Web Server */}
          <div className="flex-1">
            <div className="p-4 bg-purple-50 dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-lg text-center">
              <div className="text-2xl mb-2" role="img" aria-label="Web server">⚙️</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Web Server</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Runs your code</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400" aria-hidden="true">→</div>

          {/* Memory System */}
          <div className="flex-1">
            <div className="p-4 bg-orange-50 dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-lg text-center">
              <div className="text-2xl mb-2" role="img" aria-label="Speed memory cache">⚡</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Speed Memory</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Redis (in-memory cache)</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400" aria-hidden="true">→</div>

          {/* Database */}
          <div className="flex-1">
            <div className="p-4 bg-green-50 dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-lg text-center">
              <div className="text-2xl mb-2" role="img" aria-label="Database">💾</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Database</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Supabase</p>
            </div>
          </div>
        </div>

        {/* Reverse arrows */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-700 dark:text-gray-300">Sends data</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-700 dark:text-gray-300">Receives request</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-700 dark:text-gray-300">Checks memory first</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-700 dark:text-gray-300">Stores safely</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-700 dark:text-gray-300">Loads page</p>
          </div>
        </div>
      </div>

      {/* Mobile Flow Diagram (stacked) */}
      <div className="md:hidden mb-8 space-y-3">
        {[
          { icon: '🌐', label: 'Web browser', title: 'Your Visitor', desc: 'Clicks on your website' },
          { icon: '⬇️', label: 'Arrow down', title: '', desc: '' },
          { icon: '⚙️', label: 'Web server', title: 'Web Server', desc: 'Runs your code' },
          { icon: '⬇️', label: 'Arrow down', title: '', desc: '' },
          { icon: '⚡', label: 'Speed memory cache', title: 'Speed Memory', desc: 'Checks if we remember this' },
          { icon: '⬇️', label: 'Arrow down', title: '', desc: '' },
          { icon: '💾', label: 'Database', title: 'Database', desc: 'Gets fresh data if needed' },
          { icon: '⬆️', label: 'Arrow up', title: '', desc: '' },
          { icon: '🌐', label: 'Web browser', title: 'Back to Browser', desc: 'Page loads instantly' },
        ].map((item, index) => (
          <div key={index} className="text-center">
            {item.title ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-xl mb-1" role="img" aria-label={item.label}>{item.icon}</div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>
            ) : (
              <p className="text-xl" role="img" aria-label={item.label}>{item.icon}</p>
            )}
          </div>
        ))}
      </div>

      {/* Explanation Boxes */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* What Visitors Experience */}
        <div className="p-4 bg-blue-50 dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">What Visitors See</h3>
          <ul className="text-sm text-blue-900 dark:text-blue-300 space-y-1">
            <li>• Pages load instantly (or very fast)</li>
            <li>• Login works seamlessly</li>
            <li>• Data loads from their account</li>
            <li>• No waiting, no errors</li>
          </ul>
        </div>

        {/* What You Build */}
        <div className="p-4 bg-purple-50 dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded-lg">
          <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">What You Build</h3>
          <ul className="text-sm text-purple-900 dark:text-purple-300 space-y-1">
            <li>• Your features and designs</li>
            <li>• Your business logic</li>
            <li>• Your rules and workflows</li>
            <li>• Everything that makes you unique</li>
          </ul>
        </div>
      </div>

      {/* Key Concept */}
      <div className="p-4 bg-green-50 dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg mb-6">
        <p className="text-sm text-green-900 dark:text-green-300">
          <strong><span role="img" aria-label="Tip">💡</span> The Key Idea:</strong> The "boring" infrastructure (how data moves, how users log in, how pages serve fast) is already done.
          All these boxes are connected and working. You just build what makes your idea special.
        </p>
      </div>

      {/* Security Layer Explanation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">How Your Data Stays Safe</h3>
        <div className="space-y-3">
          {[
            {
              title: 'Browser ↔ Web Server',
              icon: '🔒',
              description: 'Locked tunnel (HTTPS). Data travels in a sealed envelope that only the server can open. Even if someone intercepts it, they see gibberish.',
            },
            {
              title: 'Web Server ↔ Database',
              icon: '🔐',
              description: 'Private network connection. Servers talk directly through a secure path you control. No data exposed to the public internet.',
            },
            {
              title: 'Passwords in Database',
              icon: '🚫',
              description: 'Permanently scrambled (hashed). Even if a hacker steals the entire database, they get gibberish. Passwords can\'t be un-scrambled.',
            },
            {
              title: 'User Sessions',
              icon: '🎫',
              description: 'Secure tickets that expire. After login, you don\'t send the password again. You send a temporary proof of identity that becomes worthless after a time.',
            },
          ].map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex gap-3">
                <div className="text-xl flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* For Developers Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setExpandDeveloper(!expandDeveloper)}
          className="w-full text-left p-4 bg-purple-50 dark:bg-gray-700 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-purple-900 dark:text-purple-300">
              For Developers: Technical Details
            </p>
            <span className={`text-lg transition-transform ${expandDeveloper ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </button>

        {expandDeveloper && (
          <div className="mt-4 space-y-4 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-purple-700">
            {/* Next.js Explanation */}
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                1. Next.js: Frontend & Backend in One
              </p>
              <p className="text-sm text-purple-900 dark:text-purple-200 mb-2">
                Your app runs on a single server. The <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded text-xs">/app</code> directory contains:
              </p>
              <ul className="text-xs text-purple-900 dark:text-purple-200 space-y-1 ml-4">
                <li>• <strong>Pages</strong> (like <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">page.tsx</code>): What visitors see in their browser</li>
                <li>• <strong>API Routes</strong> (like <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">/api/demo/items/route.ts</code>): Server-side code that runs when clients make requests</li>
                <li>• <strong>Middleware</strong>: Code that checks authentication before requests reach API routes</li>
              </ul>
            </div>

            {/* Redis Explanation */}
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                2. Redis: The Speed Memory
              </p>
              <p className="text-sm text-purple-900 dark:text-purple-200 mb-2">
                When an API route gets a request, it checks Redis first:
              </p>
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded text-xs overflow-x-auto mb-2">
                <code>{`// Check cache first (fast - 2ms)
const cached = await redis.get('cache-key');
if (cached) return cached;

// Not cached - query database (slow - 200ms)
const data = await supabase.from('table').select();

// Save for next time
await redis.setEx('cache-key', 60, data);`}</code>
              </pre>
              <p className="text-xs text-purple-900 dark:text-purple-200">
                This pattern means 90% of requests are instant because they hit the cache.
              </p>
            </div>

            {/* Database Explanation */}
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                3. Supabase: Permanent Storage
              </p>
              <p className="text-sm text-purple-900 dark:text-purple-200 mb-2">
                Supabase is your database. When Redis doesn't have data, the API route queries it:
              </p>
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded text-xs overflow-x-auto mb-2">
                <code>{`// Query from database
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// This is slower (~200ms) but the data is fresh`}</code>
              </pre>
              <p className="text-xs text-purple-900 dark:text-purple-200">
                Row-level security (RLS) ensures users can only access their own data.
              </p>
            </div>

            {/* Request Lifecycle */}
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                4. Complete Request Lifecycle
              </p>
              <ol className="text-xs text-purple-900 dark:text-purple-200 space-y-1 ml-4">
                <li>1. Browser sends request to <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">/api/data</code></li>
                <li>2. Next.js routes to your API route handler</li>
                <li>3. Handler checks Redis: Is data cached?</li>
                <li>4. If yes → Return immediately (2ms)</li>
                <li>5. If no → Query Supabase database (200ms)</li>
                <li>6. Store result in Redis with TTL</li>
                <li>7. Return JSON to browser</li>
                <li>8. Browser updates the page</li>
              </ol>
            </div>

            {/* Docker Note */}
            <div className="p-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                🐳 All Services in Docker
              </p>
              <p className="text-xs text-blue-900 dark:text-blue-300">
                Redis and Supabase run in Docker containers. The app, Redis, and database all communicate securely within a private Docker network.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is the core flow: request comes in → check cache → fetch if needed → return fast.
          The real system also includes security (HTTPS), backups, monitoring, and automatic scaling.
        </p>
      </div>
    </div>
  );
}
