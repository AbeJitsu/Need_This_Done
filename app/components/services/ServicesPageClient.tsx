import Link from 'next/link';
import { ArrowRight, Check, Search, FileCheck2, MessagesSquare, BarChart3, Wrench } from 'lucide-react';

const capabilities = [
  { icon: Search, title: 'Discover', text: 'Research opportunities, customer signals, market context, and overlooked follow-up.' },
  { icon: FileCheck2, title: 'Audit', text: 'Find conversion gaps and support every recommendation with visible evidence.' },
  { icon: MessagesSquare, title: 'Prepare', text: 'Draft messages and actions for approval—never send them autonomously.' },
  { icon: BarChart3, title: 'Track & learn', text: 'Connect decisions to replies, meetings, projects, time saved, and next actions.' },
];

export default function ServicesPageClient() {
  return (
    <main className="bg-[#f7f4ed] text-[#183229]">
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#126b4e]">What it handles</p>
        <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-black leading-tight md:text-7xl">One accountable growth role. A flexible set of capabilities.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#50675e]">The employee follows a durable loop: discover → audit → prepare → approve → manually send → track → follow up → learn.</p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {capabilities.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl border border-[#183229]/15 bg-white p-7">
              <Icon className="h-7 w-7 text-[#126b4e]" />
              <h2 className="mt-6 text-2xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-[#50675e]">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-[#18372e] text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
          <div><Wrench className="h-8 w-8 text-emerald-300" /><h2 className="mt-5 font-playfair text-4xl font-black md:text-5xl">Implementation follows the approved plan.</h2></div>
          <div>
            <p className="text-lg leading-8 text-emerald-50/75">Website improvements, integrations, and custom automation are capabilities the employee can recommend. They are scoped only when evidence shows they are the right solution.</p>
            <ul className="mt-6 space-y-3">{['No automatic outreach or publishing', 'No system changes without approval', 'No spending money', 'Credentials remain server-side and customer-separated'].map((item) => <li className="flex gap-3" key={item}><Check className="h-5 w-5 text-emerald-300" />{item}</li>)}</ul>
            <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-bold text-[#18372e]">Design My AI Employee <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
