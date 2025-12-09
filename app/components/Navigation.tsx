'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import DarkModeToggle from './DarkModeToggle';

// ============================================================================
// Navigation Component - Persistent Site Navigation
// ============================================================================
// Appears on every page. Shows current page and links to all pages.
// Uses Next.js Link for fast client-side navigation.
// Active link is highlighted based on current URL.
// Shows login link or user dropdown based on auth state.

// Main navigation links (excludes Contact - that's now the primary CTA)
const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/get-started', label: 'Get Started' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Close Dropdown When Clicking Outside
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // Handle Logout
  // ============================================================================

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home Link */}
          <Link
            href="/"
            className="flex-shrink-0 font-semibold text-xl text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mr-6"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Need This Done
          </Link>

          {/* Navigation Links + Auth */}
          <div className="flex items-center gap-4">
            {/* Desktop Page Links - hidden on mobile/tablet */}
            <div className="hidden lg:flex gap-1">
              {navigationLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors transition-transform border
                      ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-blue-500 dark:border-blue-400 hover:text-blue-800 hover:scale-[1.05] dark:hover:text-blue-900'
                          : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Hamburger Button - hidden on desktop */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen ? "true" : "false"}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Get a Quote CTA - Primary conversion action */}
            <Link
              href="/contact"
              className={`
                hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors border
                bg-orange-100 text-orange-800 border-orange-500 dark:border-orange-400
                hover:text-orange-900 hover:border-orange-600 dark:hover:border-orange-300
              `}
            >
              Get a Quote
            </Link>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Auth Section - Less prominent, for returning customers */}
            <div className="flex-shrink-0">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : isAuthenticated ? (
                // Logged In - User Dropdown
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-400 dark:bg-gray-600 text-white flex items-center justify-center text-xs font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/users"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Manage Users
                          </Link>
                          <Link
                            href="/admin/dev"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Dev Dashboard
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Logged Out - Subtle login link for returning customers
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - slides down when hamburger is clicked */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            {navigationLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-3 py-2 text-base font-medium rounded-md transition-colors border
                    ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-blue-500 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Primary CTA in mobile menu */}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium rounded-md transition-colors mt-2 border bg-orange-100 text-orange-800 border-orange-500 dark:border-orange-400 hover:text-orange-900 hover:border-orange-600 dark:hover:border-orange-300"
            >
              Get a Quote
            </Link>

            {/* Sign in link for mobile */}
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
