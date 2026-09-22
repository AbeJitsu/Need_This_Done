import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PUBLIC_ROUTE_STAGES } from "@/lib/public-journey";
import {
  ArrowRight,
  Check,
  GitBranch,
  Lock,
  MessageCircle,
  ShieldCheck,
  Target,
  Workflow,
} from "lucide-react";
import PublicPageVisual from "@/components/public/PublicPageVisual";

const nextStep = PUBLIC_ROUTE_STAGES["/system"].secondary;
const systemDescription =
  "See how NeedThisDone turns a conversation into approved, trackable work with a clear result.";

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
  | "shield"
  | "lock"
  | "git"
  | "message"
  | "workflow";

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
    case "shield":
      return <ShieldCheck className={className} aria-hidden="true" />;
    case "lock":
      return <Lock className={className} aria-hidden="true" />;
    case "git":
      return <GitBranch className={className} aria-hidden="true" />;
    case "message":
      return <MessageCircle className={className} aria-hidden="true" />;
    case "workflow":
      return <Workflow className={className} aria-hidden="true" />;
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
    title: "Clarify the outcome",
    description: "Turn the idea into a clear first move.",
    icon: "target",
  },
  {
    number: "02",
    label: "Approve",
    title: "You make the call",
    description: "Keep the important decision with you.",
    icon: "shield",
    highlighted: true,
  },
  {
    number: "03",
    label: "Execute",
    title: "Do the agreed work",
    description: "Give the work a private place to move forward.",
    icon: "lock",
  },
  {
    number: "04",
    label: "Review",
    title: "Return a clear result",
    description: "See what happened and decide what comes next.",
    icon: "git",
  },
] as const;

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
      "The next step is easy to lose",
    ],
  },
  {
    number: "02",
    icon: "workflow",
    kicker: "The answer",
    title: "NeedThisDone",
    description:
      "NeedThisDone adds a clear, controlled path around the conversation.",
    points: [
      "The request keeps its goal and next step",
      "You decide before work moves forward",
      "The result comes back ready for review",
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
            From request to result
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
                a decision, a place to run, and a clear result.
              </p>
              <div className="system-hero__actions">
                <Link href="/contact" className="system-button system-button--gold">
                  Start a conversation
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            <SystemMap />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--public-ink)]/10 bg-[var(--public-cream)]" aria-label="A physical view of the work path">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14">
          <PublicPageVisual kind="problem-map" />
        </div>
      </section>

      <section
        id="difference"
        className="system-section system-section--light"
        aria-labelledby="difference-heading"
      >
        <div className="system-section__inner system-section__inner--narrow">
          <div className="system-section__intro">
            <SectionLabel>The difference</SectionLabel>
            <h2 id="difference-heading" className="system-heading">
              What chat alone leaves unresolved.
            </h2>
            <p className="system-section__lead">
              Chat is good at thinking with you. It is not a complete path for work
              that needs ownership, follow-through, and a clear result.
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

      <section className="system-closing" aria-labelledby="closing-heading">
        <div className="system-closing__inner">
          <SectionLabel>Next step</SectionLabel>
          <h2 id="closing-heading" className="system-heading">
            Start with one outcome.
          </h2>
          <p>
            Bring one clear result you want. We will help define the useful first
            move.
          </p>
          <div className="system-closing__actions">
            <Link href="/contact" className="system-button system-button--green">
              Start a conversation
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
