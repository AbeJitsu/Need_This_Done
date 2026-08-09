import { permanentRedirect } from 'next/navigation';

/** Support guidance is consolidated into the maintained FAQ and process pages. */
export default function GuidePage() {
  permanentRedirect('/faq');
}
