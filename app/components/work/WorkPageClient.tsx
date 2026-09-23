import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { caseStudies } from "@/lib/portfolio-data";

const needThisDone = caseStudies.find((study) => study.id === "needthisdone");
const contentWorkflow = caseStudies.find((study) => study.id === "content-workflow");

const projects = [
  {
    eyebrow: "Main build",
    title: "NeedThisDone",
    description: "A place to turn a messy request into a clear next step, with the work and decisions kept together.",
    href: "/system",
    action: "See how it works",
    className: "bg-[#18372e] text-white",
    detail: needThisDone?.tech.slice(0, 4),
  },
  {
    eyebrow: "Workflow build",
    title: "Content workflow",
    description: "A content pipeline that turned recurring preparation into a repeatable, reviewable handoff.",
    href: "/contact",
    action: "Start a conversation",
    className: "bg-[#e8e2d5] text-[var(--public-ink)]",
    detail: contentWorkflow?.tech.slice(0, 4),
  },
  {
    eyebrow: "The next useful tool",
    title: "Something custom",
    description: "A focused tool shaped around the way you already work, instead of another generic app to learn.",
    href: "/contact",
    action: "Start a conversation",
    className: "bg-[#d8e5da] text-[var(--public-ink)]",
    detail: ["Clear first step", "Useful scope", "Room to grow"],
  },
] as const;

const simpleSteps = [
  ["Start with the messy part", "A slow task, a confusing website, or an idea you cannot quite explain yet."],
  ["Find the useful shape", "Define what the first helpful version needs to do."],
  ["Leave you with something real", "A working path, a clearer decision, or a tool you can keep using."],
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="bg-[var(--public-cream)] text-[var(--public-ink)]">
      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[.85fr_1.15fr] md:items-center md:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#c9dcca]">Selected builds</p>
            <h1 className="mt-6 max-w-3xl font-playfair text-5xl font-black leading-[.98] sm:text-6xl md:text-7xl">
              Useful things for messy problems.
            </h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-8 text-[#dce8dd]">
              Websites, tools, and systems that help people understand what to do next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#case-studies" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#d0a94f] px-6 py-3 font-bold text-[var(--public-dark)] transition hover:bg-[#e2c36f]">
                See the builds <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white/10">
                Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl">
            <Image src="/images/portfolio-hero.png" alt="A laptop, paper notes, and connected visual ideas on a warm workbench" fill priority unoptimized sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section id="case-studies" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24" aria-labelledby="projects-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">Selected work</p>
          <h2 id="projects-heading" className="mt-4 font-playfair text-4xl font-black md:text-5xl">Start with what catches your eye.</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.title} className={`flex min-h-[28rem] flex-col justify-between rounded-[1.75rem] p-6 shadow-[0_1.5rem_3rem_rgba(24,55,46,.08)] sm:p-8 ${project.className}`}>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[.18em] opacity-70">{project.eyebrow}</p>
                  <Sparkles className="h-5 w-5 opacity-70" aria-hidden="true" />
                </div>
                <h3 className="mt-16 font-playfair text-3xl font-black">{project.title}</h3>
                <p className="mt-4 max-w-[28ch] text-lg leading-7 opacity-80">{project.description}</p>
              </div>
              <div>
                <div className="mb-6 flex flex-wrap gap-2" aria-label={`${project.title} highlights`}>
                  {project.detail?.map((item) => <span key={item} className="rounded-full border border-current/15 bg-white/20 px-3 py-1.5 text-xs font-semibold">{item}</span>)}
                </div>
                <Link href={project.href} className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4">
                  {project.action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--public-ink)]/10 bg-[var(--public-sand)] px-5 py-16 sm:px-8 md:py-24" aria-labelledby="approach-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--public-green)]">The working approach</p>
            <h2 id="approach-heading" className="mt-4 font-playfair text-4xl font-black md:text-5xl">Making the next step feel obvious.</h2>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {simpleSteps.map(([title, description], index) => (
              <li key={title} className="rounded-[1.5rem] bg-white/65 p-6 sm:p-7">
                <span className="text-sm font-black tracking-[.16em] text-[#775d22]">0{index + 1}</span>
                <h3 className="mt-8 font-playfair text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-[var(--public-muted)]">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24">
        <h2 className="font-playfair text-4xl font-black md:text-5xl">Want to see what&apos;s underneath?</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-[var(--public-muted)]">The technical details are here when you want them. They stay out of the way until they are useful.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">

          <a href="https://github.com/AbeJitsu/Need_This_Done" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--public-green)] px-5 py-2.5 font-bold text-white">Open the code <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
        </div>
      </section>
    </main>
  );
}
