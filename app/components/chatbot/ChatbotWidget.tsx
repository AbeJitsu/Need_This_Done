'use client';

import { useState, useEffect } from 'react';
import ChatbotButton from './ChatbotButton';
import ChatbotModal from './ChatbotModal';
import { IndexingProvider } from './IndexingContext';

// ============================================================================
// Chatbot Widget Component
// ============================================================================
// What: Main chatbot component combining button and modal
// Why: Single component to add chatbot functionality to any page
// How: Manages open/close state, renders button + modal

// Custom event name for opening chatbot from anywhere
export const OPEN_CHATBOT_EVENT = 'open-chatbot';

/**
 * Complete chatbot widget with floating button and modal.
 *
 * Add this component to your layout to enable the chatbot site-wide.
 * It handles:
 * - Open/close state
 * - Button rendering (always visible)
 * - Modal rendering (when open)
 * - Indexing state context for debug features
 *
 * To open the chatbot from anywhere, dispatch a custom event:
 * ```tsx
 * window.dispatchEvent(new CustomEvent('open-chatbot'));
 * ```
 *
 * Usage in layout.tsx:
 * ```tsx
 * import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
 *
 * // In your layout:
 * <ChatbotWidget />
 * ```
 */
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  // Listen for custom event to open chatbot from anywhere
  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener(OPEN_CHATBOT_EVENT, handleOpenChatbot);
    return () => window.removeEventListener(OPEN_CHATBOT_EVENT, handleOpenChatbot);
  }, []);

  return (
    <IndexingProvider>
      {/* Floating button - always visible when chat is closed */}
      {!isOpen && <ChatbotButton onClick={openChat} />}

      {/* Chat modal - visible when open */}
      <ChatbotModal isOpen={isOpen} onClose={closeChat} />
    </IndexingProvider>
  );
}
