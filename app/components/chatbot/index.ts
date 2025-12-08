// ============================================================================
// Chatbot Components - Central Export
// ============================================================================
// This file re-exports all chatbot components for cleaner imports.

export { default as ChatbotWidget } from './ChatbotWidget';
export { default as ChatbotButton } from './ChatbotButton';
export { default as ChatbotModal } from './ChatbotModal';
export { default as ChatMessage } from './ChatMessage';
export { default as PageIndexer } from './PageIndexer';
export { IndexingProvider, useIndexing, useIndexingOptional } from './IndexingContext';
export type { IndexingStatus } from './IndexingContext';
