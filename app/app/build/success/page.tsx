import { permanentRedirect } from 'next/navigation';

/** The retired success page has no checkout state; continue at the scoped intake. */
export default function BuildSuccessPage() {
  permanentRedirect('/contact?offer=website-improvement');
}
