import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { StripeProvider } from '@/context/StripeContext';
import { ChatbotWidget, PageIndexer } from '@/components/chatbot';

// Inter font - modern, trustworthy, highly readable (body text)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Poppins font - geometric, authoritative (logo/brand)
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

// Playfair Display - elegant serif for logo
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair',
  display: 'swap',
});

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
  title: 'NeedThisDone - Get Your Projects Done Right',
  description: 'Professional project services - submit your project, get it done right.',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${playfair.variable}`}>
      <head>
        {/* FOUC Prevention: Apply dark mode immediately before any rendering */}
        {/* This blocking script runs before CSS/content loads to prevent flash */}
        {/* Matches DarkModeToggle logic: check localStorage first, then system preference */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('darkMode');
                  let isDark = false;

                  if (stored !== null) {
                    // User has explicitly set a preference
                    isDark = stored === 'true';
                  } else {
                    // Fall back to system preference
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }

                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="transition-colors duration-0">
        <AuthProvider>
          <CartProvider>
            <StripeProvider>
              {/* Skip to main content link for keyboard users */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:bg-blue-600 focus:text-white focus:p-2 focus:z-50"
              >
                Skip to main content
              </a>

              {/* Site-wide navigation (includes dark mode toggle) */}
              <Navigation />

              {/* Page content - gradient background applied here once for all pages */}
              <main id="main-content" className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
                {children}
              </main>

              {/* AI Chatbot - floating widget available on all pages */}
              <PageIndexer />
              <ChatbotWidget />
            </StripeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
