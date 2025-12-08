'use client';

import {
  TextField,
  TextAreaField,
  SelectField,
  CollapsibleSection,
  ArrayField,
  ButtonField,
  colorOptions,
} from '../fields';
import type { HomePageContent, CTAButton, ProcessPreviewStep } from '@/lib/page-content-types';

// ============================================================================
// Homepage Form
// ============================================================================
// What: Form for editing Homepage content
// Why: Provides organized input fields matching the homepage structure
// How: Collapsible sections for Hero, Process Preview, and CTA
// Note: Hero tagline/description and service cards come from site.config (not editable here)

interface HomepageFormProps {
  content: HomePageContent;
  onChange: (content: HomePageContent) => void;
}

export default function HomepageForm({ content, onChange }: HomepageFormProps) {
  const updateField = <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Note about hero content */}
      <div className="px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> The main hero title and description are defined in code (site.config.ts). You can edit the hero buttons and other sections below.
        </p>
      </div>

      {/* Hero Buttons */}
      <CollapsibleSection title="Hero Buttons" defaultOpen={true}>
        <ArrayField<CTAButton>
          label="Buttons"
          items={content.hero.buttons}
          onChange={(buttons) => updateField('hero', { ...content.hero, buttons })}
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

      {/* Services Section Title */}
      <CollapsibleSection title="Services Section" defaultOpen={true}>
        <TextField
          label="Section Title"
          value={content.servicesTitle}
          onChange={(v) => updateField('servicesTitle', v)}
          placeholder="e.g., What We Do"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The service cards themselves are defined in code and can&apos;t be edited here.
        </p>
      </CollapsibleSection>

      {/* Process Preview */}
      <CollapsibleSection title="How It Works Preview" badge={`${content.processPreview.steps.length} steps`}>
        <TextField
          label="Section Title"
          value={content.processPreview.title}
          onChange={(v) => updateField('processPreview', { ...content.processPreview, title: v })}
          placeholder="e.g., How It Works"
        />
        <TextField
          label="Link Text"
          value={content.processPreview.linkText}
          onChange={(v) => updateField('processPreview', { ...content.processPreview, linkText: v })}
          placeholder="e.g., See the full process →"
        />
        <ArrayField<ProcessPreviewStep>
          label="Steps"
          items={content.processPreview.steps}
          onChange={(steps) => updateField('processPreview', { ...content.processPreview, steps })}
          createItem={() => ({
            number: content.processPreview.steps.length + 1,
            title: '',
            description: '',
            color: 'blue',
          })}
          itemLabel={(step) => `Step ${step.number}: ${step.title || 'Untitled'}`}
          minItems={1}
          maxItems={4}
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
                  onChange={(v) => onStepChange({ ...step, color: v as ProcessPreviewStep['color'] })}
                  options={colorOptions}
                />
              </div>
              <TextField
                label="Title"
                value={step.title}
                onChange={(v) => onStepChange({ ...step, title: v })}
                placeholder="e.g., Submit Request"
              />
              <TextAreaField
                label="Description"
                value={step.description}
                onChange={(v) => onStepChange({ ...step, description: v })}
                placeholder="Brief description of this step"
                rows={2}
              />
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
          placeholder="e.g., Ready to Get Started?"
        />
        <TextAreaField
          label="Description"
          value={content.cta.description}
          onChange={(v) => updateField('cta', { ...content.cta, description: v })}
          placeholder="Text below the CTA title"
          rows={2}
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
        <TextField
          label="Footer Text"
          value={content.cta.footer}
          onChange={(v) => updateField('cta', { ...content.cta, footer: v })}
          placeholder="e.g., Not sure what you need?"
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Footer Link Text"
            value={content.cta.footerLinkText}
            onChange={(v) => updateField('cta', { ...content.cta, footerLinkText: v })}
            placeholder="e.g., Check our FAQ"
          />
          <TextField
            label="Footer Link URL"
            value={content.cta.footerLinkHref}
            onChange={(v) => updateField('cta', { ...content.cta, footerLinkHref: v })}
            placeholder="/faq"
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
