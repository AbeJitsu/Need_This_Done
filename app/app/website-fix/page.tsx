import type { Metadata } from 'next';
import OfferPage from '@/components/public/OfferPage';

export const metadata: Metadata = { title: 'Website Fix | Need This Done', description: 'A $500 evidence-based review and one agreed contained website fix.', alternates: { canonical: '/website-fix' } };

export default function WebsiteFixPage() { return <OfferPage eyebrow="Website Fix · $500" title="One website problem, made meaningfully better." introduction="We review the evidence, agree on one contained fix, and deliver it with a clear handoff." commitment="$250 is invoiced manually to begin. The remaining $250 is invoiced after the agreed contained fix is delivered." included={['One evidence-based review of a specific page, path, or component.', 'One mutually agreed contained correction.', 'A handoff showing what changed and what remains outside scope.']} excluded={['A redesign, integration, multi-page build, or ongoing maintenance.', 'Accessibility certification, legal advice, or a promised business result.', 'Work that expands beyond the agreed written boundary.']} cta="Start a Website Fix" href="/contact?offer=website-fix" />; }
