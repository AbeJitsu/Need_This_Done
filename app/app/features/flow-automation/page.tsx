import type { Metadata } from 'next';
import FlowAutomationDemo from '@/components/features/FlowAutomationDemo';

export const metadata: Metadata = {
  title: 'Workflow Automation | NeedThisDone',
  description:
    'Visual workflow automation for e-commerce stores. Build trigger-condition-action flows with a drag-and-drop builder — no code required.',
};

export default function FlowAutomationPage() {
  return <FlowAutomationDemo />;
}
