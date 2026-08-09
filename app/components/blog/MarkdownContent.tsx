// ============================================================================
// MarkdownContent Component — Magazine Editorial Reading Experience
// ============================================================================
// Renders markdown with editorial styling: accent bars on h2, comfortable
// paragraph sizing, forest-themed blockquotes, and quiet separators.
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
            <h1 className="mb-5 mt-10 text-3xl font-bold text-[#183229]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-12 mb-5 flex items-center gap-3 text-2xl font-bold text-[#183229]">
              <span className="inline-block h-1 w-6 flex-shrink-0 rounded-full bg-gradient-to-r from-[#8ed3ac] to-[#126b4e]" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-4 mt-8 text-xl font-semibold text-[#183229]">
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
          <p className="mb-5 text-[1.0625rem] leading-relaxed text-[#40564e]">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#183229]">
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
              className="text-[#126b4e] underline decoration-[#8ed3ac] underline-offset-2 transition-colors hover:text-[#0c563e]"
            >
              {children}
            </a>
          ),

          // ============================================
          // Lists — CSS handles bullets via .markdown-content
          // ============================================
          ul: ({ children }) => (
            <ul className="mb-5 space-y-1.5 text-[1.0625rem] text-[#40564e]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-inside list-decimal space-y-1.5 text-[1.0625rem] text-[#40564e]">
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
                  className="rounded bg-[#e4eee6] px-1.5 py-0.5 font-mono text-sm text-[#126b4e]"
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
            <blockquote className="relative my-6 rounded-r-xl border-l-4 border-[#126b4e] bg-[#e4eee6] py-4 pl-6 pr-5">
              <span className="absolute left-2 top-2 select-none font-playfair text-4xl leading-none text-[#b8d9c7]" aria-hidden="true">
                &ldquo;
              </span>
              <div className="relative italic text-[#40564e]">
                {children}
              </div>
            </blockquote>
          ),

          // ============================================
          // Horizontal Rules — editorial separator with dot
          // ============================================
          hr: () => (
            <div className="my-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#183229]/10" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#d9b96e]" />
              <div className="h-px flex-1 bg-[#183229]/10" />
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
