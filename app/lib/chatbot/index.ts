// ============================================================================
// Chatbot Utilities - Central Export
// ============================================================================
// This file re-exports all chatbot utilities for cleaner imports.
// Usage: import { generateContentHash, chunkText, extractPageContent } from '@/lib/chatbot';

export { generateContentHash, hasContentChanged } from './content-hash';
export { chunkText, estimateTokenCount, type TextChunk, type ChunkOptions } from './text-chunker';
export {
  extractPageContent,
  extractProductContent,
  shouldIndexPage,
  getPageType,
  type ExtractedContent,
} from './content-extractor';
