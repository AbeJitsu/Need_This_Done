'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Clock3, FileSearch, ShieldCheck, Wrench } from 'lucide-react';
import {
  normalizePublicOfferId,
  PUBLIC_OFFERS,
  type PublicOfferId,
} from '@/lib/public-offers';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

const checkInOptions = ['Morning', 'Midday', 'End of day', 'Weekly only'];

function ContactIntake() {
  const searchParams = useSearchParams();
  const requestedOffer = searchParams.get('offer') || searchParams.get('offering');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [offer, setOffer] = useState<PublicOfferId>('website-improvement');
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    websiteUrl: '',
    websiteProblem: '',
    websiteGoal: '',
    bottlenecks: '',
    repetitiveWork: '',
    tools: '',
    approvals: '',
    outcomes: '',
    checkInRhythm: 'Weekly only',
  });

  useEffect(() => {
    const selected = normalizePublicOfferId(requestedOffer);
    if (selected) setOffer(selected);
  }, [requestedOffer]);

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const selectOffer = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOffer(event.target.value as PublicOfferId);
    setStatus('idle');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    const message = offer === 'website-improvement'
      ? [
          'Offer: website-improvement',
          `Website URL:\n${form.websiteUrl}`,
          `What needs attention:\n${form.websiteProblem}`,
          `Business goal for this contained fix:\n${form.websiteGoal}`,
        ].join('\n\n')
      : [
          'Offer: ai-operator',
          `Growth bottlenecks:\n${form.bottlenecks}`,
          `Repetitive work:\n${form.repetitiveWork}`,
          `Existing tools and channels:\n${form.tools}`,
          `Actions that must always require approval:\n${form.approvals}`,
          `Outcomes to improve:\n${form.outcomes}`,
          `Preferred client briefing rhythm: ${form.checkInRhythm}`,
        ].join('\n\n');
    const body = new FormData();
    body.append('name', form.name);
    body.append('email', form.email);
    body.append('company', form.company);
    body.append('service', PUBLIC_OFFERS[offer].serviceName);
    body.append('message', message);
    try {
      const response = await fetch('/api/projects', { method: 'POST', body });
      if (!response.ok) throw new Error('Request failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const activeOffer = PUBLIC_OFFERS[offer];
  const textAreaClass = 'mt-2 min-h-28 w-full rounded-2xl border border-[#183229]/20 bg-white px-4 py-3 text-[#183229] outline-none focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';
  const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#183229]/20 bg-white px-4 text-[#183229] outline-none focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';

  if (status === 'success') {
    const website = offer === 'website-improvement';
    return (
      <main className="grid min-h-[75vh] place-items-center bg-[#f7f4ed] px-5">
        <div className="max-w-xl rounded-3xl border border-[#183229]/15 bg-white p-9 text-center text-[#183229]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e4eee6]"><Check className="h-7 w-7 text-[#126b4e]" /></div>
          <h1 className="mt-6 font-playfair text-4xl font-black">{website ? 'Your website improvement request is in.' : 'Your operator-pilot request is in.'}</h1>
          <p className="mt-4 leading-7 text-[#50675e]">{website ? 'We’ll review the site context and confirm whether the requested work fits one contained $500 fix before invoicing.' : 'We’ll review the bottleneck, approval boundaries, and desired outcomes before sharing a 30-day pilot proposal.'}</p>
        </div>
      </main>
    );
  }

  const website = offer === 'website-improvement';

  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="bg-[#18372e] text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Start a project</p>
            <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">Choose the path that solves the problem in front of you.</h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50/75">A project request is a conversation starter, not an automatic purchase. We confirm scope and the next step before work begins.</p>
            <div className="mt-8 space-y-3 text-sm text-emerald-50/80">
              <p className="flex gap-2"><ShieldCheck className="h-5 w-5 text-emerald-300" /> External actions always require human approval</p>
              <p className="flex gap-2"><Clock3 className="h-5 w-5 text-emerald-300" /> AI pilot clients receive weekly briefs, not a dashboard to operate</p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/7 p-6 ring-1 ring-white/15 sm:p-8">
            <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300 text-[#18372e]">{website ? <FileSearch className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}</div><div><p className="text-sm font-bold text-emerald-200">Selected path</p><h2 className="mt-1 text-2xl font-bold">{activeOffer.name}</h2><p className="mt-2 leading-7 text-emerald-50/75">{activeOffer.summary}</p></div></div>
            <ol className="mt-7 space-y-5">
              {(website
                ? ['Review the page, report, and desired outcome.', 'Confirm one contained fix and the $250 start invoice.', 'Deliver the agreed fix, then send the $250 completion invoice.']
                : ['Map the role, evidence sources, and prohibited actions.', 'Review a clear 30-day operating brief and pilot proposal.', 'Operate privately and send a useful brief each week.']
              ).map((step, index) => (
                <li className="flex gap-4" key={step}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-300 font-bold text-[#18372e]">{index + 1}</span><span className="pt-1">{step}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="mx-auto max-w-4xl space-y-10 px-5 py-16 sm:px-8 md:py-24">
        <fieldset>
          <legend className="mb-5 text-2xl font-black">What would you like help with?</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.values(PUBLIC_OFFERS)).map((candidate) => {
              const selected = offer === candidate.id;
              return <label key={candidate.id} className={`cursor-pointer rounded-2xl border p-5 transition ${selected ? 'border-[#126b4e] bg-[#e4eee6] ring-2 ring-[#126b4e]/20' : 'border-[#183229]/15 bg-white hover:border-[#126b4e]/40'}`}><input className="sr-only" type="radio" name="offer" value={candidate.id} checked={selected} onChange={selectOffer} /><span className="block text-lg font-black">{candidate.name}</span><span className="mt-2 block text-sm leading-6 text-[#50675e]">{candidate.summary}</span></label>;
            })}
          </div>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 text-2xl font-black">About you</legend>
          <label className="font-semibold">Name<input className={inputClass} required name="name" value={form.name} onChange={update} autoComplete="name" /></label>
          <label className="font-semibold">Work email<input className={inputClass} required type="email" name="email" value={form.email} onChange={update} autoComplete="email" /></label>
          <label className="font-semibold sm:col-span-2">Company <span className="font-normal text-[#50675e]">(optional)</span><input className={inputClass} name="company" value={form.company} onChange={update} autoComplete="organization" /></label>
        </fieldset>

        {website ? (
          <fieldset className="space-y-6">
            <legend className="mb-5 text-2xl font-black">Focus the website improvement</legend>
            <label className="block font-semibold">Website URL<input className={inputClass} required type="url" name="websiteUrl" value={form.websiteUrl} onChange={update} placeholder="https://example.com/page" /></label>
            <label className="block font-semibold">What needs attention?<textarea className={textAreaClass} required name="websiteProblem" value={form.websiteProblem} onChange={update} placeholder="For example: the service page is hard to scan, the audit shows missing labels, or the form loses leads." /></label>
            <label className="block font-semibold">What would a useful contained fix achieve?<textarea className={textAreaClass} required name="websiteGoal" value={form.websiteGoal} onChange={update} placeholder="For example: make one booking form usable by keyboard, clarify one offer, or improve one page’s conversion path." /></label>
            <p className="rounded-2xl bg-[#e4eee6] p-5 text-sm leading-6 text-[#40564e]"><strong className="text-[#183229]">Scope reminder:</strong> the $500 engagement covers an audit and one agreed contained fix—not a redesign, integration, or multi-page build.</p>
          </fieldset>
        ) : (
          <fieldset className="space-y-6">
            <legend className="mb-5 text-2xl font-black">Design the operator pilot</legend>
            <label className="block font-semibold">Where does work get stuck?<textarea className={textAreaClass} required name="bottlenecks" value={form.bottlenecks} onChange={update} placeholder="For example: warm leads do not get consistent follow-up..." /></label>
            <label className="block font-semibold">What repetitive work keeps returning?<textarea className={textAreaClass} required name="repetitiveWork" value={form.repetitiveWork} onChange={update} /></label>
            <label className="block font-semibold">Which tools and channels are involved?<textarea className={textAreaClass} required name="tools" value={form.tools} onChange={update} placeholder="CRM, email, website, calendar, social channels..." /></label>
            <label className="block font-semibold">Which actions must always require approval?<textarea className={textAreaClass} required name="approvals" value={form.approvals} onChange={update} placeholder="Sending messages, publishing content, changing systems, spending money..." /></label>
            <label className="block font-semibold">What outcomes should the pilot improve?<textarea className={textAreaClass} required name="outcomes" value={form.outcomes} onChange={update} placeholder="Replies, qualified leads, meetings, projects, time saved..." /></label>
            <label className="block max-w-md font-semibold">Preferred briefing rhythm<select className={inputClass} name="checkInRhythm" value={form.checkInRhythm} onChange={update}>{checkInOptions.map((time) => <option key={time}>{time}</option>)}</select></label>
          </fieldset>
        )}

        {status === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">We couldn’t submit this project request. Please try again.</p>}
        <button disabled={status === 'sending'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white disabled:opacity-60 sm:w-auto">
          {status === 'sending' ? 'Sending…' : website ? 'Request the $500 website improvement' : 'Request an AI operator proposal'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<main className="grid min-h-[60vh] place-items-center bg-[#f7f4ed] text-[#183229]">Loading project intake…</main>}>
      <ContactIntake />
    </Suspense>
  );
}
