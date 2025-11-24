'use client';

import { useState } from 'react';

// ============================================================================
// Technical Flow Component - How the System Works Under the Hood
// ============================================================================
// This component breaks down the request flow into 5 clear steps:
// 1. Frontend/Backend Separation (how Next.js works)
// 2. Cache Check (Redis)
// 3. Database Query (Supabase)
// 4. Response & Storage (updating the cache)
// 5. Back to Browser (result delivered)
//
// Goal: Help developers understand exactly what happens when a visitor
// interacts with your app—no magic, just clear logic.

interface Step {
  number: number;
  title: string;
  description: string;
  detail: string;
  icon: string;
  codeExample: string;
  color: 'blue' | 'purple' | 'orange' | 'red' | 'green';
}

export default function TechnicalFlow() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // ========================================================================
  // The 5-step request flow
  // ========================================================================
  const steps: Step[] = [
    {
      number: 1,
      title: 'Browser Sends Request',
      description: 'Visitor clicks something in their browser. The request travels over HTTPS (secure tunnel) to your server.',
      detail: 'When you visit a website, your browser sends a request. HTTPS means the data is encrypted—even if someone intercepts it, they see gibberish.',
      icon: '🌐',
      codeExample: `// Browser sends request to API route
fetch('/api/data', { method: 'GET' })
  .then(res => res.json())
  .then(data => console.log(data))`,
      color: 'blue',
    },
    {
      number: 2,
      title: 'Next.js Routes It',
      description: 'Your Next.js server receives the request. It routes it to the right API handler based on the URL path.',
      detail: 'Next.js separates frontend and backend. In the /app/api/ folder, you write "route handlers" that execute on the server. When a request comes in, Next.js finds the matching route and runs your code.',
      icon: '⚙️',
      codeExample: `// File: /app/api/data/route.ts (runs on server)
export async function GET(request: Request) {
  // This code only runs on the server, not in browser
  const data = await fetchData();
  return NextResponse.json(data);
}`,
      color: 'purple',
    },
    {
      number: 3,
      title: 'Check Cache (Redis)',
      description: 'Before querying the database, check Redis (in-memory cache). If the data is there, return it instantly.',
      detail: 'Redis is like a whiteboard in your kitchen. You write data there temporarily so you can grab it super fast. Instead of going to the filing cabinet (database) every time, you check the whiteboard first.',
      icon: '⚡',
      codeExample: `// Check Redis first (very fast)
const cacheKey = 'user_data:123';
const cached = await redis.get(cacheKey);

if (cached) {
  // Cache hit! Return immediately
  return NextResponse.json(JSON.parse(cached));
}
// Cache miss, continue to database...`,
      color: 'orange',
    },
    {
      number: 4,
      title: 'Query Database (Supabase)',
      description: 'If not in cache, query Supabase. Get the fresh data, save it to Redis for next time, then return it.',
      detail: 'Supabase is your database (filing cabinet). It permanently stores data. Since database queries are slower, we cache the result in Redis so future requests are instant.',
      icon: '💾',
      codeExample: `// Cache miss - fetch from database
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 123)
  .single();

// Save to Redis for 1 hour
await redis.setEx(cacheKey, 3600, JSON.stringify(data));

return NextResponse.json(data);`,
      color: 'red',
    },
    {
      number: 5,
      title: 'Return Response',
      description: 'Send the data back to the browser as JSON. The browser updates the page with the new data.',
      detail: 'The client-side code (JavaScript in the browser) receives the JSON response and updates what the visitor sees. This all happens seamlessly.',
      icon: '✓',
      codeExample: `// Browser receives response
// Code already sent (fetch above)
  .then(res => res.json())
  .then(data => {
    // Update the page with new data
    document.getElementById('content').innerHTML = data.text;
  })`,
      color: 'green',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: {
        bg: 'bg-blue-600 dark:bg-blue-500',
        border: 'border-blue-200 dark:border-blue-700',
        text: 'text-blue-900 dark:text-blue-300',
        light: 'bg-blue-50 dark:bg-blue-900/20',
      },
      purple: {
        bg: 'bg-purple-600 dark:bg-purple-500',
        border: 'border-purple-200 dark:border-purple-700',
        text: 'text-purple-900 dark:text-purple-300',
        light: 'bg-purple-50 dark:bg-purple-900/20',
      },
      orange: {
        bg: 'bg-orange-600 dark:bg-orange-500',
        border: 'border-orange-200 dark:border-orange-700',
        text: 'text-orange-900 dark:text-orange-300',
        light: 'bg-orange-50 dark:bg-orange-900/20',
      },
      red: {
        bg: 'bg-red-600 dark:bg-red-500',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-900 dark:text-red-300',
        light: 'bg-red-50 dark:bg-red-900/20',
      },
      green: {
        bg: 'bg-green-600 dark:bg-green-500',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-900 dark:text-green-300',
        light: 'bg-green-50 dark:bg-green-900/20',
      },
    };
    return colorMap[color];
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          How It Actually Works (Technical)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Here's the exact flow when a visitor interacts with your app. Click each step to see the code.
        </p>
      </div>

      {/* Step-by-Step Flow */}
      <div className="space-y-4 mb-8">
        {steps.map((step, index) => {
          const colors = getColorClasses(step.color);
          const isExpanded = expandedStep === step.number;

          return (
            <div key={step.number}>
              {/* Step Header - Clickable */}
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${colors.light} ${colors.border}
                  hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon and Number */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${colors.bg}`}>
                        {step.icon}
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${colors.text}`}>
                        Step {step.number}: {step.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div className={`text-lg flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </div>
              </button>

              {/* Expanded Detail Section */}
              {isExpanded && (
                <div className={`mt-2 p-4 rounded-lg border ${colors.border} ${colors.light}`}>
                  {/* Explanation */}
                  <div className="mb-4">
                    <p className={`text-sm ${colors.text} leading-relaxed`}>
                      {step.detail}
                    </p>
                  </div>

                  {/* Code Example */}
                  <div>
                    <p className={`text-xs font-semibold ${colors.text} mb-2`}>
                      Code Example:
                    </p>
                    <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                      <code>{step.codeExample}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Arrow between steps (except after last) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="text-xl text-gray-400">⬇️</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Takeaway */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong><span role="img" aria-label="Key point">🔑</span> The Pattern:</strong> Every request follows this pattern: Check cache first → Fetch if needed → Store for next time.
          This makes pages feel instant while keeping your database from being overwhelmed.
        </p>
      </div>

      {/* Performance Explanation */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
          <span role="img" aria-label="Performance tip">⚡</span> Why This Is Fast:
        </p>
        <ul className="text-sm text-green-900 dark:text-green-300 space-y-1">
          <li>• <strong>Cache hit</strong> (Redis): ~2ms response time</li>
          <li>• <strong>Cache miss</strong> (database): ~200ms response time</li>
          <li>• Typical: 90% of requests hit cache = pages feel instant</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is what your API routes do behind the scenes. You don't need to understand every detail to use this template—but understanding the pattern helps you build faster features.
        </p>
      </div>
    </div>
  );
}
