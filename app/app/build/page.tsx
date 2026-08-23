import { permanentRedirect } from 'next/navigation';

/** Legacy build inquiry: preserve the route while preselecting its replacement offer. */
export default function BuildPage() {
  permanentRedirect('/contact?offer=website-fix');
}
