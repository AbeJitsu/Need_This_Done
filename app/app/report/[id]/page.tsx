import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import ReportHero from '@/components/report/ReportHero';
import ScoreBreakdown from '@/components/report/ScoreBreakdown';
import AccessibilityCallout from '@/components/report/AccessibilityCallout';
import PageMetricsTable from '@/components/report/PageMetricsTable';
import AIAnalysis from '@/components/report/AIAnalysis';
import ReportCTA from '@/components/report/ReportCTA';

// ============================================================================
// Report Page - /report/[id]
// ============================================================================
// Server-rendered dashboard-style scorecard. No auth required — the UUID in
// the URL acts as the access token. Data fetched from Supabase.

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

async function getReport(id: string) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return { title: 'Report Not Found - NeedThisDone' };
  }

  const domain = new URL(report.url).hostname;
  return {
    title: `Website Snapshot: ${domain} | Need This Done`,
    description: report.executive_summary,
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  const domain = new URL(report.url).hostname;
  const categories = Array.isArray(report.categories) ? report.categories : [];
  const metrics = Array.isArray(report.metrics) ? report.metrics : [];
  const accessibility = report.accessibility && typeof report.accessibility === 'object' && !Array.isArray(report.accessibility)
    ? report.accessibility
    : {};

  return (
    <main id="main-content" className="min-h-screen bg-[#f7f4ed]">
      <ReportHero
        domain={domain}
        url={report.url}
        executiveSummary={report.executive_summary}
        pagesCrawled={report.pages_crawled}
      />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-12 py-12 space-y-12">
        <ScoreBreakdown categories={categories} />
        <AccessibilityCallout accessibility={accessibility} />
        <PageMetricsTable metrics={metrics} />
        <AIAnalysis aiAnalysis={report.ai_analysis} />
        <ReportCTA />
      </div>
    </main>
  );
}
