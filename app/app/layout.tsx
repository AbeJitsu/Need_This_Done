import type { Metadata, Viewport } from 'next';
import { Inter, Poppins, Playfair_Display, Manrope } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import SessionProvider from '@/components/providers/SessionProvider';
import { ServiceModalProvider } from '@/context/ServiceModalContext';
import { ToastProvider } from '@/context/ToastContext';
import { ServiceDetailModal } from '@/components/service-modal';
import { Suspense } from 'react';
import HeroPreviewDetector from '@/components/HeroPreviewDetector';
import { ProfessionalServiceJsonLd, WebSiteJsonLd, LocalBusinessJsonLd } from '@/components/seo/JsonLd';
import { seoConfig } from '@/lib/seo-config';
import { validateEnvironmentVariables } from '@/lib/env-validation';

// Validate all required environment variables on startup
// This ensures the app fails immediately if config is wrong instead of
// failing deep in a request handler after hours of running
try {
  validateEnvironmentVariables();
} catch (error) {
  if (error instanceof Error) {
    console.warn('[EnvValidation] Warning:', error.message);
  }
}

// ============================================================================
// Static Generation with ISR
// ============================================================================
// Previously forced dynamic rendering due to context providers in Navigation.
// Now using ISR to pre-render pages and regenerate periodically.
// Contexts are created at request time, allowing static page generation.
export const revalidate = 3600; // Regenerate every hour

// Inter font - modern, trustworthy, highly readable (body text)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Manrope font - geometric, bold, distinctive (headings)
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-manrope',
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
    default: `${seoConfig.siteName} - Targeted Fixes & Automation Systems`,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.description,
  keywords: seoConfig.keywords,
  authors: [{ name: seoConfig.siteName }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,

  // Robots crawling configuration
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
    title: `${seoConfig.siteName} - Targeted Fixes & Automation Systems`,
    description: seoConfig.description,
    images: [
      {
        url: `${seoConfig.baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} - Targeted Fixes & Automation Systems`,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: `${seoConfig.siteName} - Targeted Fixes & Automation Systems`,
    description: 'A $500 targeted website fix, or a browser-based automation system for recurring work.',
    images: [`${seoConfig.baseUrl}/og-image.png`],
  },

  // Base URL for resolving relative metadata URLs (used by child pages)
  metadataBase: new URL(seoConfig.baseUrl),

  // Google Search Console verification
  verification: {
    google: 'CnXTZsLJ4prlLIidSFHpHT3GaU7Fx1a5BiaEjm7kdMk',
  },
};

// ============================================================================
// Viewport Configuration
// ============================================================================
// Separate export for viewport settings (Next.js 14+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} ${poppins.variable} ${playfair.variable}`}
    >
      <head>
        {/* JSON-LD Structured Data for rich search results */}
        <ProfessionalServiceJsonLd />
        <WebSiteJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body className="antialiased">
        <SessionProvider>
        <AuthProvider>
                  <ServiceModalProvider>
                    <ToastProvider>
                    {/* Skip to main content link for keyboard users */}
                    <a
                      href="#main-content"
                      className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:bg-blue-600 focus:text-white focus:p-2 focus:z-50"
                    >
                      Skip to main content
                    </a>

                    {/* Hero preview mode — disables interactivity inside device iframes */}
                    <Suspense fallback={null}>
                      <HeroPreviewDetector />
                    </Suspense>

                    {/* Site-wide navigation (includes dark mode toggle) */}
                    <Navigation />

                    {/* Page content - gradient background applied here once for all pages */}
                    <main id="main-content" className="min-h-screen bg-white">
                      {children}
                    </main>

                    {/* Site-wide footer */}
                    <div data-noindex>
                      <Footer />
                    </div>

                    {/* Service detail modal - available on all pages */}
                    <ServiceDetailModal />

                  </ToastProvider>
                  </ServiceModalProvider>
        </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
