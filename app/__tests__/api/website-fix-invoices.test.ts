import { beforeEach, describe, expect, it, vi } from 'vitest';

const { executeWebsiteFixInvoice, verifyAdmin } = vi.hoisted(() => ({
  executeWebsiteFixInvoice: vi.fn(),
  verifyAdmin: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/api-auth', () => ({ verifyAdmin }));
vi.mock('@/lib/website-fix-invoice-service', () => ({ executeWebsiteFixInvoice }));

import { POST } from '@/app/api/admin/website-fix/invoices/route';
import { POST as compatibilityPOST } from '@/app/api/admin/website-improvement/invoices/route';

function request(path: string, body: Record<string, unknown>) {
  return new Request(`http://localhost${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

describe('operator Website Fix invoice routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdmin.mockResolvedValue({ user: { id: 'operator-1' } });
  });

  it('rejects browser-generated operation and provider identifiers', async () => {
    const response = await POST(request('/api/admin/website-fix/invoices', {
      projectId: '10000000-0000-4000-8000-000000000001', confirmOperatorAction: true,
      idempotencyKey: 'browser-key', stripeInvoiceId: 'in_browser',
    }));
    expect(response.status).toBe(400);
    expect(executeWebsiteFixInvoice).not.toHaveBeenCalled();
  });

  it('creates server-side and returns the durable operation ID even when disabled', async () => {
    executeWebsiteFixInvoice.mockResolvedValue({ status: 503, body: { error: 'disabled', operationId: 'operation-1' } });
    const response = await POST(request('/api/admin/website-fix/invoices', {
      projectId: '10000000-0000-4000-8000-000000000001', confirmOperatorAction: true,
    }));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ operationId: 'operation-1' });
    expect(executeWebsiteFixInvoice).toHaveBeenCalledWith({
      userId: 'operator-1', projectId: '10000000-0000-4000-8000-000000000001',
    });
  });

  it('retries only by the stored operation ID', async () => {
    const operationId = '20000000-0000-4000-8000-000000000001';
    executeWebsiteFixInvoice.mockResolvedValue({ status: 201, body: { operationId } });
    expect((await POST(request('/api/admin/website-fix/invoices', {
      operationId, confirmOperatorAction: true,
    }))).status).toBe(201);
    expect(executeWebsiteFixInvoice).toHaveBeenCalledWith({ userId: 'operator-1', operationId });
  });

  it('keeps the old route as an authenticated, non-advertised compatibility redirect', async () => {
    const response = await compatibilityPOST(request('/api/admin/website-improvement/invoices', {
      projectId: '10000000-0000-4000-8000-000000000001', confirmOperatorAction: true,
    }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/api/admin/website-fix/invoices');
  });
});
