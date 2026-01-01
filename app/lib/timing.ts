// ============================================================================
// Timing Constants - Centralized timing values for consistent UX
// ============================================================================
// What: All timeout and delay values in one place
// Why: Consistent timing across the app, easy to tune, no magic numbers
// How: Import and use these constants instead of hardcoded milliseconds

// ============================================================================
// Feedback Durations - How long success/error messages stay visible
// ============================================================================
/** How long toast messages display before auto-dismissing */
export const TOAST_DURATION = 3000;

/** How long "Copied!" feedback shows after clipboard copy */
export const COPY_FEEDBACK_DELAY = 2000;

/** How long success messages show in admin panels */
export const ADMIN_SUCCESS_DURATION = 5000;

/** How long save status indicators show before resetting */
export const SAVE_STATUS_DURATION = 3000;

// ============================================================================
// UI Delays - Small delays for better UX
// ============================================================================
/** Delay before focusing an input (allows animations to complete) */
export const FOCUS_DELAY = 100;

/** Debounce delay for search/indexing operations */
export const DEBOUNCE_DELAY = 500;

/** Simulated processing delay for form submissions (UX feedback) */
export const FORM_SUBMIT_DELAY = 1500;

// ============================================================================
// API Timeouts - How long to wait for network requests
// ============================================================================
/** Default timeout for API fetch requests */
export const API_REQUEST_TIMEOUT = 10000;

// ============================================================================
// Test Timeouts - Extended timeouts for E2E tests
// ============================================================================
/** Timeout for standard E2E tests */
export const E2E_TEST_TIMEOUT = 60000;

/** Timeout for screenshot/visual regression tests */
export const E2E_SCREENSHOT_TIMEOUT = 120000;
