import Image from "next/image";
import Link from "next/link";
import { Code2, ExternalLink, FileCode2, FlaskConical } from "lucide-react";
import { caseStudies } from "@/lib/portfolio-data";

const needThisDone = caseStudies.find((study) => study.id === "needthisdone")!;
const contentWorkflow = caseStudies.find(
  (study) => study.id === "content-workflow",
)!;
const codeRoot = "https://github.com/AbeJitsu/Need_This_Done";
const simpleSteps = [
  [
    "Start with the messy part",
    "A slow task, a confusing website, or an idea that needs a clearer shape.",
  ],
  [
    "Find the useful shape",
    "Define what the first helpful version needs to do.",
  ],
  [
    "Leave something reviewable",
    "A working path, a documented decision, and checks that someone else can follow.",
  ],
] as const;

export default function WorkPageClient() {
  return (
    <main
      id="main-content"
      className="studio-work bg-[var(--public-cream)] text-[var(--public-ink)]"
    >
      <section className="public-page-hero border-b border-[var(--public-ink)]/10 bg-[var(--public-dark)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="studio-kicker studio-kicker--light">
              Selected work · Abe Reyes
            </p>
            <h1 className="mt-5 font-playfair text-5xl font-black leading-tight">
              Useful things for messy problems.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-8 text-[#dce8dd]">
              Two projects. Different problems. The same attention to the
              interface, the data, and the handoff.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#case-studies"
                className="public-action studio-gold-button"
              >
                See the builds
              </Link>
              <a
                href={codeRoot}
                className="studio-text-link studio-text-link--light"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the code <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="relative aspect-video w-full min-w-0 overflow-hidden rounded-[1.25rem] border border-white/15">
            <Image
              src="/images/portfolio-hero.png"
              alt="A laptop, paper notes, and connected visual ideas on a warm workbench"
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section
        id="case-studies"
        className="public-section studio-case-studies"
        aria-labelledby="projects-heading"
      >
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">A closer look</p>
            <h2 id="projects-heading" className="studio-title">
              The work behind the words.
            </h2>
          </div>
          <span className="studio-index">01 — 02</span>
        </div>
        <article id="needthisdone" className="studio-case-study">
          <div className="studio-case-heading">
            <span className="studio-case-number">01</span>
            <div>
              <p className="studio-kicker">
                {needThisDone.role} · {needThisDone.period}
              </p>
              <h3>NeedThisDone</h3>
              <p>A full-stack system for reviewable work.</p>
            </div>
          </div>
          <div className="studio-case-grid">
            <div>
              <figure className="studio-browser">
                <div className="studio-browser-bar" aria-hidden="true">
                  <span className="studio-browser-mark" />
                  <span>needthisdone.com / notes</span>
                  <Code2 size={16} />
                </div>
                <div className="studio-browser-image">
                  <Image
                    src="/images/work/engineering-notes.webp"
                    alt="The NeedThisDone notes interface with its featured article and responsive reading layout"
                    width={1280}
                    height={900}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    unoptimized
                  />
                </div>
                <figcaption>Public interface / Engineering notes</figcaption>
              </figure>
              <div className="studio-evidence-links">
                <Link href="/blog" className="studio-text-link">
                  Explore the interface
                </Link>
                <Link href="/system" className="studio-text-link">
                  Read the system note
                </Link>
              </div>
            </div>
            <div className="studio-case-details">
              <dl>
                <div>
                  <dt>The problem</dt>
                  <dd>
                    Technical requests need a clear scope, durable records, and
                    a way to review the result.
                  </dd>
                </div>
                <div>
                  <dt>The contribution</dt>
                  <dd>
                    Independent application development across the public
                    interface, authenticated workspace, APIs, and data model.
                  </dd>
                </div>
                <div>
                  <dt>The implementation</dt>
                  <dd>
                    Accessible forms, authenticated routes, database
                    permissions, approval records, and recovery paths.
                  </dd>
                </div>
                <div>
                  <dt>Current stage</dt>
                  <dd>
                    The public site is available. The private workflow is under
                    development, with end-to-end execution still being verified.
                  </dd>
                </div>
              </dl>
              <div className="studio-tag-list">
                {needThisDone.tech.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          <div
            className="studio-source-links"
            aria-label="NeedThisDone source evidence"
          >
            <a
              href={`${codeRoot}/tree/dev/app/components`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileCode2 aria-hidden="true" size={20} />
              <span>
                <strong>Interface code</strong>
                <small>Components, forms, and page layouts</small>
              </span>
              <ExternalLink aria-hidden="true" size={16} />
            </a>
            <a
              href={`${codeRoot}/tree/dev/app/__tests__`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FlaskConical aria-hidden="true" size={20} />
              <span>
                <strong>Verification code</strong>
                <small>Route, component, and accessibility checks</small>
              </span>
              <ExternalLink aria-hidden="true" size={16} />
            </a>
          </div>
        </article>

        <article
          id="content-workflow"
          className="studio-case-study studio-case-study--content"
        >
          <div className="studio-case-heading">
            <span className="studio-case-number">02</span>
            <div>
              <p className="studio-kicker">
                {contentWorkflow.role} · {contentWorkflow.period}
              </p>
              <h3>Content workflow</h3>
              <p>Repeatable preparation. A reviewable handoff.</p>
            </div>
          </div>
          <div className="studio-case-grid">
            <div className="studio-workflow-panel">
              <p className="studio-kicker">The delivery path</p>
              <h4>
                From source material
                <br />
                to useful content.
              </h4>
              <ol className="studio-workflow-steps">
                {[
                  ["PDF source", "Variable educational source material"],
                  ["Extract and transform", "Convert content into clean HTML"],
                  ["Validate", "Check output and prepare migration"],
                  [
                    "Review and hand off",
                    "Document the result for the next person",
                  ],
                ].map(([title, description], index) => (
                  <li key={title}>
                    <span>0{index + 1}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="studio-case-details">
              <dl>
                <div>
                  <dt>The problem</dt>
                  <dd>
                    Recurring content preparation relied on variable source
                    documents and careful review.
                  </dd>
                </div>
                <div>
                  <dt>The contribution</dt>
                  <dd>
                    Built a PDF-to-HTML conversion pipeline, validation tools,
                    and data-migration tooling.
                  </dd>
                </div>
                <div>
                  <dt>The result</dt>
                  <dd>
                    Preparation became a documented, reusable workflow with
                    clear review and handoff steps.
                  </dd>
                </div>
              </dl>
              <div className="studio-tag-list">
                {contentWorkflow.tech.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <Link href="/about#experience" className="studio-text-link">
                See the experience behind the work
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="studio-approach border-y border-[var(--public-ink)]/10 bg-[var(--public-sand)]">
        <div className="public-section">
          <p className="studio-kicker">The working approach</p>
          <h2 className="studio-title">Making the next step feel obvious.</h2>
          <ol className="studio-approach-grid">
            {simpleSteps.map(([title, description], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="public-section text-center">
        <p className="studio-kicker">Work together</p>
        <h2 className="studio-title">
          A useful place to start a conversation.
        </h2>
        <p className="public-reading mx-auto mt-5 leading-7 text-[var(--public-muted)]">
          Discuss a technical role, a project, or the next problem worth
          solving.
        </p>
        <Link href="/contact" className="public-action mt-7">
          Start a conversation
        </Link>
      </section>
    </main>
  );
}
