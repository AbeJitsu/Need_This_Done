'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UIMessage } from 'ai';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { accentText } from '@/lib/contrast';

// ============================================================================
// Chat Message Component
// ============================================================================
// What: Displays a single chat message with appropriate styling
// Why: Visual distinction between user and assistant messages
// How: Different styles based on message role, supports markdown links

interface ChatMessageProps {
  message: UIMessage;
}

/**
 * Extracts text content from a UIMessage.
 * In AI SDK v5, messages have a parts array with different content types.
 */
function getMessageText(message: UIMessage): string {
  // Extract text from parts array
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/**
 * Renders a single chat message bubble.
 *
 * User messages appear on the right with accent color.
 * Assistant messages appear on the left with neutral styling.
 * Supports basic markdown link rendering for citations.
 */
export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const content = getMessageText(message);
  const router = useRouter();

  // ========================================================================
  // Handle link clicks - use client-side navigation for internal links
  // ========================================================================
  // This prevents full page reloads and preserves chat state
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      // Use client-side navigation for internal links (starting with /)
      if (href && href.startsWith('/')) {
        e.preventDefault();
        router.push(href);
      }
    }
  }, [router]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
        }`}
      >
        {/* Message content with markdown link support */}
        <div
          onClick={handleClick}
          className={`prose prose-sm max-w-none ${
            isUser
              ? 'prose-invert'
              : 'dark:prose-invert'
          } prose-a:${accentText.blue} prose-a:underline`}
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(formatMessageContent(content)),
          }}
        />
      </div>
    </div>
  );
}

/**
 * Converts markdown links to HTML anchor tags.
 *
 * Transforms [text](url) into clickable links.
 * Also handles basic line breaks.
 */
function formatMessageContent(content: string): string {
  // Convert markdown links: [text](url) → <a href="url">text</a>
  // Using text-accent-blue class for background-aware color switching
  let formatted = content.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-accent-blue underline">$1</a>'
  );

  // Convert line breaks to <br> for proper display
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}
