import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Code2, Server, Bug } from "lucide-react";
import TaskBoard from "@/components/examples/TaskBoard";
import ImportInspector from "@/components/examples/ImportInspector";
import DebuggingLab from "@/components/examples/DebuggingLab";
import { EXAMPLE_FILE_SOURCE } from "@/lib/portfolio-examples";

export const metadata: Metadata = {
  title: "Working Examples — Abe Reyes",
  description:
    "Try a React task board, call a real Next.js validation API, and explore a reproducible debugging example.",
  alternates: { canonical: "/examples" },
};

export default function ExamplesPage() {
  return (
    <main id="main-content" className="pf-page">
      <section className="pf-page-intro pf-wrap">
        <p className="pf-eyebrow">
          <span /> The work, in your hands
        </p>
        <h1>
          Less explanation.
          <br />
          <em>More interaction.</em>
        </h1>
        <p className="pf-lead">
          Three small examples built for this portfolio. Change an input,
          inspect the behavior, and follow the code.
        </p>
        <nav className="pf-section-nav" aria-label="Examples on this page">
          <a href="#react">React interface</a>
          <a href="#import">Server API</a>
          <a href="#debugging">Debugging</a>
        </nav>
      </section>
      <section
        id="react"
        className="pf-example-section pf-wrap"
        aria-labelledby="react-heading"
      >
        <div className="pf-example-description">
          <p className="pf-number">
            <Code2 size={19} aria-hidden="true" /> 01 / FRONTEND
          </p>
          <h2 id="react-heading">
            An interface that
            <br />
            keeps up.
          </h2>
          <p>
            Add a task, change its status, filter the list, and reload. Progress
            follows the data.
          </p>
          <ul className="pf-skill-list">
            <li>React state and derived values</li>
            <li>Keyboard-accessible controls</li>
            <li>Browser storage with recovery</li>
          </ul>
          <a
            href={`${EXAMPLE_FILE_SOURCE}/app/components/examples/TaskBoard.tsx`}
            className="pf-text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the component <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <TaskBoard />
      </section>
      <section
        id="import"
        className="pf-example-section pf-example-section--wide pf-wrap"
        aria-labelledby="import-heading"
      >
        <div className="pf-example-heading">
          <div>
            <p className="pf-number">
              <Server size={19} aria-hidden="true" /> 02 / BACKEND
            </p>
            <h2 id="import-heading">
              Good data starts
              <br />
              at the boundary.
            </h2>
          </div>
          <div>
            <p>
              This interface calls a real server endpoint. It validates fields,
              normalizes email addresses, and catches duplicates before
              returning a preview.
            </p>
            <a
              href={`${EXAMPLE_FILE_SOURCE}/app/app/api/examples/import/route.ts`}
              className="pf-text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the route handler{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <ImportInspector />
      </section>
      <section
        id="debugging"
        className="pf-example-section pf-example-section--wide pf-wrap"
        aria-labelledby="debugging-heading"
      >
        <div className="pf-example-heading">
          <div>
            <p className="pf-number">
              <Bug size={19} aria-hidden="true" /> 03 / INVESTIGATION
            </p>
            <h2 id="debugging-heading">
              Reproduce it.
              <br />
              Then prove the fix.
            </h2>
          </div>
          <div>
            <p>
              A deliberately small bug: two versions of the same address slip
              past a raw string comparison. Switch implementations to see why.
            </p>
            <a
              href={`${EXAMPLE_FILE_SOURCE}/app/__tests__/api/portfolio-import.test.ts`}
              className="pf-text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the regression tests{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <DebuggingLab />
      </section>
      <section className="pf-bottom-cta pf-wrap">
        <p className="pf-eyebrow">Behind the examples</p>
        <h2>
          Small pieces.
          <br />A connected way of thinking.
        </h2>
        <p>
          Explore the larger application, or read how Abe approaches a problem
          across the stack.
        </p>
        <div className="pf-actions">
          <Link href="/work" className="pf-button pf-button--green">
            Explore the project
          </Link>
          <Link href="/how-it-works" className="pf-text-link">
            The development approach{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
