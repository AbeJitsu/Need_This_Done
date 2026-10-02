import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/examples/import/route';

function request(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/examples/import', {
    method: 'POST', body, headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('public import example', () => {
  it('normalizes contact data before returning the preview', async () => {
    const response = await POST(request(JSON.stringify([{ name: '  Alex Rivera  ', email: ' ALEX@EXAMPLE.COM ' }])));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, records: [{ name: 'Alex Rivera', email: 'alex@example.com' }], issues: [] });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('finds duplicates after trimming and case normalization', async () => {
    const response = await POST(request(JSON.stringify([
      { name: 'Alex', email: 'alex@example.com' },
      { name: 'Different name', email: ' ALEX@EXAMPLE.COM ' },
    ])));
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ ok: false, records: [{ name: 'Alex', email: 'alex@example.com' }], issues: [{ row: 2, field: 'email', message: 'Duplicate email after normalization.' }] });
  });

  it('reports row-level validation errors while preserving valid preview rows', async () => {
    const response = await POST(request(JSON.stringify([
      { name: 'Sam', email: 'sam@example.com' }, { name: ' ', email: 'broken' },
    ])));
    const result = await response.json();
    expect(response.status).toBe(422);
    expect(result.records).toHaveLength(1);
    expect(result.issues.map((issue: { field: string }) => issue.field)).toEqual(['name', 'email']);
  });

  it.each(['null', '{}', '[]', JSON.stringify(Array.from({ length: 26 }, () => ({ name: 'Alex', email: 'alex@example.com' })))])('rejects unsupported collections: %s', async body => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBeTruthy();
  });

  it('rejects malformed JSON and unexpected media types', async () => {
    expect((await POST(request('{'))).status).toBe(400);
    expect((await POST(request('[]', { 'content-type': 'text/plain' }))).status).toBe(415);
  });

  it('enforces actual body bytes even without a Content-Length header', async () => {
    const response = await POST(request(JSON.stringify([{ name: '界'.repeat(5000), email: 'a@example.com' }])));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('12 KB');
  });

  it('rejects extra fields rather than reflecting arbitrary submitted content', async () => {
    const response = await POST(request(JSON.stringify([{ name: 'Alex', email: 'alex@example.com', secret: 'omit-this' }])));
    expect(response.status).toBe(422);
    expect(await response.text()).not.toContain('omit-this');
  });
});
