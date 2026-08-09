import 'server-only';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyWorkerSignature } from '@/lib/prospecting';

export type SignedWorkerRequest = {
  body: string;
  nonce: string;
};

/**
 * Every Mac-mini endpoint signs its path as well as its body. The secret is
 * read only on the private server and the Mac-mini; no browser route receives
 * it. Nonces are consumed separately so callers can validate their schema
 * before a malformed request burns a retry.
 */
export async function verifySignedWorkerRequest(request: Request, purpose: string): Promise<SignedWorkerRequest | NextResponse> {
  const body = await request.text();
  const timestamp = request.headers.get('x-worker-timestamp') || '';
  const nonce = request.headers.get('x-worker-nonce') || '';
  const signature = request.headers.get('x-worker-signature') || '';
  const secret = process.env.PROSPECTING_WORKER_SECRET;
  if (!secret || !verifyWorkerSignature({ body, timestamp, nonce, signature, secret, purpose })) {
    return NextResponse.json({ error: 'Invalid private worker signature.' }, { status: 401 });
  }
  return { body, nonce };
}

export function isSignedWorkerFailure(value: SignedWorkerRequest | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export async function consumeWorkerNonce(nonce: string) {
  const { error } = await getSupabaseAdmin().from('worker_callback_nonces').insert({ nonce });
  return error ? NextResponse.json({ error: 'Worker callback has already been used.' }, { status: 409 }) : null;
}
