import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SessionProvider from '@/components/providers/SessionProvider';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { StripeProvider } from '@/context/StripeContext';
import { ServiceModalProvider } from '@/context/ServiceModalContext';
import { ToastProvider } from '@/context/ToastContext';
import { InlineEditProvider } from '@/context/InlineEditContext';
import { ChatbotWidget, PageIndexer } from '@/components/chatbot';
import { ServiceDetailModal } from '@/components/service-modal';
import { AdminSidebar, AdminSidebarToggle, EditModeBar, UniversalClickHandler } from '@/components/InlineEditor';

// ============================================================================
// Force Dynamic Rendering for All Routes
// ============================================================================
// The Navigation component uses useAuth and useCart hooks, which require
// context providers. During static prerendering at build time, these contexts
// aren't available, causing build failures. Making the layout dynamic ensures
// all pages are rendered at request time with proper context.
export const dynamic = 'force-dynamic';

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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${playfair.variable}`}>
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
                    // User has explicitly set a preference - respect it
                    isDark = stored === 'true';
                  } else {
                    // First-time visitor: default to light mode
                    // (They can toggle to dark if they prefer)
                    isDark = false;
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
        <SessionProvider>
        <AuthProvider>
          <CartProvider>
            <StripeProvider>
              <ServiceModalProvider>
                <ToastProvider>
                  <InlineEditProvider>
                    {/* Skip to main content link for keyboard users */}
                    <a
                      href="#main-content"
                      className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:bg-blue-600 focus:text-white focus:p-2 focus:z-50"
                    >
                      Skip to main content
                    </a>

                    {/* Site-wide navigation (includes dark mode toggle) */}
                    <Navigation />

                    {/* Edit mode indicator bar - shows when admin is in edit mode */}
                    <EditModeBar />

                    {/* Page content - gradient background applied here once for all pages */}
                    <main id="main-content" className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
                      {children}
                    </main>

                    {/* Site-wide footer */}
                    <Footer />

                    {/* AI Chatbot - floating widget available on all pages */}
                    <PageIndexer />
                    <ChatbotWidget />

                    {/* Service detail modal - available on all pages */}
                    <ServiceDetailModal />

                    {/* Inline editing - floating toggle button + sidebar for admins */}
                    <AdminSidebarToggle />
                    <AdminSidebar />
                    <UniversalClickHandler />
                  </InlineEditProvider>
                </ToastProvider>
              </ServiceModalProvider>
            </StripeProvider>
          </CartProvider>
        </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
