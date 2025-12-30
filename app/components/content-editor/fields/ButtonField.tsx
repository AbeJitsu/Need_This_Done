// ============================================================================
// ButtonField - CTA Button Configuration
// ============================================================================
// What: A compound field for editing button properties (text, href, variant)
// Why: Buttons are common across all pages and have consistent structure
// How: Combines text input, link input, and variant select in one component

import TextField from './TextField';
import SelectField, { buttonVariantOptions } from './SelectField';
import { uiChromeBg, type AccentVariant } from '@/lib/colors';

export interface ButtonConfig {
  text: string;
  href: string;
  variant: AccentVariant;
}

interface ButtonFieldProps {
  label: string;
  value: ButtonConfig;
  onChange: (value: ButtonConfig) => void;
  showVariant?: boolean;
  className?: string;
}

export default function ButtonField({
  label,
  value,
  onChange,
  showVariant = true,
  className = '',
}: ButtonFieldProps) {
  const handleChange = (field: keyof ButtonConfig, newValue: string) => {
    if (field === 'variant') {
      onChange({ ...value, variant: newValue as AccentVariant });
    } else {
      onChange({ ...value, [field]: newValue });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className={`p-3 rounded-lg ${uiChromeBg.panel} space-y-3`}>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Button Text"
            value={value.text}
            onChange={(v) => handleChange('text', v)}
            placeholder="e.g., Get Started"
          />

          <TextField
            label="Link URL"
            value={value.href}
            onChange={(v) => handleChange('href', v)}
            placeholder="e.g., /contact"
          />
        </div>

        {showVariant && (
          <SelectField
            label="Button Style"
            value={value.variant}
            onChange={(v) => handleChange('variant', v)}
            options={buttonVariantOptions}
          />
        )}
      </div>
    </div>
  );
}
