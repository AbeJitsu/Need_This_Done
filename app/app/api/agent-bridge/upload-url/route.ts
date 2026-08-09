import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  consumeAgentBridgeNonce,
  isSignedAgentBridgeFailure,
  verifySignedAgentBridgeRequest,
} from '@/lib/agent-bridge-auth';

export const dynamic = 'force-dynamic';

const mimeTypes = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'text/vtt': 'vtt',
  'application/x-subrip': 'srt',
  'text/plain': 'txt',
} as const;

const schema = z.object({
  ownerId: z.string().uuid(),
  workerId: z.string().trim().min(1).max(160),
  taskId: z.string().uuid(),
  artifactType: z.enum(['thumbnail', 'video', 'audio', 'subtitles', 'other']),
  mimeType: z.enum(Object.keys(mimeTypes) as [keyof typeof mimeTypes, ...(keyof typeof mimeTypes)[]]),
  byteSize: z.number().int().positive().max(50 * 1024 * 1024),
}).strict();

export async function POST(request: Request) {
  const signed = await verifySignedAgentBridgeRequest(request, '/api/agent-bridge/upload-url');
  if (isSignedAgentBridgeFailure(signed)) return signed;
  let body: unknown;
  try {
    body = JSON.parse(signed.body);
  } catch {
    return NextResponse.json({ error: 'Invalid agent upload JSON.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent upload request.' }, { status: 400 });
  }
  const replay = await consumeAgentBridgeNonce(signed.nonce);
  if (replay) return replay;

  const admin = getSupabaseAdmin();
  const { data: task, error: taskError } = await admin
    .from('agent_orchestration_tasks')
    .select('id, owner_id, run_id, status, leased_by, lease_expires_at')
    .eq('id', parsed.data.taskId)
    .eq('owner_id', parsed.data.ownerId)
    .maybeSingle();
  if (taskError || !task) return NextResponse.json({ error: 'Agent task was not found.' }, { status: 404 });
  if (!['leased', 'running'].includes(task.status)
    || task.leased_by !== parsed.data.workerId
    || !task.lease_expires_at
    || new Date(task.lease_expires_at) <= new Date()) {
    return NextResponse.json({ error: 'Agent task lease is invalid or expired.' }, { status: 409 });
  }

  const uploadId = crypto.randomUUID();
  const path = 'agent-media/' + parsed.data.ownerId + '/' + task.run_id + '/' + task.id + '/' + uploadId + '.' + mimeTypes[parsed.data.mimeType];
  const { data, error } = await admin.storage.from('agent-media-private').createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: 'A signed media upload URL could not be created.' }, { status: 503 });
  return NextResponse.json({
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    mimeType: parsed.data.mimeType,
    byteSize: parsed.data.byteSize,
    expiresInSeconds: 7200,
  });
}
