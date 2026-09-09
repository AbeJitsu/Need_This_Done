import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";
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

const nextStep = PUBLIC_ROUTE_STAGES["/system"].secondary;
const technicalSectionLabel = "Technical details for curious readers";

export const metadata: Metadata = {
  title: "The System Behind NeedThisDone | NeedThisDone",
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: "/system" },
  openGraph: {
    title: "The System Behind NeedThisDone | NeedThisDone",
    description: PUBLIC_CORE_PROMISE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The System Behind NeedThisDone | NeedThisDone",
    description: PUBLIC_CORE_PROMISE,
  },
};

type IconName = "target" | "workflow" | "shield" | "code" | "git" | "lock";

type RailStep = {
  number: string;
  label: string;
  title: string;
  description: string;
  icon: IconName;
  highlighted?: boolean;
};

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

const systemStages = [
  {
    number: "01",
    label: "Name the outcome",
    title: "Goal",
    description:
      "Start with a clear goal. Keep it with the task so the purpose stays visible.",
    icon: "target",
  },
  {
    number: "02",
    label: "Decide the boundary",
    title: "Owner approval",
    description:
      "The owner sees the scope, cost, and expected result. Work needs approval before it starts.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "03",
    label: "Move one piece",
    title: "Private execution",
    description:
      "A private machine picks up only approved work. This public website cannot send it commands.",
    icon: "lock",
  },
  {
    number: "04",
    label: "Bring back evidence",
    title: "Reviewable proof",
    description:
      "The owner can review the result, cost, and unfinished work in one private record.",
    icon: "git",
  },
] as const;

const executionSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Start with the outcome",
    title: "Name what better looks like",
    description:
      "Start with the better state. Keep the next piece connected to why it matters.",
    icon: "target",
  },
  {
    number: "02",
    label: "Shape the work",
    title: "Turn context into a clear plan",
    description:
      "We turn the goal into a bounded plan with a visible next step. The owner reviews it before deciding.",
    icon: "workflow",
  },
  {
    number: "03",
    label: "Cross the boundary",
    title: "Approve the move",
    description:
      "The owner sees the scope, cost, and expected result before anything runs. Approval sets the next move.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "04",
    label: "Do one useful piece",
    title: "Execute privately",
    description:
      "The private machine completes the approved task. The public browser never runs private work.",
    icon: "code",
  },
  {
    number: "05",
    label: "Make it legible",
    title: "Review the proof",
    description:
      "The result comes back with evidence, blockers, and a clear next decision. Work can resume without guesswork.",
    icon: "git",
  },
];

const architectureSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Mission control",
    title: "NeedThisDone",
    description:
      "Keeps goals, approvals, status, costs, and results in one durable record. The browser remains the place to inspect it.",
    icon: "target",
  },
  {
    number: "02",
    label: "Planning layer",
    title: "Hermes",
    description:
      "Turns a long-range objective into a focused work packet. It proposes the next move without executing it.",
    icon: "workflow",
    highlighted: true,
  },
  {
    number: "03",
    label: "Local gateway",
    title: "OpenClaw",
    description:
      "Runs approved non-code tools on the private machine. Its work stays separate from coding tasks.",
    icon: "shield",
  },
  {
    number: "04",
    label: "Coding lane",
    title: "Codex",
    description:
      "Works inside an isolated repository worktree to inspect, edit, test, and prepare code changes. The live product stays outside it.",
    icon: "code",
  },
  {
    number: "05",
    label: "Review boundary",
    title: "GitHub",
    description:
      "Holds the branch, diff, commit, and pull request. Review happens before a change becomes part of the product.",
    icon: "git",
  },
];

const codingSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Start from the boundary",
    title: "Base commit",
    description: "Start from the exact approved repository state. The boundary is known before a file changes.",
    icon: "git",
  },
  {
    number: "02",
    label: "Keep the change isolated",
    title: "Dedicated worktree",
    description: "Keep the change isolated from other work. The resulting diff is easier to review.",
    icon: "lock",
  },
  {
    number: "03",
    label: "Inspect, edit, verify",
    title: "Codex execution",
    description:
      "Inspect, edit, test, and explain the result. The evidence travels with the change.",
    icon: "code",
  },
  {
    number: "04",
    label: "Return the evidence",
    title: "Reviewable handoff",
    description:
      "Return the branch, diff, tests, and blockers before merge. A reviewer can decide from the handoff.",
    icon: "shield",
    highlighted: true,
  },
];

const differencePoints = [
  {
    number: "01",
    icon: "workflow",
    title: "A conversation",
    description:
      "Useful for thinking through a next step. The context may need to be rebuilt later.",
    points: [
      "The work is centered on the current exchange",
      "The result may be an answer, draft, or recommendation",
      "Continuity depends on remembering where the conversation stopped",
    ],
  },
  {
    number: "02",
    icon: "target",
    title: "NeedThisDone",
    description:
      "Built for work that continues after the conversation. The goal stays visible as one approved piece moves.",
    points: [
      "The goal and constraints remain durable",
      "Every meaningful action crosses an approval boundary",
      "The output includes evidence and the next decision",
    ],
  },
] as const;

const dailyBeats: readonly RailStep[] = [
  {
    number: "01",
    label: "Check in",
    title: "See the current mission.",
    description:
      "Review what moved and what is blocked. See the one decision that would clarify the next step.",
    icon: "target",
  },
  {
    number: "02",
    label: "Approve",
    title: "Authorize one useful move.",
    description:
      "The owner decides what may happen and what result should come back. The approval remains bounded.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "03",
    label: "Review",
    title: "Pick up from evidence.",
    description:
      "Return to the result or blocker. The next decision stays visible.",
    icon: "git",
  },
];

const proofItems = [
  "Authenticated browser control plane",
  "Supabase-backed plans, approvals, costs, and results",
  "A protected connection to the private machine",
  "Approval steps around each task",
  "Safety checks around private work",
] as const;

const nextItems = [
  "A first-class coding task contract",
  "A reviewable code handoff",
  "Change, test, and review evidence",
  "A durable goal and milestone record",
  "A bounded coding rehearsal",
] as const;

function SectionLabel({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={cx("system-eyebrow", light && "system-eyebrow--light")}>
      {children}
    </p>
  );
}

function SystemMap() {
  return (
    <figure className="system-map-shell">
      <div className="system-map-shell__header">
        <div>
          <p className="system-map-shell__kicker">Four controls, one handoff</p>
          <figcaption className="system-map-shell__caption">
            What a controlled next move looks like
          </figcaption>
        </div>
        <span className="system-map-shell__status">
          <span aria-hidden="true" /> guardrails on
        </span>
      </div>
      <ol className="system-map" aria-label="The four stages of a NeedThisDone work move">
        {systemStages.map((stage, index) => (
          <li
            key={stage.title}
            className={cx(
              "system-map__stage",
              "highlighted" in stage && stage.highlighted && "system-map__stage--approval",
            )}
          >
            <article className="system-map__card">
              <div className="system-card-identity system-map__identity">
                <div className="system-map__topline">
                  <span className="system-map__number">{stage.number}</span>
                  <span className="system-map__icon">
                    <StepIcon name={stage.icon} />
                  </span>
                </div>
                <p className="system-map__label">{stage.label}</p>
                <h2 className="system-map__title">{stage.title}</h2>
              </div>
              <div className="system-card-detail system-map__detail">
                <p className="system-map__description">{stage.description}</p>
              </div>
            </article>
            {index < systemStages.length - 1 && (
              <span className="system-map__connector" aria-hidden="true">
                <ArrowRight />
              </span>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}

function SystemRail({
  steps,
  dark = false,
  className,
}: {
  steps: readonly RailStep[];
  dark?: boolean;
  className?: string;
}) {
  return (
    <ol
      className={cx(
        "system-rail",
        steps.length === 5 ? "system-rail--five" : "system-rail--four",
        dark && "system-rail--dark",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={step.number}
          className={cx(
            "system-rail__item",
            step.highlighted && "system-rail__item--highlighted",
          )}
        >
          <article className="system-rail__card">
            <div className="system-card-identity system-rail__identity">
              <div className="system-rail__topline">
                <span className="system-rail__number">{step.number}</span>
                <span className="system-rail__icon">
                  <StepIcon name={step.icon} />
                </span>
              </div>
              <p className="system-rail__label">{step.label}</p>
              <h3 className="system-rail__title">{step.title}</h3>
            </div>
            <div className="system-card-detail system-rail__detail">
              <p className="system-rail__description">{step.description}</p>
            </div>
          </article>
          {index < steps.length - 1 && (
            <span className="system-rail__connector" aria-hidden="true">
              <span className="system-rail__connector-dot" />
              <ArrowRight />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function SystemPage() {
  return (
    <main id="main-content" className="system-case-study">
      <section className="system-hero" aria-labelledby="system-hero-heading">
        <div className="system-hero__glow system-hero__glow--gold" aria-hidden="true" />
        <div className="system-hero__glow system-hero__glow--green" aria-hidden="true" />
        <div className="system-hero__inner">
          <div className="system-hero__grid">
            <div className="system-hero__copy">
              <SectionLabel light>A private system for follow-through</SectionLabel>
              <h1 id="system-hero-heading" className="system-hero__title">
                Important work, kept moving.
              </h1>
              <p className="system-hero__lead">
                We are building a private assistant that turns a goal into a clear plan, asks for approval, and brings back the result.
              </p>
              <p className="system-hero__support">
                It remembers what matters, asks before it acts, and shows what changed.
              </p>
              <div className="system-hero__actions">
                <Link href="/contact" className="system-button system-button--gold">
                  Share Your Vision
                  <ArrowRight aria-hidden="true" />
                </Link>
                <a
                  href="https://github.com/AbeJitsu/Need_This_Done/tree/dev"
                  target="_blank"
                  rel="noreferrer"
                  className="system-button system-button--ghost"
                >
                  Inspect the implementation
                  <ArrowRight aria-hidden="true" />
                </a>
              </div>
              <dl className="system-hero__stats">
                <div>
                  <dt>15–20 min</dt>
                  <dd>owner check-in</dd>
                </div>
                <div>
                  <dt>1 goal</dt>
                  <dd>next useful move</dd>
                </div>
                <div>
                  <dt>1 record</dt>
                  <dd>proof of what changed</dd>
                </div>
              </dl>
            </div>
            <SystemMap />
          </div>
        </div>
      </section>

      <section
        id="difference"
        className="system-section system-section--light"
        aria-labelledby="difference-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
              <SectionLabel>The reason to build it</SectionLabel>
            <h2 id="difference-heading" className="system-heading">
              A conversation starts the work. A clear record carries it forward.
            </h2>
            <p className="system-section__lead">
              NeedThisDone is for work that continues after the first
              conversation. The goal stays visible while one approved piece
              moves forward.
            </p>
          </div>
          <div className="system-difference-grid">
            {differencePoints.map((item, index) => (
              <article
                key={item.title}
                className={cx(
                  "system-difference-card",
                  index === 1 && "system-difference-card--dark",
                )}
              >
                <div className="system-card-identity system-difference-card__identity">
                  <div className="system-difference-card__topline">
                    <span className="system-difference-card__number">{item.number}</span>
                    <span className="system-difference-card__icon">
                      <StepIcon name={item.icon} />
                    </span>
                  </div>
                  <p className="system-card-kicker">
                    {index === 0 ? "Starting point" : "System outcome"}
                  </p>
                  <h3>{item.title}</h3>
                </div>
                <div className="system-card-detail system-difference-card__detail">
                  <p className="system-difference-card__description">{item.description}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>
                        <Check aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {index < differencePoints.length - 1 && (
                  <span className="system-difference-card__connector" aria-hidden="true">
                    <ArrowRight />
                  </span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="execution-loop"
        className="system-section system-section--sand"
        aria-labelledby="execution-heading"
      >
        <div className="system-section__inner">
          <div className="system-section__intro">
            <SectionLabel>How the loop works</SectionLabel>
            <h2 id="execution-heading" className="system-heading">
              Keep the mission visible as the next piece moves.
            </h2>
            <p className="system-section__lead">
              Every run has a beginning, a boundary, and a handoff. That makes
              long-range work easier to resume and easier to trust.
            </p>
          </div>
          <SystemRail steps={executionSteps} />
        </div>
      </section>

      <section
        id="architecture"
        className="system-section system-section--light"
        aria-labelledby="architecture-heading"
      >
        <div className="system-section__inner">
          <div className="system-two-column system-two-column--architecture">
            <div className="system-section__intro">
            <SectionLabel>{technicalSectionLabel}</SectionLabel>
              <h2 id="architecture-heading" className="system-heading system-heading--compact">
                How the private pieces fit together.
              </h2>
              <p className="system-section__lead">
                Each named layer owns one responsibility. This keeps authority
                clear and limits where a failure can spread.
              </p>
            </div>
            <figure>
              <SystemRail steps={architectureSteps} className="system-rail--architecture" />
              <figcaption className="system-figure-caption">
                NeedThisDone and Supabase hold the durable record. The private
                Mac performs approved work. GitHub holds code changes for review.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="coding-lane"
        className="system-section system-section--dark"
        aria-labelledby="coding-heading"
      >
        <div className="system-section__inner">
          <div className="system-two-column system-two-column--dark">
            <div className="system-section__intro">
              <SectionLabel light>Technical details · code changes</SectionLabel>
              <h2 id="coding-heading" className="system-heading">
                Code can change without losing the boundary.
              </h2>
              <p className="system-section__lead">
                A coding task is not permission to modify the live product. It
                allows one bounded change in a designated worktree. We run the
                relevant checks and return the evidence.
              </p>
              <div className="system-guardrail">
                <Lock aria-hidden="true" />
                No merge or deployment by default
              </div>
            </div>
            <figure>
              <figcaption className="system-rail-caption">A reviewable code change</figcaption>
              <SystemRail steps={codingSteps} dark />
            </figure>
          </div>
        </div>
      </section>

      <section
        id="daily-loop"
        className="system-section system-section--light"
        aria-labelledby="daily-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>The intended rhythm</SectionLabel>
            <h2 id="daily-heading" className="system-heading system-heading--compact">
              Short check-ins. Clear next moves.
            </h2>
          </div>
          <div className="system-beats">
            {dailyBeats.map((beat, index) => (
              <article
                key={beat.number}
                className={cx("system-beat", beat.highlighted && "system-beat--highlighted")}
              >
                <div className="system-card-identity system-beat__identity">
                  <div className="system-beat__topline">
                    <span className="system-beat__number">{beat.number}</span>
                    <span className="system-beat__icon">
                      <StepIcon name={beat.icon} />
                    </span>
                  </div>
                  <p className="system-card-kicker">{beat.label}</p>
                  <h3>{beat.title}</h3>
                </div>
                <div className="system-card-detail system-beat__detail">
                  <p>{beat.description}</p>
                </div>
                {index < dailyBeats.length - 1 && (
                  <span className="system-beat__connector" aria-hidden="true">
                    <ArrowRight />
                  </span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="status"
        className="system-section system-section--sand"
        aria-labelledby="status-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>Where the project stands</SectionLabel>
            <h2 id="status-heading" className="system-heading system-heading--compact">
              Show what exists before making promises.
            </h2>
            <p className="system-section__lead">
              The repository contains the control-plane foundation. The next
              proof is a bounded coding handoff. This page stays honest about
              what exists and what still needs to be shown.
            </p>
          </div>
          <div className="system-status-grid">
            <article className="system-status-card">
              <div className="system-card-identity system-status-card__identity">
                <div className="system-status-card__topline">
                  <span className="system-status-card__number">01</span>
                  <span className="system-status-card__icon">
                    <StepIcon name="shield" />
                  </span>
                </div>
                <p className="system-card-kicker">In the repository</p>
                <h3>Control-plane foundation</h3>
              </div>
              <div className="system-card-detail system-status-card__detail">
                <ul>
                  {proofItems.map((item) => (
                    <li key={item}>
                      <Check aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="system-status-card__connector" aria-hidden="true">
                <ArrowRight />
              </span>
            </article>
            <article className="system-status-card system-status-card--dark">
              <div className="system-card-identity system-status-card__identity">
                <div className="system-status-card__topline">
                  <span className="system-status-card__number">02</span>
                  <span className="system-status-card__icon">
                    <StepIcon name="code" />
                  </span>
                </div>
                <p className="system-card-kicker">Next proof</p>
                <h3>A bounded coding handoff</h3>
              </div>
              <div className="system-card-detail system-status-card__detail">
                <ul>
                  {nextItems.map((item) => (
                    <li key={item}>
                      <span className="system-status-card__dot" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="system-closing" aria-labelledby="closing-heading">
        <div className="system-closing__inner">
          <SectionLabel>Take the next real-world step</SectionLabel>
          <h2 id="closing-heading" className="system-heading">
            More useful follow-through starts with one clear outcome.
          </h2>
          <p>
            Share the situation in your own words. We will help clarify the
            first piece of work and what you can review before deciding.
          </p>
          <div className="system-closing__actions">
            <Link href="/contact" className="system-button system-button--green">
              Share Your Vision
              <ArrowRight aria-hidden="true" />
            </Link>
            {nextStep && (
              <Link href={nextStep.href} className="system-button system-button--outline">
                {nextStep.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
