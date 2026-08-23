import { render } from '@react-email/components';
import { sendDurableTransactionalEmail } from '@/lib/transactional-email-service';

export const getEmailConfig = () => ({
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  adminEmail: process.env.RESEND_ADMIN_EMAIL,
  replyTo: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
});

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export type RenderedEmailOperation = {
  operationKey: string;
  domainReference: string;
  projectId?: string | null;
  attachments?: EmailAttachment[];
};

/** Render one template and hand it to the only transactional provider service. */
export async function sendRenderedTransactionalEmail(
  to: string,
  subject: string,
  react: React.ReactElement,
  operation: RenderedEmailOperation,
): Promise<string | null> {
  const html = await render(react);
  const text = await render(react, { plainText: true });
  return sendDurableTransactionalEmail({
    to,
    subject,
    text,
    html,
    attachments: operation.attachments,
    projectId: operation.projectId,
    operationKey: operation.operationKey,
    domainReference: operation.domainReference,
  });
}
