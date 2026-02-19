import { getSupabaseAdmin } from '@/lib/supabase';

export interface CreateSessionPayload { source: 'page' | 'overlay'; }

export interface UpdateSessionPayload {
  responses?: Record<string, unknown>;
  recommended_tier?: string;
  recommended_addons?: string[];
  estimated_total?: number;
  outcome?: 'added_to_cart' | 'booked_consultation' | 'abandoned';
  abandoned_at_step?: string;
  completed_at?: string;
}

export async function createWizardSession(payload: CreateSessionPayload): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('wizard_sessions')
    .insert({ source: payload.source, started_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) throw new Error(`Failed to create wizard session: ${error.message}`);
  return data.id;
}

export async function updateWizardSession(sessionId: string, payload: UpdateSessionPayload): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('wizard_sessions').update(payload).eq('id', sessionId);
  if (error) throw new Error(`Failed to update wizard session: ${error.message}`);
}
