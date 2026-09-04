'use client';

import { Suspense, type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, FileSearch, PanelTop } from 'lucide-react';
import { normalizePublicOfferId, PUBLIC_OFFERS, type PublicOfferId } from '@/lib/public-offers';

type SubmissionStatus = 'idle' | 'sending' | 'success' | 'error';

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  vision: string;
  outcome: string;
  obstacle: string;
}

const initialForm: ContactFormState = {
  name: '',
  email: '',
  company: '',
  vision: '',
  outcome: '',
  obstacle: '',
};

function ContactIntake() {
  const searchParams = useSearchParams();
  const requestedOffer = searchParams.get('offer') || searchParams.get('offering');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [offer, setOffer] = useState<PublicOfferId | null>(null);
  const [form, setForm] = useState<ContactFormState>(initialForm);

  useEffect(() => {
    setOffer(normalizePublicOfferId(requestedOffer));
  }, [requestedOffer]);

  const update = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (status === 'error') setStatus('idle');
  };

  const selectOffer = (event: ChangeEvent<HTMLInputElement>) => {
    setOffer(event.target.value as PublicOfferId);
    setStatus('idle');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    const message = [
      `Vision:\n${form.vision.trim()}`,
      `Desired outcome:\n${form.outcome.trim()}`,
      form.obstacle.trim() ? `Current obstacle:\n${form.obstacle.trim()}` : null,
      offer ? `Selected starting point:\n${PUBLIC_OFFERS[offer].name}` : 'Selected starting point:\nNot selected',
    ].filter(Boolean).join('\n\n');

    const body = new FormData();
    body.append('name', form.name);
    body.append('email', form.email);
    body.append('company', form.company);
    if (offer) body.append('service', PUBLIC_OFFERS[offer].serviceName);
    body.append('message', message);

    try {
      const response = await fetch('/api/projects', { method: 'POST', body });
      if (!response.ok) throw new Error('Request failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const activeOffer = offer ? PUBLIC_OFFERS[offer] : null;
  const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#183229]/20 bg-white px-4 text-[#183229] outline-none transition focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';
  const textAreaClass = 'mt-2 min-h-36 w-full rounded-2xl border border-[#183229]/20 bg-white px-4 py-3 leading-7 text-[#183229] outline-none transition focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';

  if (status === 'success') {
    return (
      <main id="main-content" className="grid min-h-[72vh] place-items-center bg-[#f7f4ed] px-5 py-16 text-[#183229]">
        <section className="max-w-xl border-y border-[#183229]/15 py-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e4eee6]"><Check className="h-7 w-7 text-[#126b4e]" aria-hidden="true" /></div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">Vision received</p>
          <h1 className="mt-4 font-playfair text-4xl font-black">Thank you for sharing it.</h1>
          <p className="mt-4 leading-7 text-[#50675e]">We will read the context and follow up about a clear next step. No work or purchase begins from this request alone.</p>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="bg-[#f7f4ed] text-[#183229]">
      <section className="border-b border-[#183229]/10 bg-[#18372e] text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">Start with the idea</p>
          <h1 className="mt-6 max-w-4xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">Share your vision.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#dce8dd] md:text-xl">Tell us what you want to bring to life and what should be better when it is done. You do not need a technical brief.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <form onSubmit={submit} className="min-w-0">
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-6 font-playfair text-3xl font-black sm:col-span-2">A little about you</legend>
            <label className="font-semibold">Name<input className={inputClass} required name="name" value={form.name} onChange={update} autoComplete="name" /></label>
            <label className="font-semibold">Email<input className={inputClass} required type="email" name="email" value={form.email} onChange={update} autoComplete="email" /></label>
            <label className="font-semibold sm:col-span-2">Company <span className="font-normal text-[#50675e]">(optional)</span><input className={inputClass} name="company" value={form.company} onChange={update} autoComplete="organization" /></label>
          </fieldset>

          <fieldset className="mt-12 grid gap-6 border-t border-[#183229]/15 pt-10">
            <legend className="-ml-2 bg-[#f7f4ed] px-2 font-playfair text-3xl font-black">What do you want to bring to life?</legend>
            <label className="font-semibold">Your vision<textarea className={textAreaClass} required name="vision" value={form.vision} onChange={update} placeholder="Describe the idea, change, or better version you can see." /></label>
            <label className="font-semibold">Desired outcome<textarea className={textAreaClass} required name="outcome" value={form.outcome} onChange={update} placeholder="What should be meaningfully better when this is done?" /></label>
            <label className="font-semibold">Current obstacle <span className="font-normal text-[#50675e]">(optional)</span><textarea className={textAreaClass} name="obstacle" value={form.obstacle} onChange={update} placeholder="What is making this difficult to move forward today?" /></label>
          </fieldset>

          <fieldset className="mt-12 border-t border-[#183229]/15 pt-10">
            <legend className="-ml-2 bg-[#f7f4ed] px-2 font-playfair text-3xl font-black">Is there a starting point?</legend>
            <p className="mt-3 leading-7 text-[#50675e]">Optional. Choose one if it clearly fits; otherwise leave this open.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.values(PUBLIC_OFFERS).map((candidate) => {
                const selected = offer === candidate.id;
                const Icon = candidate.id === 'website-improvement' ? FileSearch : PanelTop;
                return (
                  <label key={candidate.id} className={`cursor-pointer rounded-2xl border p-5 transition ${selected ? 'border-[#126b4e] bg-[#e4eee6] ring-2 ring-[#126b4e]/20' : 'border-[#183229]/15 bg-white hover:border-[#126b4e]/40'}`}>
                    <input type="radio" name="offer" value={candidate.id} checked={selected} onChange={selectOffer} />
                    <span className="ml-3 inline-flex items-center gap-2 font-black"><Icon className="h-5 w-5 text-[#126b4e]" aria-hidden="true" />{candidate.name}</span>
                    <span className="mt-3 block pl-7 text-sm leading-6 text-[#50675e]">{candidate.summary}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {status === 'error' && <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-800">We could not send your vision. Please try again.</p>}
          <div className="mt-10 flex flex-col gap-4 border-t border-[#183229]/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm leading-6 text-[#50675e]">Sending this form starts a conversation, not an automatic purchase or authorization to act.</p>
            <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e] disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Share your vision'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </form>

        <aside className="border-t border-[#183229]/15 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0" aria-labelledby="what-happens-next">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[#126b4e]">{activeOffer ? 'Selected starting point' : 'No service required'}</p>
          <h2 id="what-happens-next" className="mt-4 font-playfair text-3xl font-black">{activeOffer?.name || 'Start with the outcome.'}</h2>
          <p className="mt-4 leading-7 text-[#50675e]">{activeOffer?.payment || 'We will read what you share, look for the clearest useful focus, and discuss the boundary before any commitment.'}</p>
          <ol className="mt-8 space-y-5 border-t border-[#183229]/15 pt-7 text-sm leading-6 text-[#50675e]">
            <li><strong className="block text-[#183229]">1. We understand the vision</strong>We read the context and desired outcome.</li>
            <li><strong className="block text-[#183229]">2. We clarify the focus</strong>We identify a useful, bounded starting point.</li>
            <li><strong className="block text-[#183229]">3. You decide</strong>Scope and commitment are confirmed separately.</li>
          </ol>
        </aside>
      </section>
    </main>
  );
}

export default function ContactPage() {
  return <Suspense fallback={<main id="main-content" className="grid min-h-[60vh] place-items-center bg-[#f7f4ed] text-[#183229]">Loading contact form…</main>}><ContactIntake /></Suspense>;
}
