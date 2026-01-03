'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, CheckCircle, Star, Heart, ThumbsUp, Award, Trophy,
  Sparkles, Zap, Shield, ShieldCheck, Clock, Calendar,
  User, Users, Mail, Phone, Home, Building, DollarSign,
  FileText, Settings, Search, Eye, Target, Rocket, Send,
  Globe, Lightbulb, Flame, Package, Gift, Bookmark, Flag,
  Bell, Camera, Code, Layers, Pencil, Plus, AlertCircle, Info,
} from 'lucide-react';
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
  getSolidButtonColors,
  outlineButtonColors,
  getCheckmarkColors,
  type AccentVariant,
} from '@/lib/colors';
import { CloseIcon } from '@/components/ui/icons';
import { serviceColors } from '@/lib/service-colors';
import { Editable, IconPicker } from '@/components/InlineEditor';

// Map of common icon names to components
const BULLET_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Check, CheckCircle, Star, Heart, ThumbsUp, Award, Trophy,
  Sparkles, Zap, Shield, ShieldCheck, Clock, Calendar,
  User, Users, Mail, Phone, Home, Building, DollarSign,
  FileText, Settings, Search, Eye, Target, Rocket, Send,
  Globe, Lightbulb, Flame, Package, Gift, Bookmark, Flag,
  Bell, Camera, Code, Layers, Pencil, Plus, AlertCircle, Info,
};

// Render a lucide icon by name with colored circle background
function BulletIcon({
  iconName = 'Check',
  color = 'green',
}: {
  iconName?: string;
  color?: AccentVariant;
}) {
  const { bg, icon: iconColor } = getCheckmarkColors(color);
  const IconComponent = BULLET_ICON_MAP[iconName] || Check;

  return (
    <div className={`w-5 h-5 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
      <IconComponent size={12} className={iconColor} />
    </div>
  );
}

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
  const { isOpen, activeService, activeServiceType, cardIndex, closeModal, updateBulletIcon } = useServiceModal();
  const { isEditMode, updateField } = useInlineEdit();
  const { handleBackdropClick, modalRef } = useBackdropClose({
    isOpen,
    onClose: closeModal,
    includeEscape: true,
  });

  // State for icon picker
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    bulletIndex: number;
    position: { top: number; left: number };
  }>({ isOpen: false, bulletIndex: -1, position: { top: 0, left: 0 } });

  // Get the accent color for current service
  const color = activeServiceType ? serviceColors[activeServiceType] : 'blue';

  // Can we edit this modal? Only if we have a card index (from page content)
  const canEdit = isEditMode && cardIndex !== null;

  // Handle icon click - open picker
  const handleIconClick = (e: React.MouseEvent, bulletIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setIconPickerState({
      isOpen: true,
      bulletIndex,
      position: { top: rect.bottom + 8, left: rect.left },
    });
  };

  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    if (cardIndex === null) return;

    // Update the modal's local state for immediate UI feedback
    updateBulletIcon(iconPickerState.bulletIndex, iconName);

    // Update the page content for persistence
    updateField('services', `cards.${cardIndex}.modal.bulletIcons.${iconPickerState.bulletIndex}`, iconName);

    setIconPickerState({ isOpen: false, bulletIndex: -1, position: { top: 0, left: 0 } });
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
            {canEdit ? (
              <Editable path={`services.cards.${cardIndex}.modal.headline`}>
                <p className={`text-xl font-medium ${headingColors.primary} mb-2`}>
                  {activeService.headline}
                </p>
              </Editable>
            ) : (
              <p className={`text-xl font-medium ${headingColors.primary} mb-2`}>
                {activeService.headline}
              </p>
            )}
            {canEdit ? (
              <Editable path={`services.cards.${cardIndex}.modal.hook`}>
                <p className={`${headingColors.secondary} text-base`}>
                  {activeService.hook}
                </p>
              </Editable>
            ) : (
              <p className={`${headingColors.secondary} text-base`}>
                {activeService.hook}
              </p>
            )}
          </div>

          {/* ================================================================
              Content section - Teaser format (brief, drives to services page)
              ================================================================ */}
          <div className="px-6 pb-6 space-y-5">
            {/* What we do - bullet points (3 items max) */}
            <div>
              <h3 className={`font-semibold ${headingColors.primary} mb-3`}>
                {canEdit ? (
                  <Editable path={`services.cards.${cardIndex}.modal.bulletHeader`}>
                    <span>{activeService.bulletHeader || 'What we handle:'}</span>
                  </Editable>
                ) : (
                  <span>{activeService.bulletHeader || 'What we handle:'}</span>
                )}
              </h3>
              <ul className="space-y-2">
                {activeService.bulletPoints.map((point, index) => {
                  // Get custom icon or default to Check
                  const iconName = activeService.bulletIcons?.[index] || 'Check';
                  return (
                    <li key={index} className={`flex items-center gap-3 ${headingColors.secondary}`}>
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={(e) => handleIconClick(e, index)}
                          className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                          aria-label={`Change icon for bullet point ${index + 1}`}
                          title="Click to change icon"
                        >
                          <BulletIcon iconName={iconName} color={color} />
                        </button>
                      ) : (
                        <BulletIcon iconName={iconName} color={color} />
                      )}
                      {canEdit ? (
                        <Editable path={`services.cards.${cardIndex}.modal.bulletPoints.${index}`}>
                          <span>{point}</span>
                        </Editable>
                      ) : (
                        <span>{point}</span>
                      )}
                    </li>
                  );
                })}
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
                      ${getSolidButtonColors(color).bg} ${getSolidButtonColors(color).hover} ${getSolidButtonColors(color).text}
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
                    ${getSolidButtonColors(color).bg} ${getSolidButtonColors(color).hover} ${getSolidButtonColors(color).text}
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

      {/* Icon Picker */}
      {iconPickerState.isOpen && (
        <IconPicker
          currentIcon={activeService.bulletIcons?.[iconPickerState.bulletIndex] || 'Check'}
          onSelect={handleIconSelect}
          onClose={() => setIconPickerState({ isOpen: false, bulletIndex: -1, position: { top: 0, left: 0 } })}
          position={iconPickerState.position}
        />
      )}

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
