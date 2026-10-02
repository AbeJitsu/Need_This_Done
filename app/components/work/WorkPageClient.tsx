import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { EXAMPLE_SOURCE } from "@/lib/portfolio-examples";

const layers = [
  [
    "Interface",
    "Responsive React components, accessible controls, navigation, and recoverable form states.",
    "app/components",
  ],
  [
    "Application",
    "Next.js route handlers, input validation, structured responses, and error handling.",
    "app/app/api",
  ],
  [
    "Data & access",
    "Postgres migrations, Supabase authentication, and owner-scoped access policies.",
    "supabase/migrations",
  ],
  [
    "Verification",
    "Unit, API, accessibility, and browser tests, with written release evidence.",
    "app/__tests__",
  ],
] as const;

export default function WorkPageClient() {
  return (
    <main id="main-content" className="pf-page">
      <section className="pf-page-intro pf-wrap">
        <p className="pf-eyebrow">
          <span /> Selected work / Independent development
        </p>
        <h1>
          One substantial build.
          <br />
          <em>Plenty to explore.</em>
        </h1>
        <p className="pf-lead">
          NeedThisDone is my own project. The code, public application, and
          working examples are available to inspect.
        </p>
        <div className="pf-actions">
          <Link href="/examples" className="pf-button pf-button--green">
            Try the examples <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <a
            href="https://github.com/AbeJitsu/Need_This_Done"
            className="pf-text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={17} aria-hidden="true" /> Open the code
          </a>
        </div>
      </section>
      <section
        id="case-studies"
        className="pf-wrap pf-work-case"
        aria-labelledby="project-title"
      >
        <article id="needthisdone">
          <div className="pf-case-identity">
            <div>
              <p className="pf-mono">01 / NEXT.JS APPLICATION</p>
              <h2 id="project-title">NeedThisDone</h2>
            </div>
            <div className="pf-case-tags">
              <span>Independent project</span>
              <span>Ongoing</span>
              <span>Source available</span>
            </div>
          </div>
          <div className="pf-case-image">
            <div className="pf-window-bar">
              <span />
              <span />
              <span />
              <p>needthisdone / working examples</p>
            </div>
            <div className="studio-browser-image">
              <Image
                src="/images/work/portfolio-examples.webp"
                alt="The working examples page, showing the interactive React task board and its accessible controls"
                width={1440}
                height={1000}
                sizes="(min-width: 1200px) 1100px, 100vw"
                unoptimized
              />
            </div>
          </div>
          <div className="pf-case-overview">
            <div>
              <h3>What I built</h3>
              <p>
                A deployed web application connecting interfaces, server
                endpoints, authentication, and database-backed records. The
                portfolio examples make a few of those behaviors easy to try.
              </p>
            </div>
            <div>
              <h3>My contribution</h3>
              <p>
                Independent design and development, using AI-assisted tools to
                investigate, implement, and verify changes. The repository
                records the implementation and checks.
              </p>
            </div>
            <div>
              <h3>Current scope</h3>
              <p>
                The public site and examples are available to use. The separate
                agent-execution experiment is paused; a complete live worker
                workflow remains unproven.
              </p>
            </div>
          </div>
          <div className="pf-case-stack">
            {[
              "React",
              "Next.js",
              "TypeScript",
              "Supabase",
              "PostgreSQL",
              "Vitest",
              "Playwright",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </section>
      <section
        className="pf-wrap pf-code-section"
        aria-labelledby="layers-heading"
      >
        <div className="pf-section-heading">
          <div>
            <p className="pf-eyebrow">Follow the implementation</p>
            <h2 id="layers-heading">
              From the screen
              <br />
              <em>to the source.</em>
            </h2>
          </div>
          <p>
            Explore a layer directly. Database and private-workflow code is
            available for review; public examples identify their own execution
            and storage boundaries.
          </p>
        </div>
        <div className="pf-code-grid">
          {layers.map(([title, description, path], index) => (
            <a
              key={title}
              href={EXAMPLE_SOURCE + "/" + path}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="pf-mono">
                0{index + 1} / <ArrowUpRight size={17} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <code>{path}</code>
            </a>
          ))}
        </div>
      </section>
      <section className="pf-wrap pf-work-context">
        <div>
          <p className="pf-eyebrow">Related experience</p>
          <h2>
            Content workflows
            <br />
            <em>and technical support.</em>
          </h2>
        </div>
        <div>
          <p>
            At Acadio, my work included content conversion, validation, and
            migration tooling. That employer’s implementation belongs in my
            experience history; the inspectable project here is NeedThisDone.
          </p>
          <Link href="/about#experience" className="pf-text-link">
            Read the experience summary{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/system" className="pf-quiet-link">
            Background on the paused system experiment
          </Link>
        </div>
      </section>
      <section className="pf-bottom-cta pf-wrap">
        <p className="pf-eyebrow">Continue exploring</p>
        <h2>
          See how I approach
          <br />
          <em>the next problem.</em>
        </h2>
        <div className="pf-actions">
          <Link href="/how-it-works" className="pf-button pf-button--green">
            Read the approach
          </Link>
          <Link href="/contact" className="pf-text-link">
            Contact Abe <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
