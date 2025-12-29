'use client';

import { useInlineEdit } from '@/context/InlineEditContext';
import { formInputColors, headingColors, cardBgColors, cardBorderColors, focusRingClasses } from '@/lib/colors';

// ============================================================================
// Property Sidebar - Edit component properties inline
// ============================================================================
// What: Sidebar that shows editable fields for the selected component
// Why: Allows admins to modify component properties without opening full editor
// How: Reads component type to determine fields, updates pending changes on edit

// Common field types that Puck components use
type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'number' | 'color';

interface FieldConfig {
  type: FieldType;
  label: string;
  options?: { label: string; value: string }[];
}

// Simplified field configurations for common Puck components
// This maps component types to their editable fields
const componentFields: Record<string, Record<string, FieldConfig>> = {
  Hero: {
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'textarea', label: 'Subtitle' },
    buttonText: { type: 'text', label: 'Button Text' },
    buttonHref: { type: 'text', label: 'Button Link' },
  },
  TextBlock: {
    content: { type: 'textarea', label: 'Content' },
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
  PageHeader: {
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'textarea', label: 'Subtitle' },
  },
  CTASection: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
    buttonText: { type: 'text', label: 'Button Text' },
    buttonHref: { type: 'text', label: 'Button Link' },
  },
  Button: {
    children: { type: 'text', label: 'Button Text' },
    href: { type: 'text', label: 'Link URL' },
    variant: {
      type: 'select',
      label: 'Color',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Purple', value: 'purple' },
        { label: 'Green', value: 'green' },
        { label: 'Orange', value: 'orange' },
        { label: 'Gray', value: 'gray' },
      ],
    },
  },
  Card: {
    title: { type: 'text', label: 'Title' },
    description: { type: 'textarea', label: 'Description' },
  },
  Image: {
    src: { type: 'text', label: 'Image URL' },
    alt: { type: 'text', label: 'Alt Text' },
  },
};

export default function PropertySidebar() {
  const {
    isEditMode,
    isSidebarOpen,
    setSidebarOpen,
    selectedComponent,
    addPendingChange,
  } = useInlineEdit();

  // Don't render if not in edit mode or no component selected
  if (!isEditMode || !isSidebarOpen || !selectedComponent) {
    return null;
  }

  const fields = componentFields[selectedComponent.type] || {};
  const hasFields = Object.keys(fields).length > 0;

  const handleFieldChange = (propName: string, newValue: unknown) => {
    addPendingChange({
      path: selectedComponent.path,
      propName,
      oldValue: selectedComponent.props[propName],
      newValue,
    });
  };

  const renderField = (propName: string, config: FieldConfig) => {
    const currentValue = selectedComponent.props[propName] as string | number | undefined;

    switch (config.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(propName, e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(propName, e.target.value)}
            rows={3}
            className={`
              w-full px-3 py-2 rounded-lg border resize-y
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          />
        );

      case 'select':
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(propName, e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          >
            {config.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(propName, Number(e.target.value))}
            className={`
              w-full px-3 py-2 rounded-lg border
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          />
        );

      default:
        return (
          <input
            type="text"
            value={String(currentValue || '')}
            onChange={(e) => handleFieldChange(propName, e.target.value)}
            className={`
              w-full px-3 py-2 rounded-lg border
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          />
        );
    }
  };

  return (
    <div
      className={`
        fixed top-32 right-0 w-80 h-[calc(100vh-8rem)] z-40
        ${cardBgColors.base} ${cardBorderColors.light}
        border-l shadow-xl overflow-y-auto
        transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="sticky top-0 bg-inherit border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-semibold ${headingColors.primary}`}>
              {selectedComponent.type}
            </h3>
            <p className={`text-xs ${formInputColors.helper}`}>
              {selectedComponent.path}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-4">
        {hasFields ? (
          Object.entries(fields).map(([propName, config]) => (
            <div key={propName}>
              <label className={`block text-sm font-medium ${formInputColors.label} mb-1`}>
                {config.label}
              </label>
              {renderField(propName, config)}
            </div>
          ))
        ) : (
          <p className={`text-sm ${formInputColors.helper}`}>
            No editable fields configured for this component type.
            <br /><br />
            Use the full Puck editor at{' '}
            <a href="/admin/pages" className="text-blue-500 hover:underline">
              /admin/pages
            </a>{' '}
            to edit this component.
          </p>
        )}
      </div>

      {/* Footer with component info */}
      <div className="sticky bottom-0 bg-inherit border-t border-gray-200 dark:border-gray-700 p-4">
        <p className={`text-xs ${formInputColors.helper}`}>
          Tip: Click another component to edit it, or press Escape to deselect.
        </p>
      </div>
    </div>
  );
}
