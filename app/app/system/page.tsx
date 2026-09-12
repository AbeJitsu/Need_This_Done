import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { SYSTEM_PROOF_LANES } from "@/lib/system-progress";
import {
  ArrowRight,
  Check,
  Code2,
  Database,
  GitBranch,
  Lock,
  MessageCircle,
  Server,
  ShieldCheck,
  Target,
  Workflow,
} from "lucide-react";

const nextStep = PUBLIC_ROUTE_STAGES["/system"].secondary;
const technicalSectionLabel = "Technical map";
const systemDescription =
  "See how NeedThisDone turns a conversation into approved, trackable work with a reviewable result.";

export const metadata: Metadata = {
  title: "The System Behind NeedThisDone | NeedThisDone",
  description: systemDescription,
  alternates: { canonical: "/system" },
  openGraph: {
    title: "The System Behind NeedThisDone | NeedThisDone",
    description: systemDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The System Behind NeedThisDone | NeedThisDone",
    description: systemDescription,
  },
};

type IconName =
  | "target"
  | "workflow"
  | "shield"
  | "code"
  | "git"
  | "lock"
  | "message"
  | "database"
  | "server";

type RailStep = {
  number: string;
  label: string;
  title: string;
  problem: string;
  plainEnglish: string;
  description: string;
  icon: IconName;
  highlighted?: boolean;
  status?: string;
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
    case "message":
      return <MessageCircle className={className} aria-hidden="true" />;
    case "database":
      return <Database className={className} aria-hidden="true" />;
    case "server":
      return <Server className={className} aria-hidden="true" />;
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
    label: "Define",
    title: "Goal and scope",
    description: "Make the work clear.",
    icon: "target",
  },
  {
    number: "02",
    label: "Approve",
    title: "Owner decision",
    description: "Keep the decision yours.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "03",
    label: "Execute",
    title: "Private worker",
    description: "Run only what was approved.",
    icon: "lock",
  },
  {
    number: "04",
    label: "Review",
    title: "Evidence and next move",
    description: "See what happened.",
    icon: "git",
  },
] as const;

const coreSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Define",
    title: "Make the work specific",
    problem:
      "A broad request can produce a broad answer, not a clear next action.",
    plainEnglish:
      "NeedThisDone turns the outcome into one bounded task.",
    description:
      "The request keeps its owner, goal, scope, and summary before execution.",
    icon: "message",
  },
  {
    number: "02",
    label: "Approve",
    title: "Keep the decision yours",
    problem: "A recommendation is not permission to act.",
    plainEnglish:
      "You review the plan and approve it before work starts.",
    description:
      "Owner-scoped authentication and a durable approval record gate the workflow.",
    icon: "lock",
    highlighted: true,
  },
  {
    number: "03",
    label: "Execute",
    title: "Do the agreed work",
    problem: "A chat has no private computer that can safely carry out the task.",
    plainEnglish:
      "A configured worker handles only the approved task in an isolated workspace.",
    description:
      "Hermes coordinates the workflow; OpenClaw uses its configured Codex runtime and returns changed files and checks.",
    icon: "code",
  },
  {
    number: "04",
    label: "Review",
    title: "Bring back a reviewable result",
    problem: "When the conversation ends, it can be hard to tell what happened.",
    plainEnglish:
      "Your private workspace shows status, evidence, blockers, and the next decision.",
    description:
      "Supabase keeps the durable record. GitHub holds code changes and commit evidence.",
    icon: "git",
  },
];

const technicalSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Secure entry",
    title: "MCP + Next.js",
    problem: "A request needs a small, authenticated front door.",
    plainEnglish:
      "Only an identified owner should be able to start or check work.",
    description:
      "The MCP/API facade accepts an owner-scoped bearer credential and exposes three tools. The local route and authentication seam are built; hosted client access is pending.",
    icon: "lock",
    status: "Owner boundary built · hosted reachability pending",
  },
  {
    number: "02",
    label: "Durable truth",
    title: "Supabase",
    problem: "A chat thread is not a reliable work record.",
    plainEnglish:
      "The request, decision, status, and result need to stay together.",
    description:
      "Supabase stores owner-scoped workflows, approvals, costs, results, and assets under RLS. Raw MCP tokens are never stored; local integration proof is next.",
    icon: "database",
    status: "Application boundary exists · local-first proof next",
  },
  {
    number: "03",
    label: "Coordination",
    title: "Hermes + Redis",
    problem: "Approved work needs to keep moving between steps.",
    plainEnglish:
      "Hermes directs the workflow. Redis carries short-lived signals such as queues, locks, leases, and heartbeats.",
    description:
      "Hermes owns workflow state and result return. Redis is coordination only, not authentication or durable truth. Durable Hermes persistence and queue wiring are pending.",
    icon: "workflow",
    status: "Dispatcher and queue wiring pending",
  },
  {
    number: "04",
    label: "Private execution",
    title: "Worker host + OpenClaw",
    problem: "Real work needs a private place to run.",
    plainEnglish:
      "A configured local, private, or cloud machine performs only approved work.",
    description:
      "OpenClaw is the replaceable coding worker. It uses a configured Codex runtime, an isolated worktree, and safety checks, then returns files, a commit, and evidence. Live activation is pending.",
    icon: "code",
    status: "Safety contracts built · live task pending",
  },
  {
    number: "05",
    label: "Review and context",
    title: "GitHub + Vector memory",
    problem: "A result needs evidence and useful context without mixing up sources.",
    plainEnglish:
      "GitHub records code changes for review. Optional vector memory helps find selected context.",
    description:
      "GitHub holds branches, diffs, commits, and pull requests. Upstash Vector receives selected provenance-bearing findings; it never replaces Supabase or GitHub. Live projection is pending.",
    icon: "git",
    status: "Repository active · vector projection pending",
  },
];

const summaryComparison = [
  {
    number: "01",
    icon: "message",
    kicker: "The problem",
    title: "Chat alone",
    description:
      "A conversation can be useful and still leave the follow-through to you.",
    points: [
      "The plan can remain inside a thread",
      "Approval and execution happen somewhere else",
      "Status and evidence are not in one work record",
    ],
  },
  {
    number: "02",
    icon: "workflow",
    kicker: "The answer",
    title: "NeedThisDone",
    description:
      "NeedThisDone adds a controlled work path around the conversation.",
    points: [
      "One owner-scoped request keeps its goal and decision",
      "Approved work moves through a private coordinator and worker",
      "The result returns with evidence, blockers, and a next decision",
    ],
  },
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
          <p className="system-map-shell__kicker">The path</p>
          <figcaption className="system-map-shell__caption">
            From request to proof
          </figcaption>
        </div>
        <span className="system-map-shell__status">
          <span aria-hidden="true" /> approval first
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
        steps.length === 5 ? "system-rail--five" : steps.length === 4 ? "system-rail--four" : "system-rail--many",
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
              {step.status && <p className="system-rail__status">{step.status}</p>}
            </div>
            <div className="system-card-detail system-rail__detail">
              <div className="system-rail__problem">
                <p className="system-rail__detail-label">Problem</p>
                <p className="system-rail__problem-description">{step.problem}</p>
              </div>
              <div className="system-rail__plain">
                <p className="system-rail__detail-label">What changes</p>
                <p className="system-rail__plain-description">{step.plainEnglish}</p>
              </div>
              <div className="system-rail__technical">
                <p className="system-rail__detail-label">Technical detail</p>
                <p className="system-rail__description">{step.description}</p>
              </div>
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
              <SectionLabel light>Why this exists</SectionLabel>
              <h1 id="system-hero-heading" className="system-hero__title">
                Chat can start the work. NeedThisDone carries it through.
              </h1>
              <p className="system-hero__lead">
                A chat can help you think through a task. Important work also needs
                a decision, a place to run, and proof.
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
            <SectionLabel>The problem</SectionLabel>
            <h2 id="difference-heading" className="system-heading">
              What chat alone leaves unresolved.
            </h2>
            <p className="system-section__lead">
              Chat is good at thinking with you. It is not a complete path for work
              that needs ownership, follow-through, and proof.
            </p>
          </div>
          <div className="system-difference-grid system-closing__comparison">
            {summaryComparison.map((item, index) => (
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
                  <p className="system-card-kicker">{item.kicker}</p>
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
                {index < summaryComparison.length - 1 && (
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
        id="plain-language"
        className="system-section system-section--light"
        aria-labelledby="core-flow-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>How the gaps are closed</SectionLabel>
            <h2 id="core-flow-heading" className="system-heading">
              Four problems. One controlled path.
            </h2>
            <p className="system-section__lead">
              Each card names the problem first, then shows what changes and how
              the technical pieces support it.
            </p>
          </div>
          <SystemRail steps={coreSteps} className="system-plain-flow system-core-flow" />
        </div>
      </section>

      <section
        id="architecture"
        className="system-section system-section--light"
        aria-labelledby="architecture-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>{technicalSectionLabel}</SectionLabel>
            <h2 id="architecture-heading" className="system-heading">
              The pieces have separate jobs.
            </h2>
            <p className="system-section__lead">
              The model and worker can change. The owner boundary and durable
              record stay explicit.
            </p>
          </div>
          <SystemRail steps={technicalSteps} className="system-plain-flow system-technical-flow" />
        </div>
      </section>

      <section
        id="status"
        className="system-section system-section--sand"
        aria-labelledby="status-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>Proof, not promises</SectionLabel>
            <h2 id="status-heading" className="system-heading system-heading--compact">
              What is built, and what still needs proof.
            </h2>
            <p className="system-section__lead">
              The foundation is in the repository. Local, hosted, and worker
              connections advance only after their own checks pass.
            </p>
          </div>
          <div className="system-proof-lanes" aria-label="System proof progress">
            {SYSTEM_PROOF_LANES.map((lane) => (
              <article key={lane.number} className="system-proof-lane">
                <div className="system-proof-lane__topline">
                  <span className="system-proof-lane__number">{lane.number}</span>
                  <span className="system-proof-lane__status">{lane.status}</span>
                </div>
                <h3>{lane.title}</h3>
                <p>{lane.description}</p>
                <p className="system-proof-lane__evidence">Evidence: {lane.evidence}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="system-closing" aria-labelledby="closing-heading">
        <div className="system-closing__inner">
          <SectionLabel>Next step</SectionLabel>
          <h2 id="closing-heading" className="system-heading">
            Start with one outcome.
          </h2>
          <p>
            Bring one clear result you want. The first step is to define a
            bounded piece of work.
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
