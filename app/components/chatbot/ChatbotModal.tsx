'use client';

import { useRef, useEffect, useState, useMemo, useCallback, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import type { UIMessage } from '@ai-sdk/react';
import ChatMessage from './ChatMessage';
import { useIndexingOptional } from './IndexingContext';

// ============================================================================
// Chat Persistence - Keep chat history across page navigations
// ============================================================================
const CHAT_STORAGE_KEY = 'ntd-chat-messages';

function loadMessagesFromStorage(): UIMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Chat] Failed to load messages from storage:', e);
  }
  return [];
}

function saveMessagesToStorage(messages: UIMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn('[Chat] Failed to save messages to storage:', e);
  }
}

function clearMessagesFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (e) {
    console.warn('[Chat] Failed to clear messages from storage:', e);
  }
}

// ============================================================================
// Chatbot Panel Component
// ============================================================================
// What: Collapsible right-side chat panel with message history and input
// Why: Allows users to chat while viewing the page content
// How: Uses Vercel AI SDK v5's useChat hook for state management and streaming

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Collapsible right-side chat panel.
 *
 * Features:
 * - Right-side positioning that doesn't block page content
 * - Collapse/expand functionality with smooth animations
 * - Message history with auto-scroll
 * - Streaming responses via Vercel AI SDK
 * - Loading indicator and error handling
 * - Keyboard accessibility (Esc to close)
 * - Dark mode support
 */
export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get indexing context for dev features
  const indexing = useIndexingOptional();

  // Create a stable transport instance using TextStreamChatTransport
  // This handles text streaming responses from our /api/chat endpoint
  const transport = useMemo(
    () => new TextStreamChatTransport({ api: '/api/chat' }),
    []
  );

  // Load initial messages from localStorage
  const initialMessages = useMemo(() => loadMessagesFromStorage(), []);

  // Use the chat hook with the transport and initial messages
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    initialMessages,
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // ========================================================================
  // Persist messages to localStorage when they change
  // ========================================================================
  useEffect(() => {
    // Save messages whenever they change (including during streaming)
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  // ========================================================================
  // Save messages before page unload (handles full page navigations)
  // ========================================================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        saveMessagesToStorage(messages);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages]);

  // ========================================================================
  // Auto-scroll to bottom when new messages arrive
  // ========================================================================
  useEffect(() => {
    if (isOpen && !isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isCollapsed]);

  // ========================================================================
  // Focus input when panel opens or expands
  // ========================================================================
  useEffect(() => {
    if (isOpen && !isCollapsed) {
      // Small delay to ensure panel is rendered
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isCollapsed]);

  // ========================================================================
  // Handle Escape key to close panel
  // ========================================================================
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ========================================================================
  // Clear chat handler - clears both state and localStorage
  // ========================================================================
  // Note: This hook must be before any conditional returns
  const handleClearChat = useCallback(() => {
    setMessages([]);
    clearMessagesFromStorage();
  }, [setMessages]);

  // Don't render if panel is closed
  if (!isOpen) return null;

  // ========================================================================
  // Form submission handler
  // ========================================================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput(''); // Clear input immediately
    await sendMessage({ text: trimmedInput });
  };

  // ========================================================================
  // Collapsed View - Narrow strip with expand button
  // ========================================================================
  if (isCollapsed) {
    return (
      <div
        className="fixed right-0 top-20 bottom-4 w-14 z-50
                   flex flex-col items-center
                   transition-all duration-300 ease-in-out"
        role="complementary"
        aria-label="Chat Assistant (collapsed)"
      >
        {/* Expand button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-12 h-12 rounded-l-xl
                     bg-blue-600 hover:bg-blue-700
                     dark:bg-blue-500 dark:hover:bg-blue-600
                     text-white shadow-lg
                     flex items-center justify-center
                     transition-colors"
          aria-label="Expand chat"
          title="Expand chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Message count indicator */}
        {messages.length > 0 && (
          <div className="mt-2 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50
                          flex items-center justify-center
                          text-xs font-medium text-blue-600 dark:text-blue-400">
            {messages.length}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-auto mb-4 w-10 h-10 rounded-l-lg
                     bg-gray-200 hover:bg-gray-300
                     dark:bg-gray-700 dark:hover:bg-gray-600
                     text-gray-600 dark:text-gray-300
                     flex items-center justify-center
                     transition-colors"
          aria-label="Close chat"
          title="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // ========================================================================
  // Expanded View - Full chat panel
  // ========================================================================
  return (
    <div
      className="fixed right-0 top-20 bottom-4 w-[400px] max-w-[90vw] z-50
                 flex flex-col
                 bg-white dark:bg-gray-800
                 rounded-l-2xl shadow-2xl
                 border-l border-t border-b border-gray-200 dark:border-gray-700
                 transition-all duration-300 ease-in-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
    >
      {/* ================================================================
          Header
          ================================================================ */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                     p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Collapse chat"
          title="Collapse chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <h2
            id="chatbot-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Chat Assistant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask me anything about our services
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Dev mode: Re-index button */}
          {indexing?.isDevMode && (
            <button
              onClick={indexing.forceReindex}
              disabled={indexing.status === 'indexing'}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                         p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Re-index page"
              title={indexing.status === 'indexing' ? 'Indexing...' : 'Re-index this page'}
            >
              <svg
                className={`w-5 h-5 ${indexing.status === 'indexing' ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Clear chat button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                         p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                       p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close chat"
            title="Close chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ================================================================
          Messages Area
          ================================================================ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message when empty */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Hi there! How can I help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm mx-auto">
              Ask me about our services, pricing, or how we can help with your projects.
            </p>
          </div>
        )}

        {/* Message list */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 text-sm">
              Sorry, something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ================================================================
          Input Area
          ================================================================ */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl
                       border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 rounded-xl
                       bg-blue-600 hover:bg-blue-700
                       dark:bg-blue-500 dark:hover:bg-blue-600
                       text-white font-medium
                       transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send
        </p>
      </form>
    </div>
  );
}
