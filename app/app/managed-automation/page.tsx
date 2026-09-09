import type { Metadata } from 'next';
import OfferPage from '@/components/public/OfferPage';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

export const metadata: Metadata = { title: 'Managed Automation | Need This Done', description: `${PUBLIC_CORE_PROMISE} Managed Automation starts with one repeated task.`, alternates: { canonical: '/managed-automation' } };

export default function ManagedAutomationPage() { return <OfferPage offerId="ai-operator" title="Make one repeated task easier to run." introduction="We review one task that keeps taking time. We outline a more dependable way to handle it." commitment="Before work begins, you receive a written plan. It names the problem, scope, price, payment terms, and decisions that remain yours." included={['One repeated task worth fixing.', 'A shared view of what needs to change.', 'Work aimed at that one problem.']} excluded={['No promise about revenue, time saved, or another business result.', 'No redesign, large tool connection, or open-ended work.', 'No work until the scope is written and agreed.']} />; }
