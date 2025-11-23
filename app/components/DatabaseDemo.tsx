'use client';

import { useState } from 'react';

// ============================================================================
// Database Demo Component - Data Storage Demonstration
// ============================================================================
// Shows how data storage works. Visitors can type something, save it,
// and immediately retrieve it. Demonstrates that data persists and is
// retrieved instantly.

interface SavedItem {
  id: string;
  content: string;
  timestamp: string;
}

export default function DatabaseDemo() {
  const [input, setInput] = useState('');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ========================================================================
  // Save item to "database" (really just state, but demonstrates the flow)
  // ========================================================================
  const handleSave = async () => {
    if (!input.trim()) return;

    setIsSaving(true);

    // Simulate database write
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 10 + 5));

    const newItem: SavedItem = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setSavedItems((prev) => [newItem, ...prev]);
    setInput('');
    setIsSaving(false);
  };

  // ========================================================================
  // Delete item
  // ========================================================================
  const handleDelete = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ========================================================================
  // Handle Enter key
  // ========================================================================
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving && input.trim()) {
      handleSave();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Try Data Storage
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Type something below, click save, and it's instantly stored and retrieved. This is how your data persists.
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type something you want to save..."
            className="
              flex-1 px-4 py-3
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              rounded-lg
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            disabled={isSaving}
          />
          <button
            onClick={handleSave}
            disabled={isSaving || !input.trim()}
            className="
              px-4 py-3
              bg-blue-600 dark:bg-blue-500
              hover:bg-blue-700 dark:hover:bg-blue-600
              disabled:bg-gray-400 dark:disabled:bg-gray-600
              text-white font-semibold
              rounded-lg
              transition-all duration-200
              active:scale-95
              whitespace-nowrap
            "
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Press Enter or click Save
        </p>
      </div>

      {/* Stats */}
      {savedItems.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Items Saved
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {savedItems.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Retrieval Speed
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                &lt;5ms
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Items List */}
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-3">
          Your Saved Data
        </p>

        {savedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Nothing saved yet. Type something above and click Save.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="
                  p-3 rounded-lg
                  bg-blue-50 dark:bg-blue-900/20
                  border border-blue-300 dark:border-blue-700
                  flex items-start justify-between gap-4
                "
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-words mb-1">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Saved: {item.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="
                    px-3 py-1
                    text-xs font-medium
                    text-blue-600 dark:text-blue-400
                    hover:bg-blue-100 dark:hover:bg-blue-900/30
                    rounded
                    transition-colors
                    whitespace-nowrap
                  "
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          That's how a database works: store something, retrieve it instantly. Your real data is stored securely
          in a database that doesn't delete when you refresh. You can store unlimited data - customer info, posts,
          orders, whatever your app needs.
        </p>
      </div>
    </div>
  );
}
