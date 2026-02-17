import { NextResponse } from 'next/server';
import { createWizardSession, updateWizardSession, type UpdateSessionPayload } from '@/lib/wizard-analytics';

export async function POST(request: Request) {
  try {
    const { source } = await request.json();
    if (source !== 'page' && source !== 'overlay') {
      return NextResponse.json({ error: 'source must be "page" or "overlay"' }, { status: 400 });
    }
    const id = await createWizardSession({ source });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('[Wizard] Failed to create session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { sessionId, ...updates } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });

    const validOutcomes = ['added_to_cart', 'booked_consultation', 'abandoned'];
    if (updates.outcome && !validOutcomes.includes(updates.outcome)) {
      return NextResponse.json({ error: `outcome must be one of: ${validOutcomes.join(', ')}` }, { status: 400 });
    }

    const payload: UpdateSessionPayload = {};
    if (updates.responses !== undefined) payload.responses = updates.responses;
    if (updates.recommended_tier) payload.recommended_tier = updates.recommended_tier;
    if (updates.recommended_addons) payload.recommended_addons = updates.recommended_addons;
    if (updates.estimated_total !== undefined) payload.estimated_total = updates.estimated_total;
    if (updates.outcome) payload.outcome = updates.outcome;
    if (updates.abandoned_at_step) payload.abandoned_at_step = updates.abandoned_at_step;
    if (updates.outcome === 'added_to_cart' || updates.outcome === 'booked_consultation') {
      payload.completed_at = new Date().toISOString();
    }

    await updateWizardSession(sessionId, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Wizard] Failed to update session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
