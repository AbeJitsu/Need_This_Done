import { permanentRedirect } from 'next/navigation';

/** Keep the legacy route pointed at the homepage's Why Us section. */
export default function AboutPage() {
  permanentRedirect('/#why-us');
}
