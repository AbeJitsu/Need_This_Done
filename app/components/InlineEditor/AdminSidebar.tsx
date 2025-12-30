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
  solidButtonColors,
  uiChromeBg,
  hoverBgColors,
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
    selectedItem,
    clearItemSelection,
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

  // Handle field change for section editing
  const handleFieldChange = (fieldPath: string, newValue: unknown) => {
    if (!selectedSection) return;
    // If we're drilled into a nested item, prepend the subPath
    const fullFieldPath = selectedSection.subPath
      ? `${selectedSection.subPath}.${fieldPath}`
      : fieldPath;
    updateField(selectedSection.sectionKey, fullFieldPath, newValue);
  };

  // Handle field change for item editing (cards, FAQ items, etc.)
  const handleItemFieldChange = (fieldPath: string, newValue: unknown) => {
    if (!selectedItem) return;

    // Build the full path relative to sectionKey
    // If sectionKey equals arrayField (e.g., both are "items"), sectionKey IS the array
    // so we skip the arrayField prefix to avoid doubling: "items.items.0.answer" → "0.answer"
    // If arrayField is empty, the item is a direct array item of the section
    const fullPath = (selectedItem.sectionKey === selectedItem.arrayField || selectedItem.arrayField === '')
      ? `${selectedItem.index}.${fieldPath}`
      : `${selectedItem.arrayField}.${selectedItem.index}.${fieldPath}`;

    updateField(selectedItem.sectionKey, fullPath, newValue);
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

  // Navigate back up from nested item or item selection
  const handleNavigateUp = () => {
    // If viewing an item, go back to section list
    if (selectedItem) {
      clearItemSelection();
      return;
    }

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

  // Render an input for a primitive value (for item editing)
  const renderItemPrimitiveInput = (path: string, value: unknown, fieldName: string) => {
    const stringValue = value !== null && value !== undefined ? String(value) : '';
    const label = fieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();

    // Color variant selector
    if (fieldName === 'variant' || fieldName === 'color') {
      return (
        <div key={path} className="mb-3">
          <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
            {label}
          </label>
          <select
            value={stringValue}
            onChange={(e) => handleItemFieldChange(path, e.target.value)}
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
    if (fieldName === 'description' || fieldName === 'answer' || fieldName === 'details' || stringValue.length > 80) {
      return (
        <div key={path} className="mb-3">
          <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
            {label}
          </label>
          <textarea
            value={stringValue}
            onChange={(e) => handleItemFieldChange(path, e.target.value)}
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

    // Boolean toggle
    if (typeof value === 'boolean' || fieldName === 'popular' || fieldName === 'enabled') {
      const boolValue = typeof value === 'boolean' ? value : value === 'true';
      return (
        <div key={path} className="mb-3 flex items-center justify-between">
          <label className={`text-xs font-medium ${formInputColors.label}`}>
            {label}
          </label>
          <button
            type="button"
            onClick={() => handleItemFieldChange(path, !boolValue)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${boolValue ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
            `}
            role="switch"
            aria-checked={boolValue}
            aria-label={`Toggle ${label}`}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${boolValue ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
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
            onChange={(e) => handleItemFieldChange(path, Number(e.target.value))}
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
          onChange={(e) => handleItemFieldChange(path, e.target.value)}
          className={`
            w-full px-2 py-1.5 rounded border text-sm
            ${formInputColors.base} ${formInputColors.focus}
            ${focusRingClasses.blue}
          `}
        />
      </div>
    );
  };

  // Render item fields (flat, no drill-down)
  const renderItemFields = (obj: unknown, basePath: string = ''): React.ReactNode => {
    if (obj === null || obj === undefined) return null;

    // Primitive value
    if (typeof obj !== 'object') {
      const fieldName = basePath.split('.').pop() || '_value';
      return renderItemPrimitiveInput(basePath, obj, fieldName);
    }

    // Array - render each item's editable fields inline
    if (Array.isArray(obj)) {
      return obj.map((item, index) => (
        <div key={`${basePath}.${index}`}>
          {renderItemFields(item, basePath ? `${basePath}.${index}` : String(index))}
        </div>
      ));
    }

    // Object - render each field
    const entries = Object.entries(obj as Record<string, unknown>);
    return (
      <div className="space-y-1">
        {entries.map(([key, value]) => {
          const path = basePath ? `${basePath}.${key}` : key;
          // Skip nested arrays/objects for now - keep item editing flat
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return renderItemFields(value, path);
          }
          if (Array.isArray(value)) {
            return null; // Skip nested arrays in item view
          }
          return renderItemFields(value, path);
        })}
      </div>
    );
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

    // Boolean toggle
    if (typeof value === 'boolean' || fieldName === 'popular' || fieldName === 'enabled') {
      const boolValue = typeof value === 'boolean' ? value : value === 'true';
      return (
        <div key={path} className="mb-3 flex items-center justify-between">
          <label className={`text-xs font-medium ${formInputColors.label}`}>
            {label}
          </label>
          <button
            type="button"
            onClick={() => handleFieldChange(path, !boolValue)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${boolValue ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
            `}
            role="switch"
            aria-checked={boolValue}
            aria-label={`Toggle ${label}`}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${boolValue ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
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

  // Array operations: add, delete, reorder
  const handleAddArrayItem = (arrayPath: string, template: unknown) => {
    if (!selectedSection || !pageContent) return;
    const sectionContent = pageContent[selectedSection.sectionKey];

    // If sectionKey equals arrayPath, sectionContent IS the array
    // Otherwise, navigate to the array within sectionContent
    let arr: unknown[];
    if (selectedSection.sectionKey === arrayPath) {
      arr = sectionContent as unknown[];
    } else {
      const pathParts = arrayPath.split('.');
      arr = sectionContent as unknown[];
      for (const part of pathParts) {
        if (arr === null || arr === undefined) break;
        if (Array.isArray(arr)) {
          arr = arr[parseInt(part, 10)] as unknown[];
        } else if (typeof arr === 'object') {
          arr = (arr as Record<string, unknown>)[part] as unknown[];
        }
      }
    }

    if (Array.isArray(arr)) {
      const newArr = [...arr, template];
      handleFieldChange(arrayPath, newArr);
    }
  };

  const handleDeleteArrayItem = (arrayPath: string, index: number) => {
    if (!selectedSection || !pageContent) return;
    if (!confirm('Delete this item?')) return;

    const sectionContent = pageContent[selectedSection.sectionKey];

    // If sectionKey equals arrayPath, sectionContent IS the array
    let arr: unknown[];
    if (selectedSection.sectionKey === arrayPath) {
      arr = sectionContent as unknown[];
    } else {
      const pathParts = arrayPath.split('.');
      arr = sectionContent as unknown[];
      for (const part of pathParts) {
        if (arr === null || arr === undefined) break;
        if (Array.isArray(arr)) {
          arr = arr[parseInt(part, 10)] as unknown[];
        } else if (typeof arr === 'object') {
          arr = (arr as Record<string, unknown>)[part] as unknown[];
        }
      }
    }

    if (Array.isArray(arr)) {
      const newArr = arr.filter((_, i) => i !== index);
      handleFieldChange(arrayPath, newArr);
    }
  };

  const handleMoveArrayItem = (arrayPath: string, fromIndex: number, direction: 'up' | 'down') => {
    if (!selectedSection || !pageContent) return;

    const sectionContent = pageContent[selectedSection.sectionKey];

    // If sectionKey equals arrayPath, sectionContent IS the array
    let arr: unknown[];
    if (selectedSection.sectionKey === arrayPath) {
      arr = sectionContent as unknown[];
    } else {
      const pathParts = arrayPath.split('.');
      arr = sectionContent as unknown[];
      for (const part of pathParts) {
        if (arr === null || arr === undefined) break;
        if (Array.isArray(arr)) {
          arr = arr[parseInt(part, 10)] as unknown[];
        } else if (typeof arr === 'object') {
          arr = (arr as Record<string, unknown>)[part] as unknown[];
        }
      }
    }

    if (Array.isArray(arr)) {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= arr.length) return;

      const newArr = [...arr];
      [newArr[fromIndex], newArr[toIndex]] = [newArr[toIndex], newArr[fromIndex]];
      handleFieldChange(arrayPath, newArr);
    }
  };

  // Recursively render fields for any object structure
  const renderFields = (obj: unknown, basePath: string = '', depth: number = 0): React.ReactNode => {
    if (obj === null || obj === undefined) return null;

    // Primitive value
    if (typeof obj !== 'object') {
      const fieldName = basePath.split('.').pop() || '_value';
      return renderPrimitiveInput(basePath, obj, fieldName);
    }

    // Array - show as clickable items with add/delete/reorder
    if (Array.isArray(obj)) {
      const itemLabel = basePath.split('.').pop() || 'items';
      const singularLabel = itemLabel.endsWith('s') ? itemLabel.slice(0, -1) : itemLabel;

      // Create template for new items based on first item structure
      const getItemTemplate = () => {
        if (obj.length === 0) return {};
        const first = obj[0];
        if (typeof first !== 'object' || first === null) return '';
        // Create empty template with same keys
        const template: Record<string, unknown> = {};
        for (const key of Object.keys(first as Record<string, unknown>)) {
          const val = (first as Record<string, unknown>)[key];
          if (typeof val === 'string') template[key] = '';
          else if (typeof val === 'number') template[key] = 0;
          else if (typeof val === 'boolean') template[key] = false;
          else if (Array.isArray(val)) template[key] = [];
          else template[key] = null;
        }
        return template;
      };

      return (
        <div key={basePath} className="mb-4">
          <div className={`flex items-center justify-between text-xs font-medium ${formInputColors.label} mb-2`}>
            <span>{fieldLabels[itemLabel] || itemLabel} ({obj.length})</span>
            <button
              type="button"
              onClick={() => handleAddArrayItem(basePath, getItemTemplate())}
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                ${solidButtonColors.green.bg} ${solidButtonColors.green.hover} ${solidButtonColors.green.text}
                transition-colors
              `}
              aria-label={`Add new ${singularLabel}`}
            >
              <span aria-hidden="true">+</span> Add
            </button>
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
                <div
                  key={`${basePath}.${index}`}
                  className={`
                    relative rounded-lg
                    ${uiChromeBg.panel}
                    border border-gray-200 dark:border-gray-700
                    hover:border-blue-300 dark:hover:border-blue-600
                    transition-all duration-150 group
                  `}
                >
                  {/* Reorder and Delete buttons */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveArrayItem(basePath, index, 'up'); }}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveArrayItem(basePath, index, 'down'); }}
                      disabled={index === obj.length - 1}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteArrayItem(basePath, index); }}
                      className={`p-1 rounded ${hoverBgColors.red} text-red-600 dark:text-red-400`}
                      aria-label="Delete item"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Clickable content */}
                  <button
                    type="button"
                    onClick={() => handleDrillDown(`${basePath}.${index}`, `${singularLabel} ${index + 1}`)}
                    className="w-full text-left px-3 py-2"
                  >
                    <div className="flex items-center justify-between pr-20">
                      <div>
                        <div className={`text-xs ${formInputColors.helper}`}>
                          {singularLabel} {index + 1}
                        </div>
                        <div className={`text-sm font-medium ${headingColors.secondary} truncate max-w-[180px]`}>
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
                </div>
              );
            })}

            {/* Empty state */}
            {obj.length === 0 && (
              <div className={`text-center py-4 text-sm ${formInputColors.helper}`}>
                No items yet. Click "Add" to create one.
              </div>
            )}
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
    // top-10 (40px) accounts for EditModeBar height so sidebar header is below it
    // h-[calc(100vh-2.5rem)] ensures sidebar doesn't extend beyond viewport
    <div
      data-testid="admin-sidebar"
      data-content-loaded={pageContent ? 'true' : 'false'}
      className={`
        fixed top-10 right-0 w-96 h-[calc(100vh-2.5rem)] z-50
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
        {selectedItem ? (
          // Item Editor View (clicked on a specific card/item)
          (() => {
            // Get array info for operations
            const sectionContent = pageContent?.[selectedItem.sectionKey];
            const array = sectionContent && typeof sectionContent === 'object'
              ? (sectionContent as Record<string, unknown>)[selectedItem.arrayField]
              : null;
            const arrayLength = Array.isArray(array) ? array.length : 0;
            const itemIndex = selectedItem.index;

            // Handler functions for item-level array operations
            const handleItemDelete = () => {
              if (!confirm('Delete this item?')) return;
              if (!pageContent || !Array.isArray(array)) return;
              const newArr = array.filter((_, i) => i !== itemIndex);
              updateField(selectedItem.sectionKey, selectedItem.arrayField, newArr);
              clearItemSelection(); // Go back to section list
            };

            const handleItemMove = (direction: 'up' | 'down') => {
              if (!pageContent || !Array.isArray(array)) return;
              const toIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
              if (toIndex < 0 || toIndex >= arrayLength) return;
              const newArr = [...array];
              [newArr[itemIndex], newArr[toIndex]] = [newArr[toIndex], newArr[itemIndex]];
              updateField(selectedItem.sectionKey, selectedItem.arrayField, newArr);
            };

            const handleItemAdd = () => {
              if (!pageContent || !Array.isArray(array)) return;
              // Create template from first item or empty object
              let template: unknown = {};
              if (array.length > 0) {
                const first = array[0];
                if (typeof first === 'object' && first !== null) {
                  template = {};
                  for (const key of Object.keys(first as Record<string, unknown>)) {
                    const val = (first as Record<string, unknown>)[key];
                    if (typeof val === 'string') (template as Record<string, unknown>)[key] = '';
                    else if (typeof val === 'number') (template as Record<string, unknown>)[key] = 0;
                    else if (typeof val === 'boolean') (template as Record<string, unknown>)[key] = false;
                    else if (Array.isArray(val)) (template as Record<string, unknown>)[key] = [];
                    else (template as Record<string, unknown>)[key] = null;
                  }
                }
              }
              const newArr = [...array, template];
              updateField(selectedItem.sectionKey, selectedItem.arrayField, newArr);
            };

            return (
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
                    All Sections
                  </button>
                </div>

                {/* Breadcrumb path */}
                <div className="pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{sectionLabels[selectedItem.sectionKey] || selectedItem.sectionKey}</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {selectedItem.label}
                    </span>
                  </div>
                  <h3 className={`font-medium ${headingColors.primary}`}>
                    {selectedItem.label}
                  </h3>
                </div>

                {/* Array Operations Bar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleItemMove('up')}
                      disabled={itemIndex === 0}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                      aria-label="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleItemMove('down')}
                      disabled={itemIndex === arrayLength - 1}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                      aria-label="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleItemAdd}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                        ${solidButtonColors.green.bg} ${solidButtonColors.green.hover} ${solidButtonColors.green.text}
                        transition-colors
                      `}
                      aria-label="Add new item"
                    >
                      <span aria-hidden="true">+</span> Add
                    </button>
                    <button
                      type="button"
                      onClick={handleItemDelete}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:opacity-90 transition-opacity"
                      aria-label="Delete item"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Item fields */}
                {renderItemFields(selectedItem.content)}
              </div>
            );
          })()
        ) : selectedSection ? (
          // Section Editor View
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
              ${solidButtonColors.blue.bg} ${solidButtonColors.blue.hover} ${solidButtonColors.blue.text}
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
