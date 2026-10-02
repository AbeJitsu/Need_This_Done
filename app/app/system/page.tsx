import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "A Paused System Experiment — Abe Reyes",
  description:
    "The original request-to-result experiment, its design goals, and why the current focus is the developer portfolio.",
  alternates: { canonical: "/system" },
};

const stages = [
  ["Define", "Record a request and make the intended outcome clear."],
  [
    "Approve",
    "Keep the decision and scope with the person requesting the work.",
  ],
  ["Execute", "Allow only the approved work to move forward."],
  ["Review", "Return the result, checks, and any unfinished work for review."],
] as const;

export default function SystemPage() {
  return (
    <main id="main-content" className="pf-page">
      <section className="pf-page-intro pf-wrap">
        <p className="pf-eyebrow">
          <span /> Project background / Paused experiment
        </p>
        <h1>
          An earlier idea.
          <br />
          <em>A useful lesson.</em>
        </h1>
        <p className="pf-lead">
          NeedThisDone began as an experiment in turning a request into
          controlled, reviewable work. A complete live execution workflow
          remains unproven.
        </p>
        <div className="pf-actions">
          <Link href="/examples" className="pf-button pf-button--green">
            Explore the working examples{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/work" className="pf-text-link">
            Back to selected work <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section
        className="pf-wrap pf-approach"
        aria-labelledby="system-design-heading"
      >
        <div className="pf-section-heading">
          <div>
            <p className="pf-eyebrow">The original design</p>
            <h2 id="system-design-heading">
              From request
              <br />
              <em>to review.</em>
            </h2>
          </div>
          <p>
            These are design goals. The interface, contracts, and tests exist in
            the repository; the entire workflow has not been demonstrated live.
          </p>
        </div>
        <ol>
          {stages.map(([title, description], index) => (
            <li key={title}>
              <span className="pf-approach-number">0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="pf-wrap pf-about-story">
        <div>
          <p className="pf-eyebrow">The decision</p>
          <h2>
            Prove the useful piece.
            <br />
            <em>Then decide what grows.</em>
          </h2>
        </div>
        <div>
          <p>
            I have paused expansion of the agent system to focus on demonstrable
            application work. Adding infrastructure before establishing everyday
            usefulness made the project harder to evaluate.
          </p>
          <p>
            The current portfolio takes a smaller approach: a working React
            interface, a real server API, a reproducible bug, and tests that
            protect the behavior.
          </p>
          <p>
            The earlier code remains available as project history. It is a
            source of implementation decisions to discuss, rather than a promise
            of a live agent service.
          </p>
          <Link href="/how-it-works" className="pf-text-link">
            Read the development approach{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
