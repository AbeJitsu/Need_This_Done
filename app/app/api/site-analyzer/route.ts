import { NextRequest, NextResponse } from 'next/server';
import { analyzeSite } from '@/lib/site-analyzer';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { sanitizeEmail } from '@/lib/validation';
import { withTimeout } from '@/lib/api-timeout';
import { handleApiError, badRequest } from '@/lib/api-errors';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendSiteReportEmail } from '@/lib/email-service';

// ============================================================================
// POST /api/site-analyzer
// ============================================================================
// Public endpoint: accepts URL + email, runs site analysis, saves report,
// sends email summary, and returns the report ID for redirect.
//
// Rate limited: 2 per IP per day, 2 per email per day (whichever hits first).
// Timeout: 55 seconds (5s buffer under Vercel's 60s limit).

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json().catch(() => null);
    if (!body || typeof body.url !== 'string' || typeof body.email !== 'string') {
      return badRequest('Missing required fields: url and email');
    }

    // Validate URL
    let validatedUrl: string;
    try {
      const parsed = new URL(body.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return badRequest('URL must start with http:// or https://');
      }
      validatedUrl = parsed.href;
    } catch {
      return badRequest('Invalid URL format');
    }

    // Validate and sanitize email
    let email: string;
    try {
      email = sanitizeEmail(body.email);
    } catch {
      return badRequest('Invalid email address');
    }

    // 2. Rate limit — two independent checks, whichever fails first blocks
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const ipCheck = await checkRateLimit(
      `analyzer:ip:${ip}`,
      { maxAttempts: 2, windowSeconds: 86400 },
      'site-analyzer'
    );
    if (!ipCheck.allowed) {
      return rateLimitResponse(ipCheck.resetAt, 'You\'ve used your 2 free analyses for today. Come back tomorrow!');
    }

    const emailCheck = await checkRateLimit(
      `analyzer:email:${email}`,
      { maxAttempts: 2, windowSeconds: 86400 },
      'site-analyzer'
    );
    if (!emailCheck.allowed) {
      return rateLimitResponse(emailCheck.resetAt, 'This email has already been used for 2 analyses today. Come back tomorrow!');
    }

    // 3. Run analyzer with 55s timeout (Vercel Pro has 60s limit)
    const result = await withTimeout(
      analyzeSite(validatedUrl),
      55000,
      'site-analyzer'
    );

    // 4. Save report to Supabase
    const supabase = getSupabaseAdmin();

    // Extract accessibility data from the first page's metrics
    const accessibilityData = result.metrics.length > 0
      ? result.metrics[0].accessibility
      : {};

    const { data: report, error: insertError } = await supabase
      .from('site_reports')
      .insert({
        url: validatedUrl,
        email,
        score: result.score,
        grade: result.grade,
        categories: result.categories,
        accessibility: accessibilityData,
        metrics: result.metrics,
        ai_analysis: result.aiAnalysis,
        executive_summary: result.executiveSummary,
        pages_crawled: result.pagesCrawled,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[site-analyzer] Failed to save report:', insertError);
      return handleApiError(insertError, 'site-analyzer:save');
    }

    const reportId = report.id;
    const reportUrl = `/report/${reportId}`;

    // 5. Send email async (don't block response)
    sendSiteReportEmail({
      email,
      url: validatedUrl,
      score: result.score,
      grade: result.grade,
      categories: result.categories,
      executiveSummary: result.executiveSummary,
      reportUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com'}${reportUrl}`,
    }).catch((err) => {
      console.error('[site-analyzer] Email send failed:', err);
    });

    // 6. Return report info for redirect
    return NextResponse.json({
      reportId,
      score: result.score,
      grade: result.grade,
      redirectUrl: reportUrl,
    });
  } catch (error) {
    return handleApiError(error, 'site-analyzer');
  }
}
