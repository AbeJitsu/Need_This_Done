'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useInlineEdit } from '@/context/InlineEditContext';
import { signOut } from '@/lib/auth';
import { navigationColors, accentColors, accentBorderWidth, accentFontWeight, getBadgeColor, cardBgColors, cardBorderColors } from '@/lib/colors';
import { DEFAULT_LAYOUT_CONTENT, type LayoutContent, type NavLink } from '@/lib/page-config';
// import DarkModeToggle from './DarkModeToggle'; // Temporarily disabled
import { CloseIcon } from '@/components/ui/icons';
import { Editable } from '@/components/InlineEditor';

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
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/guide', label: 'Guide' },
  { href: '/pricing', label: 'Pricing' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { itemCount } = useCart();
  const { layoutContent } = useInlineEdit();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get header content from layoutContent or use defaults
  const headerContent = (layoutContent as LayoutContent | null)?.header || DEFAULT_LAYOUT_CONTENT.header;
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

    // Handle both mouse and touch events for mobile support
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
    <nav aria-label="Main navigation" className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home Link - Editable in edit mode */}
          <Link
            href="/"
            className="flex-shrink-0 font-semibold text-xl text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mr-6"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            <Editable path="_layout.header.brand">
              <span>{headerContent.brand}</span>
            </Editable>
          </Link>

          {/* Navigation Links + Auth */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-hidden">
            {/* Desktop Page Links - hidden on mobile/tablet */}
            <div className="hidden lg:flex gap-1">
              {navigationLinks.map((link, index) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors transition-transform
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                      ${
                        isActive
                          ? `${accentBorderWidth} ${accentColors.blue.bg} ${accentColors.blue.text} ${accentColors.blue.border} ${accentColors.blue.hoverText} ${accentColors.blue.hoverBorder}`
                          : `border border-transparent ${navigationColors.link} ${navigationColors.linkHover}`
                      }
                    `}
                  >
                    <Editable path={`_layout.header.navLinks.${index}.label`}>
                      <span>{link.label}</span>
                    </Editable>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Hamburger Button - hidden on desktop */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 ${navigationColors.link} ${navigationColors.linkHover} transition-colors`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen ? "true" : "false"}
            >
              {mobileMenuOpen ? (
                <CloseIcon size="lg" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Get a Quote CTA - Primary conversion action */}
            {/* Uses accentColors.gold with inversion pattern (light bg→dark bg) */}
            {/* Same pattern as blue navigation links for consistency */}
            <Link
              href={headerContent.ctaButton.href}
              className={`
                hidden sm:inline-flex items-center px-3 py-2 text-sm ${accentFontWeight} rounded-full whitespace-nowrap transition-all duration-300 hover:scale-105 active:scale-95
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                ${accentBorderWidth} ${accentColors.gold.bg} ${accentColors.gold.text} ${accentColors.gold.border} ${accentColors.gold.hoverText} ${accentColors.gold.hoverBorder}
              `}
            >
              <Editable
                path="_layout.header.ctaButton.text"
                hrefPath="_layout.header.ctaButton.href"
                href={headerContent.ctaButton.href}
              >
                <span>{headerContent.ctaButton.text}</span>
              </Editable>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className={`relative p-2 ${navigationColors.link} ${navigationColors.linkHover} transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900`}
              aria-label={itemCount > 0 ? `Shopping cart with ${itemCount} items` : 'Shopping cart'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className={`absolute top-0 -right-1 ${getBadgeColor('red')} text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none`}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Sign In Icon - visible on small screens when not authenticated */}
            {!isAuthenticated && !isLoading && (
              <Link
                href="/login"
                className={`sm:hidden p-2 ${navigationColors.link} ${navigationColors.linkHover} transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900`}
                aria-label="Sign in"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : isAuthenticated ? (
                // Logged In - User Dropdown
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium ${navigationColors.userButton} ${navigationColors.userButtonHover} rounded-md transition-colors`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-400 dark:bg-gray-600 text-white flex items-center justify-center text-xs font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>

                  {showDropdown && (
                    <div className={`absolute right-0 mt-2 w-48 ${cardBgColors.base} rounded-lg shadow-lg ${cardBorderColors.light} py-1 z-50`}>
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className={`text-xs ${navigationColors.dropdownHelper}`}>Signed in as</p>
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
                            href="/admin/blog"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Manage Blog
                          </Link>
                          <Link
                            href="/admin/appointments"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Appointments
                          </Link>
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
                  className={`hidden sm:inline-flex text-xs ${navigationColors.signIn} ${navigationColors.signInHover} transition-colors`}
                >
                  <Editable path="_layout.header.signInText">
                    <span>{headerContent.signInText}</span>
                  </Editable>
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
            {navigationLinks.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-3 py-2 text-base font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? `${accentBorderWidth} ${accentColors.blue.bg} ${accentColors.blue.text} ${accentColors.blue.border} ${accentColors.blue.hoverText} ${accentColors.blue.hoverBorder}`
                        : `border border-transparent ${navigationColors.link} hover:bg-gray-100 dark:hover:bg-gray-800 ${navigationColors.linkHover}`
                    }
                  `}
                >
                  <Editable path={`_layout.header.navLinks.${index}.label`}>
                    <span>{link.label}</span>
                  </Editable>
                </Link>
              );
            })}

            {/* Primary CTA in mobile menu - uses accentColors.gold with inversion pattern */}
            <Link
              href={headerContent.ctaButton.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-base ${accentFontWeight} rounded-full transition-all duration-300 hover:scale-105 active:scale-95 mt-2 ${accentBorderWidth} ${accentColors.gold.bg} ${accentColors.gold.text} ${accentColors.gold.border} ${accentColors.gold.hoverText} ${accentColors.gold.hoverBorder}`}
            >
              <Editable path="_layout.header.ctaButton.text">
                <span>{headerContent.ctaButton.text}</span>
              </Editable>
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
                className={`block px-3 py-2 text-sm ${navigationColors.signIn} ${navigationColors.signInHover}`}
              >
                <Editable path="_layout.header.signInText">
                  <span>{headerContent.signInText}</span>
                </Editable>
              </Link>
            ) : (
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  Signed in as {user?.email}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm ${navigationColors.link} ${navigationColors.linkHover}`}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/blog"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 text-sm ${navigationColors.link} ${navigationColors.linkHover}`}
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
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
