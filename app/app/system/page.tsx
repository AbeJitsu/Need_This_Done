import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  GitBranch,
  Lock,
  ShieldCheck,
  Target,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The System Behind NeedThisDone | NeedThisDone",
  description:
    "A practical look at how NeedThisDone turns long-range goals into approved, reviewable work across a private machine, Hermes, OpenClaw, Codex, and GitHub.",
  alternates: { canonical: "/system" },
  openGraph: {
    title: "The System Behind NeedThisDone | NeedThisDone",
    description:
      "A private control plane for turning long-range goals into approved, reviewable work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The System Behind NeedThisDone | NeedThisDone",
    description:
      "A private control plane for turning long-range goals into approved, reviewable work.",
  },
};

type IconName = "target" | "workflow" | "shield" | "code" | "git" | "lock";

function StepIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  switch (name) {
    case "target":
      return <Target className={className} aria-hidden="true" />;
    case "workflow":
      return <Workflow className={className} aria-hidden="true" />;
    case "shield":
      return <ShieldCheck className={className} aria-hidden="true" />;
    case "code":
      return <Code2 className={className} aria-hidden="true" />;
    case "git":
      return <GitBranch className={className} aria-hidden="true" />;
    case "lock":
      return <Lock className={className} aria-hidden="true" />;
    default:
      return null;
  }
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const executionSteps = [
  {
    number: "01",
    title: "Name the outcome",
    description:
      "Start with the better state, not a pile of disconnected tasks.",
    icon: "target",
  },
  {
    number: "02",
    title: "Shape the work",
    description:
      "Hermes turns the goal into a bounded plan with a visible next step.",
    icon: "workflow",
  },
  {
    number: "03",
    title: "Approve the move",
    description:
      "The owner sees the scope, route, cost, and expected result before anything runs.",
    icon: "shield",
  },
  {
    number: "04",
    title: "Do the work",
    description:
      "The private machine sends the approved task to the right execution lane.",
    icon: "code",
  },
  {
    number: "05",
    title: "Review the proof",
    description:
      "The result comes back with evidence, blockers, and a clear next decision.",
    icon: "git",
  },
] as const;

const systemParts = [
  {
    number: "01",
    title: "NeedThisDone",
    label: "Mission control",
    description:
      "Keeps the goal, context, approvals, status, costs, and results together in one durable record.",
    icon: "target",
    tone: "bg-[var(--public-green)] text-white",
  },
  {
    number: "02",
    title: "Hermes",
    label: "Planning layer",
    description:
      "Interprets the long-range objective and turns it into a focused, reviewable work packet.",
    icon: "workflow",
    tone: "bg-[#d0a94f] text-[var(--public-ink)]",
  },
  {
    number: "03",
    title: "OpenClaw",
    label: "Local gateway",
    description:
      "Runs approved non-code tools and provides the always-on gateway for the private machine.",
    icon: "shield",
    tone: "bg-[#668b70] text-white",
  },
  {
    number: "04",
    title: "Codex",
    label: "Coding lane",
    description:
      "Works inside an isolated repository worktree to inspect, edit, test, and prepare code changes.",
    icon: "code",
    tone: "bg-[#2a5f50] text-white",
  },
  {
    number: "05",
    title: "GitHub",
    label: "Review boundary",
    description:
      "Holds the branch, diff, commit, and pull request so changes remain inspectable before merge.",
    icon: "git",
    tone: "bg-[#31506a] text-white",
  },
] as const;

const differencePoints = [
  {
    title: "A conversation",
    description:
      "Useful for thinking through the next prompt. The important context and next action may still need to be reconstructed later.",
    points: [
      "The work is centered on the current exchange",
      "The result may be an answer, draft, or recommendation",
      "Continuity depends on remembering where the conversation stopped",
    ],
  },
  {
    title: "NeedThisDone",
    description:
      "Designed for work that continues after the conversation. The goal stays visible while the system moves one approved piece forward.",
    points: [
      "The goal and constraints remain durable",
      "Every meaningful action crosses an approval boundary",
      "The output includes evidence and the next decision",
    ],
  },
] as const;

const codingSteps = [
  ["Base commit", "Start from the exact approved repository state."],
  ["Dedicated worktree", "Keep the change isolated from other work."],
  ["Codex execution", "Inspect, edit, run the relevant checks, and explain the result."],
  ["Reviewable handoff", "Return the branch, diff, tests, and blockers before merge."],
] as const;

const proofItems = [
  "Authenticated browser control plane",
  "Supabase-backed plans, approvals, costs, and results",
  "Signed outbound bridge to the private worker",
  "Hermes plan, freeze, and approval lifecycle",
  "Local safety and lifecycle checks around the worker boundary",
] as const;

const nextItems = [
  "A first-class coding task contract",
  "Dedicated worktree and branch metadata",
  "Test, diff, commit, and pull-request evidence",
  "A durable goal → milestone → work-packet model",
  "A bounded end-to-end coding rehearsal",
] as const;

function SectionLabel({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={cx(
        "text-xs font-bold uppercase tracking-[.22em]",
        light ? "text-[#c9dcca]" : "text-[var(--public-green)]",
      )}
    >
      {children}
    </p>
  );
}

function ExecutionDiagram() {
  return (
    <div className="mt-12 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
      {executionSteps.map((step, index) => (
        <Fragment key={step.number}>
          <article className="flex min-h-[15rem] flex-col rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white p-5 shadow-[0_16px_40px_rgba(24,55,46,.06)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-[#775d22]">{step.number}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--public-soft)] text-[var(--public-green)]">
                <StepIcon name={step.icon} />
              </span>
            </div>
            <h3 className="mt-7 font-playfair text-2xl font-black leading-tight">
              {step.title}
            </h3>
            <p className="mt-3 text-[.98rem] leading-7 text-[var(--public-muted)]">
              {step.description}
            </p>
          </article>
          {index < executionSteps.length - 1 && (
            <ArrowRight
              className="mx-auto self-center text-[#b28a2d] max-lg:rotate-90"
              aria-hidden="true"
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default function SystemPage() {
  return (
    <main
      id="main-content"
      className="overflow-hidden bg-[var(--public-cream)] text-[var(--public-ink)]"
    >
      <section className="relative border-b border-white/10 bg-[var(--public-dark)] text-white">
        <div
          className="pointer-events-none absolute -right-40 -top-48 h-[38rem] w-[38rem] rounded-full bg-[#d0a94f]/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-[#668b70]/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <div>
              <SectionLabel light>Engineering case study</SectionLabel>
              <h1 className="mt-6 max-w-4xl font-playfair text-[clamp(3rem,7vw,6.5rem)] font-black leading-[.92] tracking-tight">
                A system that keeps important work moving.
              </h1>
              <p className="mt-8 max-w-[61ch] text-lg leading-8 text-[#dce8dd] md:text-xl">
                NeedThisDone is a private control plane for turning long-range
                goals into approved, reviewable work across a local machine,
                specialized agents, and GitHub.
              </p>
              <p className="mt-5 max-w-[61ch] leading-7 text-[#b9d5bd]">
                The models are not the product. The product is the continuity:
                remembering what matters, deciding what should happen next,
                requiring permission before meaningful action, and showing what
                actually changed.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#execution-loop"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0a94f] px-7 py-3 font-bold text-[var(--public-ink)] transition hover:bg-[#e1bd65]"
                >
                  See the execution loop
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="https://github.com/AbeJitsu/Need_This_Done/tree/dev"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3 font-bold text-white transition hover:border-white/60 hover:bg-white/10"
                >
                  Browse the repository
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <dl className="mt-12 grid max-w-xl gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-2xl font-black text-white">15–20 min</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#b9d5bd]">owner check-in</dd>
                </div>
                <div>
                  <dt className="text-2xl font-black text-white">1 goal</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#b9d5bd]">next useful move</dd>
                </div>
                <div>
                  <dt className="text-2xl font-black text-white">1 record</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#b9d5bd]">proof of what changed</dd>
                </div>
              </dl>
            </div>

            <figure className="relative rounded-[2rem] border border-white/15 bg-[#21483a] p-5 shadow-[0_28px_80px_rgba(0,0,0,.18)] sm:p-7">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <figcaption className="text-sm font-bold text-[#e9f2e9]">
                  One approved work packet
                </figcaption>
                <span className="rounded-full bg-[#c9dcca]/15 px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-[#c9dcca]">
                  reviewable
                </span>
              </div>
              <div className="mt-7 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-[#18372e] p-4">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b9d5bd]">
                    Goal
                  </p>
                  <p className="mt-2 font-playfair text-xl font-black text-white">
                    Make the owner dashboard easier to act on.
                  </p>
                </div>
                <div className="flex items-center gap-3 px-3 text-[#d0a94f]">
                  <div className="h-8 w-px bg-[#d0a94f]/50" aria-hidden="true" />
                  <span className="text-sm font-bold">bounded next step</span>
                </div>
                <div className="rounded-2xl border border-[#d0a94f]/35 bg-[#d0a94f]/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#ead28f]">
                    Approved task
                  </p>
                  <p className="mt-2 leading-7 text-[#f5ecd1]">
                    Improve one empty state, run the relevant checks, and return
                    the diff for review.
                  </p>
                </div>
                <div className="grid gap-3 pt-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b9d5bd]">
                      Execution
                    </p>
                    <p className="mt-2 font-bold text-white">Private Mac → Codex</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b9d5bd]">
                      Handoff
                    </p>
                    <p className="mt-2 font-bold text-white">Branch → diff → review</p>
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="difference"
        className="scroll-mt-24"
        aria-labelledby="difference-heading"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <SectionLabel>The reason to build it</SectionLabel>
            <h2
              id="difference-heading"
              className="mt-5 font-playfair text-4xl font-black leading-tight md:text-6xl"
            >
              A conversation can start the work. The system is responsible for
              what happens next.
            </h2>
            <p className="mt-6 max-w-[64ch] text-lg leading-8 text-[var(--public-muted)]">
              NeedThisDone is not trying to be a prettier prompt box. It is
              designed for work that spans days or weeks, continues while the
              owner is away, and still needs to remain understandable and
              controllable.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {differencePoints.map((item, index) => (
              <article
                key={item.title}
                className={cx(
                  "rounded-[1.75rem] border p-7 md:p-9",
                  index === 1
                    ? "border-[var(--public-green)]/30 bg-[var(--public-dark)] text-white"
                    : "border-[var(--public-ink)]/10 bg-white",
                )}
              >
                <p
                  className={cx(
                    "text-xs font-bold uppercase tracking-[.18em]",
                    index === 1 ? "text-[#c9dcca]" : "text-[#775d22]",
                  )}
                >
                  {index === 0 ? "Starting point" : "System outcome"}
                </p>
                <h3 className="mt-5 font-playfair text-3xl font-black">{item.title}</h3>
                <p
                  className={cx(
                    "mt-4 max-w-[48ch] leading-7",
                    index === 1 ? "text-[#dce8dd]" : "text-[var(--public-muted)]",
                  )}
                >
                  {item.description}
                </p>
                <ul
                  className={cx(
                    "mt-7 space-y-4 border-t pt-6",
                    index === 1
                      ? "border-white/15 text-[#dce8dd]"
                      : "border-[var(--public-ink)]/10 text-[var(--public-muted)]",
                  )}
                >
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-3 leading-7">
                      <Check
                        className={cx(
                          "mt-1 h-4 w-4 shrink-0",
                          index === 1 ? "text-[#d0a94f]" : "text-[var(--public-green)]",
                        )}
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="execution-loop"
        className="scroll-mt-24 border-y border-[var(--public-ink)]/10 bg-[var(--public-sand)]"
        aria-labelledby="execution-heading"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <SectionLabel>How the loop works</SectionLabel>
            <h2
              id="execution-heading"
              className="mt-5 font-playfair text-4xl font-black leading-tight md:text-6xl"
            >
              Keep the mission visible while the next piece gets done.
            </h2>
            <p className="mt-6 max-w-[64ch] text-lg leading-8 text-[var(--public-muted)]">
              Every run has a beginning, a boundary, and a handoff. That makes
              long-range work easier to resume and easier to trust.
            </p>
          </div>
          <ExecutionDiagram />
        </div>
      </section>

      <section id="architecture" className="scroll-mt-24" aria-labelledby="architecture-heading">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <SectionLabel>One system, focused responsibilities</SectionLabel>
              <h2
                id="architecture-heading"
                className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl"
              >
                The pieces are intentionally not interchangeable.
              </h2>
              <p className="mt-6 leading-7 text-[var(--public-muted)]">
                The goal is not to make every agent do everything. Each layer
                owns one kind of responsibility, which makes authority easier
                to understand and the failure boundary easier to contain.
              </p>
            </div>
            <figure>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {systemParts.map((part) => (
                  <article
                    key={part.title}
                    className="flex min-h-[16rem] flex-col rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white p-5 shadow-[0_16px_40px_rgba(24,55,46,.05)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#775d22]">{part.number}</span>
                      <span className={cx("grid h-10 w-10 place-items-center rounded-full", part.tone)}>
                        <StepIcon name={part.icon} />
                      </span>
                    </div>
                    <p className="mt-7 text-xs font-bold uppercase tracking-[.15em] text-[var(--public-green)]">
                      {part.label}
                    </p>
                    <h3 className="mt-2 font-playfair text-2xl font-black">{part.title}</h3>
                    <p className="mt-3 text-[.95rem] leading-7 text-[var(--public-muted)]">
                      {part.description}
                    </p>
                  </article>
                ))}
              </div>
              <figcaption className="mt-5 text-sm leading-6 text-[var(--public-muted)]">
                The browser and Supabase hold the durable record. The private
                Mac performs approved work. GitHub is where code changes become
                reviewable before they can become part of the product.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="coding-lane"
        className="scroll-mt-24 border-y border-white/10 bg-[var(--public-dark)] text-white"
        aria-labelledby="coding-heading"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:gap-20">
            <div>
              <SectionLabel light>The coding lane</SectionLabel>
              <h2
                id="coding-heading"
                className="mt-5 font-playfair text-4xl font-black leading-tight md:text-6xl"
              >
                Codex changes code. The system makes the change safe to review.
              </h2>
              <p className="mt-6 max-w-[58ch] text-lg leading-8 text-[#dce8dd]">
                A coding task is not permission to modify the live product. It
                is permission to make one bounded change in a designated
                worktree, run the relevant checks, and return the evidence.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#d0a94f]/40 bg-[#d0a94f]/10 px-4 py-2 text-sm font-bold text-[#ead28f]">
                <Lock className="h-4 w-4" aria-hidden="true" />
                No merge or deployment by default
              </div>
            </div>
            <figure className="rounded-[2rem] border border-white/15 bg-[#21483a] p-5 sm:p-7">
              <figcaption className="border-b border-white/15 pb-4 text-sm font-bold text-[#e9f2e9]">
                A reviewable code change
              </figcaption>
              <div className="mt-7 space-y-3">
                {codingSteps.map(([title, description], index) => (
                  <div key={title} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d0a94f] text-sm font-black text-[var(--public-ink)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {index < codingSteps.length - 1 && (
                        <span className="mt-2 h-full min-h-7 w-px bg-[#d0a94f]/45" aria-hidden="true" />
                      )}
                    </div>
                    <div className="pb-5">
                      <h3 className="font-playfair text-2xl font-black">{title}</h3>
                      <p className="mt-2 leading-7 text-[#dce8dd]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </figure>
          </div>
        </div>
      </section>

      <section id="daily-loop" className="scroll-mt-24" aria-labelledby="daily-heading">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <SectionLabel>The intended rhythm</SectionLabel>
            <h2
              id="daily-heading"
              className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl"
            >
              Short check-ins. Useful progress. No mystery about what happened.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white p-7">
              <p className="text-sm font-black text-[#775d22]">01 · Check in</p>
              <h3 className="mt-4 font-playfair text-2xl font-black">See the current mission.</h3>
              <p className="mt-3 leading-7 text-[var(--public-muted)]">
                Review what moved, what is blocked, and the one decision that
                would make the next step clear.
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--public-green)]/25 bg-[var(--public-soft)] p-7">
              <p className="text-sm font-black text-[var(--public-green)]">02 · Approve</p>
              <h3 className="mt-4 font-playfair text-2xl font-black">Authorize one useful move.</h3>
              <p className="mt-3 leading-7 text-[var(--public-muted)]">
                The owner decides what the system may do, which route it may
                use, and what result should come back.
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--public-ink)]/10 bg-white p-7">
              <p className="text-sm font-black text-[#775d22]">03 · Review</p>
              <h3 className="mt-4 font-playfair text-2xl font-black">Pick up from evidence.</h3>
              <p className="mt-3 leading-7 text-[var(--public-muted)]">
                Return to a result, diff, or blocker—not a blank conversation
                where the entire project has to be explained again.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="status"
        className="border-y border-[var(--public-ink)]/10 bg-[var(--public-sand)]"
        aria-labelledby="status-heading"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-3xl">
            <SectionLabel>Where the project stands</SectionLabel>
            <h2
              id="status-heading"
              className="mt-5 font-playfair text-4xl font-black leading-tight md:text-5xl"
            >
              The system is being built in proofs, not promises.
            </h2>
            <p className="mt-5 max-w-[64ch] leading-7 text-[var(--public-muted)]">
              The repository already contains the control-plane foundation.
              The coding lane is the next proof, so the public story stays
              honest about what exists and what still needs to be demonstrated.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-[var(--public-green)]/25 bg-white p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--public-green)]">
                In the repository
              </p>
              <h3 className="mt-4 font-playfair text-3xl font-black">Control-plane foundation</h3>
              <ul className="mt-7 space-y-4">
                {proofItems.map((item) => (
                  <li key={item} className="flex gap-3 leading-7 text-[var(--public-muted)]">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--public-green)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[1.75rem] border border-[var(--public-ink)]/10 bg-[var(--public-dark)] p-7 text-white md:p-9">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c9dcca]">
                Next proof
              </p>
              <h3 className="mt-4 font-playfair text-3xl font-black">A bounded coding handoff</h3>
              <ul className="mt-7 space-y-4">
                {nextItems.map((item) => (
                  <li key={item} className="flex gap-3 leading-7 text-[#dce8dd]">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#d0a94f]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--public-ink)]/10 bg-[var(--public-cream)]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 md:py-24">
          <SectionLabel>See the idea in context</SectionLabel>
          <h2 className="mt-5 font-playfair text-4xl font-black leading-tight md:text-6xl">
            The point is not more automation. It is more useful follow-through.
          </h2>
          <p className="mx-auto mt-6 max-w-[60ch] text-lg leading-8 text-[var(--public-muted)]">
            Explore the code, follow the next proof, or see how the public
            service turns an unclear problem into a focused starting point.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://github.com/AbeJitsu/Need_This_Done/tree/dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--public-green)] px-7 py-3 font-bold text-white transition hover:bg-[#0c563e]"
            >
              Open the repository
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--public-green)]/30 px-7 py-3 font-bold text-[var(--public-green)] transition hover:bg-[var(--public-soft)]"
            >
              See the public process
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
