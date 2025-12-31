// ============================================================================
// Template Utilities - Pure Functions for Template Operations
// ============================================================================
// These utilities transform templates into Puck-compatible output.
// They're pure functions with no side effects - easy to test and change.
//
// ORTHOGONALITY:
// - Input: Template + user values
// - Output: Puck JSON
// - No knowledge of UI, storage, or rendering
// ============================================================================

import type {
  PageTemplate,
  TemplateSection,
  WizardState,
  PuckPageData,
  PuckComponent,
  TemplateCategory,
  TemplateAudience,
} from './types';
import { getNestedValue, setNestedValue } from '@/lib/object-utils';

// ============================================================================
// Template to Puck Conversion
// ============================================================================

/**
 * Converts a template section to a Puck component.
 * Handles any section type since they share the same structure.
 */
export function sectionToPuckComponent(section: TemplateSection): PuckComponent {
  return {
    type: section.type,
    props: { ...section.props },
  };
}

/**
 * Converts an entire template to Puck page data.
 * This is the main function for generating pages from templates.
 */
export function templateToPuckData(template: PageTemplate): PuckPageData {
  return {
    content: template.sections.map(sectionToPuckComponent),
    root: {
      props: {},
    },
  };
}

// ============================================================================
// Placeholder Replacement
// ============================================================================

// Re-export from centralized object utilities for backwards compatibility (DRY)
export { getNestedValue, setNestedValue };

/**
 * Applies user content to a template, replacing placeholders.
 * Returns a new template with user values filled in.
 */
export function applyContentToTemplate(
  template: PageTemplate,
  content: Record<string, string>
): PageTemplate {
  let result = template;

  for (const placeholder of template.placeholders.fields) {
    const userValue = content[placeholder.path];
    if (userValue !== undefined) {
      result = setNestedValue(result, placeholder.path, userValue);
    }
  }

  return result;
}

/**
 * Applies a color scheme to all sections in a template.
 * Useful when user picks a different color than the default.
 */
export function applyColorToTemplate(
  template: PageTemplate,
  color: string
): PageTemplate {
  const result = JSON.parse(JSON.stringify(template)) as PageTemplate;

  result.defaultColor = color as PageTemplate['defaultColor'];

  for (const section of result.sections) {
    if ('accentColor' in section.props) {
      (section.props as Record<string, unknown>).accentColor = color;
    }
  }

  return result;
}

// ============================================================================
// Wizard Flow Helpers
// ============================================================================

/**
 * Creates initial wizard state.
 */
export function createInitialWizardState(): WizardState {
  return {
    currentStep: 0,
    content: {},
    completed: false,
  };
}

/**
 * Advances wizard to next step.
 */
export function nextWizardStep(state: WizardState, totalSteps: number): WizardState {
  if (state.currentStep >= totalSteps - 1) {
    return { ...state, completed: true };
  }
  return { ...state, currentStep: state.currentStep + 1 };
}

/**
 * Goes back to previous step.
 */
export function previousWizardStep(state: WizardState): WizardState {
  if (state.currentStep <= 0) return state;
  return { ...state, currentStep: state.currentStep - 1 };
}

/**
 * Updates wizard state with user selection.
 */
export function updateWizardState(
  state: WizardState,
  updates: Partial<WizardState>
): WizardState {
  return { ...state, ...updates };
}

/**
 * Completes the wizard and generates final Puck data.
 */
export function completeWizard(
  template: PageTemplate,
  state: WizardState
): PuckPageData {
  // Apply color if user selected one
  let finalTemplate = state.color
    ? applyColorToTemplate(template, state.color)
    : template;

  // Apply user content
  finalTemplate = applyContentToTemplate(finalTemplate, state.content);

  // Convert to Puck format
  return templateToPuckData(finalTemplate);
}

// ============================================================================
// Template Filtering & Search
// ============================================================================

/**
 * Filters templates by category.
 */
export function filterByCategory(
  templates: PageTemplate[],
  category: TemplateCategory
): PageTemplate[] {
  return templates.filter((t) => t.metadata.category === category);
}

/**
 * Filters templates by audience.
 */
export function filterByAudience(
  templates: PageTemplate[],
  audience: TemplateAudience
): PageTemplate[] {
  return templates.filter((t) => t.metadata.audience === audience);
}

/**
 * Searches templates by keyword.
 * Searches name, description, and tags.
 */
export function searchTemplates(
  templates: PageTemplate[],
  query: string
): PageTemplate[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return templates;

  return templates.filter((t) => {
    const searchable = [
      t.metadata.name,
      t.metadata.description,
      ...t.metadata.tags,
    ].join(' ').toLowerCase();

    return searchable.includes(lowerQuery);
  });
}

/**
 * Gets featured templates.
 */
export function getFeaturedTemplates(templates: PageTemplate[]): PageTemplate[] {
  return templates.filter((t) => t.metadata.featured);
}

/**
 * Sorts templates - featured first, then by name.
 */
export function sortTemplates(templates: PageTemplate[]): PageTemplate[] {
  return [...templates].sort((a, b) => {
    // Featured first
    if (a.metadata.featured && !b.metadata.featured) return -1;
    if (!a.metadata.featured && b.metadata.featured) return 1;
    // Then alphabetically
    return a.metadata.name.localeCompare(b.metadata.name);
  });
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates that all required placeholders have values.
 */
export function validateWizardContent(
  template: PageTemplate,
  content: Record<string, string>
): { valid: boolean; missing: string[] } {
  const requiredFields = template.placeholders.fields.filter((f) => f.required);
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = content[field.path];
    if (!value || value.trim() === '') {
      missing.push(field.label);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Gets progress through required fields (for progress bar).
 */
export function getWizardProgress(
  template: PageTemplate,
  content: Record<string, string>
): number {
  const requiredFields = template.placeholders.fields.filter((f) => f.required);
  if (requiredFields.length === 0) return 100;

  const filledCount = requiredFields.filter((f) => {
    const value = content[f.path];
    return value && value.trim() !== '';
  }).length;

  return Math.round((filledCount / requiredFields.length) * 100);
}
