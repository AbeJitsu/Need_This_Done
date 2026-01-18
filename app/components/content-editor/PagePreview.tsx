'use client';

import { useState } from 'react';
import { uiChromeBg, cardBgColors } from '@/lib/colors';
import HomepagePreview from './previews/HomepagePreview';
import PricingPreview from './previews/PricingPreview';
import ServicesPreview from './previews/ServicesPreview';
import FAQPreview from './previews/FAQPreview';
import HowItWorksPreview from './previews/HowItWorksPreview';
import type {
  PageContent,
  HomePageContent,
  PricingPageContent,
  ServicesPageContent,
  FAQPageContent,
  HowItWorksPageContent,
  EditablePageSlug,
} from '@/lib/page-content-types';

// ============================================================================
// Page Preview Router
// ============================================================================
// What: Routes to the correct preview component based on page slug
// Why: Centralizes preview rendering logic for the content editor
// How: Switches on slug, casts content to correct type, renders in container

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

interface PagePreviewProps {
  slug: EditablePageSlug;
  content: PageContent;
}

const deviceDimensions: Record<DeviceSize, { width: number; label: string }> = {
  desktop: { width: 1280, label: 'Desktop' },
  tablet: { width: 768, label: 'Tablet' },
  mobile: { width: 375, label: 'Mobile' },
};

export default function PagePreview({ slug, content }: PagePreviewProps) {
  const [device, setDevice] = useState<DeviceSize>('desktop');

  // Render the appropriate preview based on slug
  const renderPreview = () => {
    switch (slug) {
      case 'home':
        return <HomepagePreview content={content as HomePageContent} />;
      case 'pricing':
        return <PricingPreview content={content as PricingPageContent} />;
      case 'services':
        return <ServicesPreview content={content as ServicesPageContent} />;
      case 'faq':
        return <FAQPreview content={content as FAQPageContent} />;
      case 'how-it-works':
        return <HowItWorksPreview content={content as HowItWorksPageContent} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Preview not available for this page
          </div>
        );
    }
  };

  // Calculate scale factor based on container width
  const targetWidth = deviceDimensions[device].width;

  return (
    <div className="h-full flex flex-col">
      {/* Device Toggle Bar */}
      <div className={`flex-shrink-0 flex items-center justify-center gap-2 py-3 px-4 border-b border-gray-200 dark:border-gray-700 ${uiChromeBg.toolbar}`}>
        {Object.entries(deviceDimensions).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            onClick={() => setDevice(key as DeviceSize)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full transition-colors
              ${
                device === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div
          className={`mx-auto ${cardBgColors.base} shadow-lg rounded-lg overflow-hidden transition-all duration-300`}
          style={{
            width: device === 'desktop' ? '100%' : targetWidth,
            maxWidth: '100%',
            minHeight: '600px',
          }}
        >
          {/* Simulated Browser Chrome */}
          <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 flex items-center gap-2 border-b border-gray-300 dark:border-gray-600">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-gold-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white dark:bg-gray-600 rounded px-3 py-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                yoursite.com/{slug === 'home' ? '' : slug}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
