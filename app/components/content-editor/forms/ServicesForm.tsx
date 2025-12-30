'use client';

import {
  TextField,
  TextAreaField,
  CollapsibleSection,
  ArrayField,
} from '../fields';
import { alertColors } from '@/lib/colors';
import type { ServicesPageContent, ExpectationItem } from '@/lib/page-content-types';

// ============================================================================
// Services Page Form
// ============================================================================
// What: Form for editing Services page content
// Why: Provides organized input fields matching the Services page structure
// How: Collapsible sections for Header, Expectations, and CTA
// Note: Service cards themselves come from site.config.ts (not editable here)

interface ServicesFormProps {
  content: ServicesPageContent;
  onChange: (content: ServicesPageContent) => void;
}

export default function ServicesForm({ content, onChange }: ServicesFormProps) {
  const updateField = <K extends keyof ServicesPageContent>(
    key: K,
    value: ServicesPageContent[K]
  ) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <CollapsibleSection title="Page Header" defaultOpen={true}>
        <TextField
          label="Title"
          value={content.header.title}
          onChange={(v) => updateField('header', { ...content.header, title: v })}
          placeholder="e.g., What We Offer"
        />
        <TextAreaField
          label="Description"
          value={content.header.description}
          onChange={(v) => updateField('header', { ...content.header, description: v })}
          placeholder="Brief description below the title"
          rows={2}
        />
      </CollapsibleSection>

      {/* Note about service cards */}
      <div className={`px-4 py-3 rounded-lg ${alertColors.info.bg} border border-blue-200 dark:border-blue-400`}>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> The service cards (Data Work, Document Handling, etc.) are defined in code and can&apos;t be edited here. Contact a developer to add or modify services.
        </p>
      </div>

      {/* What to Expect Section */}
      <CollapsibleSection title="What to Expect" badge={`${content.expectations.length} items`}>
        <TextField
          label="Section Title"
          value={content.expectationsTitle}
          onChange={(v) => updateField('expectationsTitle', v)}
          placeholder="e.g., What to Expect"
        />
        <ArrayField<ExpectationItem>
          label="Expectation Items"
          items={content.expectations}
          onChange={(items) => updateField('expectations', items)}
          createItem={() => ({
            title: '',
            description: '',
          })}
          itemLabel={(item, index) => item.title || `Item ${index + 1}`}
          minItems={1}
          maxItems={6}
          renderItem={(item, _, onItemChange) => (
            <div className="space-y-3">
              <TextField
                label="Title"
                value={item.title}
                onChange={(v) => onItemChange({ ...item, title: v })}
                placeholder="e.g., Quick Communication"
              />
              <TextAreaField
                label="Description"
                value={item.description}
                onChange={(v) => onItemChange({ ...item, description: v })}
                placeholder="Brief explanation..."
                rows={2}
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`link-enabled-${item.title}`}
                  checked={!!item.link}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onItemChange({ ...item, link: { href: '' } });
                    } else {
                      const { link, ...rest } = item;
                      onItemChange(rest as ExpectationItem);
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor={`link-enabled-${item.title}`} className="text-sm text-gray-600 dark:text-gray-400">
                  Make this item clickable
                </label>
              </div>
              {item.link && (
                <TextField
                  label="Link URL"
                  value={item.link.href}
                  onChange={(v) => onItemChange({ ...item, link: { href: v } })}
                  placeholder="/contact"
                />
              )}
            </div>
          )}
        />
      </CollapsibleSection>

      {/* Choose Your Path Section */}
      <CollapsibleSection title="Choose Your Path" defaultOpen={false}>
        <TextField
          label="Title"
          value={content.chooseYourPath.title}
          onChange={(v) => updateField('chooseYourPath', { ...content.chooseYourPath, title: v })}
          placeholder="e.g., Choose What Works for You"
        />
        <TextAreaField
          label="Description"
          value={content.chooseYourPath.description}
          onChange={(v) => updateField('chooseYourPath', { ...content.chooseYourPath, description: v })}
          placeholder="Text below the title"
          rows={2}
        />
        <p className="text-sm text-gray-600 mt-4 mb-4">
          Two paths are displayed: Get a Quote (Free/Green) and Book a Consultation (Expert Help/Purple). Edit path details in the content management system.
        </p>
      </CollapsibleSection>
    </div>
  );
}
