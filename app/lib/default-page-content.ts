// ============================================================================
// Default Page Content - Re-export from Consolidated Page Config
// ============================================================================
// This file re-exports default content from the consolidated page-config.ts
// for backwards compatibility. All new code should import from page-config.ts.
//
// To add a new editable page, update PAGE_CONFIGS in page-config.ts

import { PAGE_CONFIGS, getDefaultContent, type PageContent, type EditablePageSlug } from './page-config';

// Re-export getDefaultContent for backwards compatibility
export { getDefaultContent };

// Re-export individual default content objects for backwards compatibility
// These are extracted from PAGE_CONFIGS for code that imports them directly
export const defaultPricingContent = PAGE_CONFIGS.pricing.defaults;
export const defaultFAQContent = PAGE_CONFIGS.faq.defaults;
export const defaultServicesContent = PAGE_CONFIGS.services.defaults;
export const defaultHowItWorksContent = PAGE_CONFIGS['how-it-works'].defaults;
export const defaultHomeContent = PAGE_CONFIGS.home.defaults;
export const defaultContactContent = PAGE_CONFIGS.contact.defaults;
export const defaultBlogContent = PAGE_CONFIGS.blog.defaults;
export const defaultGuideContent = PAGE_CONFIGS.guide.defaults;
export const defaultPrivacyContent = PAGE_CONFIGS.privacy.defaults;
export const defaultTermsContent = PAGE_CONFIGS.terms.defaults;
export const defaultLoginContent = PAGE_CONFIGS.login.defaults;

// Re-export the content map for backwards compatibility
export const defaultContentMap: Record<EditablePageSlug, PageContent> = Object.fromEntries(
  Object.entries(PAGE_CONFIGS).map(([slug, config]) => [slug, config.defaults])
) as Record<EditablePageSlug, PageContent>;
