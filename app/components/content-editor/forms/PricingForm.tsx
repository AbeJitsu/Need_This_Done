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
import type { PricingPageContent, PricingTier, CTAButton } from '@/lib/page-content-types';

// ============================================================================
// Pricing Page Form
// ============================================================================
// What: Form for editing Pricing page content
// Why: Provides organized input fields matching the page structure
// How: Collapsible sections for Header, Pricing Tiers, Payment Note, and Custom Section

interface PricingFormProps {
  content: PricingPageContent;
  onChange: (content: PricingPageContent) => void;
}

export default function PricingForm({ content, onChange }: PricingFormProps) {
  const updateField = <K extends keyof PricingPageContent>(
    key: K,
    value: PricingPageContent[K]
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
          placeholder="e.g., Pick Your Perfect Fit"
        />
        <TextAreaField
          label="Description"
          value={content.header.description}
          onChange={(v) => updateField('header', { ...content.header, description: v })}
          placeholder="Brief description below the title"
          rows={2}
        />
      </CollapsibleSection>

      {/* Pricing Tiers */}
      <CollapsibleSection title="Pricing Tiers" badge={`${content.tiers.length} tiers`}>
        <ArrayField<PricingTier>
          label="Tiers"
          items={content.tiers}
          onChange={(tiers) => updateField('tiers', tiers)}
          createItem={() => ({
            name: '',
            price: '$0',
            period: '',
            description: '',
            features: [],
            color: 'blue',
            cta: 'Get Started',
            popular: false,
          })}
          itemLabel={(tier) => tier.name || 'New Tier'}
          minItems={1}
          maxItems={4}
          renderItem={(tier, _, onTierChange) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Tier Name"
                  value={tier.name}
                  onChange={(v) => onTierChange({ ...tier, name: v })}
                  placeholder="e.g., Quick Task"
                />
                <SelectField
                  label="Color"
                  value={tier.color}
                  onChange={(v) => onTierChange({ ...tier, color: v as PricingTier['color'] })}
                  options={colorOptions}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Price"
                  value={tier.price}
                  onChange={(v) => onTierChange({ ...tier, price: v })}
                  placeholder="e.g., $35"
                />
                <TextField
                  label="Period"
                  value={tier.period}
                  onChange={(v) => onTierChange({ ...tier, period: v })}
                  placeholder="e.g., per task"
                />
              </div>
              <TextAreaField
                label="Description"
                value={tier.description}
                onChange={(v) => onTierChange({ ...tier, description: v })}
                placeholder="Brief description of this tier"
                rows={2}
              />
              <TextField
                label="Button Text (leave empty for shared CTA)"
                value={tier.cta || ''}
                onChange={(v) => onTierChange({ ...tier, cta: v || undefined })}
                placeholder="e.g., Get Started"
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`popular-${tier.name}`}
                  checked={tier.popular || false}
                  onChange={(e) => onTierChange({ ...tier, popular: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor={`popular-${tier.name}`} className="text-sm text-gray-600 dark:text-gray-400">
                  Show &quot;Most Popular&quot; badge
                </label>
              </div>
              {/* Features list */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Features
                </label>
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...tier.features];
                        newFeatures[featureIndex] = e.target.value;
                        onTierChange({ ...tier, features: newFeatures });
                      }}
                      placeholder="Feature item"
                      className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = tier.features.filter((_, i) => i !== featureIndex);
                        onTierChange({ ...tier, features: newFeatures });
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
                    onTierChange({ ...tier, features: [...tier.features, ''] });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          )}
        />
      </CollapsibleSection>

      {/* Payment Note */}
      <CollapsibleSection title="Payment Note" defaultOpen={false}>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="payment-note-enabled"
            checked={content.paymentNote.enabled}
            onChange={(e) => updateField('paymentNote', { ...content.paymentNote, enabled: e.target.checked })}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="payment-note-enabled" className="text-sm text-gray-600 dark:text-gray-400">
            Show payment structure section
          </label>
        </div>
        {content.paymentNote.enabled && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Deposit</h4>
                <TextField
                  label="Percent Badge"
                  value={content.paymentNote.depositPercent}
                  onChange={(v) => updateField('paymentNote', { ...content.paymentNote, depositPercent: v })}
                  placeholder="50%"
                />
                <TextField
                  label="Label"
                  value={content.paymentNote.depositLabel}
                  onChange={(v) => updateField('paymentNote', { ...content.paymentNote, depositLabel: v })}
                  placeholder="To Begin"
                />
                <TextField
                  label="Description"
                  value={content.paymentNote.depositDescription}
                  onChange={(v) => updateField('paymentNote', { ...content.paymentNote, depositDescription: v })}
                  placeholder="Reserves your spot"
                />
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">On Delivery</h4>
                <TextField
                  label="Percent Badge"
                  value={content.paymentNote.deliveryPercent}
                  onChange={(v) => updateField('paymentNote', { ...content.paymentNote, deliveryPercent: v })}
                  placeholder="50%"
                />
                <TextField
                  label="Label"
                  value={content.paymentNote.deliveryLabel}
                  onChange={(v) => updateField('paymentNote', { ...content.paymentNote, deliveryLabel: v })}
                  placeholder="On Delivery"
                />
                <TextField
                  label="Description"
                  value={content.paymentNote.deliveryDescription}
                  onChange={(v) => updateField('paymentNote', { ...content.paymentNote, deliveryDescription: v })}
                  placeholder="When you're happy"
                />
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Custom Section (Bottom CTA) */}
      <CollapsibleSection title="Bottom Section" defaultOpen={false}>
        <TextField
          label="Title"
          value={content.customSection.title}
          onChange={(v) => updateField('customSection', { ...content.customSection, title: v })}
          placeholder="e.g., Something Else in Mind?"
        />
        <TextAreaField
          label="Description"
          value={content.customSection.description}
          onChange={(v) => updateField('customSection', { ...content.customSection, description: v })}
          placeholder="Text below the section title"
          rows={2}
        />
        <SelectField
          label="Card Hover Color"
          value={content.customSection.hoverColor || 'orange'}
          onChange={(v) => updateField('customSection', { ...content.customSection, hoverColor: v as PricingPageContent['customSection']['hoverColor'] })}
          options={hoverColorOptions}
        />
        <ArrayField<CTAButton>
          label="Buttons"
          items={content.customSection.buttons}
          onChange={(buttons) => updateField('customSection', { ...content.customSection, buttons })}
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
