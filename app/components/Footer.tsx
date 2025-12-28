'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { formInputColors, headingColors, footerColors, dividerColors, linkHoverColors } from '@/lib/colors';
import { OPEN_CHATBOT_EVENT } from './chatbot/ChatbotWidget';

// ============================================================================
// Footer Component - Compact Site-wide Footer
// ============================================================================
// Single-row layout with all links inline for minimal vertical footprint.
// Contains brand, navigation links, chat trigger, and copyright.

const footerLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/contact', label: 'Contact' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/get-started', label: 'Get Started' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent(OPEN_CHATBOT_EVENT));
  };

  return (
    <footer className={`${footerColors.bg} ${footerColors.border}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-5">
        {/* Main row: Brand + Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand */}
          <Link
            href="/"
            className={`font-semibold ${headingColors.primary} ${linkHoverColors.blue} transition-colors`}
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {siteConfig.project.name}
          </Link>

          {/* Navigation links - inline with dot separators */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {footerLinks.map((link) => (
              <span key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className={`text-sm ${formInputColors.helper} ${linkHoverColors.blue} transition-colors`}
                >
                  {link.label}
                </Link>
                <span className={`mx-2 text-sm ${formInputColors.helper}`}>·</span>
              </span>
            ))}
            <button
              type="button"
              onClick={openChatbot}
              className={`text-sm ${formInputColors.helper} ${linkHoverColors.blue} transition-colors cursor-pointer flex items-center gap-1`}
              aria-label="Chat with AI assistant"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="sr-only sm:not-sr-only">Chat</span>
            </button>
          </nav>
        </div>

        {/* Bottom row: Tagline + Legal + Copyright */}
        <div className={`mt-3 pt-3 border-t ${dividerColors.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm ${formInputColors.helper}`}>
          <p>Real people helping busy professionals get things done.</p>
          <p className="flex items-center gap-2">
            <Link href="/privacy" className={`${formInputColors.helper} ${linkHoverColors.blue} transition-colors`}>Privacy</Link>
            <span>·</span>
            <Link href="/terms" className={`${formInputColors.helper} ${linkHoverColors.blue} transition-colors`}>Terms</Link>
            <span>·</span>
            <span>&copy; {currentYear}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
