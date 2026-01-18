'use client';

import {
  TextField,
  TextAreaField,
  SelectField,
  CollapsibleSection,
  ArrayField,
  ButtonField,
  hoverColorOptions,
} from '../fields';
import type { FAQPageContent, FAQItem, CTAButton } from '@/lib/page-content-types';

// ============================================================================
// FAQ Page Form
// ============================================================================
// What: Form for editing FAQ page content
// Why: Provides organized input fields matching the FAQ page structure
// How: Collapsible sections for Header, FAQ Items, and CTA

interface FAQFormProps {
  content: FAQPageContent;
  onChange: (content: FAQPageContent) => void;
}

export default function FAQForm({ content, onChange }: FAQFormProps) {
  // Helper to update nested content
  const updateField = <K extends keyof FAQPageContent>(
    key: K,
    value: FAQPageContent[K]
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
          placeholder="e.g., Frequently Asked Questions"
        />
        <TextAreaField
          label="Description"
          value={content.header.description}
          onChange={(v) => updateField('header', { ...content.header, description: v })}
          placeholder="Brief description below the title"
          rows={2}
        />
      </CollapsibleSection>

      {/* FAQ Items */}
      <CollapsibleSection title="FAQ Items" badge={`${content.items.length} questions`}>
        <ArrayField<FAQItem>
          label="Questions"
          items={content.items}
          onChange={(items) => updateField('items', items)}
          createItem={() => ({
            question: '',
            answer: '',
            links: [],
          })}
          itemLabel={(item, index) => item.question || `Question ${index + 1}`}
          minItems={1}
          renderItem={(item, _, onItemChange) => (
            <div className="space-y-3">
              <TextField
                label="Question"
                value={item.question}
                onChange={(v) => onItemChange({ ...item, question: v })}
                placeholder="e.g., How long does a project take?"
              />
              <TextAreaField
                label="Answer"
                value={item.answer}
                onChange={(v) => onItemChange({ ...item, answer: v })}
                placeholder="The answer to the question..."
                rows={3}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Tip: To add links, include the link text in your answer (e.g., &quot;contact page&quot;) then add link entries below.
              </div>
              {/* Simple link management */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Links in Answer (optional)
                </label>
                {(item.links || []).map((link, linkIndex) => (
                  <div key={linkIndex} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={link.text}
                      onChange={(e) => {
                        const newLinks = [...(item.links || [])];
                        newLinks[linkIndex] = { ...link, text: e.target.value };
                        onItemChange({ ...item, links: newLinks });
                      }}
                      placeholder="Link text"
                      className="flex-1 px-2 py-1 text-xs rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => {
                        const newLinks = [...(item.links || [])];
                        newLinks[linkIndex] = { ...link, href: e.target.value };
                        onItemChange({ ...item, links: newLinks });
                      }}
                      placeholder="/path"
                      className="w-24 px-2 py-1 text-xs rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = (item.links || []).filter((_, i) => i !== linkIndex);
                        onItemChange({ ...item, links: newLinks });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = [...(item.links || []), { text: '', href: '' }];
                    onItemChange({ ...item, links: newLinks });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  + Add Link
                </button>
              </div>
            </div>
          )}
        />
      </CollapsibleSection>

      {/* CTA Section */}
      <CollapsibleSection title="Call to Action" defaultOpen={false}>
        <TextField
          label="Title"
          value={content.cta.title}
          onChange={(v) => updateField('cta', { ...content.cta, title: v })}
          placeholder="e.g., Still Have Questions?"
        />
        <TextAreaField
          label="Description"
          value={content.cta.description}
          onChange={(v) => updateField('cta', { ...content.cta, description: v })}
          placeholder="Text below the CTA title"
          rows={2}
        />
        <SelectField
          label="Card Hover Color"
          value={content.cta.hoverColor || 'gold'}
          onChange={(v) => updateField('cta', { ...content.cta, hoverColor: v as FAQPageContent['cta']['hoverColor'] })}
          options={hoverColorOptions}
        />
        <ArrayField<CTAButton>
          label="Buttons"
          items={content.cta.buttons}
          onChange={(buttons) => updateField('cta', { ...content.cta, buttons })}
          createItem={() => ({ text: '', href: '', variant: 'purple' })}
          itemLabel={(btn) => btn.text || 'New Button'}
          maxItems={3}
          renderItem={(button, _, onButtonChange) => (
            <ButtonField
              label=""
              value={button}
              onChange={onButtonChange}
            />
          )}
        />
      </CollapsibleSection>
    </div>
  );
}
