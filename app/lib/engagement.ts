import { ENGAGEMENT_EVENTS, ENGAGEMENT_ROUTES, PUBLIC_VARIANT } from './public-journey';
import { z } from 'zod';

export const engagementSchema = z.object({
  event: z.enum(ENGAGEMENT_EVENTS),
  route: z.enum(ENGAGEMENT_ROUTES),
  element: z.string().regex(/^[a-z0-9_]{1,64}$/),
  variant: z.literal(PUBLIC_VARIANT),
}).strict();

export function recordEngagement(payload: z.infer<typeof engagementSchema>) {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  void fetch('/api/engagement', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), keepalive: true,
  }).catch(() => undefined);
}

declare global { interface Navigator { globalPrivacyControl?: boolean } }
