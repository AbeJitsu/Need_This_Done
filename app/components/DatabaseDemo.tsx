'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// Database Demo Component - Data Storage Demonstration
// ============================================================================
// Shows how data storage works. Visitors can type something, save it,
// and immediately retrieve it. Demonstrates real database persistence.
//
// This demo uses a real API endpoint (/api/demo/items) that:
// 1. Saves data to Supabase (real database)
// 2. Checks Redis cache on retrieval
// 3. Shows the flow trace so visitors understand what just happened

interface SavedItem {
  id: string;
  content: string;
  timestamp: string;
}

interface FlowTrace {
  action: string;
  source: 'cache' | 'database' | 'client';
  duration: number;
  message: string;
}

export default function DatabaseDemo() {
  const [input, setInput] = useState('');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const [flowTrace, setFlowTrace] = useState<FlowTrace[]>([]);

  // ========================================================================
  // Load items on mount
  // ========================================================================
  useEffect(() => {
    loadItems();
  }, []);

  // ========================================================================
  // Load items from the real API
  // ========================================================================
  const loadItems = async () => {
    setIsLoading(true);
    setFlowTrace([]);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/demo/items', { method: 'GET' });
      const data = await response.json();
      const duration = Math.round(performance.now() - startTime);

      setSavedItems(data.items || []);

      // Record the flow trace
      setFlowTrace([
        {
          action: 'Fetch Items',
          source: data.source,
          duration,
          message: data.message,
        },
      ]);
    } catch (error) {
      console.error('Failed to load items:', error);
      setFlowTrace([
        {
          action: 'Fetch Items',
          source: 'client',
          duration: 0,
          message: 'Failed to load items',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // Save item to the real API
  // ========================================================================
  const handleSave = async () => {
    if (!input.trim()) return;

    setIsSaving(true);
    setFlowTrace([]);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/demo/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });

      await response.json();
      const duration = Math.round(performance.now() - startTime);

      if (response.ok) {
        // After saving, reload the list
        await loadItems();

        setInput('');
        setFlowTrace((prev) => [
          {
            action: 'Save Item',
            source: 'database',
            duration,
            message: 'Item saved to database',
          },
          ...prev,
        ]);
      } else {
        setFlowTrace([
          {
            action: 'Save Item',
            source: 'client',
            duration,
            message: 'Failed to save item',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to save item:', error);
      setFlowTrace([
        {
          action: 'Save Item',
          source: 'client',
          duration: 0,
          message: 'Error saving item',
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================================================
  // Delete item
  // ========================================================================
  const handleDelete = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    setFlowTrace([
      {
        action: 'Delete Item',
        source: 'client',
        duration: 0,
        message: 'Item deleted (local demo)',
      },
    ]);
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
          Try Data Storage (Real Database)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Type something, click save, and it gets stored in a real database. You'll see exactly what happened behind the scenes.
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
              focus:outline-none focus:ring-2 focus:ring-blue-500
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

      {/* Flow Trace - Shows what just happened */}
      {flowTrace.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">
            What Just Happened:
          </p>
          {flowTrace.map((trace, index) => {
            const sourceColor =
              trace.source === 'cache'
                ? 'bg-orange-50 dark:bg-gray-700 border-orange-200 dark:border-gray-600'
                : trace.source === 'database'
                ? 'bg-green-50 dark:bg-gray-700 border-green-200 dark:border-gray-600'
                : 'bg-blue-50 dark:bg-gray-700 border-blue-200 dark:border-gray-600';

            const textColor =
              trace.source === 'cache'
                ? 'text-orange-900 dark:text-orange-300'
                : trace.source === 'database'
                ? 'text-green-900 dark:text-green-300'
                : 'text-blue-900 dark:text-blue-300';

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${sourceColor}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${textColor}`}>
                      {trace.action}
                    </p>
                    <p className={`text-xs ${textColor} mt-1`}>
                      {trace.message}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-mono ${textColor}`}>
                      {trace.duration}ms
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {savedItems.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Items in Database
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {savedItems.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Status
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✓
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
                  bg-blue-50 dark:bg-gray-700
                  border border-blue-200 dark:border-gray-600
                  flex items-start justify-between gap-4
                "
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-words mb-1 font-medium">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
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
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            What's Happening:
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• When you save, it goes to Supabase (real database) and gets stored permanently</li>
            <li>• When you load the page, the API checks Redis cache first (fast)</li>
            <li>• If cache miss, it queries Supabase database (slower, but still fast)</li>
            <li>• The flow trace shows you exactly what happened and how long it took</li>
          </ul>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is the cache-first pattern: check memory first (2ms), fall back to database (200ms), save for next time.
          That's how your app stays fast even with thousands of users.
        </p>
      </div>
    </div>
  );
}
