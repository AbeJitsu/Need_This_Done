import { getPortfolioPage } from '@/lib/portfolio-pages';
import { inspectPortfolioPage } from '@/lib/portfolio-page-check';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const page = getPortfolioPage(new URL(request.url).searchParams.get('page'));
  if (!page) {
    return Response.json({ error: 'Choose a page from the list.' }, { status: 400 });
  }

  try {
    const result = await inspectPortfolioPage(page.id);
    return Response.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch {
    return Response.json(
      { error: 'The live check is unavailable. Please try again shortly.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
