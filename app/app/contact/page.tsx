'use client';

import { Suspense, type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, CheckCircle2, FileSearch, PanelTop, ShieldCheck, Sparkles } from 'lucide-react';
import {
  normalizePublicOfferId,
  PUBLIC_OFFERS,
  type PublicOfferId,
} from '@/lib/public-offers';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  websiteUrl: string;
  websiteProblem: string;
  websiteGoal: string;
  bottlenecks: string;
  tools: string;
  approvals: string;
  outcomes: string;
}

const initialForm: ContactFormState = {
  name: '',
  email: '',
  company: '',
  websiteUrl: '',
  websiteProblem: '',
  websiteGoal: '',
  bottlenecks: '',
  tools: '',
  approvals: '',
  outcomes: '',
};

const nextSteps = [
  ['01', 'We read the context', 'We look for the smallest useful starting point.'],
  ['02', 'We confirm the scope', 'You see the result, boundary, and commitment before work begins.'],
  ['03', 'We make the next move', 'The work starts with an agreed record—not a vague handoff.'],
];

function ContactIntake() {
  const searchParams = useSearchParams();
  const requestedOffer = searchParams.get('offer') || searchParams.get('offering');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [offer, setOffer] = useState<PublicOfferId>('website-improvement');
  const [form, setForm] = useState<ContactFormState>(initialForm);

  useEffect(() => {
    const selected = normalizePublicOfferId(requestedOffer);
    if (selected) setOffer(selected);
  }, [requestedOffer]);

  const update = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const selectOffer = (event: ChangeEvent<HTMLInputElement>) => {
    setOffer(event.target.value as PublicOfferId);
    setStatus('idle');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    const message = offer === 'website-improvement'
      ? [
          'Offer: website-improvement',
          `Website URL:\n${form.websiteUrl}`,
          `Problem:\n${form.websiteProblem}`,
          `Desired result:\n${form.websiteGoal}`,
        ].join('\n\n')
      : [
          'Offer: ai-operator',
          `Workflow problem:\n${form.bottlenecks}`,
          `Tools involved:\n${form.tools}`,
          `Desired result:\n${form.outcomes}`,
          `Approval boundary:\n${form.approvals}`,
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
  const website = offer === 'website-improvement';
  const textAreaClass = 'mt-2 min-h-32 w-full rounded-2xl border border-[#183229]/15 bg-white px-4 py-3 leading-6 text-[#183229] outline-none transition focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';
  const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#183229]/15 bg-white px-4 text-[#183229] outline-none transition focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';

  if (status === 'success') {
    return (
      <main className="grid min-h-[75vh] place-items-center bg-[#f7f4ed] px-5 py-16 text-[#183229]">
        <section className="max-w-xl rounded-[2rem] border border-[#183229]/15 bg-white p-9 text-center shadow-xl shadow-emerald-950/10 sm:p-12">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e4eee6]"><Check className="h-7 w-7 text-[#126b4e]" aria-hidden="true" /></div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Contact</p>
          <h1 className="mt-4 font-playfair text-4xl font-black">Request received.</h1>
          <p className="mt-4 leading-7 text-[#50675e]">We&apos;ll review the context for your {activeOffer.name.toLowerCase()} and confirm the next step before work begins.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="relative overflow-hidden bg-[#18372e] text-white">
        <div className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-56 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#d9b96e]/20 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:px-12">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-200"><Sparkles className="h-4 w-4" aria-hidden="true" /> Contact</p>
            <h1 className="mt-6 font-playfair text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">Start with the work that is stuck.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-emerald-50/75 md:text-xl">Share the context and the result you want. A useful first conversation should make the next decision easier.</p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ['Context', 'What is happening now?'],
                ['Result', 'What should be different?'],
                ['Boundary', 'What needs a decision?'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[.08] p-4">
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-5 text-emerald-50/65">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/[.08] p-7 backdrop-blur-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300 text-[#18372e]"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /></div>
              <div>
                <p className="text-sm font-bold text-emerald-200">A focused first conversation</p>
                <h2 className="mt-2 font-playfair text-3xl font-black">Tell us what should be different.</h2>
              </div>
            </div>
            <p className="mt-6 leading-7 text-emerald-50/75">The form keeps the starting point visible, asks for the context needed to review it, and leaves the commitment for a separate confirmation.</p>
            <p className="mt-6 border-t border-white/10 pt-5 text-sm font-semibold text-emerald-50/80">No automatic purchase is created by this request.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20 lg:px-12">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <form onSubmit={submit} className="rounded-[2rem] border border-[#183229]/15 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-9 md:p-10">
            <div className="border-b border-[#183229]/10 pb-8">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">A short intake</p>
              <h2 className="mt-3 font-playfair text-4xl font-black">Make the first move concrete.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-[#50675e]">Start with the offer that best matches the work. You can add detail without writing a full brief.</p>
            </div>

            <fieldset className="mt-9">
              <legend className="mb-5 text-2xl font-black">What are you contacting us about?</legend>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.values(PUBLIC_OFFERS).map((candidate) => {
                  const selected = offer === candidate.id;
                  const Icon = candidate.id === 'website-improvement' ? FileSearch : PanelTop;
                  return (
                    <label key={candidate.id} className={`group cursor-pointer rounded-2xl border p-5 transition ${selected ? 'border-[#126b4e] bg-[#e4eee6] ring-2 ring-[#126b4e]/20' : 'border-[#183229]/15 bg-[#f7f4ed] hover:border-[#126b4e]/40 hover:bg-white'}`}>
                      <input className="sr-only" type="radio" name="offer" value={candidate.id} checked={selected} onChange={selectOffer} />
                      <span className="flex items-start gap-4">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selected ? 'bg-[#126b4e] text-white' : 'bg-white text-[#126b4e] ring-1 ring-[#183229]/10'}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                        <span>
                          <span className="block text-lg font-black">{candidate.name}</span>
                          <span className="mt-2 block text-sm leading-6 text-[#50675e]">{candidate.summary}</span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mt-12 grid gap-5 border-t border-[#183229]/10 pt-9 sm:grid-cols-2">
              <legend className="mb-5 text-2xl font-black sm:col-span-2">Your details</legend>
              <label className="font-semibold">Name<input className={inputClass} required name="name" value={form.name} onChange={update} autoComplete="name" /></label>
              <label className="font-semibold">Work email<input className={inputClass} required type="email" name="email" value={form.email} onChange={update} autoComplete="email" /></label>
              <label className="font-semibold sm:col-span-2">Company <span className="font-normal text-[#50675e]">(optional)</span><input className={inputClass} name="company" value={form.company} onChange={update} autoComplete="organization" /></label>
            </fieldset>

            {website ? (
              <fieldset className="mt-12 rounded-[1.5rem] border border-[#183229]/10 bg-[#f7f4ed] p-5 sm:p-7">
                <legend className="px-2 text-2xl font-black">Targeted fix context</legend>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#50675e]">Point to the page, describe the friction, and name the improvement you would recognize when it is done.</p>
                <label className="mt-7 block font-semibold">Website URL<input className={inputClass} required type="url" name="websiteUrl" value={form.websiteUrl} onChange={update} placeholder="https://example.com/page" /></label>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <label className="block font-semibold">What needs attention?<textarea className={textAreaClass} required name="websiteProblem" value={form.websiteProblem} onChange={update} placeholder="What feels stuck, unclear, slow, or hard to use?" /></label>
                  <label className="block font-semibold">What should improve?<textarea className={textAreaClass} required name="websiteGoal" value={form.websiteGoal} onChange={update} placeholder="What would a better version help someone do?" /></label>
                </div>
                <div className="mt-5 flex gap-3 rounded-2xl border border-[#183229]/10 bg-white p-4 text-sm leading-6 text-[#50675e]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#126b4e]" aria-hidden="true" /><span><strong className="text-[#183229]">Keep it specific.</strong> One page, path, or component is enough to start.</span></div>
              </fieldset>
            ) : (
              <fieldset className="mt-12 space-y-6 border-t border-[#183229]/10 pt-9">
                <legend className="mb-5 text-2xl font-black">Automation setup context</legend>
                <label className="block font-semibold">Where does work get stuck or repeat?<textarea className={textAreaClass} required name="bottlenecks" value={form.bottlenecks} onChange={update} placeholder="Describe the recurring workflow or bottleneck." /></label>
                <label className="block font-semibold">Which tools are involved?<textarea className={textAreaClass} required name="tools" value={form.tools} onChange={update} placeholder="CRM, email, website, calendar, or other tools." /></label>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block font-semibold">What result do you want?<textarea className={textAreaClass} required name="outcomes" value={form.outcomes} onChange={update} placeholder="Describe the result that would make the work better." /></label>
                  <label className="block font-semibold">What needs your approval?<textarea className={textAreaClass} required name="approvals" value={form.approvals} onChange={update} placeholder="Messages, publishing, system changes, spending, or other decisions." /></label>
                </div>
              </fieldset>
            )}

            {status === 'error' && <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-800">We couldn&apos;t submit this request. Please try again.</p>}
            <div className="mt-9 flex flex-col gap-3 border-t border-[#183229]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#50675e]">We review the context before confirming scope.</p>
              <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Send request'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </form>

          <div className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-[2rem] border border-[#183229]/10 bg-[#e4eee6] p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">Selected starting point</p>
              <h2 className="mt-4 font-playfair text-3xl font-black">{activeOffer.name}</h2>
              <p className="mt-3 leading-7 text-[#50675e]">{activeOffer.summary}</p>
              <p className="mt-5 border-t border-[#183229]/10 pt-5 text-sm font-semibold leading-6 text-[#183229]">{activeOffer.payment}</p>
            </div>
            <div className="rounded-[2rem] border border-[#183229]/15 bg-white p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">What happens next</p>
              <div className="mt-6 space-y-5">
                {nextSteps.map(([number, title, description]) => (
                  <div key={number} className="flex gap-4">
                    <span className="text-xs font-bold text-[#126b4e]">{number}</span>
                    <div><p className="font-black">{title}</p><p className="mt-1 text-sm leading-6 text-[#50675e]">{description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<main className="grid min-h-[60vh] place-items-center bg-[#f7f4ed] text-[#183229]">Loading contact form…</main>}>
      <ContactIntake />
    </Suspense>
  );
}
