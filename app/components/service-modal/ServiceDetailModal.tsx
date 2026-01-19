'use client';
import { accentText } from '@/lib/contrast';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, CheckCircle, Star, Heart, ThumbsUp, Award, Trophy,
  Sparkles, Zap, Shield, ShieldCheck, Clock, Calendar,
  User, Users, Mail, Phone, Home, Building, DollarSign,
  FileText, Settings, Search, Eye, Target, Rocket, Send,
  Globe, Lightbulb, Flame, Package, Gift, Bookmark, Flag,
  Bell, Camera, Code, Layers, Pencil, Plus, AlertCircle, Info,
  ArrowRight, X,
} from 'lucide-react';
import { useServiceModal } from '@/context/ServiceModalContext';
import { useInlineEdit } from '@/context/InlineEditContext';
import { useBackdropClose } from '@/hooks/useBackdropClose';
import { type AccentVariant } from '@/lib/colors';
import { Editable, IconPicker } from '@/components/InlineEditor';
import { serviceColors } from '@/lib/service-colors';

// ============================================================================
// Service Detail Modal - Premium Editorial Design
// ============================================================================
// Redesigned with:
// - Glass morphism backdrop
// - Strong typography hierarchy
// - Elegant bullet treatment with subtle backgrounds
// - Refined button styling
// - Smooth animations

// Type for lucide icons
type LucideIconComponent = React.ComponentType<{ size?: string | number; className?: string }>;

// Icon map
const BULLET_ICON_MAP: Record<string, LucideIconComponent> = {
  Check, CheckCircle, Star, Heart, ThumbsUp, Award, Trophy,
  Sparkles, Zap, Shield, ShieldCheck, Clock, Calendar,
  User, Users, Mail, Phone, Home, Building, DollarSign,
  FileText, Settings, Search, Eye, Target, Rocket, Send,
  Globe, Lightbulb, Flame, Package, Gift, Bookmark, Flag,
  Bell, Camera, Code, Layers, Pencil, Plus, AlertCircle, Info,
};

// Color configurations for each service type
const SERVICE_THEMES: Record<AccentVariant, {
  gradient: string;
  accentBg: string;
  textColor: string;
  iconBg: string;
  iconText: string;
  buttonBg: string;
  buttonHover: string;
  outlineBorder: string;
  outlineText: string;
  outlineHover: string;
}> = {
  green: {
    gradient: 'from-green-50 via-white to-green-50/30',
    accentBg: 'bg-green-100',
    textColor: accentText.emerald,
    iconBg: 'bg-green-100',
    iconText: accentText.emerald,
    buttonBg: 'bg-green-500',
    buttonHover: 'hover:bg-green-600',
    outlineBorder: 'border-green-300',
    outlineText: accentText.emerald,
    outlineHover: 'hover:bg-green-50',
  },
  purple: {
    gradient: 'from-purple-50 via-white to-purple-50/30',
    accentBg: 'bg-purple-100',
    textColor: accentText.purple,
    iconBg: 'bg-purple-100',
    iconText: accentText.purple,
    buttonBg: 'bg-purple-500',
    buttonHover: 'hover:bg-purple-600',
    outlineBorder: 'border-purple-300',
    outlineText: accentText.purple,
    outlineHover: 'hover:bg-purple-50',
  },
  gold: {
    gradient: 'from-gold-50 via-white to-gold-50/30',
    accentBg: 'bg-gold-100',
    textColor: accentText.gold,
    iconBg: 'bg-gold-100',
    iconText: accentText.gold,
    buttonBg: 'bg-gold-500',
    buttonHover: 'hover:bg-gold-600',
    outlineBorder: 'border-gold-300',
    outlineText: accentText.gold,
    outlineHover: 'hover:bg-gold-50',
  },
  blue: {
    gradient: 'from-blue-50 via-white to-blue-50/30',
    accentBg: 'bg-blue-100',
    textColor: accentText.blue,
    iconBg: 'bg-blue-100',
    iconText: accentText.blue,
    buttonBg: 'bg-blue-500',
    buttonHover: 'hover:bg-blue-600',
    outlineBorder: 'border-blue-300',
    outlineText: accentText.blue,
    outlineHover: 'hover:bg-blue-50',
  },
  teal: {
    gradient: 'from-green-50 via-white to-blue-50/30',
    accentBg: 'bg-green-100',
    textColor: accentText.teal,
    iconBg: 'bg-green-100',
    iconText: accentText.teal,
    buttonBg: 'bg-green-500',
    buttonHover: 'hover:bg-green-600',
    outlineBorder: 'border-green-300',
    outlineText: accentText.teal,
    outlineHover: 'hover:bg-green-50',
  },
  red: {
    gradient: 'from-purple-50 via-white to-purple-50/30',
    accentBg: 'bg-purple-100',
    textColor: accentText.red,
    iconBg: 'bg-purple-100',
    iconText: accentText.red,
    buttonBg: 'bg-purple-500',
    buttonHover: 'hover:bg-purple-600',
    outlineBorder: 'border-purple-300',
    outlineText: accentText.red,
    outlineHover: 'hover:bg-purple-50',
  },
  gray: {
    gradient: 'from-gray-50 via-white to-slate-50/30',
    accentBg: 'bg-gray-100',
    textColor: accentText.gray,
    iconBg: 'bg-gray-100',
    iconText: accentText.gray,
    buttonBg: 'bg-gray-600',
    buttonHover: 'hover:bg-gray-700',
    outlineBorder: 'border-gray-400',
    outlineText: accentText.gray,
    outlineHover: 'hover:bg-gray-50',
  },
};

// Bullet icon with refined styling
function BulletIcon({
  iconName = 'Check',
  theme,
}: {
  iconName?: string;
  theme: typeof SERVICE_THEMES.blue;
}) {
  const IconComponent = BULLET_ICON_MAP[iconName] || Check;

  return (
    <div className={`w-8 h-8 rounded-lg ${theme.iconBg} flex items-center justify-center flex-shrink-0`}>
      <IconComponent size={16} className={theme.iconText} />
    </div>
  );
}

export default function ServiceDetailModal() {
  const { isOpen, activeService, activeServiceType, cardIndex, closeModal, updateBulletIcon } = useServiceModal();
  const { isEditMode, updateField } = useInlineEdit();
  const { handleBackdropClick, modalRef } = useBackdropClose({
    isOpen,
    onClose: closeModal,
    includeEscape: true,
  });

  // Icon picker state
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    bulletIndex: number;
    position: { top: number; left: number };
  }>({ isOpen: false, bulletIndex: -1, position: { top: 0, left: 0 } });

  // Get theme for current service
  const color = activeServiceType ? serviceColors[activeServiceType] : 'blue';
  const theme = SERVICE_THEMES[color] || SERVICE_THEMES.blue;

  // Can we edit?
  const canEdit = isEditMode && cardIndex !== null;

  // Handle icon click
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
    updateBulletIcon(iconPickerState.bulletIndex, iconName);
    updateField('services', `cards.${cardIndex}.modal.bulletIcons.${iconPickerState.bulletIndex}`, iconName);
    setIconPickerState({ isOpen: false, bulletIndex: -1, position: { top: 0, left: 0 } });
  };

  if (!isOpen || !activeService) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
      >
        {/* Modal panel */}
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          className={`
            relative w-full max-w-xl max-h-[90vh] overflow-y-auto cursor-default
            bg-gradient-to-br ${theme.gradient}
            rounded-3xl shadow-2xl
            border border-white/60
            transition-all duration-300 ease-out
            animate-modal-enter
          `}
        >
          {/* Close button - minimal floating style */}
          <button
            onClick={closeModal}
            className="
              absolute top-5 right-5 z-10
              w-10 h-10 rounded-full
              bg-white/80 hover:bg-white
              text-gray-500 hover:text-gray-700
              flex items-center justify-center
              transition-all duration-200
              shadow-sm hover:shadow-md
            "
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>

          {/* Content */}
          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2
                id="service-modal-title"
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 pr-12 tracking-tight"
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
                  <p className="text-xl text-gray-700 font-medium mb-3">
                    {activeService.headline}
                  </p>
                </Editable>
              ) : (
                <p className="text-xl text-gray-700 font-medium mb-3">
                  {activeService.headline}
                </p>
              )}

              {canEdit ? (
                <Editable path={`services.cards.${cardIndex}.modal.hook`}>
                  <p className="text-gray-500 text-base leading-relaxed">
                    {activeService.hook}
                  </p>
                </Editable>
              ) : (
                <p className="text-gray-500 text-base leading-relaxed">
                  {activeService.hook}
                </p>
              )}
            </div>

            {/* Bullet points - card style */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {canEdit ? (
                  <Editable path={`services.cards.${cardIndex}.modal.bulletHeader`}>
                    <span>{activeService.bulletHeader || 'What we handle'}</span>
                  </Editable>
                ) : (
                  <span>{activeService.bulletHeader || 'What we handle'}</span>
                )}
              </h3>

              <div className="space-y-3">
                {activeService.bulletPoints.map((point, index) => {
                  const iconName = activeService.bulletIcons?.[index] || 'Check';
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/60 border border-white/80"
                    >
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={(e) => handleIconClick(e, index)}
                          className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                          aria-label={`Change icon for bullet point ${index + 1}`}
                        >
                          <BulletIcon iconName={iconName} theme={theme} />
                        </button>
                      ) : (
                        <BulletIcon iconName={iconName} theme={theme} />
                      )}
                      {canEdit ? (
                        <Editable path={`services.cards.${cardIndex}.modal.bulletPoints.${index}`}>
                          <span className="text-gray-700 font-medium">{point}</span>
                        </Editable>
                      ) : (
                        <span className="text-gray-700 font-medium">{point}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
              {/* Primary CTA */}
              {canEdit ? (
                <Editable
                  path={`services.cards.${cardIndex}.modal.ctas.primary.text`}
                  hrefPath={`services.cards.${cardIndex}.modal.ctas.primary.href`}
                  href={activeService.ctas.primary.href}
                >
                  <span
                    className={`
                      w-full sm:flex-1 text-center py-4 px-6 rounded-2xl font-semibold
                      ${theme.buttonBg} ${theme.buttonHover} text-white hover:text-white
                      transition-all duration-200 hover:scale-[1.02] hover:brightness-110
                      flex items-center justify-center gap-2
                      shadow-lg hover:shadow-xl
                    `}
                  >
                    {activeService.ctas.primary.text}
                    <ArrowRight size={18} />
                  </span>
                </Editable>
              ) : (
                <Link
                  href={activeService.ctas.primary.href}
                  onClick={closeModal}
                  className={`
                    w-full sm:flex-1 text-center py-4 px-6 rounded-2xl font-semibold
                    ${theme.buttonBg} ${theme.buttonHover} text-white hover:text-white
                    transition-all duration-200 hover:scale-[1.02] hover:brightness-110
                    flex items-center justify-center gap-2
                    shadow-lg hover:shadow-xl
                  `}
                >
                  {activeService.ctas.primary.text}
                  <ArrowRight size={18} />
                </Link>
              )}

              {/* Secondary CTA */}
              {canEdit ? (
                <Editable
                  path={`services.cards.${cardIndex}.modal.ctas.secondary.text`}
                  hrefPath={`services.cards.${cardIndex}.modal.ctas.secondary.href`}
                  href={activeService.ctas.secondary.href}
                >
                  <span
                    className={`
                      w-full sm:flex-1 text-center py-4 px-6 rounded-2xl font-semibold
                      bg-white border-2 ${theme.outlineBorder} ${theme.outlineText}
                      ${theme.outlineHover}
                      transition-all duration-200
                      flex items-center justify-center
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
                    w-full sm:flex-1 text-center py-4 px-6 rounded-2xl font-semibold
                    bg-white border-2 ${theme.outlineBorder} ${theme.outlineText}
                    ${theme.outlineHover}
                    transition-all duration-200
                    flex items-center justify-center
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

      {/* Animation */}
      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
