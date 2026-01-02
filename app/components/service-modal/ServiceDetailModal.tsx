'use client';

import Link from 'next/link';
import { useServiceModal } from '@/context/ServiceModalContext';
import { useInlineEdit } from '@/context/InlineEditContext';
import { useBackdropClose } from '@/hooks/useBackdropClose';
import {
  cardBgColors,
  dividerColors,
  headingColors,
  titleColors,
  topBorderColors,
  iconButtonColors,
  solidButtonColors,
  outlineButtonColors,
} from '@/lib/colors';
import { CheckmarkCircle } from '@/components/ui/icons/CheckmarkCircle';
import { CloseIcon } from '@/components/ui/icons';
import { serviceColors } from '@/lib/service-colors';
import { Editable } from '@/components/InlineEditor';

// ============================================================================
// Service Detail Modal - Teaser Format
// ============================================================================
// What: Compact overlay modal with brief service preview
// Why: Sparks curiosity and drives users to the services page for full details
// How: Uses ServiceModalContext for state, shows headline + 3 bullets + 2 CTAs
//
// Inline Editing: When cardIndex is available, modal content is editable.
// Editable fields: headline, hook, bulletPoints, CTA text

export default function ServiceDetailModal() {
  const { isOpen, activeService, activeServiceType, cardIndex, closeModal } = useServiceModal();
  const { isEditMode } = useInlineEdit();
  const { handleBackdropClick, modalRef } = useBackdropClose({
    isOpen,
    onClose: closeModal,
    includeEscape: true,
  });

  // Get the accent color for current service
  const color = activeServiceType ? serviceColors[activeServiceType] : 'blue';

  // Can we edit this modal? Only if we have a card index (from page content)
  const canEdit = isEditMode && cardIndex !== null;

  // Helper to wrap content in Editable when editing
  const editable = (field: string, children: React.ReactNode) => {
    if (!canEdit) return children;
    const basePath = `services.cards.${cardIndex}.modal`;
    return <Editable path={`${basePath}.${field}`}>{children}</Editable>;
  };

  // Don't render if closed or no content
  if (!isOpen || !activeService) return null;

  return (
    <>
      {/* Backdrop overlay - visual layer */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal container - centered, handles clicks outside modal */}
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
      >
        {/* Modal panel - stops click propagation so outside clicks close modal */}
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
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
            <CloseIcon size="lg" />
          </button>

          {/* ================================================================
              Header section
              ================================================================ */}
          <div className="p-6 pb-4">
            <h2
              id="service-modal-title"
              className={`text-2xl md:text-3xl font-bold ${titleColors[color]} mb-2 pr-10`}
            >
              {canEdit ? (
                <Editable path={`services.cards.${cardIndex}.title`}>
                  <span>{activeService.title}</span>
                </Editable>
              ) : (
                activeService.title
              )}
            </h2>
            {editable('headline', (
              <p className={`text-xl font-medium ${headingColors.primary} mb-2`}>
                {activeService.headline}
              </p>
            ))}
            {editable('hook', (
              <p className={`${headingColors.secondary} text-base`}>
                {activeService.hook}
              </p>
            ))}
          </div>

          {/* ================================================================
              Content section - Teaser format (brief, drives to services page)
              ================================================================ */}
          <div className="px-6 pb-6 space-y-5">
            {/* What we do - bullet points (3 items max) */}
            <div>
              <h3 className={`font-semibold ${headingColors.primary} mb-3`}>
                {editable('bulletHeader', (
                  <span>{activeService.bulletHeader || 'What we handle:'}</span>
                ))}
              </h3>
              <ul className="space-y-2">
                {activeService.bulletPoints.map((point, index) => (
                  <li key={index} className={`flex items-start gap-3 ${headingColors.secondary}`}>
                    <CheckmarkCircle color={color} size="sm" className="mt-0.5" />
                    {editable(`bulletPoints.${index}`, (
                      <span>{point}</span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className={`${dividerColors.subtle} h-px`} />

            {/* CTA buttons - Primary goes to services, Secondary to contact */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary CTA - See All Services */}
              {canEdit ? (
                <Editable
                  path={`services.cards.${cardIndex}.modal.ctas.primary.text`}
                  hrefPath={`services.cards.${cardIndex}.modal.ctas.primary.href`}
                  href={activeService.ctas.primary.href}
                >
                  <span
                    className={`
                      flex-1 text-center py-3 px-6 rounded-xl font-semibold
                      transition-all duration-200
                      ${solidButtonColors[color].bg} ${solidButtonColors[color].hover} ${solidButtonColors[color].text}
                    `}
                  >
                    {activeService.ctas.primary.text}
                  </span>
                </Editable>
              ) : (
                <Link
                  href={activeService.ctas.primary.href}
                  onClick={closeModal}
                  className={`
                    flex-1 text-center py-3 px-6 rounded-xl font-semibold
                    transition-all duration-200
                    ${solidButtonColors[color].bg} ${solidButtonColors[color].hover} ${solidButtonColors[color].text}
                  `}
                >
                  {activeService.ctas.primary.text}
                </Link>
              )}

              {/* Secondary CTA - Get a Quote */}
              {canEdit ? (
                <Editable
                  path={`services.cards.${cardIndex}.modal.ctas.secondary.text`}
                  hrefPath={`services.cards.${cardIndex}.modal.ctas.secondary.href`}
                  href={activeService.ctas.secondary.href}
                >
                  <span
                    className={`
                      flex-1 text-center py-3 px-6 rounded-xl font-semibold
                      border-2 transition-all duration-200
                      ${outlineButtonColors[color].base} ${outlineButtonColors[color].hover}
                    `}
                  >
                    {activeService.ctas.secondary.text}
                  </span>
                </Editable>
              ) : (
                <Link
                  href={activeService.ctas.secondary.href}
                  onClick={closeModal}
                  className={`
                    flex-1 text-center py-3 px-6 rounded-xl font-semibold
                    border-2 transition-all duration-200
                    ${outlineButtonColors[color].base} ${outlineButtonColors[color].hover}
                  `}
                >
                  {activeService.ctas.secondary.text}
                </Link>
              )}
            </div>
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
