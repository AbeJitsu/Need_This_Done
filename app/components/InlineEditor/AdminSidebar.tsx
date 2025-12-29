'use client';

import { useState } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';
import { useAuth } from '@/context/AuthContext';
import {
  formInputColors,
  headingColors,
  cardBgColors,
  cardBorderColors,
  focusRingClasses,
  accentColors,
} from '@/lib/colors';

// ============================================================================
// Admin Sidebar - Edit ALL page content inline
// ============================================================================
// What: Sidebar that dynamically renders editors for any content structure
// Why: Allows admins to modify ANY page content directly
// How: Recursively renders fields, arrays, and nested objects

// Color variant options for dropdowns
const colorVariants = ['blue', 'purple', 'green', 'orange', 'gray', 'teal'];

// Human-readable labels for common field names
const fieldLabels: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  text: 'Text',
  variant: 'Style',
  href: 'Link URL',
  name: 'Name',
  price: 'Price',
  duration: 'Duration',
  linkText: 'Link Text',
  linkHref: 'Link URL',
  footer: 'Footer Text',
  footerLinkText: 'Footer Link Text',
  footerLinkHref: 'Footer Link URL',
  chatbotNote: 'Chatbot Note',
  number: 'Step Number',
  color: 'Color',
  _value: 'Value',
  // Service card fields
  tagline: 'Tagline',
  details: 'Details',
  cards: 'Service Cards',
  // Button fields
  buttons: 'Buttons',
  // Consultation fields
  options: 'Options',
  // Process fields
  steps: 'Steps',
};

// Section labels for homepage
const sectionLabels: Record<string, string> = {
  hero: 'Hero Section',
  services: 'Services',
  consultations: 'Consultations',
  processPreview: 'Process Preview',
  cta: 'Call to Action',
  header: 'Page Header',
  paymentNote: 'Payment Note',
  customSection: 'Custom Section',
  scenarioMatcher: 'Scenario Matcher',
  comparison: 'Comparison Table',
  chooseYourPath: 'Choose Your Path',
  expectationsTitle: 'Expectations Title',
  timeline: 'Timeline Section',
  questionsSection: 'Questions Section',
};

export default function AdminSidebar() {
  const { isAdmin, isAuthenticated } = useAuth();
  const {
    isEditMode,
    isSidebarOpen,
    setSidebarOpen,
    setEditMode,
    selectedSection,
    selectSection,
    pageContent,
    pageSlug,
    pendingChanges,
    clearPendingChanges,
    updateField,
    hasUnsavedChanges,
  } = useInlineEdit();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Only render for authenticated admins in edit mode
  if (!isAuthenticated || !isAdmin || !isEditMode || !isSidebarOpen) {
    return null;
  }

  // Get all top-level sections from page content
  const getSections = () => {
    if (!pageContent) return [];
    return Object.keys(pageContent).map(key => ({
      key,
      label: sectionLabels[key] || key.replace(/([A-Z])/g, ' $1').trim(),
      content: pageContent[key],
    }));
  };

  // Handle section selection
  const handleSelectSection = (sectionKey: string) => {
    if (!pageContent) return;
    const sectionContent = pageContent[sectionKey];

    selectSection({
      sectionKey,
      label: sectionLabels[sectionKey] || sectionKey,
      content: typeof sectionContent === 'object' && sectionContent !== null
        ? (sectionContent as Record<string, unknown>)
        : { _value: sectionContent },
    });
  };

  // Handle field change
  const handleFieldChange = (fieldPath: string, newValue: unknown) => {
    if (!selectedSection) return;
    // If we're drilled into a nested item, prepend the subPath
    const fullFieldPath = selectedSection.subPath
      ? `${selectedSection.subPath}.${fieldPath}`
      : fieldPath;
    updateField(selectedSection.sectionKey, fullFieldPath, newValue);
  };

  // Drill down into a nested item (e.g., buttons.0)
  const handleDrillDown = (subPath: string, subLabel: string) => {
    if (!selectedSection || !pageContent) return;

    // Get the nested content at this path
    const sectionContent = pageContent[selectedSection.sectionKey];
    const pathParts = subPath.split('.');
    let nestedContent: unknown = sectionContent;

    for (const part of pathParts) {
      if (nestedContent === null || nestedContent === undefined) break;
      if (Array.isArray(nestedContent)) {
        nestedContent = nestedContent[parseInt(part, 10)];
      } else if (typeof nestedContent === 'object') {
        nestedContent = (nestedContent as Record<string, unknown>)[part];
      }
    }

    // Update selection to show only this nested item
    selectSection({
      ...selectedSection,
      subPath,
      subLabel,
      content: typeof nestedContent === 'object' && nestedContent !== null
        ? (nestedContent as Record<string, unknown>)
        : { _value: nestedContent },
    });
  };

  // Navigate back up from nested item
  const handleNavigateUp = () => {
    if (!selectedSection) return;

    if (selectedSection.subPath) {
      // Go back to section level
      const sectionContent = pageContent?.[selectedSection.sectionKey];
      selectSection({
        sectionKey: selectedSection.sectionKey,
        label: selectedSection.label,
        content: typeof sectionContent === 'object' && sectionContent !== null
          ? (sectionContent as Record<string, unknown>)
          : { _value: sectionContent },
      });
    } else {
      // Go back to section list
      selectSection(null);
    }
  };

  // Save changes to API
  const handleSave = async () => {
    if (!pageSlug || !pageContent) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/page-content/${pageSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageContent }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      clearPendingChanges();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    if (confirm('Discard all changes? This will reload the page.')) {
      window.location.reload();
    }
  };

  // Close sidebar
  const handleClose = () => {
    setSidebarOpen(false);
    setEditMode(false);
  };

  // Render an input for a primitive value
  const renderPrimitiveInput = (path: string, value: unknown, fieldName: string) => {
    const stringValue = value !== null && value !== undefined ? String(value) : '';
    // For _value fields (primitive sections), use the section label
    const label = fieldName === '_value' && selectedSection
      ? selectedSection.label
      : (fieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim());

    // Color variant selector
    if (fieldName === 'variant' || fieldName === 'color') {
      return (
        <div key={path} className="mb-3">
          <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
            {label}
          </label>
          <select
            value={stringValue}
            onChange={(e) => handleFieldChange(path, e.target.value)}
            className={`
              w-full px-2 py-1.5 rounded border text-sm
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          >
            {colorVariants.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      );
    }

    // Textarea for long text
    if (fieldName === 'description' || fieldName === 'chatbotNote' || stringValue.length > 80) {
      return (
        <div key={path} className="mb-3">
          <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
            {label}
          </label>
          <textarea
            value={stringValue}
            onChange={(e) => handleFieldChange(path, e.target.value)}
            rows={3}
            className={`
              w-full px-2 py-1.5 rounded border text-sm resize-y
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          />
        </div>
      );
    }

    // Number input
    if (typeof value === 'number' || fieldName === 'number') {
      return (
        <div key={path} className="mb-3">
          <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
            {label}
          </label>
          <input
            type="number"
            value={stringValue}
            onChange={(e) => handleFieldChange(path, Number(e.target.value))}
            className={`
              w-full px-2 py-1.5 rounded border text-sm
              ${formInputColors.base} ${formInputColors.focus}
              ${focusRingClasses.blue}
            `}
          />
        </div>
      );
    }

    // Default text input
    return (
      <div key={path} className="mb-3">
        <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
          {label}
        </label>
        <input
          type="text"
          value={stringValue}
          onChange={(e) => handleFieldChange(path, e.target.value)}
          className={`
            w-full px-2 py-1.5 rounded border text-sm
            ${formInputColors.base} ${formInputColors.focus}
            ${focusRingClasses.blue}
          `}
        />
      </div>
    );
  };

  // Recursively render fields for any object structure
  const renderFields = (obj: unknown, basePath: string = '', depth: number = 0): React.ReactNode => {
    if (obj === null || obj === undefined) return null;

    // Primitive value
    if (typeof obj !== 'object') {
      const fieldName = basePath.split('.').pop() || '_value';
      return renderPrimitiveInput(basePath, obj, fieldName);
    }

    // Array - show as clickable items that zoom in
    if (Array.isArray(obj)) {
      const itemLabel = basePath.split('.').pop() || 'items';
      const singularLabel = itemLabel.endsWith('s') ? itemLabel.slice(0, -1) : itemLabel;

      return (
        <div key={basePath} className="mb-4">
          <div className={`text-xs font-medium ${formInputColors.label} mb-2`}>
            {fieldLabels[itemLabel] || itemLabel} ({obj.length})
          </div>
          <div className="space-y-2">
            {obj.map((item, index) => {
              // Get a preview label for the item
              const itemPreview = typeof item === 'object' && item !== null
                ? ((item as Record<string, unknown>).title ||
                   (item as Record<string, unknown>).name ||
                   (item as Record<string, unknown>).text ||
                   (item as Record<string, unknown>).question ||
                   `${singularLabel} ${index + 1}`)
                : String(item);

              return (
                <button
                  key={`${basePath}.${index}`}
                  type="button"
                  onClick={() => handleDrillDown(`${basePath}.${index}`, `${singularLabel} ${index + 1}`)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg
                    bg-gray-50 dark:bg-gray-800/50
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    border border-gray-200 dark:border-gray-700
                    hover:border-blue-300 dark:hover:border-blue-600
                    transition-all duration-150 group
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs ${formInputColors.helper}`}>
                        {singularLabel} {index + 1}
                      </div>
                      <div className={`text-sm font-medium ${headingColors.secondary} truncate max-w-[240px]`}>
                        {String(itemPreview)}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Object
    const entries = Object.entries(obj as Record<string, unknown>);

    // Special case: if object only has _value, render it directly as an input
    if (entries.length === 1 && entries[0][0] === '_value') {
      return renderPrimitiveInput(basePath ? `${basePath}._value` : '_value', entries[0][1], '_value');
    }

    return (
      <div key={basePath} className={depth > 0 ? 'space-y-1' : 'space-y-2'}>
        {entries.map(([key, value]) => {
          const path = basePath ? `${basePath}.${key}` : key;
          return renderFields(value, path, depth);
        })}
      </div>
    );
  };

  const sections = getSections();

  return (
    <div
      className={`
        fixed top-0 right-0 w-96 h-screen z-50
        ${cardBgColors.base} ${cardBorderColors.light}
        border-l shadow-2xl
        flex flex-col
        transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`font-semibold ${headingColors.primary}`}>
            Page Editor
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close editor"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {pageSlug && (
          <p className={`text-xs ${formInputColors.helper}`}>
            Editing: {pageSlug === 'home' ? 'Homepage' : pageSlug.replace(/-/g, ' ')}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedSection ? (
          // Field Editor View
          <div>
            {/* Breadcrumb navigation */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleNavigateUp}
                className={`
                  flex items-center gap-2 text-sm font-medium
                  ${accentColors.blue.text} hover:underline
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {selectedSection.subPath ? selectedSection.label : 'All Sections'}
              </button>
            </div>

            {/* Current location header */}
            <div className="pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`font-medium ${headingColors.primary}`}>
                {selectedSection.subLabel || selectedSection.label}
              </h3>
              {selectedSection.subPath && (
                <p className={`text-xs ${formInputColors.helper} mt-1`}>
                  {selectedSection.label} → {selectedSection.subLabel}
                </p>
              )}
            </div>

            {/* Dynamic fields */}
            {renderFields(selectedSection.content)}
          </div>
        ) : (
          // Section List View
          <div className="space-y-2">
            <p className={`text-sm ${formInputColors.helper} mb-4`}>
              Click a section to edit:
            </p>
            {sections.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectSection(key)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg
                  border border-gray-200 dark:border-gray-700
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  hover:border-blue-300 dark:hover:border-blue-600
                  transition-all duration-150
                  group
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${headingColors.secondary}`}>
                    {label}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {saveError && (
          <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
        )}

        {hasUnsavedChanges && (
          <p className={`text-xs ${formInputColors.helper}`}>
            {pendingChanges.length} unsaved change{pendingChanges.length !== 1 ? 's' : ''}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!hasUnsavedChanges || isSaving}
            className={`
              flex-1 px-4 py-2 rounded-lg text-sm font-medium
              border border-gray-300 dark:border-gray-600
              hover:bg-gray-50 dark:hover:bg-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`
              flex-1 px-4 py-2 rounded-lg text-sm font-medium
              ${accentColors.blue.bg} text-white
              hover:opacity-90
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
