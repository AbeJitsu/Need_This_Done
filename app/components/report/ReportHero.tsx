// ============================================================================
// Report Hero — a limited signal summary, not a grade or certification.

interface ReportHeroProps {
  domain: string;
  url: string;
  executiveSummary: string;
  pagesCrawled: number;
}

export default function ReportHero({ domain, executiveSummary, pagesCrawled }: ReportHeroProps) {

  return (
    <section className="border-b border-[#183229]/10 bg-[#183229] text-white"><div className="mx-auto max-w-5xl px-6 pb-16 pt-16 sm:px-8 md:px-12 md:pb-20 md:pt-24"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d5bd]">Website snapshot</p>

        <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-8">
          {domain}
        </h1>

        <p className="mb-4 text-sm text-[#b9d5bd]">Selected signals from {pagesCrawled} page{pagesCrawled === 1 ? '' : 's'} reviewed</p><p className="max-w-3xl text-lg leading-relaxed text-[#dce8dd]">{executiveSummary}</p><p className="mt-6 max-w-3xl text-sm leading-6 text-[#b9d5bd]">This snapshot can miss issues and does not certify accessibility, security, legal compliance, or overall site quality.</p></div></section>
  );
}
