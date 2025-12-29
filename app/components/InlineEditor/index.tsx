// ============================================================================
// Inline Editor Components - Export all inline editing components
// ============================================================================

// Section-based editing (for marketing pages like Home, Services, etc.)
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminSidebarToggle } from './AdminSidebarToggle';
export { default as EditableSection } from './EditableSection';

// Puck page rendering (for pages built with Puck visual builder)
export { default as PuckPageRenderer } from './PuckPageRenderer';

// Note: AdminEditBar, PropertySidebar, PuckPageWrapper, and EditableWrapper
// are deprecated in favor of the new section-based editing system above.
// They remain in the codebase but are no longer exported.
