'use client';

import { useState } from 'react';
import { neutralAccentBg, cardBgColors, cardBorderColors, headingColors, formInputColors } from '@/lib/colors';
import { accentText } from '@/lib/contrast';

// ============================================================================
// How It Works Component - Simple Visual Diagram
// ============================================================================
// Explains the architecture in simple terms with a visual flow diagram.
// Shows how data moves from the user through the system.

export default function HowItWorks() {
  const [expandDeveloper, setExpandDeveloper] = useState(false);

  return (
    <div className={`${cardBgColors.base} p-6 rounded-xl ${cardBorderColors.light} shadow-sm`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${headingColors.primary} mb-2`}>
          How It Works
        </h2>
        <p className={`text-sm ${formInputColors.helper}`}>
          When someone visits, your app checks recent answers first (lightning fast), then looks them up if needed.
        </p>
      </div>

      {/* Desktop Flow Diagram */}
      <div className="hidden md:block mb-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          {/* Visitor */}
          <div className="flex-1">
            <div className={`p-4 ${neutralAccentBg.blue} border-2 border-blue-200 dark:border-blue-800 rounded-lg text-center`}>
              <div className="text-2xl mb-2" role="img" aria-label="Person visiting">👤</div>
              <p className={`font-semibold ${headingColors.primary} text-sm`}>Your Visitor</p>
              <p className={`text-xs ${formInputColors.helper} mt-1`}>Asks for something</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400" aria-hidden="true">→</div>

          {/* App */}
          <div className="flex-1">
            <div className={`p-4 ${neutralAccentBg.purple} border-2 border-purple-200 dark:border-purple-800 rounded-lg text-center`}>
              <div className="text-2xl mb-2" role="img" aria-label="Your app">🎯</div>
              <p className={`font-semibold ${headingColors.primary} text-sm`}>Your App</p>
              <p className={`text-xs ${formInputColors.helper} mt-1`}>Processes the request</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400" aria-hidden="true">→</div>

          {/* Quick Memory */}
          <div className="flex-1">
            <div className={`p-4 ${neutralAccentBg.gold} border-2 border-gold-200 dark:border-gold-800 rounded-lg text-center`}>
              <div className="text-2xl mb-2" role="img" aria-label="Quick memory">⚡</div>
              <p className={`font-semibold ${headingColors.primary} text-sm`}>Quick Memory</p>
              <p className={`text-xs ${formInputColors.helper} mt-1`}>Recent answers saved here</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400" aria-hidden="true">→</div>

          {/* Storage */}
          <div className="flex-1">
            <div className={`p-4 ${neutralAccentBg.green} border-2 border-green-200 dark:border-green-800 rounded-lg text-center`}>
              <div className="text-2xl mb-2" role="img" aria-label="Permanent storage">💾</div>
              <p className={`font-semibold ${headingColors.primary} text-sm`}>Permanent Storage</p>
              <p className={`text-xs ${formInputColors.helper} mt-1`}>All your data kept safe</p>
            </div>
          </div>
        </div>

        {/* Simple explanation */}
        <div className={`p-4 ${neutralAccentBg.blue} border border-blue-200 dark:border-blue-700 rounded-lg mt-4`}>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            <strong>The Flow:</strong> Your visitor asks → Your app checks Quick Memory → Gets from Permanent Storage if needed → Sends answer back (usually in milliseconds)
          </p>
        </div>
      </div>

      {/* Mobile Flow Diagram (stacked) */}
      <div className="md:hidden mb-8 space-y-3">
        {[
          { icon: '👤', label: 'Person visiting', title: 'Your Visitor', desc: 'Asks for something' },
          { icon: '⬇️', label: 'Arrow down', title: '', desc: '' },
          { icon: '🎯', label: 'Your app', title: 'Your App', desc: 'Processes the request' },
          { icon: '⬇️', label: 'Arrow down', title: '', desc: '' },
          { icon: '⚡', label: 'Quick memory', title: 'Quick Memory', desc: 'Checks recent answers' },
          { icon: '⬇️', label: 'Arrow down', title: '', desc: '' },
          { icon: '💾', label: 'Permanent storage', title: 'Permanent Storage', desc: 'Gets fresh data if needed' },
          { icon: '⬆️', label: 'Arrow up', title: '', desc: '' },
          { icon: '👤', label: 'Person visiting', title: 'Answer Sent', desc: 'Page loads instantly' },
        ].map((item, index) => (
          <div key={index} className="text-center">
            {item.title ? (
              <div className={`p-3 ${neutralAccentBg.gray} ${cardBorderColors.light} rounded-lg`}>
                <div className="text-xl mb-1" role="img" aria-label={item.label}>{item.icon}</div>
                <p className={`font-semibold ${headingColors.primary} text-sm`}>{item.title}</p>
                <p className={`text-xs ${formInputColors.helper} mt-1`}>{item.desc}</p>
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
        <div className={`p-4 ${neutralAccentBg.blue} border border-blue-300 dark:border-blue-700 rounded-lg`}>
          <h3 className={`font-semibold ${accentText.blue} dark:text-white mb-2`}>What Your Visitors Experience</h3>
          <ul className={`text-sm ${accentText.blue} dark:text-gray-100 space-y-1`}>
            <li>• Everything loads super fast</li>
            <li>• Login is simple and safe</li>
            <li>• Their information appears instantly</li>
            <li>• Zero frustration, zero waiting</li>
          </ul>
        </div>

        {/* What You Create */}
        <div className={`p-4 ${neutralAccentBg.purple} border border-purple-300 dark:border-purple-700 rounded-lg`}>
          <h3 className={`font-semibold ${accentText.purple} dark:text-white mb-2`}>What You Create</h3>
          <ul className={`text-sm ${accentText.purple} dark:text-gray-100 space-y-1`}>
            <li>• Your unique features</li>
            <li>• How your app works</li>
            <li>• Your special rules</li>
            <li>• Everything that's uniquely yours</li>
          </ul>
        </div>
      </div>

      {/* Key Concept */}
      <div className={`p-4 ${neutralAccentBg.green} border border-green-300 dark:border-green-700 rounded-lg mb-6`}>
        <p className={`text-sm ${accentText.emerald} dark:text-gray-100`}>
          <strong><span role="img" aria-label="Tip">💡</span> The Key Idea:</strong> All the technical plumbing (how requests travel, how logins work, how your app stays fast) is already built and connected.
          You focus on what matters: your features, your design, and what makes your app special.
        </p>
      </div>

      {/* Security Layer Explanation */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>How Your Data Stays Safe</h3>
        <div className="space-y-3">
          {[
            {
              title: 'Your Visitor ↔ Your App',
              icon: '🔒',
              description: 'Think of it like sealed mail. Data travels in locked envelopes. Even if someone intercepts it, they can\'t read it. It\'s just scrambled letters.',
            },
            {
              title: 'Your App ↔ Permanent Storage',
              icon: '🔐',
              description: 'Private hallway. Your servers talk directly to storage in a private pathway. No one on the internet can see or intercept it.',
            },
            {
              title: 'Passwords Stay Hidden',
              icon: '🚫',
              description: 'Passwords are like fingerprints, converted into a unique pattern. Even if someone steals all the data, they get just the patterns. Passwords can never be revealed.',
            },
            {
              title: 'Login Tokens (Proof of Identity)',
              icon: '🎫',
              description: 'Like a temporary ID badge. After login, you get a badge that proves you\'re you. It expires automatically. You don\'t send your password repeatedly. Just the badge.',
            },
          ].map((item, index) => (
            <div key={index} className={`p-3 ${neutralAccentBg.gray} ${cardBorderColors.light} rounded-lg`}>
              <div className="flex gap-3">
                <div className="text-xl flex-shrink-0">{item.icon}</div>
                <div>
                  <p className={`font-semibold ${headingColors.primary} text-sm`}>{item.title}</p>
                  <p className={`text-xs ${formInputColors.helper} mt-1`}>{item.description}</p>
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
          className={`w-full text-left p-4 ${neutralAccentBg.purple} border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          <div className="flex items-center justify-between">
            <p className={`font-semibold ${accentText.purple} dark:text-white`}>
              For Developers: Technical Details
            </p>
            <span className={`text-lg transition-transform ${expandDeveloper ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </button>

        {expandDeveloper && (
          <div className={`mt-4 space-y-4 p-4 ${neutralAccentBg.purple} rounded-lg border border-purple-200 dark:border-purple-700`}>
            {/* Next.js Explanation */}
            <div>
              <p className={`font-semibold ${accentText.purple} dark:text-purple-300 mb-2`}>
                1. Next.js: Frontend & Backend in One
              </p>
              <p className={`text-sm ${accentText.purple} dark:text-gray-100 mb-2`}>
                Your app runs on a single server. The <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded text-xs">/app</code> directory contains:
              </p>
              <ul className={`text-xs ${accentText.purple} dark:text-gray-100 space-y-1 ml-4`}>
                <li>• <strong>Pages</strong> (like <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">page.tsx</code>): What visitors see in their browser</li>
                <li>• <strong>API Routes</strong> (like <code className="bg-purple-200 dark:bg-purple-800 px-1 rounded">/api/demo/items/route.ts</code>): Server-side code that runs when clients make requests</li>
                <li>• <strong>Middleware</strong>: Code that checks authentication before requests reach API routes</li>
              </ul>
            </div>

            {/* Redis Explanation */}
            <div>
              <p className={`font-semibold ${accentText.purple} dark:text-purple-300 mb-2`}>
                2. Quick Memory (Redis): Keep Recent Answers Ready
              </p>
              <p className={`text-sm ${accentText.purple} dark:text-gray-100 mb-2`}>
                Instead of going to the permanent storage every time, we keep frequently-requested answers on a fast "counter" so people don't wait:
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
              <p className={`text-xs ${accentText.purple} dark:text-gray-100`}>
                This pattern means 90% of requests are instant because they hit the cache.
              </p>
            </div>

            {/* Database Explanation */}
            <div>
              <p className={`font-semibold ${accentText.purple} dark:text-purple-300 mb-2`}>
                3. Permanent Storage (Supabase): Long-Term Memory
              </p>
              <p className={`text-sm ${accentText.purple} dark:text-gray-100 mb-2`}>
                This is where all your actual data lives, organized and protected. When Quick Memory doesn't have something, we fetch it here:
              </p>
              <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded text-xs overflow-x-auto mb-2">
                <code>{`// Query from database
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// This is slower (~200ms) but the data is fresh`}</code>
              </pre>
              <p className={`text-xs ${accentText.purple} dark:text-gray-100`}>
                Security is built-in: Each user automatically sees only their own data. Your mom's information stays separate from your information.
              </p>
            </div>

            {/* Request Lifecycle */}
            <div>
              <p className={`font-semibold ${accentText.purple} dark:text-purple-300 mb-2`}>
                4. What Happens When Someone Requests Something
              </p>
              <ol className={`text-xs ${accentText.purple} dark:text-gray-100 space-y-1 ml-4`}>
                <li>1. Your visitor asks your app for something</li>
                <li>2. Your app checks Quick Memory: "Do I remember this?"</li>
                <li>3. If yes: Instant answer (2 milliseconds)</li>
                <li>4. If no: Look it up in Permanent Storage (200 milliseconds)</li>
                <li>5. Save the answer in Quick Memory for next time</li>
                <li>6. Send the answer back to the visitor</li>
                <li>7. Page loads and displays</li>
              </ol>
            </div>

            {/* Cloud Services Note */}
            <div className={`p-3 ${neutralAccentBg.blue} border border-blue-200 dark:border-blue-700 rounded`}>
              <p className={`text-xs font-semibold ${accentText.blue} dark:text-white mb-1`}>
                ☁️ Cloud Infrastructure
              </p>
              <p className={`text-xs ${accentText.blue} dark:text-gray-100`}>
                Redis (Upstash) and Supabase run as managed cloud services. The app communicates securely with these services over encrypted connections.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className={`text-xs ${formInputColors.helper}`}>
          <strong>In a nutshell:</strong> When someone visits, your app asks itself "Do I remember this?" If yes, answer instantly. If no, look it up and remember it for next time. Everything is encrypted and protected so only the right person sees their information.
        </p>
      </div>
    </div>
  );
}
