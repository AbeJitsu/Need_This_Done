import { permanentRedirect } from 'next/navigation';

/** Keep the legacy route pointed at the public proof layer. */
export default function AboutPage() {
  permanentRedirect('/work');
}
