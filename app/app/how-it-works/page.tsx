import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { EXAMPLE_FILE_SOURCE } from "@/lib/portfolio-examples";

export const metadata: Metadata = {
  title: "Development Approach — Abe Reyes",
  description:
    "Reproduce the problem, isolate the cause, make a focused change, and verify the result.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  [
    "Reproduce the problem",
    "Describe the expected behavior and the actual result. Find an input or sequence that makes the failure repeatable.",
    "A concrete failing example.",
  ],
  [
    "Isolate the cause",
    "Trace the relevant interface, request, response, and data. Narrow down where the behavior diverges from the expectation.",
    "An explanation of the failing boundary.",
  ],
  [
    "Make a focused change",
    "Change the smallest useful part. Keep assumptions visible and use AI-assisted tools to explore and implement the solution.",
    "A change that can be reviewed.",
  ],
  [
    "Verify the behavior",
    "Add a meaningful regression test. Check the working path, failure states, accessibility, and layout where the change affects them.",
    "A result with evidence behind it.",
  ],
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main-content" className="pf-page">
      <section className="pf-page-intro pf-wrap">
        <p className="pf-eyebrow">
          <span /> The development approach
        </p>
        <h1>
          Find the cause.
          <br />
          <em>Verify the change.</em>
        </h1>
        <p className="pf-lead">
          Tools help move the work forward. A repeatable process makes the
          result understandable.
        </p>
        <div className="pf-actions">
          <Link
            href="/examples#debugging"
            className="pf-button pf-button--green"
          >
            Explore a debugging example{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section
        className="pf-wrap pf-approach"
        aria-labelledby="approach-heading"
      >
        <h2 id="approach-heading" className="sr-only">
          From problem to verified behavior
        </h2>
        <ol>
          {steps.map(([title, description, result], index) => (
            <li key={title}>
              <span className="pf-approach-number">0{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="pf-approach-deliverable">{result}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="pf-wrap pf-regression-story">
        <div>
          <p className="pf-eyebrow">An example from this portfolio</p>
          <h2>
            Two strings.
            <br />
            <em>One overlooked duplicate.</em>
          </h2>
          <p>
            The import inspector accepts contact records. Different
            capitalization and extra whitespace can hide a repeated email
            address.
          </p>
          <Link href="/examples#debugging" className="pf-text-link">
            Compare the implementations{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="pf-test-card">
          <span className="pf-mono">REGRESSION CONTRACT</span>
          <pre>
            {
              "Input\n  alex@example.com\n   ALEX@EXAMPLE.COM \n\nExpected\n  1 ready row\n  Row 2: duplicate email\n\nRule\n  Normalize before comparing."
            }
          </pre>
          <a
            href={
              EXAMPLE_FILE_SOURCE + "/app/__tests__/api/portfolio-import.test.ts"
            }
            className="pf-text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Inspect the test <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section className="pf-bottom-cta pf-wrap">
        <p className="pf-eyebrow">AI-assisted development</p>
        <h2>
          Keep the reasoning
          <br />
          <em>close to the result.</em>
        </h2>
        <p>
          AI can help investigate, implement, and write tests. I aim to keep
          changes small enough to inspect and explain, then verify the behavior.
        </p>
        <div className="pf-actions">
          <Link href="/work" className="pf-button pf-button--green">
            Explore the application
          </Link>
          <Link href="/blog" className="pf-text-link">
            Read the notes <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
