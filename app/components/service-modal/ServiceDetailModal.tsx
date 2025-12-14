'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useServiceModal } from '@/context/ServiceModalContext';
import {
  cardBgColors,
  dividerColors,
  headingColors,
  formInputColors,
  titleColors,
  checkmarkColors,
  topBorderColors,
  iconButtonColors,
  lightBgColors,
  AccentColor,
} from '@/lib/colors';
import type { ServiceType } from '@/lib/service-modal-content';

// ============================================================================
// Service Detail Modal
// ============================================================================
// What: Centered overlay modal showing detailed service info
// Why: Gives visitors a deep dive into each service without leaving the page
// How: Uses ServiceModalContext for state, displays friendly non-tech content

// Map service types to accent colors
const serviceColors: Record<ServiceType, AccentColor> = {
  'virtual-assistant': 'green',
  'data-documents': 'blue',
  'website-services': 'purple',
};

export default function ServiceDetailModal() {
  const { isOpen, activeService, activeServiceType, closeModal } = useServiceModal();
  const modalRef = useRef<HTMLDivElement>(null);

  // Get the accent color for current service
  const color = activeServiceType ? serviceColors[activeServiceType] : 'blue';

  // ========================================================================
  // Handle escape key to close modal
  // ========================================================================
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  // ========================================================================
  // Focus trap and scroll lock when modal is open
  // ========================================================================
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Focus modal
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't render if closed or no content
  if (!isOpen || !activeService) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal container - centered */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
      >
        {/* Modal panel */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
            ${cardBgColors.base} rounded-2xl shadow-2xl
            border-t-4 ${topBorderColors[color]}
            transition-all duration-300 ease-out
            animate-modal-enter
          `}
        >
          {/* ================================================================
              Close button
              ================================================================ */}
          <button
            onClick={closeModal}
            className={`
              absolute top-4 right-4 z-10
              ${iconButtonColors.text} ${iconButtonColors.hover}
              p-2 rounded-lg ${iconButtonColors.bg} transition-colors
            `}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* ================================================================
              Header section
              ================================================================ */}
          <div className="p-6 pb-4">
            <h2
              id="service-modal-title"
              className={`text-2xl md:text-3xl font-bold ${titleColors[color]} mb-2 pr-10`}
            >
              {activeService.title}
            </h2>
            <p className={`text-xl font-medium ${headingColors.primary}`}>
              {activeService.headline}
            </p>
          </div>

          {/* ================================================================
              Content section
              ================================================================ */}
          <div className="px-6 pb-6 space-y-6">
            {/* Subtitle - the friendly explanation */}
            {activeService.subtitle && (
              <p className={`${formInputColors.helper} text-base leading-relaxed`}>
                {activeService.subtitle}
              </p>
            )}

            {/* Divider */}
            <div className={`${dividerColors.subtle} h-px`} />

            {/* What we do - bullet points */}
            <div>
              <h3 className={`font-semibold ${headingColors.primary} mb-3`}>
                What we handle:
              </h3>
              <ul className="space-y-2">
                {activeService.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full ${checkmarkColors[color].bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <svg className={`w-3 h-3 ${checkmarkColors[color].icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`${formInputColors.helper}`}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Examples section */}
            <div className={`${lightBgColors[color]} rounded-xl p-5`}>
              <h3 className={`font-semibold ${headingColors.primary} mb-3`}>
                {activeService.examples.title}
              </h3>
              <ul className="space-y-2">
                {activeService.examples.items.map((example, index) => (
                  <li key={index} className={`${headingColors.primary} text-sm pl-4 border-l-2 border-gray-400 dark:border-gray-500`}>
                    {example}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reassurance message */}
            <p className={`${titleColors[color]} font-medium text-center italic`}>
              &ldquo;{activeService.reassurance}&rdquo;
            </p>

            {/* Divider */}
            <div className={`${dividerColors.subtle} h-px`} />

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary CTA */}
              <Link
                href={activeService.ctas.primary.href}
                onClick={closeModal}
                className={`
                  flex-1 text-center py-3 px-6 rounded-xl font-semibold
                  transition-all duration-200
                  ${color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  ${color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  ${color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                `}
              >
                <span className="block">{activeService.ctas.primary.text}</span>
                <span className="block text-sm opacity-80">{activeService.ctas.primary.description}</span>
              </Link>

              {/* Secondary CTA */}
              <Link
                href={activeService.ctas.secondary.href}
                onClick={closeModal}
                className={`
                  flex-1 text-center py-3 px-6 rounded-xl font-semibold
                  border-2 transition-all duration-200
                  ${color === 'green' ? 'border-green-500 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20' : ''}
                  ${color === 'blue' ? 'border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
                  ${color === 'purple' ? 'border-purple-500 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
                `}
              >
                <span className="block">{activeService.ctas.secondary.text}</span>
                <span className="block text-sm opacity-70">{activeService.ctas.secondary.description}</span>
              </Link>
            </div>

            {/* Cross-page link to compare services */}
            <p className={`text-center ${formInputColors.helper} text-sm`}>
              <Link
                href="/services"
                onClick={closeModal}
                className="hover:underline"
              >
                Compare all services →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Animation keyframes - added via style tag */}
      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
