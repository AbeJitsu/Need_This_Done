import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Server,
  Bug,
  Github,
} from "lucide-react";
import TaskBoard from "@/components/examples/TaskBoard";

const examples = [
  {
    number: "01",
    icon: Code2,
    title: "An interface you can use.",
    description:
      "Add tasks, change their status, and watch the progress update.",
    detail: "React · TypeScript · Browser state",
    href: "/examples#react",
    className: "pf-preview--board",
  },
  {
    number: "02",
    icon: Server,
    title: "A backend you can inspect.",
    description:
      "Send sample data to a real API. See validation, normalization, and errors.",
    detail: "Next.js · API routes · Validation",
    href: "/examples#import",
    className: "pf-preview--api",
  },
  {
    number: "03",
    icon: Bug,
    title: "A fix you can follow.",
    description:
      "Reproduce a duplicate-data bug. Compare the behavior before and after.",
    detail: "Investigation · Regression tests",
    href: "/examples#debugging",
    className: "pf-preview--debug",
  },
] as const;

export default function HomePageClient() {
  return (
    <main id="main-content" className="pf-page pf-home">
      <section className="pf-home-hero pf-wrap" aria-labelledby="home-heading">
        <div className="pf-hero-copy">
          <p className="pf-eyebrow">
            <span /> Abe Reyes / Developer &amp; problem solver
          </p>
          <h1 id="home-heading">
            Build the useful thing.
            <br />
            <em>
              Understand why
              <br />
              it works.
            </em>
          </h1>
          <p className="pf-lead">
            I build web applications and work through the problems between
            interfaces, APIs, and data. This is a place to explore what I can
            build and how I think.
          </p>
          <div className="pf-actions">
            <Link href="/examples" className="pf-button pf-button--green">
              Try the working examples{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/work" className="pf-text-link">
              Explore the project <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="pf-hero-context">
            <span>Based in Orlando, Florida</span>
            <span>Independent development + technical support</span>
          </div>
        </div>
        <div className="pf-hero-workbench">
          <div className="pf-workbench-caption">
            <span className="pf-mono">A SMALL PIECE OF THE WORK</span>
            <span className="pf-live-label">
              <span /> Try the controls
            </span>
          </div>
          <TaskBoard compact />
          <div className="pf-workbench-foot">
            <span className="pf-mono">INPUT → STATE → INTERFACE</span>
            <Link href="/examples#react">
              Open the full example{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="pf-stack-strip">
            <span>React</span>
            <span>Next.js</span>
            <span>TypeScript</span>
            <span>Postgres</span>
          </div>
        </div>
      </section>
      <section
        id="working-examples"
        className="pf-feature-section pf-wrap"
        aria-labelledby="examples-heading"
      >
        <div className="pf-section-heading">
          <div>
            <p className="pf-eyebrow">Explore / 01</p>
            <h2 id="examples-heading">
              A few things
              <br />
              <em>you can actually try.</em>
            </h2>
          </div>
          <p>
            Start anywhere. Each example connects a visible behavior to the code
            behind it.
          </p>
        </div>
        <div className="pf-example-cards">
          {examples.map(({ icon: Icon, ...example }) => (
            <Link
              key={example.number}
              href={example.href}
              className="pf-example-card"
            >
              <div
                className={"pf-card-preview " + example.className}
                aria-hidden="true"
              >
                {example.number === "01" ? (
                  <div className="pf-mini-board">
                    <span />
                    <span />
                    <span />
                    <i>3 tasks · 1 complete</i>
                  </div>
                ) : example.number === "02" ? (
                  <div className="pf-mini-api">
                    <span>POST /api/examples/import</span>
                    <strong>
                      200 <small>OK</small>
                    </strong>
                    <code>{'{ "ok": true }'}</code>
                  </div>
                ) : (
                  <div className="pf-mini-debug">
                    <span>reproduce</span>
                    <span>normalize</span>
                    <strong>✓ duplicate detected</strong>
                  </div>
                )}
              </div>
              <div className="pf-card-copy">
                <div className="pf-card-top">
                  <span className="pf-mono">
                    {example.number} / <Icon size={15} />
                  </span>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </div>
                <h3>{example.title}</h3>
                <p>{example.description}</p>
                <span className="pf-card-detail">{example.detail}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section
        id="featured-work"
        className="pf-project-band"
        aria-labelledby="project-heading"
      >
        <div className="pf-wrap pf-project-band-inner">
          <div>
            <p className="pf-eyebrow">The larger build / 02</p>
            <h2 id="project-heading">
              One project.
              <br />
              <em>Many connected layers.</em>
            </h2>
            <p>
              NeedThisDone is my independent application: public interfaces,
              server routes, authentication, database models, and tests. Explore
              the source and the decisions behind it.
            </p>
            <div className="pf-actions">
              <Link href="/work" className="pf-button pf-button--gold">
                Explore selected work{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a
                href="https://github.com/AbeJitsu/Need_This_Done"
                className="pf-text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={17} aria-hidden="true" /> Browse the repository
              </a>
            </div>
          </div>
          <div className="pf-layer-map" aria-label="Application layers">
            <div>
              <span>01</span>
              <strong>Interface</strong>
              <p>React components · Responsive layouts</p>
            </div>
            <div>
              <span>02</span>
              <strong>Application</strong>
              <p>Next.js routes · Validation · Error handling</p>
            </div>
            <div>
              <span>03</span>
              <strong>Data</strong>
              <p>Postgres models · Authentication · Ownership</p>
            </div>
            <div>
              <span>04</span>
              <strong>Verification</strong>
              <p>Unit tests · Accessibility · Browser checks</p>
            </div>
          </div>
        </div>
      </section>
      <section
        className="pf-about-preview pf-wrap"
        aria-labelledby="about-preview-heading"
      >
        <div>
          <p className="pf-eyebrow">The person behind the work / 03</p>
          <h2 id="about-preview-heading">
            Technical work.
            <br />
            <em>A human perspective.</em>
          </h2>
        </div>
        <div>
          <p>
            My background spans customer-facing work, onboarding, and technical
            support. It shapes how I investigate problems and build interfaces
            people can understand.
          </p>
          <div className="pf-actions">
            <Link href="/about" className="pf-text-link">
              Meet Abe <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/how-it-works" className="pf-text-link">
              See the development approach{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <Link href="/contact" className="pf-contact-line">
            Have a role or project in mind? Let’s talk.{" "}
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
