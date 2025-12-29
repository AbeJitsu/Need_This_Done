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
import type { HomePageContent, CTAButton, ProcessPreviewStep, HomeServiceCard } from '@/lib/page-content-types';

// ============================================================================
// Homepage Form
// ============================================================================
// What: Form for editing Homepage content
// Why: Provides organized input fields matching the homepage structure
// How: Collapsible sections for Hero, Services, Process Preview, and CTA
// Note: All content is now editable via the inline sidebar editor

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
      {/* Hero Section */}
      <CollapsibleSection title="Hero Section" defaultOpen={true}>
        <TextField
          label="Title"
          value={content.hero.title}
          onChange={(v) => updateField('hero', { ...content.hero, title: v })}
          placeholder="e.g., Get your tasks done right"
        />
        <TextAreaField
          label="Description"
          value={content.hero.description}
          onChange={(v) => updateField('hero', { ...content.hero, description: v })}
          placeholder="Main hero description"
          rows={2}
        />
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

      {/* Services Section */}
      <CollapsibleSection title="Services Section" defaultOpen={true} badge={`${content.services.cards.length} cards`}>
        <TextField
          label="Section Title"
          value={content.services.title}
          onChange={(v) => updateField('services', { ...content.services, title: v })}
          placeholder="e.g., What We Offer"
        />
        <TextField
          label="Link Text"
          value={content.services.linkText}
          onChange={(v) => updateField('services', { ...content.services, linkText: v })}
          placeholder="e.g., Compare them all →"
        />
        <TextField
          label="Link URL"
          value={content.services.linkHref}
          onChange={(v) => updateField('services', { ...content.services, linkHref: v })}
          placeholder="/services"
        />
        <ArrayField<HomeServiceCard>
          label="Service Cards"
          items={content.services.cards}
          onChange={(cards) => updateField('services', { ...content.services, cards })}
          createItem={() => ({ title: '', tagline: '', description: '', details: '', color: 'blue' })}
          itemLabel={(card) => card.title || 'New Service'}
          minItems={1}
          maxItems={6}
          renderItem={(card, _, onCardChange) => (
            <div className="space-y-3">
              <TextField
                label="Title"
                value={card.title}
                onChange={(v) => onCardChange({ ...card, title: v })}
                placeholder="e.g., Virtual Assistant"
              />
              <TextField
                label="Tagline"
                value={card.tagline}
                onChange={(v) => onCardChange({ ...card, tagline: v })}
                placeholder="Short description shown on card"
              />
              <TextAreaField
                label="Description"
                value={card.description}
                onChange={(v) => onCardChange({ ...card, description: v })}
                placeholder="Full description"
                rows={2}
              />
              <TextField
                label="Details"
                value={card.details || ''}
                onChange={(v) => onCardChange({ ...card, details: v })}
                placeholder="Comma-separated features"
              />
              <SelectField
                label="Color"
                value={card.color}
                onChange={(v) => onCardChange({ ...card, color: v as HomeServiceCard['color'] })}
                options={colorOptions}
              />
            </div>
          )}
        />
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
