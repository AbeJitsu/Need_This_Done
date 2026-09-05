import type { Metadata } from 'next';
import OfferPage from '@/components/public/OfferPage';

export const metadata: Metadata = { title: 'Website Fix | Need This Done', description: 'A review and one agreed correction for the part of your website getting in people’s way.', alternates: { canonical: '/website-fix' } };

export default function WebsiteFixPage() { return <OfferPage offerId="website-improvement" title="That page should be helping, not getting in the way." introduction="If visitors are getting lost, hesitating, or leaving before the next step, we will help resolve the main problem on one page, path, or part of your website." commitment="We review one specific problem, agree on a correction, and show you what changed." included={['A review of one specific page, path, or part of your website.', 'One fix you agree with us in writing.', 'A simple record of what changed and what still needs attention.']} excluded={['A full redesign, a large connection between tools, many-page build, or ongoing maintenance.', 'A promise about legal compliance, revenue, traffic, or another business result.', 'Anything beyond the fix you agreed with us first.']} />; }
