import 'server-only';

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyWorkerSignature } from '@/lib/prospecting';

export type SignedAgentBridgeRequest = {
  body: string;
  nonce: string;
};

/**
 * The Mac-mini bridge has a separate secret from the retained prospecting
 * worker. That makes revocation and staged rollout possible without changing
 * the existing research worker credential.
 */
export async function verifySignedAgentBridgeRequest(
  request: Request,
  purpose: string,
): Promise<SignedAgentBridgeRequest | NextResponse> {
  const body = await request.text();
  const timestamp = request.headers.get('x-bridge-timestamp') || '';
  const nonce = request.headers.get('x-bridge-nonce') || '';
  const signature = request.headers.get('x-bridge-signature') || '';
  const secret = process.env.OPENCLAW_BRIDGE_SECRET;
  if (!secret || !verifyWorkerSignature({
    body,
    timestamp,
    nonce,
    signature,
    secret,
    purpose,
  })) {
    return NextResponse.json({ error: 'Invalid agent bridge signature.' }, { status: 401 });
  }
  return { body, nonce };
}

export function isSignedAgentBridgeFailure(
  value: SignedAgentBridgeRequest | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}

export async function consumeAgentBridgeNonce(nonce: string) {
  const { error } = await getSupabaseAdmin().from('worker_callback_nonces').insert({ nonce });
  return error
    ? NextResponse.json({ error: 'Agent bridge callback has already been used.' }, { status: 409 })
    : null;
}
