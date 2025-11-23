'use client';

// ============================================================================
// How It Works Component - Simple Visual Diagram
// ============================================================================
// Explains the architecture in simple terms with a visual flow diagram.
// Shows how data moves from the user through the system.

export default function HowItWorks() {
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
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg text-center">
              <div className="text-2xl mb-2">🌐</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Visitor's Browser</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Chrome, Safari, Firefox</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400">→</div>

          {/* Web Server */}
          <div className="flex-1">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Web Server</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Runs your code</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400">→</div>

          {/* Memory System */}
          <div className="flex-1">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Speed Memory</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Redis</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-2xl text-gray-400">→</div>

          {/* Database */}
          <div className="flex-1">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg text-center">
              <div className="text-2xl mb-2">💾</div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Database</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Supabase</p>
            </div>
          </div>
        </div>

        {/* Reverse arrows */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Sends data</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Receives request</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Checks memory first</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Stores safely</p>
          </div>
          <div className="text-xl text-gray-400">←</div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Loads page</p>
          </div>
        </div>
      </div>

      {/* Mobile Flow Diagram (stacked) */}
      <div className="md:hidden mb-8 space-y-3">
        {[
          { icon: '🌐', title: 'Your Visitor', desc: 'Clicks on your website' },
          { icon: '⬇️', title: '', desc: '' },
          { icon: '⚙️', title: 'Web Server', desc: 'Runs your code' },
          { icon: '⬇️', title: '', desc: '' },
          { icon: '⚡', title: 'Speed Memory', desc: 'Checks if we remember this' },
          { icon: '⬇️', title: '', desc: '' },
          { icon: '💾', title: 'Database', desc: 'Gets fresh data if needed' },
          { icon: '⬆️', title: '', desc: '' },
          { icon: '🌐', title: 'Back to Browser', desc: 'Page loads instantly' },
        ].map((item, index) => (
          <div key={index} className="text-center">
            {item.title ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>
            ) : (
              <p className="text-xl">{item.icon}</p>
            )}
          </div>
        ))}
      </div>

      {/* Explanation Boxes */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* What Visitors Experience */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What Visitors See</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Pages load instantly (or very fast)</li>
            <li>• Login works seamlessly</li>
            <li>• Data loads from their account</li>
            <li>• No waiting, no errors</li>
          </ul>
        </div>

        {/* What You Build */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">What You Build</h3>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Your features and designs</li>
            <li>• Your business logic</li>
            <li>• Your rules and workflows</li>
            <li>• Everything that makes you unique</li>
          </ul>
        </div>
      </div>

      {/* Key Concept */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-300">
          <strong>💡 The Key Idea:</strong> The "boring" infrastructure (how data moves, how users log in, how pages serve fast) is already done.
          All these boxes are connected and working. You just build what makes your idea special.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is a simplified view. The real system also includes security (HTTPS padlock), backups,
          monitoring, and automatic scaling. But the core flow is exactly this: request comes in,
          we find or fetch the data, and send it back fast.
        </p>
      </div>
    </div>
  );
}
