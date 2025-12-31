// ============================================================================
// Editable Routes - Re-export from Consolidated Page Config
// ============================================================================
// This file re-exports route utilities from the consolidated page-config.ts
// for backwards compatibility. All new code should import from page-config.ts.
//
// To add a new editable page, update PAGE_CONFIGS in page-config.ts

export {
  editableRoutes,
  getPageSlugFromPath,
  isEditableRoute,
  type EditablePageSlug,
} from './page-config';
