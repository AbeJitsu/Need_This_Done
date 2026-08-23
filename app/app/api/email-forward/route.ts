import { POST as transactionalResendWebhook } from '@/app/api/webhooks/resend/transactional/route';

export const dynamic = 'force-dynamic';

// Compatibility path: raw-body signature verification and inbound forwarding
// are owned by the same transactional Resend webhook handler.
export const POST = transactionalResendWebhook;
