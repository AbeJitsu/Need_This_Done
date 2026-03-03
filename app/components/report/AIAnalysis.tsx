// ============================================================================
// AI Analysis — 6 expandable accordion sections
// ============================================================================
// Parses the markdown AI analysis into sections and renders as accordion.
// Section 6 (Action Items) is open by default since it's the most actionable.

'use client';

import { useState } from 'react';

const SECTION_TITLES = [
  'First Impression & Messaging',
  'Service & Offer Clarity',
  'Trust Signals',
  'Technical Health',
  'Accessibility & ADA Compliance',
  'Top 5 Action Items',
];

function parseSections(markdown: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];

  // Split on ## N. headers
  const parts = markdown.split(/^## \d+\.\s+/m);

  // First part is preamble (before ## 1.) — skip it
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newlineIdx = part.indexOf('\n');
    const title = newlineIdx > -1 ? part.slice(0, newlineIdx).trim() : part.trim();
    const content = newlineIdx > -1 ? part.slice(newlineIdx + 1).trim() : '';

    sections.push({
      title: title || SECTION_TITLES[i - 1] || `Section ${i}`,
      content,
    });
  }

  // Fallback: if parsing fails, show the whole thing as one section
  if (sections.length === 0 && markdown.trim()) {
    sections.push({ title: 'Analysis', content: markdown.trim() });
  }

  return sections;
}

function AccordionItem({
  title,
  content,
  index,
  isOpen,
  onToggle,
}: {
  title: string;
  content: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {index + 1}
          </span>
          <span className="font-semibold text-slate-800">{title}</span>
        </div>
        <span className="text-slate-400 text-lg" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="pl-10 prose prose-slate prose-sm max-w-none">
            {content.split('\n').map((line, i) => {
              if (!line.trim()) return null;

              // Numbered list items (action items)
              const numberedMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/);
              if (numberedMatch) {
                return (
                  <div key={i} className="flex gap-2 mb-3">
                    <span className="font-bold text-slate-500 shrink-0">{numberedMatch[1]}.</span>
                    <p className="text-slate-700">
                      <strong>{numberedMatch[2]}</strong>{numberedMatch[3]}
                    </p>
                  </div>
                );
              }

              // Regular numbered list
              const simpleNumbered = line.match(/^(\d+)\.\s+(.+)$/);
              if (simpleNumbered) {
                return (
                  <div key={i} className="flex gap-2 mb-3">
                    <span className="font-bold text-slate-500 shrink-0">{simpleNumbered[1]}.</span>
                    <p className="text-slate-700">{renderInlineMarkdown(simpleNumbered[2])}</p>
                  </div>
                );
              }

              // Bullet points
              if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return (
                  <div key={i} className="flex gap-2 mb-2 ml-2">
                    <span className="text-slate-400 shrink-0" aria-hidden="true">&bull;</span>
                    <p className="text-slate-700">{renderInlineMarkdown(line.trim().slice(2))}</p>
                  </div>
                );
              }

              return (
                <p key={i} className="text-slate-700 mb-3">{renderInlineMarkdown(line)}</p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Render bold and quoted text within a line */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split on **bold** and "quoted" patterns
  const parts = text.split(/(\*\*[^*]+\*\*|"[^"]*")/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('"') && part.endsWith('"')) {
      return <span key={i} className="text-blue-700 font-medium">{part}</span>;
    }
    return part;
  });
}

export default function AIAnalysis({ aiAnalysis }: { aiAnalysis: string }) {
  const sections = parseSections(aiAnalysis);

  // Section 6 (index 5) is open by default
  const [openSections, setOpenSections] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (sections.length > 0) {
      initial.add(sections.length - 1); // Last section (Action Items)
    }
    return initial;
  });

  const toggleSection = (index: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">AI-Powered Analysis</h2>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <AccordionItem
            key={i}
            title={section.title}
            content={section.content}
            index={i}
            isOpen={openSections.has(i)}
            onToggle={() => toggleSection(i)}
          />
        ))}
      </div>
    </section>
  );
}
