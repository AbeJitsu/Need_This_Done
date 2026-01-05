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
import { AdminSidebarToggle, EditModeBar, EditModeTutorial, InlineTextEditor } from '@/components/InlineEditor';
import { LocalBusinessJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import { seoConfig } from '@/lib/seo-config';

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

// ============================================================================
// SEO Metadata Configuration
// ============================================================================
// Comprehensive metadata for search engines and social media sharing.
// This appears in search results, browser tabs, and social media previews.

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: `${seoConfig.siteName} - Get Your Projects Done Right`,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.description,
  keywords: seoConfig.keywords,
  authors: [{ name: seoConfig.siteName }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,

  // Viewport and robots
  viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Favicons
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },

  // Open Graph - for Facebook, LinkedIn, etc.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: seoConfig.baseUrl,
    siteName: seoConfig.siteName,
    title: `${seoConfig.siteName} - Get Your Projects Done Right`,
    description: seoConfig.description,
    images: [
      {
        url: `${seoConfig.baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} - Professional Project Services`,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: `${seoConfig.siteName} - Get Your Projects Done Right`,
    description: 'Professional project services for businesses and individuals. Get things done right the first time.',
    images: [`${seoConfig.baseUrl}/og-image.png`],
  },

  // Canonical URL
  metadataBase: new URL(seoConfig.baseUrl),
  alternates: {
    canonical: '/',
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
        {/* JSON-LD Structured Data for rich search results */}
        <LocalBusinessJsonLd />
        <WebSiteJsonLd />

        {/* FOUC Prevention: Apply dark mode immediately before any rendering */}
        {/* This blocking script runs before CSS/content loads to prevent flash */}
        {/* Matches DarkModeToggle logic: check localStorage first, then system preference */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // TEMPORARY: Force light mode only until dark mode colors are fixed
                  // This prevents broken dark mode from appearing in production
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  
                  // Clear any stored dark mode preference to prevent confusion
                  localStorage.removeItem('darkMode');
                } catch (e) {
                  // Silent fail - light mode will be the default
                }
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

                    {/* Inline editing - click any text to edit it directly */}
                    <AdminSidebarToggle />
                    <InlineTextEditor />

                    {/* Edit mode tutorial - shows on first edit mode activation */}
                    <EditModeTutorial />
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
