import { Render } from '@measured/puck';
import { puckConfig } from '@/lib/puck-config';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

// ============================================================================
// Dynamic Page Viewer
// ============================================================================
// What: Renders published Puck pages at root-level URLs (e.g., /about, /features)
// Why: Enables public viewing of pages created with Puck visual editor
// How: Fetches page data server-side, validates publication status, renders with Puck

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params;

  try {
    // Get the request URL from headers to construct absolute URL
    const headersList = await headers();
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Fetch page data server-side
    const response = await fetch(`${baseUrl}/api/pages/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      notFound();
    }

    const { page } = await response.json();

    if (!page || !page.is_published) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <main>
          <Render config={puckConfig} data={page.content} />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    notFound();
  }
}
