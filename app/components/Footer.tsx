'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { formInputColors, headingColors, footerColors, dividerColors, linkHoverColors } from '@/lib/colors';
import { OPEN_CHATBOT_EVENT } from './chatbot/ChatbotWidget';

// ============================================================================
// Footer Component - Site-wide Footer
// ============================================================================
// Appears at the bottom of every page. Contains:
// - Brand info and tagline
// - Quick links to informational pages
// - Help section with FAQ and chat trigger
// - Copyright

// Footer link sections
const footerLinks = {
  quickLinks: [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/contact', label: 'Contact' },
    { href: '/pricing', label: 'Pricing' },
  ],
  help: [
    { href: '/faq', label: 'FAQ' },
    { href: '/get-started', label: 'Get Started' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Open chatbot when clicking the chat link
  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent(OPEN_CHATBOT_EVENT));
  };

  return (
    <footer className={`${footerColors.bg} ${footerColors.border}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <Link
              href="/"
              className={`font-semibold text-lg ${headingColors.primary} ${linkHoverColors.blue} transition-colors`}
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {siteConfig.project.name}
            </Link>
            <p className={`mt-2 text-sm ${formInputColors.helper} max-w-xs`}>
              Real people helping busy professionals get things done.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-semibold ${headingColors.primary} mb-3`}>Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm ${formInputColors.helper} ${linkHoverColors.blue} transition-colors`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className={`font-semibold ${headingColors.primary} mb-3`}>Help</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm ${formInputColors.helper} ${linkHoverColors.blue} transition-colors`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openChatbot}
                  className={`text-sm ${formInputColors.helper} ${linkHoverColors.blue} transition-colors cursor-pointer`}
                >
                  Chat with us anytime
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className={`mt-8 pt-6 border-t ${dividerColors.border} text-center text-sm ${formInputColors.helper}`}>
          &copy; {currentYear} {siteConfig.project.name}
        </div>
      </div>
    </footer>
  );
}
