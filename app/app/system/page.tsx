import type { Metadata } from "next";
import Link from "next/link";
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
      "A durable aim gives the work somewhere useful to go: make the owner dashboard easier to act on. That reference point keeps later decisions aligned.",
    icon: "target",
  },
  {
    number: "02",
    label: "Decide the boundary",
    title: "Owner approval",
    description:
      "The owner sees the scope, route, cost, and expected result before a meaningful action can run. Permission stays explicit instead of being assumed.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "03",
    label: "Move one piece",
    title: "Private execution",
    description:
      "The outbound-only Mac sends the frozen task to the right lane: OpenClaw for tools or Codex for code. The private worker only follows the recorded boundary.",
    icon: "lock",
  },
  {
    number: "04",
    label: "Bring back evidence",
    title: "Reviewable proof",
    description:
      "The result, cost, diff, private asset, blocker, or next decision stays attached to the durable record. Nothing important disappears into an informal handoff.",
    icon: "git",
  },
] as const;

const executionSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Start with the outcome",
    title: "Name what better looks like",
    description:
      "Start with the better state, not a pile of disconnected tasks. That keeps the next piece connected to the reason it matters.",
    icon: "target",
  },
  {
    number: "02",
    label: "Shape the work",
    title: "Turn context into a plan",
    description:
      "Hermes turns the goal into a bounded plan with a visible next step. The owner can inspect the proposed move before deciding.",
    icon: "workflow",
  },
  {
    number: "03",
    label: "Cross the boundary",
    title: "Approve the move",
    description:
      "The owner sees the scope, route, cost, and expected result before anything runs. The approval freezes what may happen next.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "04",
    label: "Do one useful piece",
    title: "Execute privately",
    description:
      "The private machine sends the approved task to the right execution lane. The public browser never becomes the worker.",
    icon: "code",
  },
  {
    number: "05",
    label: "Make it legible",
    title: "Review the proof",
    description:
      "The result comes back with evidence, blockers, and a clear next decision. The mission is ready to resume without guesswork.",
    icon: "git",
  },
];

const architectureSteps: readonly RailStep[] = [
  {
    number: "01",
    label: "Mission control",
    title: "NeedThisDone",
    description:
      "Keeps the goal, context, approvals, status, costs, and results together in one durable record. The browser remains the place to inspect the work.",
    icon: "target",
  },
  {
    number: "02",
    label: "Planning layer",
    title: "Hermes",
    description:
      "Interprets the long-range objective and turns it into a focused, reviewable work packet. It proposes the next move without executing it.",
    icon: "workflow",
    highlighted: true,
  },
  {
    number: "03",
    label: "Local gateway",
    title: "OpenClaw",
    description:
      "Runs approved non-code tools and provides the always-on gateway for the private machine. Its lane stays separate from coding work.",
    icon: "shield",
  },
  {
    number: "04",
    label: "Coding lane",
    title: "Codex",
    description:
      "Works inside an isolated repository worktree to inspect, edit, test, and prepare code changes. The live product stays outside that boundary.",
    icon: "code",
  },
  {
    number: "05",
    label: "Review boundary",
    title: "GitHub",
    description:
      "Holds the branch, diff, commit, and pull request so changes remain inspectable before merge. Review happens before a change becomes part of the product.",
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
    description: "Keep the change isolated from other work. That makes the resulting diff easier to review.",
    icon: "lock",
  },
  {
    number: "03",
    label: "Inspect, edit, verify",
    title: "Codex execution",
    description:
      "Inspect, edit, run the relevant checks, and explain the result. The evidence travels with the change.",
    icon: "code",
  },
  {
    number: "04",
    label: "Return the evidence",
    title: "Reviewable handoff",
    description:
      "Return the branch, diff, tests, and blockers before merge. A reviewer can decide from the handoff itself.",
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
      "Useful for thinking through the next prompt. The important context and next action may still need to be reconstructed later.",
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
      "Designed for work that continues after the conversation. The goal stays visible while the system moves one approved piece forward.",
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
      "Review what moved, what is blocked, and the one decision that would make the next step clear. The owner starts from the current record.",
    icon: "target",
  },
  {
    number: "02",
    label: "Approve",
    title: "Authorize one useful move.",
    description:
      "The owner decides what the system may do, which route it may use, and what result should come back. The approval remains bounded.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "03",
    label: "Review",
    title: "Pick up from evidence.",
    description:
      "Return to a result, diff, or blocker—not a blank conversation where the entire project has to be explained again. The next decision stays visible.",
    icon: "git",
  },
];

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
                NeedThisDone turns a long-range goal into one approved, reviewable next move.
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
              A conversation starts the work. The system carries it forward.
            </h2>
            <p className="system-section__lead">
              NeedThisDone is not trying to be a prettier prompt box. It is
              designed for work that spans days or weeks, continues while the
              owner is away, and still needs to remain understandable and
              controllable.
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
              <SectionLabel>One system, focused responsibilities</SectionLabel>
              <h2 id="architecture-heading" className="system-heading system-heading--compact">
                Clear boundaries make the system easier to trust.
              </h2>
              <p className="system-section__lead">
                The goal is not to make every agent do everything. Each layer
                owns one kind of responsibility, which makes authority easier
                to understand and the failure boundary easier to contain.
              </p>
            </div>
            <figure>
              <SystemRail steps={architectureSteps} className="system-rail--architecture" />
              <figcaption className="system-figure-caption">
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
        className="system-section system-section--dark"
        aria-labelledby="coding-heading"
      >
        <div className="system-section__inner">
          <div className="system-two-column system-two-column--dark">
            <div className="system-section__intro">
              <SectionLabel light>The coding lane</SectionLabel>
              <h2 id="coding-heading" className="system-heading">
                Code can change without losing the boundary.
              </h2>
              <p className="system-section__lead">
                A coding task is not permission to modify the live product. It
                is permission to make one bounded change in a designated
                worktree, run the relevant checks, and return the evidence.
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
              Build proof before making promises.
            </h2>
            <p className="system-section__lead">
              The repository already contains the control-plane foundation.
              The coding lane is the next proof, so the public story stays
              honest about what exists and what still needs to be demonstrated.
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
          <Link href="/contact" className="system-button system-button--green">
            Share Your Vision
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
