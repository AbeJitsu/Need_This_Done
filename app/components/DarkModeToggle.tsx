'use client';

import { useEffect, useState } from 'react';

// ============================================================================
// Dark Mode Toggle Component
// ============================================================================
// Provides manual dark/light mode switching with localStorage persistence
// Overrides system preference when user makes explicit choice
// Floating button in top-right corner with sun/moon icons

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // ========================================================================
  // Initialize dark mode from localStorage or system preference
  // ========================================================================
  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);

    // Check localStorage first (user preference)
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      setDarkMode(stored === 'true');
    } else {
      // Fall back to system preference
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // ========================================================================
  // Apply dark mode class to HTML element
  // ========================================================================
  useEffect(() => {
    if (darkMode === null) return;

    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // ========================================================================
  // Toggle handler
  // ========================================================================
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted || darkMode === null) return null;

  return (
    <button
      onClick={toggleDarkMode}
      className="
        fixed top-6 right-6 z-50
        p-3 rounded-lg
        bg-white dark:bg-gray-800
        border-2 border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-gray-100
        hover:bg-gray-50 dark:hover:bg-gray-700
        hover:border-gray-300 dark:hover:border-gray-600
        transition-all duration-200
        shadow-lg hover:shadow-xl
        active:scale-95
        min-h-[44px] min-w-[44px]
        flex items-center justify-center
      "
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Light mode' : 'Dark mode'}
    >
      {darkMode ? (
        // Sun icon - click to switch to light mode
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon - click to switch to dark mode
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
