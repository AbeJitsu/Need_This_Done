// ============================================================================
// MarkdownContent Component - Renders Markdown with Syntax Highlighting
// ============================================================================
// Renders markdown content with proper styling for blog posts.
// Supports GitHub-flavored markdown (tables, task lists, strikethrough)
// and syntax highlighting for code blocks.

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { headingColors, formInputColors, tableHeaderBg } from '@/lib/colors';

// Import highlight.js styles for syntax highlighting
import 'highlight.js/styles/github-dark.css';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // ============================================
          // Headings
          // ============================================
          h1: ({ children }) => (
            <h1 className={`text-3xl font-bold mt-8 mb-4 ${headingColors.primary}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-2xl font-bold mt-8 mb-4 ${headingColors.primary}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xl font-semibold mt-6 mb-3 ${headingColors.secondary}`}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={`text-lg font-semibold mt-4 mb-2 ${headingColors.secondary}`}>
              {children}
            </h4>
          ),

          // ============================================
          // Paragraphs and Text
          // ============================================
          p: ({ children }) => (
            <p className={`mb-4 leading-relaxed ${formInputColors.helper}`}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),

          // ============================================
          // Links
          // ============================================
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),

          // ============================================
          // Lists
          // ============================================
          ul: ({ children }) => (
            <ul className={`list-disc list-inside mb-4 space-y-1 ${formInputColors.helper}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-inside mb-4 space-y-1 ${formInputColors.helper}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // ============================================
          // Code Blocks and Inline Code
          // ============================================
          code: ({ className, children, ...props }) => {
            // Check if this is an inline code block (no language class)
            const isInline = !className;

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded text-sm font-mono bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Block code - let rehype-highlight handle syntax highlighting
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 p-4 rounded-lg overflow-x-auto bg-gray-900 dark:bg-gray-950 text-sm">
              {children}
            </pre>
          ),

          // ============================================
          // Tables
          // ============================================
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-400 dark:border-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={tableHeaderBg}>{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-400 dark:border-gray-700">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-2 text-sm ${formInputColors.helper}`}>
              {children}
            </td>
          ),

          // ============================================
          // Blockquotes
          // ============================================
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),

          // ============================================
          // Horizontal Rules
          // ============================================
          hr: () => (
            <hr className="my-8 border-gray-400 dark:border-gray-700" />
          ),

          // ============================================
          // Images
          // ============================================
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg my-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
