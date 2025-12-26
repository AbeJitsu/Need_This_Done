// ============================================================================
// Templates Module - Clean Public API
// ============================================================================
// Single entry point for the templates system.
// Import from '@/lib/templates' to get everything you need.
// ============================================================================

// Types
export type {
  // Metadata
  TemplateCategory,
  TemplateAudience,
  TemplateMetadata,
  // Sections
  BaseSection,
  HeroSection,
  FeatureGridSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  CTASection,
  VideoSection,
  TextSection,
  ImageSection,
  ProductGridSection,
  StatsSection,
  TemplateSection,
  // Templates
  PageTemplate,
  TemplatePlaceholder,
  TemplateCollection,
  // Wizard
  WizardStep,
  WizardState,
  // Puck output
  PuckComponent,
  PuckPageData,
} from './types';

// Utilities
export {
  // Conversion
  sectionToPuckComponent,
  templateToPuckData,
  // Placeholders
  getNestedValue,
  setNestedValue,
  applyContentToTemplate,
  applyColorToTemplate,
  // Wizard
  createInitialWizardState,
  nextWizardStep,
  previousWizardStep,
  updateWizardState,
  completeWizard,
  // Filtering
  filterByCategory,
  filterByAudience,
  searchTemplates,
  getFeaturedTemplates,
  sortTemplates,
  // Validation
  validateWizardContent,
  getWizardProgress,
} from './utils';

// Templates
export { STARTER_TEMPLATES, getTemplateById, getAllTemplates } from './starter-templates';
