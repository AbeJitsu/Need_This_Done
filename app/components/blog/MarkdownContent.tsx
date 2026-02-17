// ============================================================================
// MarkdownContent Component — Magazine Editorial Reading Experience
// ============================================================================
// Renders markdown with editorial styling: accent bars on h2, comfortable
// paragraph sizing, purple-themed blockquotes, and decorative hr separators.
// Custom bullet dots are handled via CSS in globals.css (.markdown-content).

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { tableHeaderBg } from '@/lib/colors';

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
          // Headings — editorial accent bar on h2
          // ============================================
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-10 mb-5 text-gray-900">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="flex items-center gap-3 text-2xl font-bold mt-12 mb-5 text-gray-900">
              <span className="inline-block w-6 h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="uppercase tracking-wide text-sm font-semibold mt-6 mb-2 text-gray-700">
              {children}
            </h4>
          ),

          // ============================================
          // Paragraphs and Text — 17px for reading comfort
          // ============================================
          p: ({ children }) => (
            <p className="text-[1.0625rem] text-gray-700 mb-5 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
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
              className="text-purple-600 hover:text-purple-800 underline decoration-purple-300 underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),

          // ============================================
          // Lists — CSS handles bullets via .markdown-content
          // ============================================
          ul: ({ children }) => (
            <ul className="mb-5 space-y-1.5 text-[1.0625rem] text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-5 space-y-1.5 text-[1.0625rem] text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // ============================================
          // Code Blocks and Inline Code
          // ============================================
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded text-sm font-mono bg-gray-100 text-purple-600"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-5 p-4 rounded-lg overflow-x-auto bg-gray-900 text-sm">
              {children}
            </pre>
          ),

          // ============================================
          // Tables
          // ============================================
          table: ({ children }) => (
            <div className="overflow-x-auto mb-5">
              <table className="min-w-full border-collapse border border-gray-400">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={tableHeaderBg}>{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-400">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700">
              {children}
            </td>
          ),

          // ============================================
          // Blockquotes — purple accent, decorative quote
          // ============================================
          blockquote: ({ children }) => (
            <blockquote className="relative border-l-4 border-purple-500 bg-purple-50 rounded-r-xl pl-6 pr-5 py-4 my-6">
              <span className="absolute top-2 left-2 text-4xl leading-none text-purple-200 font-playfair select-none" aria-hidden="true">
                &ldquo;
              </span>
              <div className="relative text-gray-700 italic">
                {children}
              </div>
            </blockquote>
          ),

          // ============================================
          // Horizontal Rules — editorial separator with dot
          // ============================================
          hr: () => (
            <div className="my-10 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>
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
