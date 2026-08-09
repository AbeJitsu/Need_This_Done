'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, CircleDollarSign, FileText, Loader2, Mail, ShieldAlert, ShieldCheck, Users, X } from 'lucide-react';
import type { GrowthProfile, OutreachMessage, ProspectDossier, ProspectingQueue } from '@/lib/prospecting-types';
import { MODEL_EVALUATION_DAILY_CAP_USD } from '@/lib/model-evaluation';

type Tab = 'morning' | 'midday' | 'evening';
const blank = { name: 'NeedThisDone growth profile', targetMarket: '', geography: '', businessSize: '', painSignals: '', exclusionRules: '', offer: '', senderName: '', senderEmail: '', dailyProspectCap: 10, dailySendCap: 10, workingHoursStart: '09:00', workingHoursEnd: '17:00', timezone: 'America/New_York', followUpDays: '3,7', emergencyStop: false };
type ProfileForm = typeof blank;
const inputClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#183229]/20 bg-white px-3';

function asLines(value: unknown[]) {
  return value.filter((item): item is string => typeof item === 'string').join('\n');
}

function formFor(profile: GrowthProfile | null): ProfileForm {
  if (!profile) return { ...blank };
  return {
    ...blank,
    name: profile.name,
    targetMarket: profile.target_market,
    geography: profile.geography,
    businessSize: profile.business_size,
    painSignals: asLines(profile.pain_signals),
    exclusionRules: asLines(profile.exclusion_rules),
    offer: profile.offer,
    senderName: profile.sender_name || '',
    senderEmail: profile.sender_email || '',
    dailyProspectCap: profile.daily_prospect_cap,
    dailySendCap: profile.daily_send_cap,
    workingHoursStart: profile.working_hours_start.slice(0, 5),
    workingHoursEnd: profile.working_hours_end.slice(0, 5),
    timezone: profile.timezone,
    followUpDays: profile.follow_up_days.join(','),
    emergencyStop: profile.emergency_stop,
  };
}

function senderConfigured(profile: GrowthProfile | null | undefined) {
  return Boolean(profile?.sender_name?.trim() && profile.sender_email?.trim());
}

export default function ProspectingDashboard() {
  const [queue, setQueue] = useState<ProspectingQueue | null>(null);
  const [form, setForm] = useState<ProfileForm>({ ...blank });
  const [tab, setTab] = useState<Tab>('morning');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, { subject: string; body: string }>>({});

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch('/api/prospecting/queue', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Prospecting queue could not be loaded.');
      setQueue(data); setForm(formFor(data.profile)); if (!data.profile) setSetupOpen(true);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Prospecting queue could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const setField = (field: keyof ProfileForm, value: string | number | boolean) => setForm((current) => ({ ...current, [field]: value }));
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(null);
    const payload = { ...form, painSignals: form.painSignals.split('\n').map((item) => item.trim()).filter(Boolean), exclusionRules: form.exclusionRules.split('\n').map((item) => item.trim()).filter(Boolean), followUpDays: form.followUpDays.split(',').map(Number).filter(Number.isInteger) };
    try {
      const response = await fetch('/api/prospecting/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Profile could not be saved.');
      setSetupOpen(false); setNotice('Growth profile saved. Research can remain sender-free.'); await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Profile could not be saved.'); }
    finally { setSaving(false); }
  };
  const emergencyStop = async () => {
    const active = !queue?.profile?.emergency_stop;
    const response = await fetch('/api/prospecting/emergency-stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
    if (!response.ok) { setError('Emergency-stop state could not be changed.'); return; }
    setNotice(active ? 'Emergency stop is active.' : 'Emergency stop cleared.'); await load();
  };
  const queueToday = async () => {
    setQueueing(true); setError(null);
    try {
      const response = await fetch('/api/prospecting/discovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Today could not be queued.');
      setNotice(data.queued ? 'Today’s private research task is queued.' : 'Today’s research was already queued.'); await load();
    } catch (queueError) { setError(queueError instanceof Error ? queueError.message : 'Today could not be queued.'); }
    finally { setQueueing(false); }
  };
  const promote = async (dossier: ProspectDossier) => {
    setPromoting(dossier.id); setError(null);
    try {
      const response = await fetch(`/api/prospecting/dossiers/${dossier.id}/promote`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The draft could not enter human outreach review.');
      setNotice('Draft promoted to human outreach review. It is still not approved or sent.'); await load(); setTab('midday');
    } catch (promotionError) { setError(promotionError instanceof Error ? promotionError.message : 'The draft could not be promoted.'); }
    finally { setPromoting(null); }
  };
  const decide = async (message: OutreachMessage, decision: 'approve' | 'reject' | 'defer') => {
    const value = editing[message.id] || { subject: message.subject, body: message.body };
    const response = await fetch(`/api/prospecting/messages/${message.id}/decision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision, ...value, nextActionAt: decision === 'defer' ? new Date(Date.now() + 3 * 86_400_000).toISOString() : undefined }) });
    if (!response.ok) { const data = await response.json(); setError(data.error || 'Message decision failed.'); return; }
    setNotice(`Message ${decision}d.`); await load();
  };
  const sendApproved = async (message: OutreachMessage) => {
    const response = await fetch('/api/prospecting/sender/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: message.id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Approved message could not be sent.'); return; }
    setNotice(data.duplicate ? 'The approved message was already sent.' : 'Approved message sent through the configured sender.'); await load();
  };

  if (loading) return <div className="grid min-h-[65vh] place-items-center bg-[#f7f4ed]"><p className="flex items-center gap-3 font-bold"><Loader2 className="h-5 w-5 animate-spin" />Loading prospecting workspace…</p></div>;
  const canQueue = Boolean(queue?.profile && !queue.profile.emergency_stop && queue.profile.model_route !== 'evaluation-required' && queue.profile.selected_model_id);
  return <div className="min-h-screen bg-[#f7f4ed] px-5 py-8 text-[#183229] sm:px-8"><div className="mx-auto max-w-7xl">
    <header className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">NeedThisDone · private two-business research</p><h1 className="mt-2 text-4xl font-black">Prospecting &amp; outreach</h1><p className="mt-2 max-w-2xl text-[#50675e]">Research up to two public businesses daily, review source-backed drafts, and keep every external action human-controlled.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void queueToday()} disabled={!canQueue || queueing} className="min-h-11 rounded-full border border-[#183229]/20 bg-white px-4 font-bold disabled:cursor-not-allowed disabled:opacity-50">{queueing ? 'Queueing…' : 'Queue today'}</button><button onClick={() => setSetupOpen((value) => !value)} className="min-h-11 rounded-full border border-[#183229]/20 bg-white px-4 font-bold">{setupOpen ? 'Close setup' : 'Growth profile'}</button>{queue?.profile && <button onClick={() => void emergencyStop()} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-bold ${queue.profile.emergency_stop ? 'bg-[#183229] text-white' : 'bg-red-100 text-red-800'}`}><ShieldAlert className="h-4 w-4" />{queue.profile.emergency_stop ? 'Clear stop' : 'Emergency stop'}</button>}</div></header>
    {error && <div role="alert" className="mt-6 flex gap-2 rounded-xl bg-red-50 p-4 text-red-800"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}{notice && <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-900">{notice}</div>}
    {setupOpen && <ProfileForm form={form} saving={saving} onChange={setField} onSubmit={saveProfile} />}
    {!queue?.profile ? <Empty title="Start with your market profile" description="Configure the profile above before private research can run." icon={<Users className="mx-auto h-8 w-8 text-[#126b4e]" />} /> : <>
      <Policy profile={queue.profile} />
      <Stats queue={queue} />
      <nav aria-label="Prospecting check-ins" className="mt-8 grid gap-2 sm:grid-cols-3">{(['morning', 'midday', 'evening'] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`min-h-14 rounded-xl px-4 text-left font-bold ${tab === item ? 'bg-[#18372e] text-white' : 'border border-[#183229]/15 bg-white'}`}>{item === 'morning' ? 'Morning · research dossiers' : item === 'midday' ? 'Midday · review drafts' : 'Evening · usage & failures'}</button>)}</nav>
      {tab === 'morning' && <Morning queue={queue} promoting={promoting} onPromote={(dossier) => void promote(dossier)} />}
      {tab === 'midday' && <Midday queue={queue} editing={editing} setEditing={setEditing} onDecision={(message, decision) => void decide(message, decision)} onSend={(message) => void sendApproved(message)} />}
      {tab === 'evening' && <Evening queue={queue} />}
    </>}
  </div></div>;
}

function Empty({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) { return <div className="mt-8 rounded-3xl border border-dashed border-[#183229]/25 bg-white p-12 text-center">{icon}<h2 className="mt-4 text-2xl font-black">{title}</h2><p className="mt-2 text-[#50675e]">{description}</p></div>; }

function Policy({ profile }: { profile: GrowthProfile }) {
  const selected = profile.selected_model_id;
  return <section className="mt-7 grid gap-4 rounded-3xl border border-[#183229]/15 bg-white p-5 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Read-only model policy</p><p className="mt-2 font-bold">{selected ? selected : 'Evaluation required — no model work can run'}</p><p className="mt-1 text-sm leading-6 text-[#50675e]">{profile.selected_model_rationale || `The shared model ceiling is $${MODEL_EVALUATION_DAILY_CAP_USD.toFixed(2)} daily. A Mac-mini benchmark must pin a catalog model before research can run.`}</p></div><div className={`rounded-2xl px-4 py-3 text-sm font-bold ${profile.emergency_stop ? 'bg-red-100 text-red-800' : selected ? 'bg-emerald-50 text-emerald-900' : 'bg-[#f7f4ed]'}`}>{profile.emergency_stop ? 'Stopped' : selected ? 'Pinned' : 'Evaluation required'}</div></section>;
}

function Stats({ queue }: { queue: ProspectingQueue }) {
  const values: Array<[string, string | number]> = [['Dossiers', `${queue.stats.acceptedDossiersToday}/2`], ['Pending drafts', queue.stats.pendingDrafts], ['Task failures', queue.stats.taskFailures], ['Actual spend', `$${queue.stats.modelSpendToday.toFixed(4)}`], ['Reserved spend', `$${queue.stats.reservedModelSpendToday.toFixed(4)}`], ['Replies', queue.stats.replies], ['Bounces', queue.stats.bounces]];
  return <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">{values.map(([label, value]) => <article key={label} className="rounded-2xl border border-[#183229]/15 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#126b4e]">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></article>)}</section>;
}

function ProfileForm({ form, saving, onChange, onSubmit }: { form: ProfileForm; saving: boolean; onChange: (field: keyof ProfileForm, value: string | number | boolean) => void; onSubmit: (event: React.FormEvent) => void }) {
  const fields: Array<[keyof ProfileForm, string, boolean]> = [['name', 'Profile name', false], ['targetMarket', 'Target market', true], ['geography', 'Geography', true], ['businessSize', 'Business size/type', false], ['offer', 'Offer', true], ['senderName', 'Sender name (optional)', false], ['senderEmail', 'Approved sender email (optional)', false], ['timezone', 'Timezone', true]];
  return <form onSubmit={onSubmit} className="mt-8 rounded-3xl border border-[#183229]/15 bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">Configure research</h2><p className="mt-1 text-sm text-[#50675e]">Sender details are optional for research-only setup. Promotion and sending remain blocked until both are approved.</p><p className="mt-2 text-sm text-[#50675e]">The model policy is recorded by measured Mac-mini benchmarks and cannot be edited here.</p></div><Check className="h-6 w-6 text-[#126b4e]" /></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([field, label, required]) => <label key={field} className="font-semibold">{label}<input required={required} value={String(form[field])} onChange={(event) => onChange(field, event.target.value)} className={inputClass} /></label>)}<label className="font-semibold">Daily prospect cap<input type="number" min="1" max="100" value={form.dailyProspectCap} onChange={(event) => onChange('dailyProspectCap', Number(event.target.value))} className={inputClass} /></label><label className="font-semibold">Daily approved-send cap<input type="number" min="1" max="100" value={form.dailySendCap} onChange={(event) => onChange('dailySendCap', Number(event.target.value))} className={inputClass} /></label><label className="font-semibold">Follow-up days<input value={form.followUpDays} onChange={(event) => onChange('followUpDays', event.target.value)} className={inputClass} placeholder="3,7" /></label><label className="font-semibold">Working hours start<input type="time" value={form.workingHoursStart} onChange={(event) => onChange('workingHoursStart', event.target.value)} className={inputClass} /></label><label className="font-semibold">Working hours end<input type="time" value={form.workingHoursEnd} onChange={(event) => onChange('workingHoursEnd', event.target.value)} className={inputClass} /></label><label className="font-semibold sm:col-span-2 lg:col-span-3">Pain signals, one per line<textarea value={form.painSignals} onChange={(event) => onChange('painSignals', event.target.value)} className={`${inputClass} min-h-20 p-3`} /></label><label className="font-semibold sm:col-span-2 lg:col-span-3">Exclusion rules, one per line<textarea value={form.exclusionRules} onChange={(event) => onChange('exclusionRules', event.target.value)} className={`${inputClass} min-h-20 p-3`} /></label></div><button disabled={saving} className="mt-6 min-h-11 rounded-full bg-[#126b4e] px-5 font-bold text-white">{saving ? 'Saving…' : 'Save growth profile'}</button></form>;
}

function Morning({ queue, promoting, onPromote }: { queue: ProspectingQueue; promoting: string | null; onPromote: (dossier: ProspectDossier) => void }) {
  const senderReady = senderConfigured(queue.profile);
  if (!queue.dossiers.length) return <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><Empty title="No citation-backed dossiers yet" description="The signed Mac-mini worker will record up to two accepted public-business dossiers after the daily task is queued." icon={<FileText className="mx-auto h-8 w-8 text-[#126b4e]" />} /><Guardrails /></section>;
  return <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><div className="space-y-4">{queue.dossiers.map((dossier) => {
    const prospect = queue.prospects.find((item) => item.id === dossier.prospect_id);
    const canPromote = dossier.review_status === 'pending_review' && Boolean(prospect?.email) && prospect?.suppression_status === 'clear' && senderReady;
    return <article key={dossier.id} className="rounded-3xl border border-[#183229]/15 bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">Dossier · {dossier.review_status.replace('_', ' ')}</p><h2 className="mt-2 text-2xl font-black">{dossier.company_name}</h2><a className="mt-1 block text-sm text-[#126b4e] underline" href={dossier.official_website_url} target="_blank" rel="noreferrer">{dossier.official_website_url}</a></div>{canPromote && <button disabled={promoting === dossier.id} onClick={() => onPromote(dossier)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#126b4e] px-4 font-bold text-white"><Mail className="h-4 w-4" />{promoting === dossier.id ? 'Promoting…' : 'Promote to review'}</button>}</div><p className="mt-4 leading-7 text-[#50675e]">{dossier.icp_reason}</p><div className="mt-4 grid gap-3 lg:grid-cols-2"><section className="rounded-2xl bg-[#f7f4ed] p-4"><p className="text-sm font-bold">Observed public evidence</p><ul className="mt-2 space-y-2 text-sm text-[#50675e]">{dossier.observed_evidence.map((evidence) => <li key={evidence.claim}>{evidence.claim}</li>)}</ul></section><section className="rounded-2xl bg-[#f7f4ed] p-4"><p className="text-sm font-bold">Recommended angle</p><p className="mt-2 text-sm leading-6 text-[#50675e]">{dossier.recommended_offer_angle}</p><p className="mt-3 text-sm"><span className="font-bold">Contact path:</span> {dossier.contact_path.value}</p></section></div><section className="mt-4 rounded-2xl border border-[#183229]/10 p-4"><p className="text-sm font-bold">Suggested draft (not sent)</p><p className="mt-2 font-semibold">{dossier.suggested_subject}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#50675e]">{dossier.suggested_body}</p></section><section className="mt-4"><p className="text-sm font-bold">Citations</p><ul className="mt-2 space-y-2 text-sm">{dossier.citations.map((citation) => <li key={citation.url}><a className="text-[#126b4e] underline" href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a><p className="text-[#50675e]">{citation.excerpt}</p></li>)}</ul></section>{!canPromote && dossier.review_status === 'pending_review' && <p className="mt-4 rounded-xl bg-[#f7f4ed] p-3 text-sm text-[#50675e]">{!senderReady ? 'Research-only setup: configure an approved sender before this valid-recipient draft can enter outreach review.' : !prospect?.email ? 'No public email is required for this dossier. The draft remains reviewable but cannot enter email outreach.' : 'This prospect is suppressed and cannot enter outreach.'}</p>}</article>;
  })}</div><Guardrails /></section>;
}

function Guardrails() { return <aside className="rounded-3xl bg-[#d9b96e]/35 p-6"><h2 className="text-xl font-black">Research guardrails</h2><ul className="mt-4 space-y-3 text-sm leading-6"><li>At most two accepted dossiers per local day.</li><li>Only public HTTPS citations are accepted.</li><li>Duplicate businesses and unsupported claims are rejected.</li><li>The worker cannot create, approve, or send outreach messages.</li></ul></aside>; }

function Midday({ queue, editing, setEditing, onDecision, onSend }: { queue: ProspectingQueue; editing: Record<string, { subject: string; body: string }>; setEditing: React.Dispatch<React.SetStateAction<Record<string, { subject: string; body: string }>>>; onDecision: (message: OutreachMessage, decision: 'approve' | 'reject' | 'defer') => void; onSend: (message: OutreachMessage) => void }) {
  const messages = queue.messages.filter((message) => message.approval_status === 'pending' || message.approval_status === 'deferred' || message.approval_status === 'approved');
  if (!messages.length) return <Empty title="Draft review is clear" description="Citation-backed dossier drafts remain in the morning view until a human promotes an eligible recipient into this review flow." icon={<Mail className="mx-auto h-8 w-8 text-[#126b4e]" />} />;
  const configured = senderConfigured(queue.profile);
  return <section className="mt-6 space-y-5">{messages.map((message) => { const value = editing[message.id] || { subject: message.subject, body: message.body }; const approved = message.approval_status === 'approved'; return <article key={message.id} className="rounded-3xl border border-[#183229]/15 bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#126b4e]">To {message.recipient_email} · {queue.prospects.find((item) => item.id === message.prospect_id)?.company_name || 'prospect'}</p><h2 className="mt-2 text-2xl font-black">{approved ? 'Approved and ready to send' : 'Message preview'}</h2><label className="mt-5 block font-semibold">Subject<input disabled={approved} value={value.subject} onChange={(event) => setEditing((current) => ({ ...current, [message.id]: { ...value, subject: event.target.value } }))} className={inputClass} /></label><label className="mt-4 block font-semibold">Body<textarea disabled={approved} value={value.body} onChange={(event) => setEditing((current) => ({ ...current, [message.id]: { ...value, body: event.target.value } }))} className={`${inputClass} min-h-48 p-3`} /></label><p className="mt-4 rounded-xl bg-[#f7f4ed] p-3 text-sm text-[#50675e]">{approved ? 'This exact approved record is the only message the sender can execute.' : 'Sending is blocked until this exact record is approved.'}</p><div className="mt-4 flex flex-wrap gap-2">{approved ? configured ? <button onClick={() => onSend(message)} className="min-h-11 rounded-full bg-[#126b4e] px-4 font-bold text-white">Send approved message</button> : <span className="text-sm text-[#50675e]">Sender configuration is required before sending.</span> : <><button onClick={() => onDecision(message, 'approve')} className="min-h-11 rounded-full bg-[#126b4e] px-4 font-bold text-white">Approve</button><button onClick={() => onDecision(message, 'defer')} className="min-h-11 rounded-full border border-[#183229]/20 px-4 font-bold">Defer</button><button onClick={() => onDecision(message, 'reject')} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-900/20 px-4 font-bold text-red-800"><X className="h-4 w-4" />Reject</button></>}</div></article>; })}</section>;
}

function Evening({ queue }: { queue: ProspectingQueue }) {
  const failures = queue.tasks.filter((task) => task.status === 'failed');
  return <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><div className="space-y-4"><article className="rounded-3xl border border-[#183229]/15 bg-white p-6"><div className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5 text-[#126b4e]" /><h2 className="text-xl font-black">Shared model usage ledger</h2></div>{queue.usageLedger.length ? <ul className="mt-4 space-y-2 text-sm">{queue.usageLedger.slice(0, 10).map((entry) => <li key={entry.id} className="rounded-xl bg-[#f7f4ed] p-3"><span className="font-bold">{entry.usage_kind}</span> · {entry.model_id} · reserved ${Number(entry.reserved_cost).toFixed(4)} · actual ${Number(entry.actual_cost || 0).toFixed(4)} · {entry.status}</li>)}</ul> : <p className="mt-3 text-sm text-[#50675e]">No model calls have been reserved today.</p>}</article><article className="rounded-3xl border border-[#183229]/15 bg-white p-6"><div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-red-700" /><h2 className="text-xl font-black">Task failures</h2></div>{failures.length ? <ul className="mt-4 space-y-2 text-sm">{failures.map((task) => <li key={task.id} className="rounded-xl bg-red-50 p-3"><span className="font-bold">{task.task_type}</span> · {task.last_error || 'No error detail recorded.'}</li>)}</ul> : <p className="mt-3 text-sm text-[#50675e]">No private worker failures recorded.</p>}</article></div><aside className="rounded-3xl border border-[#183229]/15 bg-white p-6"><ShieldCheck className="h-6 w-6 text-[#126b4e]" /><h2 className="mt-3 text-xl font-black">Safety status</h2><p className="mt-3 text-sm leading-6 text-[#50675e]">Dossiers are public-web research only. The usage ledger reserves before a model call and reconciles afterward. Sender configuration, human promotion, approval, and an explicit sender action remain separate.</p><p className="mt-4 font-bold">{queue.stats.replies} replies · {queue.stats.bounces} bounces · {queue.stats.unsubscribes} unsubscribes</p></aside></section>;
}
