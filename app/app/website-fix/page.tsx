import type { Metadata } from 'next';
import OfferPage from '@/components/public/OfferPage';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

export const metadata: Metadata = { title: 'Website Fix | Need This Done', description: `${PUBLIC_CORE_PROMISE} Website Fix addresses one agreed website correction.`, alternates: { canonical: '/website-fix' } };

export default function WebsiteFixPage() { return <OfferPage offerId="website-improvement" title="Fix the page that is getting in the way." introduction="We review one website problem. We agree on one correction and show what changed." commitment="We review one specific problem, agree on a correction, and show you what changed." included={['Review of one page, path, or website part.', 'One written correction that you agree with us.', 'A record of the change and any remaining work.']} excluded={['No redesign, multi-page build, tool integration, or ongoing maintenance.', 'No promise about legal compliance, revenue, traffic, or another business result.', 'No work beyond the correction you agreed with us.']} />; }
