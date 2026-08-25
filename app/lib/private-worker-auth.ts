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
async function verifySignedRequest(request: Request, purpose: string, secret: string | undefined, label: string): Promise<SignedWorkerRequest | NextResponse> {
  const body = await request.text();
  const timestamp = request.headers.get('x-worker-timestamp') || '';
  const nonce = request.headers.get('x-worker-nonce') || '';
  const signature = request.headers.get('x-worker-signature') || '';
  if (!secret || !verifyWorkerSignature({ body, timestamp, nonce, signature, secret, purpose })) {
    return NextResponse.json({ error: `Invalid ${label} signature.` }, { status: 401 });
  }
  return { body, nonce };
}

export async function verifySignedWorkerRequest(request: Request, purpose: string): Promise<SignedWorkerRequest | NextResponse> {
  return verifySignedRequest(request, purpose, process.env.PROSPECTING_WORKER_SECRET, 'private worker');
}

/** A separate secret prevents the Daily Desk research worker from invoking the legacy prospecting worker boundary. */
export async function verifySignedDailyDeskWorkerRequest(request: Request, purpose: string): Promise<SignedWorkerRequest | NextResponse> {
  return verifySignedRequest(request, purpose, process.env.DAILY_DESK_WORKER_SECRET, 'Daily Desk worker');
}

export function isSignedWorkerFailure(value: SignedWorkerRequest | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export async function consumeWorkerNonce(nonce: string) {
  const { error } = await getSupabaseAdmin().from('worker_callback_nonces').insert({ nonce });
  return error ? NextResponse.json({ error: 'Worker callback has already been used.' }, { status: 409 }) : null;
}
