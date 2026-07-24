import { redirect } from 'next/navigation';

/**
 * The internal workflow builder was retired. Preserve existing bookmarks
 * without keeping any workflow UI or execution code alive.
 */
export default function RetiredAutomationPage() {
  redirect('/admin');
}
