'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, FileSearch, PanelTop, ShieldCheck } from 'lucide-react';
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

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
  const textAreaClass = 'mt-2 min-h-28 w-full rounded-2xl border border-[#183229]/20 bg-white px-4 py-3 text-[#183229] outline-none focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';
  const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#183229]/20 bg-white px-4 text-[#183229] outline-none focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';

  if (status === 'success') {
    return (
      <main className="grid min-h-[75vh] place-items-center bg-[#f7f4ed] px-5">
        <div className="max-w-xl rounded-3xl border border-[#183229]/15 bg-white p-9 text-center text-[#183229]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e4eee6]"><Check className="h-7 w-7 text-[#126b4e]" /></div>
          <h1 className="mt-6 font-playfair text-4xl font-black">Request received.</h1>
          <p className="mt-4 leading-7 text-[#50675e]">We&apos;ll review the context for your {activeOffer.name.toLowerCase()} and confirm the next step before work begins.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="bg-[#18372e] text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Contact</p>
            <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">Give the work context.</h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50/75">Choose a starting point and share only what is needed to scope the first useful move.</p>
            <div className="mt-8 space-y-3 text-sm text-emerald-50/80">
              <p className="flex gap-2"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /> Scope is confirmed before work begins</p>
              <p className="flex gap-2"><PanelTop className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /> Important external actions stay under review</p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/7 p-6 ring-1 ring-white/15 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300 text-[#18372e]"><FileSearch className="h-5 w-5" aria-hidden="true" /></div>
              <div><p className="text-sm font-bold text-emerald-200">Selected starting point</p><h2 className="mt-1 text-2xl font-bold">{activeOffer.name}</h2><p className="mt-2 leading-7 text-emerald-50/75">{activeOffer.summary}</p></div>
            </div>
            <p className="mt-7 border-t border-white/10 pt-5 text-sm leading-6 text-emerald-50/75">Your request starts a conversation. It does not create an automatic purchase.</p>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="mx-auto max-w-4xl space-y-10 px-5 py-16 sm:px-8 md:py-24">
        <fieldset>
          <legend className="mb-5 text-2xl font-black">What are you contacting us about?</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(PUBLIC_OFFERS).map((candidate) => {
              const selected = offer === candidate.id;
              return <label key={candidate.id} className={`cursor-pointer rounded-2xl border p-5 transition ${selected ? 'border-[#126b4e] bg-[#e4eee6] ring-2 ring-[#126b4e]/20' : 'border-[#183229]/15 bg-white hover:border-[#126b4e]/40'}`}><input className="sr-only" type="radio" name="offer" value={candidate.id} checked={selected} onChange={selectOffer} /><span className="block text-lg font-black">{candidate.name}</span><span className="mt-2 block text-sm leading-6 text-[#50675e]">{candidate.summary}</span></label>;
            })}
          </div>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 text-2xl font-black">Your details</legend>
          <label className="font-semibold">Name<input className={inputClass} required name="name" value={form.name} onChange={update} autoComplete="name" /></label>
          <label className="font-semibold">Work email<input className={inputClass} required type="email" name="email" value={form.email} onChange={update} autoComplete="email" /></label>
          <label className="font-semibold sm:col-span-2">Company <span className="font-normal text-[#50675e]">(optional)</span><input className={inputClass} name="company" value={form.company} onChange={update} autoComplete="organization" /></label>
        </fieldset>

        {website ? (
          <fieldset className="space-y-6">
            <legend className="mb-5 text-2xl font-black">Targeted fix context</legend>
            <label className="block font-semibold">Website URL<input className={inputClass} required type="url" name="websiteUrl" value={form.websiteUrl} onChange={update} placeholder="https://example.com/page" /></label>
            <label className="block font-semibold">What needs attention?<textarea className={textAreaClass} required name="websiteProblem" value={form.websiteProblem} onChange={update} placeholder="Describe the page or problem." /></label>
            <label className="block font-semibold">What should improve?<textarea className={textAreaClass} required name="websiteGoal" value={form.websiteGoal} onChange={update} placeholder="Describe the result you want." /></label>
          </fieldset>
        ) : (
          <fieldset className="space-y-6">
            <legend className="mb-5 text-2xl font-black">Automation setup context</legend>
            <label className="block font-semibold">Where does work get stuck or repeat?<textarea className={textAreaClass} required name="bottlenecks" value={form.bottlenecks} onChange={update} placeholder="Describe the recurring workflow or bottleneck." /></label>
            <label className="block font-semibold">Which tools are involved?<textarea className={textAreaClass} required name="tools" value={form.tools} onChange={update} placeholder="CRM, email, website, calendar, or other tools." /></label>
            <label className="block font-semibold">What result do you want?<textarea className={textAreaClass} required name="outcomes" value={form.outcomes} onChange={update} placeholder="Describe the result that would make the work better." /></label>
            <label className="block font-semibold">What needs your approval?<textarea className={textAreaClass} required name="approvals" value={form.approvals} onChange={update} placeholder="Messages, publishing, system changes, spending, or other decisions." /></label>
          </fieldset>
        )}

        {status === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">We couldn&apos;t submit this request. Please try again.</p>}
        <button disabled={status === 'sending'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white disabled:opacity-60 sm:w-auto">
          {status === 'sending' ? 'Sending…' : 'Send request'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
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
