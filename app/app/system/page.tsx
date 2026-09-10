import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import { PUBLIC_CORE_PROMISE } from "@/lib/public-copy";
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
      "A configured worker host picks up only approved work. This public website cannot send it commands.",
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

const remoteFlowSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Your conversation",
    title: "Any compatible LLM",
    description:
      "You describe the outcome in ChatGPT, Claude, another LLM, or a custom interface. The client reasons about the request and calls a small tool when the work needs to leave the conversation.",
    icon: "message",
    status: "Interface · reasoning · summary",
  },
  {
    number: "02",
    label: "The public doorway",
    title: "NeedThisDone MCP on Vercel",
    description:
      "Your NeedThisDone site login identifies the owner, and Account Settings creates an owner-scoped MCP credential for the client. The client sends that bearer credential to one stable HTTPS doorway; the raw token is shown only once. The site login and MCP credential are separate layers, and the client does not need to open the website for each call.",
    icon: "lock",
    status: "Owner-scoped bearer · three tools",
  },
  {
    number: "03",
    label: "Record and signal",
    title: "Supabase + Redis",
    description:
      "Supabase stores the owner-scoped credential hash, durable workflow, approval, status, and result under RLS. Redis carries temporary queue signals, leases, locks, heartbeats, and deduplication; it is not part of MCP authentication and is never durable truth.",
    icon: "database",
    status: "Durable truth + temporary coordination",
  },
  {
    number: "04",
    label: "Choose the worker host",
    title: "Hermes on a configured computer",
    description:
      "Hermes runs on the configured computer that owns its credentials and can reach the control plane. That can be a local workstation, a private server, or a cloud machine. Our MacBook Pro and Mac mini are current implementation examples, not requirements.",
    icon: "workflow",
    status: "Local or cloud · configuration required",
  },
  {
    number: "05",
    label: "Do the bounded work",
    title: "OpenClaw on the selected computer",
    description:
      "OpenClaw is the replaceable coding worker. It can run locally or in the cloud through its configured Codex runtime, uses an isolated worktree, runs checks, and returns changed files, a commit, and evidence.",
    icon: "code",
    status: "Separate worker authentication",
  },
  {
    number: "06",
    label: "Bring back proof",
    title: "Result to the LLM client",
    description:
      "Hermes stores the structured result in Supabase. The LLM client calls get_workflow_status and receives a compact summary, evidence, blockers, and the next decision. The /system page is an optional visual dashboard.",
    icon: "git",
    status: "Evidence path · dashboard optional",
  },
];

const architectureSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Reasoning and conversation",
    title: "LLM client",
    description:
      "The replaceable reasoning and conversational layer. After the owner signs in to NeedThisDone and creates a credential, ChatGPT, Claude, another LLM, or a custom application can use the same owner-scoped MCP/API contract. Remote client access is designed but not yet verified.",
    icon: "message",
    status: "Model-agnostic contract · connection pending",
  },
  {
    number: "02",
    label: "Small authenticated doorway",
    title: "MCP facade",
    description:
      "The Model Context Protocol/API endpoint requires a bearer credential, resolves the owner and credential record, and exposes only start_workflow, get_workflow_status, and list_workflows. Raw tokens are shown once from Account Settings; the local route, handshake, authentication seam, owner-context propagation, and discovery contract are built, while secure hosted client access is still pending.",
    icon: "lock",
    status: "Owner boundary built · hosted reachability pending",
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
      "Stores authentication, owner-scoped MCP token hashes, plans, approvals, tasks, costs, results, and private assets with RLS. Raw MCP tokens never enter durable storage. The local real-Supabase gate must pass before the hosted Supabase proof.",
    icon: "database",
    status: "Application boundary exists · local-first proof next",
  },
  {
    number: "06",
    label: "Temporary coordination",
    title: "Redis",
    description:
      "Carries short-lived cache, locks, deduplication, leases, heartbeats, and wake-up signals. It is not durable workflow truth, is not an authentication store, and is not yet wired as the task queue.",
    icon: "server",
    status: "Client active · workflow coordination pending",
  },
  {
    number: "07",
    label: "Semantic retrieval aid",
    title: "Upstash Vector",
    description:
      "Receives selected, provenance-bearing findings after durable state exists. It helps retrieve context; it is not an authentication boundary, never overrides Supabase or GitHub, and does not restore the retired public chatbot.",
    icon: "database",
    status: "Adapter built · live index and projection pending",
  },
  {
    number: "08",
    label: "Always-on private host",
    title: "Worker host",
    description:
      "The worker host can be a local computer, a private server, or a cloud machine. It should poll outward, expose no public listener, and act only on a frozen approval. The MacBook Pro and Mac mini are current examples; neither live worker connection is complete here.",
    icon: "server",
    status: "Local or cloud · activation pending",
  },
  {
    number: "09",
    label: "Replaceable coding worker",
    title: "OpenClaw with Codex runtime",
    description:
      "OpenClaw is the coding worker. Its Codex agent runtime can inspect, edit, test, and explain changes through a correctly configured local or cloud Gateway, then return files, a commit, and review evidence. The intended login is the supported ChatGPT/Codex OAuth path; standalone Codex CLI operation is not part of this design.",
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

const proofItems = [
  "Local MCP route, handshake, owner-scoped authentication, and tool contract",
  "One-time raw-token display with redacted account credential management",
  "Supabase-backed plans, approvals, costs, results, and RLS boundaries",
  "Redis client for cache, rate limits, deduplication, and health checks",
  "Server-only vector-memory adapter with namespaced provenance metadata",
  "Signed worker bridge and fail-closed OpenClaw coding-worker safety contracts",
] as const;

const nextItems = [
  "Run the local migration 113/RLS and account-credential proof",
  "Pass the real local-Supabase-first diagnostic",
  "Pass the hosted read-only Supabase preflight",
  "Connect the authenticated MCP owner context to durable Hermes workflow records",
  "Wire Redis into workflow queue, lease, and heartbeat coordination",
  "Run the approved worker-host proof, using the MacBook Pro or Mac mini as current examples",
  "Add a safe end-to-end vector projection probe",
] as const;

const summaryComparison = [
  {
    number: "01",
    icon: "message",
    kicker: "ChatGPT, Claude, or another LLM alone",
    title: "A useful conversation",
    description:
      "The model can reason, answer questions, call available tools, and produce a plan or result. The conversation remains the main place to follow the work.",
    points: [
      "The model or its tools may not keep one durable workflow record",
      "Approvals, queues, long-running execution, and evidence remain separate concerns",
      "You still have to coordinate what happens next",
    ],
  },
  {
    number: "02",
    icon: "workflow",
    kicker: "The same LLM with NeedThisDone",
    title: "A coordinated system that carries the work forward",
    description:
      "NeedThisDone puts a small authenticated control plane around the conversation so the work can continue after the message ends.",
    points: [
      "Supabase keeps the goal, approval, status, result, and ownership durable",
      "Redis coordinates short-lived queues, leases, locks, heartbeats, and deduplication",
      "Vector memory retrieves selected context without replacing durable truth",
      "Hermes and configured local or cloud workers execute the approved work and return evidence",
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
                We are building a private coordination system that turns a goal into a clear plan, asks for approval, and brings back the result.
              </p>
              <p className="system-hero__support">
                ChatGPT, Claude, or any compatible LLM can be the conversation layer. This page first explains the system in plain English, then shows why each technical layer matters, and ends with a direct comparison with ordinary chat.
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
        aria-labelledby="remote-flow-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>In plain English · the real operating path</SectionLabel>
            <h2 id="remote-flow-heading" className="system-heading">
              One request, one controlled workflow, one answer back.
            </h2>
            <p className="system-section__lead">
              ChatGPT, Claude, or any compatible LLM can be the conversation layer. It sends a
              request to the same authenticated MCP/API contract; NeedThisDone
              keeps the workflow, approval, execution, and evidence together.
              The chat is the front door; the coordinated services and workers
              are the team doing the follow-through. ChatGPT is the current
              client, not a permanent dependency. The worker can be a local
              computer or a cloud machine when it is configured correctly.
            </p>
          </div>
          <SystemRail steps={remoteFlowSteps} className="system-remote-flow" />
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
                Why each private piece has a job.
              </h2>
              <p className="system-section__lead">
                A chat alone can discuss work. This stack gives that
                conversation a coordinator, records, signals, workers, and
                evidence. Each named layer owns one responsibility, so the
                system can do real work without turning one tool into the
                whole team.
              </p>
            </div>
            <figure>
              <SystemRail steps={architectureSteps} className="system-rail--architecture" />
              <figcaption className="system-figure-caption">
                NeedThisDone and Supabase hold the durable record. The private
                worker host performs approved work. GitHub holds code changes for review.
              </figcaption>
            </figure>
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
              still needs a local, hosted, or worker-host proof.
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
          <SectionLabel>In summary · why this is different</SectionLabel>
          <h2 id="closing-heading" className="system-heading">
            Chat can answer. NeedThisDone carries the work forward.
          </h2>
          <p>
            Even when an LLM can use tools, it does not automatically become a
            durable, approval-gated operating system. NeedThisDone adds the
            records, coordination, memory, workers, and evidence around it.
          </p>
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
          <p>
            Share one clear outcome when you are ready, and the first bounded
            piece of work can be defined before anything runs.
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
