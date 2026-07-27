'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { DEFAULT_LAYOUT_CONTENT, type NavLink } from '@/lib/page-config';
// import DarkModeToggle from './DarkModeToggle'; // Temporarily disabled
import { CloseIcon } from '@/components/ui/icons';
import { ContentValue } from '@/components/content/ContentStructure';

// ============================================================================
// Navigation Component - Persistent Site Navigation
// ============================================================================
// Appears on every page. Shows current page and links to all pages.
// Uses Next.js Link for fast client-side navigation.
// Active link is highlighted based on current URL.
// Shows login link or user dropdown based on auth state.
// In edit mode, brand, nav links, and CTA can be edited inline.

// Fallback navigation links (used if layout content not loaded)
const defaultNavLinks: NavLink[] = [
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/site-analyzer', label: 'Free Site Audit' },
  { href: '/how-it-works', label: 'How It Works' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get header content from layoutContent or use defaults
  const headerContent = DEFAULT_LAYOUT_CONTENT.header;
  const navigationLinks = headerContent.navLinks || defaultNavLinks;

  // ============================================================================
  // Close Dropdown When Clicking Outside
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDropdown) setShowDropdown(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };

    // Handle both mouse and touch events for mobile support
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown, mobileMenuOpen]);

  // ============================================================================
  // Handle Logout
  // ============================================================================

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut();
    router.push('/login');
  };

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home Link - Editable in edit mode */}
          <Link
            href="/"
            className="flex-shrink-0 font-bold text-xl text-gray-900 hover:opacity-80 transition-opacity mr-6"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            <ContentValue path="_layout.header.brand">
              <span>{headerContent.brand}</span>
            </ContentValue>
          </Link>

          {/* Navigation Links + Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Page Links - hidden on mobile/tablet */}
            <div className="hidden lg:flex gap-1">
              {navigationLinks.map((link, index) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                      ${
                        isActive
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <ContentValue path={`_layout.header.navLinks.${index}.label`}>
                      <span>{link.label}</span>
                    </ContentValue>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Hamburger Button - hidden on desktop */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen ? "true" : "false"}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <CloseIcon size="lg" aria-hidden={true} />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Contact CTA - Primary conversion action (emerald pill) */}
            <Link
              href={headerContent.ctaButton.href}
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 hover:scale-105 active:scale-95 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <ContentValue
                path="_layout.header.ctaButton.text"
                hrefPath="_layout.header.ctaButton.href"
                href={headerContent.ctaButton.href}
              >
                <span>{headerContent.ctaButton.text}</span>
              </ContentValue>
            </Link>

            {/* Mobile Sign In Icon - visible on small screens when not authenticated */}
            {!isAuthenticated && !isLoading && (
              <Link
                href="/login"
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                aria-label="Sign in"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Dark Mode Toggle - TEMPORARILY HIDDEN until dark mode colors are fixed */}
            {/* <div className="hidden sm:block">
              <DarkModeToggle />
            </div> */}

            {/* Auth Section - Less prominent, for returning customers */}
            <div className="flex-shrink-0">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : isAuthenticated ? (
                // Logged In - User Dropdown
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-haspopup="true"
                    aria-expanded={showDropdown ? "true" : "false"}
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/blog"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Manage Blog
                          </Link>
                          <Link
                            href="/admin/users"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Manage Users
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
                  className="hidden sm:inline-flex text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ContentValue path="_layout.header.signInText">
                    <span>{headerContent.signInText}</span>
                  </ContentValue>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - slides down when hamburger is clicked */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-gray-200/60 bg-white/80 backdrop-blur-md animate-slide-up">
          <nav aria-label="Mobile navigation" className="px-4 py-3 space-y-1">
            {navigationLinks.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-3 py-2 text-base font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? 'text-gray-900 bg-gray-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <ContentValue path={`_layout.header.navLinks.${index}.label`}>
                    <span>{link.label}</span>
                  </ContentValue>
                </Link>
              );
            })}

            {/* Primary CTA in mobile menu - emerald pill */}
            <Link
              href={headerContent.ctaButton.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 mt-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/25 text-center"
            >
              <ContentValue path="_layout.header.ctaButton.text">
                <span>{headerContent.ctaButton.text}</span>
              </ContentValue>
            </Link>

            {/* Dark Mode Toggle in mobile menu */}
            {/* Dark Mode Toggle - TEMPORARILY HIDDEN until dark mode colors are fixed */}
            {/* <div className="flex items-center justify-between px-3 py-2 sm:hidden">
              <span className={`text-sm ${navigationColors.link}`}>Dark Mode</span>
              <DarkModeToggle />
            </div> */}

            {/* Auth options for mobile */}
            {!isAuthenticated ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ContentValue path="_layout.header.signInText">
                  <span>{headerContent.signInText}</span>
                </ContentValue>
              </Link>
            ) : (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="px-3 py-2 text-xs text-gray-500">
                  Signed in as {user?.email}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={"block px-3 py-2 text-sm text-gray-600 hover:text-gray-900"}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/blog"
                    onClick={() => setMobileMenuOpen(false)}
                    className={"block px-3 py-2 text-sm text-gray-600 hover:text-gray-900"}
                  >
                    Manage Blog
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
}
