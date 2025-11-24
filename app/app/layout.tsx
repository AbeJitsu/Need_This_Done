import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import DarkModeToggle from '@/components/DarkModeToggle';
import { AuthProvider } from '@/context/AuthContext';

// ============================================================================
// Root Layout Component
// ============================================================================
// This wraps around every page in the application
// Think of it as the restaurant's walls, floor, and ceiling
// Everything visible on every page is here: navigation, footer, fonts, etc
//
// What's special about this file:
// - It's a server component by default (powerful, secure)
// - Metadata defined here applies to all pages
// - Styles and fonts loaded here apply everywhere
// - Good place for navigation, footer, and other persistent UI

// Define metadata for SEO and browser tab
// This appears in search results and the browser tab
export const metadata: Metadata = {
  title: 'Full-Stack Template',
  description: 'A production-ready full-stack web application',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Optional: Add custom fonts, analytics, etc here */}
      </head>
      <body>
        <AuthProvider>
          {/* Skip to main content link for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:bg-blue-600 focus:text-white focus:p-2 focus:z-50"
          >
            Skip to main content
          </a>

          {/* Top-right corner: Dark mode toggle */}
          <div className="fixed top-4 right-4 z-50">
            <DarkModeToggle />
          </div>

          {/* Site-wide navigation */}
          <Navigation />

          {/* Page content */}
          <main id="main-content">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
