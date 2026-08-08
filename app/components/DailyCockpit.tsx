'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, CircleAlert, Clock3, Compass, Loader2, MessageCircle, RefreshCw, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { CockpitAction, CockpitSignal, DailyCockpitData, WeeklyPriority } from '@/lib/cockpit-types';

type PriorityDraft = {
  outcome: string;
  ownerName: string;
  dueDate: string;
  nextAction: string;
};

const inputClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#183229]/20 bg-white px-3 text-[#183229]';

function dateAfter(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return 'No date';
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function readableType(value: string) {
  return value === 'big_rock' ? 'Weekly rock' : value.replace(/_/g, ' ');
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#183229]/20 bg-white/60 p-6 text-center">
      <p className="font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#50675e]">{description}</p>
    </div>
  );
}

export default function DailyCockpit() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<DailyCockpitData | null>(null);
  const [draft, setDraft] = useState<PriorityDraft>({ outcome: '', ownerName: '', dueDate: dateAfter(4), nextAction: '' });
  const [reflection, setReflection] = useState('');
  const [deferDates, setDeferDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'The daily cockpit could not be loaded.');
      setData(payload as DailyCockpitData);
      setReflection(payload.reflection?.reflection || '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The daily cockpit could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (user?.email && !draft.ownerName) setDraft((current) => ({ ...current, ownerName: user.email || 'Operator' }));
  }, [draft.ownerName, user?.email]);

  const activePriorities = useMemo(() => data?.weeklyPriorities.filter((priority) => priority.status === 'active') || [], [data]);

  const createPriority = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/dashboard/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Weekly priority could not be saved.');
      setDraft((current) => ({ ...current, outcome: '', nextAction: '' }));
      setNotice('Weekly big rock saved.');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Weekly priority could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const changePriorityStatus = async (priority: WeeklyPriority, status: 'active' | 'completed' | 'dropped') => {
    setSavingAction(priority.id);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/priorities/${priority.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Priority status could not be changed.');
      setNotice(status === 'completed' ? 'Big rock completed.' : 'Big rock reopened.');
      await load();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Priority status could not be changed.');
    } finally {
      setSavingAction(null);
    }
  };

  const changeAction = async (action: CockpitAction, state: 'complete' | 'defer' | 'reopen') => {
    setSavingAction(action.id);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/actions/${action.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, deferUntil: state === 'defer' ? deferDates[action.id] : undefined }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Action could not be updated.');
      setNotice(state === 'complete' ? 'Action completed.' : state === 'defer' ? 'Action deferred.' : 'Action reopened.');
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action could not be updated.');
    } finally {
      setSavingAction(null);
    }
  };

  const saveReflection = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard/reflection', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Reflection could not be saved.');
      setNotice('Evening reflection saved.');
      await load();
    } catch (reflectionError) {
      setError(reflectionError instanceof Error ? reflectionError.message : 'Reflection could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[65vh] place-items-center bg-[#f7f4ed] text-[#183229]"><p className="flex items-center gap-3 font-bold"><Loader2 className="h-5 w-5 animate-spin" />Loading your daily cockpit…</p></div>;
  }

  if (!data) {
    return <div className="grid min-h-[65vh] place-items-center bg-[#f7f4ed] px-5 text-[#183229]"><div className="max-w-lg rounded-3xl border border-red-900/15 bg-white p-8 text-center"><CircleAlert className="mx-auto h-7 w-7 text-red-700" /><h1 className="mt-4 text-2xl font-black">The cockpit is unavailable</h1><p className="mt-3 text-[#50675e]">{error || 'Try again in a moment.'}</p><button onClick={() => void load()} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#126b4e] px-5 font-bold text-white"><RefreshCw className="h-4 w-4" />Try again</button></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#183229]">
      <header className="border-b border-[#183229]/10 bg-white/75">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">NeedThisDone · operator rhythm</p>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">Daily cockpit</h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-[#50675e]">One calm place for this week&apos;s important work and today&apos;s next move.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void load()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#183229]/20 bg-white px-4 font-bold"><RefreshCw className="h-4 w-4" />Refresh</button>
              <Link href="/employee" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#183229]/20 bg-white px-4 font-bold">Employee detail <ArrowRight className="h-4 w-4" /></Link>
              {isAdmin && <Link href="/prospecting" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#183229] px-4 font-bold text-white">Prospecting detail <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </div>
          {error && <div role="alert" className="mt-6 flex gap-2 rounded-xl bg-red-50 p-4 text-red-800"><CircleAlert className="h-5 w-5 shrink-0" />{error}</div>}
          {notice && <div role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-900">{notice}</div>}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <article className="rounded-3xl bg-[#18372e] p-7 text-white sm:p-9">
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[.16em] text-[#d9b96e]"><Compass className="h-5 w-5" />Mission</div>
            <p className="mt-5 max-w-3xl text-2xl font-black leading-tight sm:text-3xl">{data.mission}</p>
            <p className="mt-5 max-w-2xl leading-7 text-emerald-50/80">The cockpit keeps the operator in control: suggestions can be completed or deferred here, while detailed employee and provider actions remain in their supervised workspaces.</p>
          </article>
          <GrowthProfile profile={data.growthProfile} isAdmin={isAdmin} />
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Week of {formatDate(data.weekStart)}</p><h2 className="mt-2 text-3xl font-black">Weekly big rocks</h2></div><span className="rounded-full bg-[#d9b96e]/45 px-3 py-1 text-sm font-bold">{activePriorities.length} of 3 active</span></div>
            <div className="mt-5 space-y-4">{data.weeklyPriorities.length ? data.weeklyPriorities.map((priority) => <PriorityCard key={priority.id} priority={priority} busy={savingAction === priority.id} onStatus={changePriorityStatus} />) : <EmptyPanel title="Protect the important work" description="Add up to three outcomes for the week. Each one becomes a visible next action." />}</div>
          </div>

          {activePriorities.length < 3 && <form onSubmit={createPriority} className="rounded-3xl border border-[#183229]/15 bg-white p-6 sm:p-7"><div className="flex items-center gap-3"><Target className="h-6 w-6 text-[#126b4e]" /><div><h2 className="text-2xl font-black">Add a big rock</h2><p className="mt-1 text-sm text-[#50675e]">Outcome first, then the next executable move.</p></div></div><label className="mt-5 block font-semibold">Outcome<input required maxLength={500} value={draft.outcome} onChange={(event) => setDraft((current) => ({ ...current, outcome: event.target.value }))} className={inputClass} placeholder="What must be true by the end of the week?" /></label><label className="mt-4 block font-semibold">Owner<input required maxLength={120} value={draft.ownerName} onChange={(event) => setDraft((current) => ({ ...current, ownerName: event.target.value }))} className={inputClass} /></label><label className="mt-4 block font-semibold">Due date<input required type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} className={inputClass} /></label><label className="mt-4 block font-semibold">Next action<input required maxLength={500} value={draft.nextAction} onChange={(event) => setDraft((current) => ({ ...current, nextAction: event.target.value }))} className={inputClass} placeholder="What is the next visible step?" /></label><button disabled={saving} className="mt-5 min-h-11 w-full rounded-full bg-[#126b4e] px-5 font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : `Add big rock ${activePriorities.length + 1}`}</button></form>}
        </section>

        <section className="mt-10" aria-labelledby="next-actions-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Today</p><h2 id="next-actions-title" className="mt-2 text-3xl font-black">Today&apos;s next actions</h2></div><span className="text-sm font-bold text-[#50675e]">Top three, kept executable</span></div><div className="mt-5 grid gap-4 lg:grid-cols-3">{data.todayActions.length ? data.todayActions.map((action, index) => <ActionCard key={action.id} action={action} index={index} deferDate={deferDates[action.id] || ''} busy={savingAction === action.id} onDeferDate={(value) => setDeferDates((current) => ({ ...current, [action.id]: value }))} onChange={changeAction} />) : <div className="lg:col-span-3"><EmptyPanel title="The day is clear" description="Complete or add a weekly big rock, or wait for the employee and outreach signals to suggest the next move." /></div>}</div></section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          <SignalPanel title="Waiting items" icon={<Clock3 className="h-5 w-5" />} signals={data.waitingItems} empty="Nothing is waiting on a future date." />
          <SignalPanel title="Replies" icon={<MessageCircle className="h-5 w-5" />} signals={data.replies} empty="No replies are waiting for review." />
          <SignalPanel title="Follow-ups" icon={<ArrowRight className="h-5 w-5" />} signals={data.followUps} empty="No follow-ups are eligible yet." />
        </section>

        {data.completedActions.length > 0 && <section className="mt-10"><h2 className="text-2xl font-black">Recently completed</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.completedActions.map((action) => <article key={action.id} className="rounded-2xl border border-[#183229]/10 bg-white/70 p-4"><p className="flex items-start gap-2 font-bold"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#126b4e]" />{action.title}</p><p className="mt-2 text-xs text-[#50675e]">Completed {formatDate(action.completed_at)}</p><button disabled={savingAction === action.id} onClick={() => void changeAction(action, 'reopen')} className="mt-4 min-h-10 rounded-full border border-[#183229]/20 px-4 text-sm font-bold disabled:opacity-60">{savingAction === action.id ? 'Saving…' : 'Reopen action'}</button></article>)}</div></section>}

        <form onSubmit={saveReflection} className="mt-10 rounded-3xl bg-[#d9b96e]/35 p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#183229]/70">Evening reset</p><h2 className="mt-2 text-3xl font-black">End-of-day reflection</h2><p className="mt-2 text-[#50675e]">What did you learn, finish, or decide today?</p></div><span className="text-sm font-bold text-[#50675e]">{formatDate(data.today)}</span></div><label className="sr-only" htmlFor="evening-reflection">Evening reflection</label><textarea id="evening-reflection" aria-label="Evening reflection" required maxLength={2000} value={reflection} onChange={(event) => setReflection(event.target.value)} className="mt-5 min-h-32 w-full rounded-2xl border border-[#183229]/20 bg-white p-4" placeholder="A few honest lines are enough…" /><button disabled={saving} className="mt-4 min-h-11 rounded-full bg-[#183229] px-5 font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save reflection'}</button></form>
      </div>
    </div>
  );
}

function GrowthProfile({ profile, isAdmin }: { profile: DailyCockpitData['growthProfile']; isAdmin: boolean }) {
  if (!profile) return <article className="rounded-3xl border border-[#183229]/15 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Current growth profile</p><h2 className="mt-3 text-2xl font-black">No profile connected yet</h2><p className="mt-3 leading-7 text-[#50675e]">The mission still holds. Configure a market profile when you are ready for discovery and supervised outreach signals.</p>{isAdmin && <Link href="/prospecting" className="mt-5 inline-flex items-center gap-2 font-bold text-[#126b4e]">Configure profile <ArrowRight className="h-4 w-4" /></Link>}</article>;
  return <article className="rounded-3xl border border-[#183229]/15 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Current growth profile</p><h2 className="mt-3 text-2xl font-black">{profile.name}</h2><p className="mt-3 font-bold">{profile.target_market}</p><p className="mt-1 text-sm text-[#50675e]">{profile.geography}{profile.business_size ? ` · ${profile.business_size}` : ''}</p><p className="mt-4 text-sm leading-6 text-[#50675e]"><span className="font-bold text-[#183229]">Offer:</span> {profile.offer}</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-[#e4eee6] px-3 py-1">{profile.daily_prospect_cap} prospects/day</span><span className="rounded-full bg-[#e4eee6] px-3 py-1">{profile.daily_send_cap} approved sends/day</span><span className="rounded-full bg-[#e4eee6] px-3 py-1">Follow up {profile.follow_up_days.join(', ')}d</span></div></article>;
}

function PriorityCard({ priority, busy, onStatus }: { priority: WeeklyPriority; busy: boolean; onStatus: (priority: WeeklyPriority, status: 'active' | 'completed' | 'dropped') => void }) {
  const active = priority.status === 'active';
  return <article className={`rounded-3xl border p-6 ${active ? 'border-[#183229]/15 bg-white' : 'border-[#183229]/10 bg-white/60'}`}><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Big rock {priority.position}</p><span className="rounded-full bg-[#f7f4ed] px-3 py-1 text-xs font-bold capitalize">{priority.status}</span></div><h3 className="mt-3 text-2xl font-black">{priority.outcome}</h3><p className="mt-2 text-sm text-[#50675e]">Owner: {priority.owner_name} · Due {formatDate(priority.due_date)}</p><div className="mt-5 rounded-2xl bg-[#f7f4ed] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#126b4e]">Next action</p><p className="mt-2 font-bold leading-6">{priority.next_action}</p></div>{active && <button disabled={busy} onClick={() => onStatus(priority, 'completed')} className="mt-5 min-h-10 rounded-full border border-[#183229]/20 px-4 text-sm font-bold disabled:opacity-60">{busy ? 'Saving…' : 'Complete big rock'}</button>}{priority.status === 'completed' && <button disabled={busy} onClick={() => onStatus(priority, 'active')} className="mt-5 min-h-10 rounded-full border border-[#183229]/20 px-4 text-sm font-bold disabled:opacity-60">Reopen</button>}</article>;
}

function ActionCard({ action, index, deferDate, busy, onDeferDate, onChange }: { action: CockpitAction; index: number; deferDate: string; busy: boolean; onDeferDate: (value: string) => void; onChange: (action: CockpitAction, state: 'complete' | 'defer' | 'reopen') => void }) {
  return <article data-action-title={action.title} className="rounded-3xl border border-[#183229]/15 bg-white p-6"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#126b4e]">Next action {index + 1}</p><span className="rounded-full bg-[#e4eee6] px-3 py-1 text-xs font-bold capitalize">{readableType(action.action_type)}</span></div><h3 className="mt-4 text-xl font-black leading-tight">{action.title}</h3><p className="mt-3 text-sm leading-6 text-[#50675e]">{action.description}</p>{action.due_date && <p className="mt-4 text-xs font-bold text-[#50675e]">Suggested by {formatDate(action.due_date)}</p>}<div className="mt-5 flex flex-wrap gap-2"><button disabled={busy} onClick={() => onChange(action, 'complete')} className="min-h-10 rounded-full bg-[#126b4e] px-4 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Complete action'}</button><button disabled={busy || !deferDate} onClick={() => onChange(action, 'defer')} className="min-h-10 rounded-full border border-[#183229]/20 px-4 text-sm font-bold disabled:opacity-50">Defer action</button></div><label className="mt-4 block text-sm font-bold">Defer until<input aria-label={`Defer ${action.title} until`} type="date" min={dateAfter(1)} value={deferDate} onChange={(event) => onDeferDate(event.target.value)} className={inputClass} /></label></article>;
}

function SignalPanel({ title, icon, signals, empty }: { title: string; icon: React.ReactNode; signals: CockpitSignal[]; empty: string }) {
  return <section className="rounded-3xl border border-[#183229]/15 bg-white p-6"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-black">{icon}{title}</h2><span className="rounded-full bg-[#f7f4ed] px-3 py-1 text-xs font-bold">{signals.length}</span></div>{signals.length ? <div className="mt-5 space-y-3">{signals.slice(0, 5).map((signal) => <article key={signal.id} className="rounded-2xl bg-[#f7f4ed] p-4"><p className="font-bold">{signal.title}</p><p className="mt-1 text-sm leading-6 text-[#50675e]">{signal.description}</p>{signal.due_date && <p className="mt-2 text-xs font-bold text-[#126b4e]">{formatDate(signal.due_date)}</p>}</article>)}</div> : <p className="mt-5 text-sm leading-6 text-[#50675e]">{empty}</p>}</section>;
}
