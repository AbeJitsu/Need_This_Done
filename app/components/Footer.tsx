'use client';

import Link from 'next/link';
import { useInlineEdit } from '@/context/InlineEditContext';
import { formInputColors, headingColors, footerColors, dividerColors, linkHoverColors } from '@/lib/colors';
import { DEFAULT_LAYOUT_CONTENT, type LayoutContent, type FooterLink } from '@/lib/page-config';
import { OPEN_CHATBOT_EVENT } from './chatbot/ChatbotWidget';
import { Editable } from '@/components/InlineEditor';

// ============================================================================
// Footer Component - Compact Site-wide Footer
// ============================================================================
// Single-row layout with all links inline for minimal vertical footprint.
// Contains brand, navigation links, chat trigger, and copyright.
// In edit mode, brand, tagline, and link labels can be edited inline.

// Fallback footer links (used if layout content not loaded)
const defaultFooterLinks: FooterLink[] = [
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/contact', label: 'Contact' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
  { href: '/get-started', label: 'Get Started' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { layoutContent } = useInlineEdit();

  // Get footer content from layoutContent or use defaults
  const footerContent = (layoutContent as LayoutContent | null)?.footer || DEFAULT_LAYOUT_CONTENT.footer;
  const footerLinks = footerContent.links || defaultFooterLinks;
  const legalLinks = footerContent.legalLinks || DEFAULT_LAYOUT_CONTENT.footer.legalLinks;

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent(OPEN_CHATBOT_EVENT));
  };

  return (
    <footer className={`${footerColors.bg} ${footerColors.border}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-5">
        {/* Main row: Brand + Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand - Editable */}
          <Link
            href="/"
            className={`font-semibold ${headingColors.primary} ${linkHoverColors.blue} transition-colors`}
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            <Editable path="_layout.footer.brand">
              <span>{footerContent.brand}</span>
            </Editable>
          </Link>

          {/* Navigation links - inline with dot separators */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {footerLinks.map((link, index) => (
              <span key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className={`text-sm text-gray-700 dark:text-gray-300 ${linkHoverColors.blue} transition-colors py-1 px-2 -mx-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
                >
                  <Editable path={`_layout.footer.links.${index}.label`}>
                    <span>{link.label}</span>
                  </Editable>
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className={`mx-3 text-sm ${formInputColors.helper}`}>·</span>
                )}
              </span>
            ))}
            <button
              type="button"
              onClick={openChatbot}
              className={`text-sm text-gray-700 dark:text-gray-300 ${linkHoverColors.blue} transition-colors cursor-pointer flex items-center gap-1 py-1 px-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
              aria-label="Open AI chatbot to ask questions"
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
          {/* Tagline - Editable */}
          <Editable path="_layout.footer.tagline">
            <p>{footerContent.tagline}</p>
          </Editable>

          {/* Legal links - Editable labels */}
          <p className="flex items-center gap-2">
            {legalLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-2">
                <Link href={link.href} className={`text-gray-700 dark:text-gray-300 ${linkHoverColors.blue} transition-colors py-1 px-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}>
                  <Editable path={`_layout.footer.legalLinks.${index}.label`}>
                    <span>{link.label}</span>
                  </Editable>
                </Link>
                {index < legalLinks.length - 1 && <span>·</span>}
              </span>
            ))}
            <span>·</span>
            <span>&copy; {currentYear}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
