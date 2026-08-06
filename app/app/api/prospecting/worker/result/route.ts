import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase';
import { modelBudgetAllowed, verifyWorkerSignature } from '@/lib/prospecting';

const schema = z.object({ taskId: z.string().uuid(), workerId: z.string().trim().min(1).max(160), status: z.enum(['succeeded', 'failed']), output: z.record(z.string(), z.unknown()).optional(), error: z.string().trim().max(4000).optional(), modelName: z.string().trim().max(200).optional(), promptTokens: z.number().int().nonnegative().optional(), completionTokens: z.number().int().nonnegative().optional(), cost: z.number().nonnegative().max(0.1).optional() });

export async function POST(request: Request) {
  const body = await request.text();
  const timestamp = request.headers.get('x-worker-timestamp') || '';
  const nonce = request.headers.get('x-worker-nonce') || '';
  const signature = request.headers.get('x-worker-signature') || '';
  const secret = process.env.PROSPECTING_WORKER_SECRET;
  if (!secret || !verifyWorkerSignature({ body, timestamp, nonce, signature, secret })) return NextResponse.json({ error: 'Invalid worker signature.' }, { status: 401 });
  let json: unknown;
  try { json = JSON.parse(body); } catch { return NextResponse.json({ error: 'Invalid worker result JSON.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid worker result.' }, { status: 400 });
  const admin = getSupabaseAdmin();
  const { error: nonceError } = await admin.from('worker_callback_nonces').insert({ nonce });
  if (nonceError) return NextResponse.json({ error: 'Worker callback has already been used.' }, { status: 409 });
  const { data: task } = await admin.from('agent_tasks').select('id, leased_by, status').eq('id', parsed.data.taskId).maybeSingle();
  if (!task || task.status !== 'leased' || task.leased_by !== parsed.data.workerId) return NextResponse.json({ error: 'Task lease is invalid or expired.' }, { status: 409 });
  const { data: profile } = await admin.from('growth_profiles').select('id, per_run_model_cap, daily_model_cap').eq('id', (await admin.from('agent_tasks').select('profile_id').eq('id', parsed.data.taskId).single()).data?.profile_id || '').single();
  const runCost = parsed.data.cost || 0;
  const { data: todayTasks } = profile ? await admin.from('agent_tasks').select('cost').eq('profile_id', profile.id).eq('status', 'succeeded').gte('completed_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()) : { data: [] };
  const dailySpend = (todayTasks || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);
  if (!profile || !modelBudgetAllowed(dailySpend, runCost, Number(profile.daily_model_cap), Number(profile.per_run_model_cap))) return NextResponse.json({ error: 'Model budget exceeded.' }, { status: 409 });
  const { data, error } = await admin.from('agent_tasks').update({ status: parsed.data.status, output: parsed.data.output || null, last_error: parsed.data.error || null, model_name: parsed.data.modelName || null, prompt_tokens: parsed.data.promptTokens || null, completion_tokens: parsed.data.completionTokens || null, cost: parsed.data.cost || 0, completed_at: new Date().toISOString(), lease_expires_at: null, updated_at: new Date().toISOString() }).eq('id', parsed.data.taskId).eq('status', 'leased').select('*').single();
  if (error) return NextResponse.json({ error: 'Task result could not be recorded.' }, { status: 500 });
  await admin.from('agent_task_events').insert({ task_id: parsed.data.taskId, event_type: parsed.data.status, payload: parsed.data.output || { error: parsed.data.error || null } });
  return NextResponse.json({ task: data });
}
