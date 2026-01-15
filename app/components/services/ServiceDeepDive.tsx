'use client';

// ============================================================================
// ServiceDeepDive - Bold Service Showcases
// ============================================================================
// Redesigned as compelling product showcases rather than boring info panels.
// Each service gets a distinctive visual treatment while maintaining cohesion.
// Features: color blocking, feature cards, editorial typography, smooth animations.

import { useState } from 'react';
import {
  serviceFullContentMap,
  type ServiceFullContent,
} from '@/lib/service-modal-content';
import {
  headingColors,
  formInputColors,
  cardBgColors,
} from '@/lib/colors';
import { type ServiceType } from '@/lib/service-colors';
import Button from '@/components/Button';

interface ServiceDeepDiveProps {
  defaultExpanded?: ServiceType;
}

// ============================================================================
// Service Icon Components - Distinctive icons for each service
// ============================================================================

function WebsiteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <circle cx="6" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="11" cy="6.5" r="0.5" fill="currentColor" />
      <path d="M7 13h10M7 16h6" />
    </svg>
  );
}

function AutomationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
      <circle cx="12" cy="12" r="3" />
      <path d="M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2l2.8-2.8" />
    </svg>
  );
}

function AIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4a2 2 0 100 4 2 2 0 000-4z" />
      <path d="M12 8v3" />
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M9 15h.01M15 15h.01M9 18h6" />
    </svg>
  );
}

const serviceIcons: Record<ServiceType, React.ComponentType<{ className?: string }>> = {
  'website-services': WebsiteIcon,
  'data-documents': AutomationIcon,
  'virtual-assistant': AIIcon,
};

// ============================================================================
// Color Configuration - Rich color palettes for each service
// ============================================================================

interface ServiceColorConfig {
  // Main gradient for header area
  gradientFrom: string;
  gradientTo: string;
  // Solid accent color
  accent: string;
  accentLight: string;
  accentDark: string;
  // Text colors
  headlineText: string;
  // Feature card styling
  featureCardBg: string;
  featureCardBorder: string;
  featureCardIcon: string;
  // Tab active state
  tabActive: string;
  tabActiveText: string;
  // CTA button variant
  buttonVariant: 'green' | 'blue' | 'purple';
}

const colorConfigs: Record<ServiceType, ServiceColorConfig> = {
  'website-services': {
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-600',
    accent: 'bg-green-500',
    accentLight: 'bg-green-100 dark:bg-green-900',
    accentDark: 'bg-green-600',
    headlineText: 'text-green-600 dark:text-green-400',
    featureCardBg: 'bg-green-50 dark:bg-green-950',
    featureCardBorder: 'border-green-200 dark:border-green-800',
    featureCardIcon: 'text-green-600 dark:text-green-400',
    tabActive: 'bg-green-500',
    tabActiveText: 'text-white',
    buttonVariant: 'green',
  },
  'data-documents': {
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    accent: 'bg-blue-500',
    accentLight: 'bg-blue-100 dark:bg-blue-900',
    accentDark: 'bg-blue-600',
    headlineText: 'text-blue-600 dark:text-blue-400',
    featureCardBg: 'bg-blue-50 dark:bg-blue-950',
    featureCardBorder: 'border-blue-200 dark:border-blue-800',
    featureCardIcon: 'text-blue-600 dark:text-blue-400',
    tabActive: 'bg-blue-500',
    tabActiveText: 'text-white',
    buttonVariant: 'blue',
  },
  'virtual-assistant': {
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-violet-600',
    accent: 'bg-purple-500',
    accentLight: 'bg-purple-100 dark:bg-purple-900',
    accentDark: 'bg-purple-600',
    headlineText: 'text-purple-600 dark:text-purple-400',
    featureCardBg: 'bg-purple-50 dark:bg-purple-950',
    featureCardBorder: 'border-purple-200 dark:border-purple-800',
    featureCardIcon: 'text-purple-600 dark:text-purple-400',
    tabActive: 'bg-purple-500',
    tabActiveText: 'text-white',
    buttonVariant: 'purple',
  },
};

// ============================================================================
// Main Component
// ============================================================================

export default function ServiceDeepDive({ defaultExpanded }: ServiceDeepDiveProps) {
  const [expanded, setExpanded] = useState<ServiceType | null>(defaultExpanded || null);

  const services = Object.entries(serviceFullContentMap) as [ServiceType, ServiceFullContent][];

  return (
    <div className="mb-16">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className={`text-3xl md:text-4xl font-bold ${headingColors.primary} mb-3 tracking-tight`}>
          Dive Deeper
        </h2>
        <p className={`${formInputColors.helper} text-lg max-w-2xl mx-auto`}>
          Click a service to explore what&apos;s included
        </p>
      </div>

      {/* Service Tab Buttons - Pill style */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {services.map(([key, content]) => {
          const colors = colorConfigs[key];
          const isActive = expanded === key;
          const Icon = serviceIcons[key];

          return (
            <button
              key={key}
              onClick={() => setExpanded(isActive ? null : key)}
              className={`
                group relative px-6 py-3 rounded-full font-semibold text-sm
                transition-all duration-300 ease-out
                flex items-center gap-2.5
                ${isActive
                  ? `${colors.tabActive} ${colors.tabActiveText} shadow-lg scale-105`
                  : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                     hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-102`
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span>{content.title}</span>
              <span className={`
                ml-1 text-xs transition-transform duration-300
                ${isActive ? 'rotate-180' : ''}
              `}>
                ▼
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Content with Animation */}
      <div className={`
        transition-all duration-500 ease-out overflow-hidden
        ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        {expanded && (
          <ServiceShowcase
            serviceType={expanded}
            content={serviceFullContentMap[expanded]}
            colors={colorConfigs[expanded]}
          />
        )}
      </div>

      {/* Hint when nothing expanded */}
      {!expanded && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <p className={`${formInputColors.helper} text-lg`}>
            Select a service above to see the details
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ServiceShowcase - Individual service expanded view
// ============================================================================

interface ServiceShowcaseProps {
  serviceType: ServiceType;
  content: ServiceFullContent;
  colors: ServiceColorConfig;
}

function ServiceShowcase({ serviceType, content, colors }: ServiceShowcaseProps) {
  const Icon = serviceIcons[serviceType];

  return (
    <div className={`
      relative rounded-3xl overflow-hidden
      ${cardBgColors.base}
      border border-gray-200 dark:border-gray-700
      shadow-xl
      animate-slideDown
    `}>
      {/* Decorative gradient accent bar */}
      <div className={`h-2 bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}`} />

      {/* Hero Section */}
      <div className="relative px-8 pt-10 pb-8">
        {/* Floating icon */}
        <div className={`
          absolute -top-1 right-8 w-20 h-20 rounded-2xl rotate-6
          bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo}
          flex items-center justify-center shadow-lg
          transform transition-transform hover:rotate-12 hover:scale-105
        `}>
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Title and subtitle */}
        <div className="max-w-2xl">
          <p className={`text-sm font-semibold uppercase tracking-wider ${colors.headlineText} mb-2`}>
            {content.title}
          </p>
          <h3 className={`text-2xl md:text-3xl font-bold ${headingColors.primary} mb-4 leading-tight`}>
            {content.headline}
          </h3>
          <p className={`text-lg ${formInputColors.helper} leading-relaxed`}>
            {content.subtitle}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* What We Handle - Feature Cards */}
          <div>
            <h4 className={`text-sm font-bold uppercase tracking-wider ${headingColors.secondary} mb-4 flex items-center gap-2`}>
              <span className={`w-8 h-0.5 ${colors.accent} rounded-full`}></span>
              What We Handle
            </h4>
            <div className="space-y-3">
              {content.bulletPoints.map((point, idx) => (
                <FeatureCard
                  key={idx}
                  text={point}
                  index={idx}
                  colors={colors}
                />
              ))}
            </div>
          </div>

          {/* What We Do - Highlight Box */}
          <div>
            <h4 className={`text-sm font-bold uppercase tracking-wider ${headingColors.secondary} mb-4 flex items-center gap-2`}>
              <span className={`w-8 h-0.5 ${colors.accent} rounded-full`}></span>
              {content.examples.title}
            </h4>
            <div className={`
              relative rounded-2xl p-6
              ${colors.featureCardBg}
              border ${colors.featureCardBorder}
            `}>
              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-16 h-16 ${colors.accentLight} rounded-bl-3xl opacity-50`} />

              <ul className="space-y-4 relative">
                {content.examples.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={`
                      flex-shrink-0 w-6 h-6 rounded-lg
                      ${colors.accentLight}
                      flex items-center justify-center
                      text-sm font-bold ${colors.featureCardIcon}
                    `}>
                      {idx + 1}
                    </span>
                    <span className={`${headingColors.primary} font-medium`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className={`
        px-8 py-6
        ${colors.featureCardBg}
        border-t ${colors.featureCardBorder}
        flex flex-col sm:flex-row items-center justify-between gap-4
      `}>
        {/* Reassurance quote */}
        <p className={`text-lg italic ${colors.headlineText} font-medium text-center sm:text-left`}>
          &ldquo;{content.reassurance}&rdquo;
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-3 flex-shrink-0">
          <Button
            href={content.ctas.secondary.href}
            variant="gray"
            size="md"
          >
            {content.ctas.secondary.text}
          </Button>
          <Button
            href={content.ctas.primary.href}
            variant={colors.buttonVariant}
            size="md"
          >
            {content.ctas.primary.text}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FeatureCard - Individual feature item with hover effect
// ============================================================================

interface FeatureCardProps {
  text: string;
  index: number;
  colors: ServiceColorConfig;
}

function FeatureCard({ text, index, colors }: FeatureCardProps) {
  return (
    <div className={`
      group relative rounded-xl p-4
      ${cardBgColors.base}
      border border-gray-200 dark:border-gray-700
      hover:border-gray-300 dark:hover:border-gray-600
      transition-all duration-300
      hover:shadow-md hover:-translate-y-0.5
    `}>
      <div className="flex items-center gap-4">
        {/* Animated checkmark */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-lg
          ${colors.accentLight}
          flex items-center justify-center
          transition-transform duration-300
          group-hover:scale-110
        `}>
          <svg
            className={`w-5 h-5 ${colors.featureCardIcon}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <span className={`${headingColors.primary} font-medium`}>
          {text}
        </span>
      </div>

      {/* Subtle index indicator */}
      <span className={`
        absolute top-2 right-3 text-xs font-mono
        text-gray-300 dark:text-gray-600
      `}>
        0{index + 1}
      </span>
    </div>
  );
}
