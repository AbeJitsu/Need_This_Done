'use client';

import { useState } from 'react';
import { ArrowRight, Check, Clock3, ShieldCheck } from 'lucide-react';

const checkInOptions = ['8:00 AM', '8:30 AM', '9:00 AM', '12:00 PM', '12:30 PM', '1:00 PM', '4:00 PM', '4:30 PM', '5:00 PM'];

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '', email: '', company: '', bottlenecks: '', repetitiveWork: '',
    tools: '', approvals: '', outcomes: '', morning: '8:30 AM', midday: '12:30 PM', evening: '4:30 PM',
  });

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    const message = [
      `Growth bottlenecks:\n${form.bottlenecks}`,
      `Repetitive work:\n${form.repetitiveWork}`,
      `Existing tools and channels:\n${form.tools}`,
      `Actions requiring approval:\n${form.approvals}`,
      `Desired outcomes:\n${form.outcomes}`,
      `Preferred check-ins: ${form.morning}, ${form.midday}, ${form.evening}`,
    ].join('\n\n');
    const body = new FormData();
    body.append('name', form.name);
    body.append('email', form.email);
    body.append('company', form.company);
    body.append('service', 'AI Growth Employee Pilot');
    body.append('message', message);
    try {
      const response = await fetch('/api/projects', { method: 'POST', body });
      if (!response.ok) throw new Error('Request failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <main className="grid min-h-[75vh] place-items-center bg-[#f7f4ed] px-5">
        <div className="max-w-xl rounded-3xl border border-[#183229]/15 bg-white p-9 text-center text-[#183229]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e4eee6]"><Check className="h-7 w-7 text-[#126b4e]" /></div>
          <h1 className="mt-6 font-playfair text-4xl font-black">Your role design is in.</h1>
          <p className="mt-4 leading-7 text-[#50675e]">We’ll review the bottlenecks, approval boundaries, tools, and outcomes, then reply with the clearest next step for a supervised pilot.</p>
        </div>
      </main>
    );
  }

  const textAreaClass = 'mt-2 min-h-28 w-full rounded-2xl border border-[#183229]/20 bg-white px-4 py-3 text-[#183229] outline-none focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';
  const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#183229]/20 bg-white px-4 text-[#183229] outline-none focus:border-[#126b4e] focus:ring-2 focus:ring-[#126b4e]/20';

  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="bg-[#18372e] text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Design the role</p>
            <h1 className="mt-5 font-playfair text-5xl font-black leading-tight md:text-7xl">What should your AI employee take off your plate?</h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50/75">Tell us where growth stalls, what repeats, and where human judgment must stay in control.</p>
            <div className="mt-8 space-y-3 text-sm text-emerald-50/80">
              <p className="flex gap-2"><ShieldCheck className="h-5 w-5 text-emerald-300" /> No automatic external actions</p>
              <p className="flex gap-2"><Clock3 className="h-5 w-5 text-emerald-300" /> Designed for 15–20 minute check-ins</p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/7 p-6 ring-1 ring-white/15 sm:p-8">
            <h2 className="text-2xl font-bold">What happens next</h2>
            <ol className="mt-6 space-y-5">
              {['We map the role, evidence sources, and prohibited actions.', 'You review a clear operating brief and pilot proposal.', 'We build the first supervised queues and measure the trial.'].map((step, index) => (
                <li className="flex gap-4" key={step}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-300 font-bold text-[#18372e]">{index + 1}</span><span className="pt-1">{step}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="mx-auto max-w-4xl space-y-10 px-5 py-16 sm:px-8 md:py-24">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-5 text-2xl font-black">About you</legend>
          <label className="font-semibold">Name<input className={inputClass} required name="name" value={form.name} onChange={update} autoComplete="name" /></label>
          <label className="font-semibold">Work email<input className={inputClass} required type="email" name="email" value={form.email} onChange={update} autoComplete="email" /></label>
          <label className="font-semibold sm:col-span-2">Company<input className={inputClass} name="company" value={form.company} onChange={update} autoComplete="organization" /></label>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="mb-5 text-2xl font-black">Design the growth role</legend>
          <label className="block font-semibold">Where does growth get stuck?<textarea className={textAreaClass} required name="bottlenecks" value={form.bottlenecks} onChange={update} placeholder="For example: warm leads do not get consistent follow-up..." /></label>
          <label className="block font-semibold">What repetitive work keeps returning?<textarea className={textAreaClass} required name="repetitiveWork" value={form.repetitiveWork} onChange={update} /></label>
          <label className="block font-semibold">Which tools and channels do you use?<textarea className={textAreaClass} required name="tools" value={form.tools} onChange={update} placeholder="CRM, email, website, calendar, social channels..." /></label>
          <label className="block font-semibold">Which actions must always require approval?<textarea className={textAreaClass} required name="approvals" value={form.approvals} onChange={update} placeholder="Sending messages, publishing content, changing systems, spending money..." /></label>
          <label className="block font-semibold">What outcomes should this role improve?<textarea className={textAreaClass} required name="outcomes" value={form.outcomes} onChange={update} placeholder="Replies, qualified leads, meetings, projects, time saved..." /></label>
        </fieldset>

        <fieldset>
          <legend className="text-2xl font-black">Preferred check-in times</legend>
          <p className="mt-2 text-[#50675e]">Choose a starting rhythm. We’ll confirm timezone and scheduling during discovery.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {[['morning', 'Morning'], ['midday', 'Midday'], ['evening', 'End of day']].map(([name, label]) => (
              <label key={name} className="font-semibold">{label}<select className={inputClass} name={name} value={form[name as 'morning']} onChange={update}>{checkInOptions.map((time) => <option key={time}>{time}</option>)}</select></label>
            ))}
          </div>
        </fieldset>

        {status === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">We couldn’t submit the role design. Please try again.</p>}
        <button disabled={status === 'sending'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#126b4e] px-7 py-3 font-bold text-white disabled:opacity-60 sm:w-auto">
          {status === 'sending' ? 'Sending…' : 'Design My AI Employee'} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </main>
  );
}
