'use client';

import {
  TextField,
  TextAreaField,
  SelectField,
  CollapsibleSection,
  ArrayField,
  ButtonField,
  hoverColorOptions,
  colorOptions,
} from '../fields';
import type { HowItWorksPageContent, ProcessStep, CTAButton } from '@/lib/page-content-types';

// ============================================================================
// How It Works Page Form
// ============================================================================
// What: Form for editing How It Works page content
// Why: Provides organized input fields matching the page structure
// How: Collapsible sections for Header, Process Steps, Timeline, and CTA

interface HowItWorksFormProps {
  content: HowItWorksPageContent;
  onChange: (content: HowItWorksPageContent) => void;
}

export default function HowItWorksForm({ content, onChange }: HowItWorksFormProps) {
  const updateField = <K extends keyof HowItWorksPageContent>(
    key: K,
    value: HowItWorksPageContent[K]
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
          placeholder="e.g., How It Works"
        />
        <TextAreaField
          label="Description"
          value={content.header.description}
          onChange={(v) => updateField('header', { ...content.header, description: v })}
          placeholder="Brief description below the title"
          rows={2}
        />
      </CollapsibleSection>

      {/* Process Steps */}
      <CollapsibleSection title="Process Steps" badge={`${content.steps.length} steps`}>
        <ArrayField<ProcessStep>
          label="Steps"
          items={content.steps}
          onChange={(steps) => updateField('steps', steps)}
          createItem={() => ({
            number: content.steps.length + 1,
            title: '',
            description: '',
            details: [],
            color: 'blue',
          })}
          itemLabel={(step) => `Step ${step.number}: ${step.title || 'Untitled'}`}
          minItems={1}
          maxItems={6}
          renderItem={(step, _, onStepChange) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Step Number"
                  value={step.number.toString()}
                  onChange={(v) => onStepChange({ ...step, number: parseInt(v) || 1 })}
                />
                <SelectField
                  label="Color"
                  value={step.color}
                  onChange={(v) => onStepChange({ ...step, color: v as ProcessStep['color'] })}
                  options={colorOptions}
                />
              </div>
              <TextField
                label="Title"
                value={step.title}
                onChange={(v) => onStepChange({ ...step, title: v })}
                placeholder="e.g., Tell Us What You Need"
              />
              <TextAreaField
                label="Description"
                value={step.description}
                onChange={(v) => onStepChange({ ...step, description: v })}
                placeholder="Brief explanation of this step"
                rows={2}
              />
              {/* Details list */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bullet Points
                </label>
                {step.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={detail}
                      onChange={(e) => {
                        const newDetails = [...step.details];
                        newDetails[detailIndex] = e.target.value;
                        onStepChange({ ...step, details: newDetails });
                      }}
                      placeholder="Detail point"
                      className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newDetails = step.details.filter((_, i) => i !== detailIndex);
                        onStepChange({ ...step, details: newDetails });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    onStepChange({ ...step, details: [...step.details, ''] });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  + Add Bullet Point
                </button>
              </div>
              {/* Optional link */}
              <TextField
                label="Link URL (optional)"
                value={step.href || ''}
                onChange={(v) => onStepChange({ ...step, href: v || undefined })}
                placeholder="/contact"
                hint="Make this step card clickable"
              />
            </div>
          )}
        />
      </CollapsibleSection>

      {/* Timeline Note */}
      <CollapsibleSection title="Timeline Note" defaultOpen={false}>
        <TextField
          label="Title"
          value={content.timeline.title}
          onChange={(v) => updateField('timeline', { ...content.timeline, title: v })}
          placeholder="e.g., Typical Timeline"
        />
        <TextAreaField
          label="Description"
          value={content.timeline.description}
          onChange={(v) => updateField('timeline', { ...content.timeline, description: v })}
          placeholder="Information about typical project timelines"
          rows={3}
        />
        <SelectField
          label="Card Hover Color"
          value={content.timeline.hoverColor || 'blue'}
          onChange={(v) => updateField('timeline', { ...content.timeline, hoverColor: v as HowItWorksPageContent['timeline']['hoverColor'] })}
          options={hoverColorOptions}
        />
      </CollapsibleSection>

      {/* CTA Section */}
      <CollapsibleSection title="Call to Action" defaultOpen={false}>
        <TextField
          label="Title"
          value={content.cta.title}
          onChange={(v) => updateField('cta', { ...content.cta, title: v })}
          placeholder="e.g., Ready to Get Started?"
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
          onChange={(v) => updateField('cta', { ...content.cta, hoverColor: v as HowItWorksPageContent['cta']['hoverColor'] })}
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
