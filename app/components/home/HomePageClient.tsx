import Image from "next/image";
import Link from "next/link";
import { Code2, Database, Layers3, Wrench } from "lucide-react";
import PublicPageVisual from "@/components/public/PublicPageVisual";

const buildSignals = [
  {
    icon: Layers3,
    label: "Full-stack builds",
    description:
      "Interfaces, server routes, data models, and the glue between them.",
    detail: "React · Next.js · TypeScript",
  },
  {
    icon: Database,
    label: "Systems that hold together",
    description:
      "Authentication, permissions, durable state, APIs, and failure paths.",
    detail: "Postgres · Supabase · Redis",
  },
  {
    icon: Wrench,
    label: "Useful technical work",
    description:
      "Start with the smallest working piece, then show what changed and how it was checked.",
    detail: "Testing · Accessibility · Delivery",
  },
] as const;

export default function HomePageClient() {
  return (
    <main id="main-content" className="homepage-trailer">
      <section
        className="homepage-hero"
        aria-labelledby="homepage-hero-heading"
      >
        <div className="homepage-hero__inner">
          <div className="homepage-hero__grid">
            <div className="homepage-hero__copy">
              <p className="homepage-eyebrow homepage-eyebrow--light">
                Abe Reyes · Independent developer
              </p>
              <h1 id="homepage-hero-heading" className="homepage-hero__title">
                <span className="homepage-hero__title-line">
                  Practical software
                </span>{" "}
                <span className="homepage-hero__title-line">for messy</span>{" "}
                <span className="homepage-hero__title-line homepage-hero__title-line--accent">
                  problems.
                </span>
              </h1>
              <p className="homepage-hero__lead">
                NeedThisDone connects interfaces, backends, databases, APIs, and
                the people using the system.
              </p>
              <div className="homepage-hero__actions">
                <Link
                  href="/work"
                  className="homepage-button homepage-button--gold"
                >
                  See selected work
                </Link>
                <Link
                  href="/contact"
                  className="homepage-button homepage-button--ghost"
                >
                  Start a conversation
                </Link>
              </div>
              <p className="studio-hero-note">
                Software development. Technical operations. A practical
                understanding of the people doing the work.
              </p>
            </div>
            <figure className="studio-hero-figure">
              <PublicPageVisual kind="messy-problems" priority />
              <figcaption>
                <span>01 / Find the useful shape</span>
                <span>NeedThisDone</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="featured-work"
        aria-labelledby="featured-work-heading"
        className="homepage-section homepage-section--light"
      >
        <div className="homepage-section__inner studio-section">
          <div className="studio-section-heading">
            <div>
              <p className="homepage-eyebrow">Selected work / 01</p>
              <h2
                id="featured-work-heading"
                className="homepage-heading homepage-heading--compact"
              >
                One build, many connected parts.
              </h2>
            </div>
            <Link href="/work" className="studio-text-link">
              Explore selected work
            </Link>
          </div>
          <div className="studio-featured">
            <Link
              href="/work#needthisdone"
              className="studio-browser studio-browser--home"
              aria-label="Explore the NeedThisDone project"
            >
              <div className="studio-browser-bar" aria-hidden="true">
                <span className="studio-browser-mark" />
                <span>needthisdone.com / contact</span>
                <Code2 size={16} />
              </div>
              <div className="studio-browser-image">
                <Image
                  src="/images/work/project-intake.webp"
                  alt="The NeedThisDone contact interface with its project message and accessible form controls"
                  width={1280}
                  height={900}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  unoptimized
                />
              </div>
            </Link>
            <div className="studio-featured-copy">
              <p className="studio-kicker">Full-stack application · Ongoing</p>
              <h3>NeedThisDone</h3>
              <p>
                A public website and private workspace, with APIs,
                database-backed state, approval boundaries, and delivery checks.
              </p>
              <dl className="studio-project-facts">
                <div>
                  <dt>Contribution</dt>
                  <dd>Independent design and development</dd>
                </div>
                <div>
                  <dt>Built with</dt>
                  <dd>React, Next.js, TypeScript, Supabase</dd>
                </div>
              </dl>
              <Link href="/work#needthisdone" className="studio-text-link">
                Explore the project
              </Link>
              <Link
                href="/work#content-workflow"
                className="studio-related-project"
              >
                <span>Also selected</span>
                <strong>Content workflow</strong>
                <span>Python · Content validation</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="capabilities"
        aria-labelledby="capabilities-heading"
        className="homepage-section homepage-section--dark"
      >
        <div className="homepage-section__inner studio-section">
          <div className="studio-section-heading">
            <div>
              <p className="homepage-eyebrow homepage-eyebrow--light">
                Capabilities / 02
              </p>
              <h2
                id="capabilities-heading"
                className="homepage-heading homepage-heading--compact"
              >
                Useful work across the stack.
              </h2>
            </div>
            <Link
              href="/services"
              className="studio-text-link studio-text-link--light"
            >
              Explore capabilities
            </Link>
          </div>
          <div className="studio-capability-grid">
            {buildSignals.map(
              ({ icon: Icon, label, description, detail }, index) => (
                <article key={label} className="studio-capability">
                  <div className="studio-capability-top">
                    <span>0{index + 1}</span>
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h3>{label}</h3>
                  <p>{description}</p>
                  <p className="studio-capability-detail">{detail}</p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="homepage-closing"
        aria-labelledby="homepage-closing-heading"
      >
        <div className="homepage-closing__inner homepage-closing__inner--compact">
          <p className="homepage-eyebrow">The next conversation</p>
          <h2 id="homepage-closing-heading" className="homepage-heading">
            Good work starts with a useful question.
          </h2>
          <p>
            Discuss a technical role, a project, or a problem worth solving.
          </p>
          <Link
            href="/contact"
            className="homepage-button homepage-button--green"
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
