// ============================================================================
// Page Content Types - Re-export from Consolidated Page Config
// ============================================================================
// This file re-exports types from the consolidated page-config.ts
// for backwards compatibility. All new code should import from page-config.ts.
//
// To add a new editable page, update PAGE_CONFIGS in page-config.ts

// Re-export all types
export type {
  // Shared types
  PageHeader,
  CTAButton,
  CTASection,

  // Page-specific content types
  PricingTier,
  PricingCtaPath,
  PricingPageContent,
  ContactFormField,
  FAQItem,
  FAQPageContent,
  ExpectationItem,
  ServiceScenario,
  ComparisonRow,
  EnhancedCTAButton,
  ChoosePath,
  ChooseYourPathContent,
  ServicesPageContent,
  ProcessStep,
  TrustBadge,
  HowItWorksPageContent,
  ProcessPreviewStep,
  ConsultationOption,
  HomeServiceCard,
  HomePageContent,
  ContactPageContent,
  GetStartedPath,
  GetStartedPageContent,
  BlogPageContent,
  ChangelogPageContent,
  GuideGroup,
  GuideSection,
  GuidePageContent,
  PrivacyPageContent,
  TermsPageContent,
  LoginPageContent,

  // Union types
  PageContent,
  PageContentType,
  EditablePageSlug,
} from './page-config';

// Re-export constants
export {
  PAGE_CONTENT_TYPES,
  PAGE_DISPLAY_NAMES,
  EDITABLE_PAGES,
} from './page-config';

// Re-export AccentColor and AccentVariant from colors for backwards compatibility
// (some code imports them from here)
export type { AccentColor, AccentVariant } from './colors';
