import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '..');
const source = (path: string) => readFileSync(resolve(APP_ROOT, path), 'utf8');

describe('transactional email caller boundary', () => {
  it('creates durable keys at every retained logical event boundary', () => {
    const projects = source('app/api/projects/route.ts');
    expect(projects).toContain('project:${project.id}:admin-notification');
    expect(projects).toContain('project:${project.id}:requester-confirmation');

    const siteReport = source('app/api/site-analyzer/route.ts');
    expect(siteReport).toContain('site-report:${reportId}:delivery');

    const login = source('app/api/auth/login/route.ts');
    expect(login).toContain('randomUUID()');
    expect(login).toContain('operationKey,');
    expect(login).toContain('user:${userId}:login-notification');

    const inbound = source('app/api/webhooks/resend/transactional/route.ts');
    expect(inbound).toContain('inbound-email:${event.data?.email_id || eventId}:forward');
  });

  it('keeps provider construction inside the single adapter boundary', () => {
    expect(source('lib/email.ts')).not.toContain('new Resend');
    expect(source('lib/transactional-email-service.ts')).not.toContain('new Resend');
    expect(source('lib/inbound-email-forwarding.ts')).not.toContain('new Resend');
    expect(source('lib/provider-adapters.ts')).toContain('new Resend');
  });
});
