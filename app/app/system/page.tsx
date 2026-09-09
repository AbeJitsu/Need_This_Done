import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";
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

const plainLanguageSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "You talk normally",
    title: "Tell ChatGPT what you want done",
    description:
      "You describe the outcome in everyday language. ChatGPT helps clarify the request; you do not need to choose a prompt, model, or worker.",
    icon: "message",
    status: "Reasoning layer",
  },
  {
    number: "02",
    label: "The system makes it durable",
    title: "A small doorway turns talk into work",
    description:
      "NeedThisDone gives ChatGPT one authenticated MCP doorway. Hermes is meant to turn the request into a trackable workflow instead of leaving it as a loose answer.",
    icon: "workflow",
    status: "Local MCP built · Hermes wiring next",
  },
  {
    number: "03",
    label: "You decide",
    title: "Nothing important runs by surprise",
    description:
      "Before work that sends, publishes, spends, changes a system, or hands off code, you see the scope and decide whether to approve it.",
    icon: "shield",
    highlighted: true,
    status: "Approval boundary",
  },
  {
    number: "04",
    label: "A private machine helps",
    title: "Approved work goes to the right worker",
    description:
      "The always-on Mac mini is the intended worker. OpenClaw handles approved non-code tasks; Codex handles approved code changes in an isolated worktree.",
    icon: "code",
    status: "Mac mini connection pending",
  },
  {
    number: "05",
    label: "You get proof",
    title: "The result comes back with a trail",
    description:
      "Supabase keeps durable workflow truth, GitHub keeps code truth, Redis handles temporary coordination, and vector memory helps retrieve selected findings.",
    icon: "git",
    status: "Connections still being proven",
  },
];

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
    label: "Reasoning and conversation",
    title: "ChatGPT",
    description:
      "The reasoning engine and conversational interface. It is meant to work from the MacBook Pro, Mac mini, or another approved client. The remote ChatGPT-to-MCP connection is designed but not yet verified.",
    icon: "message",
    status: "Interface designed · connection pending",
  },
  {
    number: "02",
    label: "Small authenticated doorway",
    title: "MCP facade",
    description:
      "The Model Context Protocol endpoint exposes only start_workflow, get_workflow_status, and list_workflows. The local route, handshake, authentication seam, and discovery contract are built; a secure hosted ChatGPT connection is still pending.",
    icon: "lock",
    status: "Built locally · hosted reachability pending",
  },
  {
    number: "03",
    label: "Internet-facing control plane",
    title: "Next.js on Vercel",
    description:
      "Hosts the authenticated browser and server-side API boundary. It records policy decisions and never becomes the always-on worker. The hosted environment must be proven separately from local development.",
    icon: "server",
    status: "Application boundary exists · hosted proof pending",
  },
  {
    number: "04",
    label: "Workflow coordination",
    title: "Hermes",
    description:
      "Validates the request, creates and tracks the workflow, assigns approved work, and returns a reviewable result. The three-tool contract is built, but the default MCP dispatcher is deliberately unavailable until durable Hermes persistence is connected.",
    icon: "workflow",
    highlighted: true,
    status: "Contract built · durable dispatcher pending",
  },
  {
    number: "05",
    label: "Durable source of truth",
    title: "Supabase",
    description:
      "Stores authentication, plans, approvals, tasks, costs, results, and private assets with RLS. The local real-Supabase gate must pass before the hosted Supabase proof.",
    icon: "database",
    status: "Application boundary exists · local-first proof next",
  },
  {
    number: "06",
    label: "Temporary coordination",
    title: "Redis",
    description:
      "Carries short-lived cache, locks, deduplication, leases, heartbeats, and wake-up signals. It is not durable workflow truth and is not yet wired as the task queue.",
    icon: "server",
    status: "Client active · workflow coordination pending",
  },
  {
    number: "07",
    label: "Semantic retrieval aid",
    title: "Upstash Vector",
    description:
      "Receives selected, provenance-bearing findings after durable state exists. It helps retrieve context; it never overrides Supabase or GitHub and does not restore the retired public chatbot.",
    icon: "database",
    status: "Adapter built · live index and projection pending",
  },
  {
    number: "08",
    label: "Always-on private host",
    title: "Mac mini",
    description:
      "The intended worker machine. It should poll outward, expose no public listener, and act only on a frozen approval. The MacBook Pro is the interactive coding and first rehearsal machine; neither live worker connection is complete here.",
    icon: "server",
    status: "Target host · activation pending",
  },
  {
    number: "09",
    label: "Replaceable workers",
    title: "OpenClaw and Codex",
    description:
      "OpenClaw runs approved non-code local tools through its loopback Gateway. Codex changes code only in a designated worktree and returns tests, files, a commit, and review evidence.",
    icon: "code",
    status: "Safety contracts built · live task pending",
  },
  {
    number: "10",
    label: "Code source of truth",
    title: "GitHub",
    description:
      "Holds the branch, diff, commit, and pull request for code work. A worker never makes a merge or deployment decision by itself.",
    icon: "git",
    status: "Repository boundary active · coding rehearsal pending",
  },
  {
    number: "11",
    label: "Model route",
    title: "OpenRouter",
    description:
      "Provides the application-side planner/model route. An allowed free route is preferred; a paid route remains a separate owner approval.",
    icon: "workflow",
    status: "Policy boundary built · live route proof pending",
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
    icon: "message",
    title: "Prompting ChatGPT by itself",
    description:
      "A prompt can produce an answer, draft, or plan. It usually leaves you to remember what should happen next.",
    points: [
      "The useful output stays in the conversation",
      "A worker is not automatically assigned",
      "Status, approvals, and evidence are not one durable workflow record",
    ],
  },
  {
    number: "02",
    icon: "target",
    title: "NeedThisDone around ChatGPT",
    description:
      "NeedThisDone is the coordination layer around the conversation. ChatGPT remains the reasoning and interface layer; the platform keeps approved work legible.",
    points: [
      "The goal and constraints become a durable work record",
      "MCP exposes a small set of workflow actions instead of arbitrary control",
      "A human approval and reviewable result sit around execution",
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
  "Local MCP route, handshake, authentication, and tool contract",
  "Supabase-backed plans, approvals, costs, results, and RLS boundaries",
  "Redis client for cache, rate limits, deduplication, and health checks",
  "Server-only vector-memory adapter with namespaced provenance metadata",
  "Signed worker bridge and fail-closed OpenClaw/Codex safety contracts",
] as const;

const nextItems = [
  "Pass the real local-Supabase-first diagnostic",
  "Pass the hosted read-only Supabase preflight",
  "Connect MCP to durable Hermes workflow records",
  "Wire Redis into workflow queue, lease, and heartbeat coordination",
  "Run the approved MacBook Pro, then Mac mini, worker proof",
  "Add a safe end-to-end vector projection probe",
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
                ChatGPT helps you think and talk. NeedThisDone keeps an approved piece of work, its status, and its proof together after the conversation ends.
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
                  <dt>3 tools</dt>
                  <dd>small MCP contract</dd>
                </div>
                <div>
                  <dt>1 boundary</dt>
                  <dd>owner approval first</dd>
                </div>
              </dl>
            </div>
            <SystemMap />
          </div>
        </div>
      </section>

      <section
        id="plain-language"
        className="system-section system-section--light"
        aria-labelledby="plain-language-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>In plain English</SectionLabel>
            <h2 id="plain-language-heading" className="system-heading">
              You explain the outcome. NeedThisDone keeps the work moving.
            </h2>
            <p className="system-section__lead">
              Think of it as a dependable work trail around a conversation. You
              talk naturally, the system keeps the request and decisions clear,
              and you can see what happened next. The labels below separate the
              intended design from the connections we still need to prove.
            </p>
          </div>
          <SystemRail steps={plainLanguageSteps} className="system-plain-flow" />
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
              ChatGPT can answer. NeedThisDone is designed to carry the work forward.
            </h2>
            <p className="system-section__lead">
              The difference is not another chatbot. It is the durable trail
              around the conversation: what you asked for, what was approved,
              what happened, and what should happen next.
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
              The repository contains a meaningful control-plane foundation,
              but the connections are not all live yet. This page stays honest
              about what is built, what has only been contract-tested, and what
              still needs a local, hosted, or Mac proof.
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
