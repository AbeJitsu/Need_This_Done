import type { Metadata } from 'next';
import './globals.css';

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
        {/* Navigation could go here */}
        <main>{children}</main>
        {/* Footer could go here */}
      </body>
    </html>
  );
}
