import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheckBig, Database, GitBranch, Layers3, Wrench } from "lucide-react";
import {
  getPublicHomeNextStep,
  type PublicHomeSectionId,
} from "@/lib/public-journey";

const buildSignals = [
  {
    icon: Layers3,
    label: "Full-stack builds",
    description: "Interfaces, server routes, data models, and the glue between them.",
  },
  {
    icon: Database,
    label: "Systems that hold together",
    description: "Authentication, permissions, durable state, APIs, and failure paths.",
  },
  {
    icon: Wrench,
    label: "Useful technical work",
    description: "The smallest working piece first, with the reasoning left visible.",
  },
] as const;

const workingPrinciples = [
  { title: "Understand the whole path", description: "I look past the visible bug to the people, data, and handoffs around it.", icon: GitBranch },
  { title: "Build the useful slice", description: "I choose a contained piece that can be tested, reviewed, and improved without pretending the whole system is finished.", icon: Wrench },
  { title: "Leave evidence behind", description: "The result should explain what changed, what was checked, and what still needs a decision.", icon: CircleCheckBig },
] as const;

function HomeNextStep({
  sectionId,
  light = false,
}: {
  sectionId: PublicHomeSectionId;
  light?: boolean;
}) {
  const nextStep = getPublicHomeNextStep(sectionId);
  if (!nextStep) return null;

  return (
    <Link
      href={nextStep.href}
      className={`homepage-link homepage-next-step${light ? " homepage-link--light" : ""}`}
    >
      {nextStep.label}
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

export default function HomePageClient() {
  return (
    <main id="main-content" className="homepage-trailer">
      <section className="homepage-hero" aria-labelledby="homepage-hero-heading">
        <div className="homepage-hero__glow homepage-hero__glow--gold" aria-hidden="true" />
        <div className="homepage-hero__glow homepage-hero__glow--green" aria-hidden="true" />
        <div className="homepage-hero__inner">
          <div className="homepage-hero__grid">
            <div className="homepage-hero__copy">
              <p className="homepage-eyebrow homepage-eyebrow--light">My work · NeedThisDone</p>
              <h1 id="homepage-hero-heading" className="homepage-hero__title">
                <span className="homepage-hero__title-line">I build</span>{" "}
                <span className="homepage-hero__title-line">across</span>{" "}
                <span className="homepage-hero__title-line">the stack.</span>
              </h1>
              <p className="homepage-hero__lead">
                I work on the parts that sit between a browser, a backend, a database,
                an API, and the person using the system.
              </p>
              <div className="homepage-hero__actions">
                <Link href="/work#case-studies" className="homepage-button homepage-button--gold">
                  See selected work
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="/about" className="homepage-button homepage-button--ghost">
                  How I think about systems
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="relative min-h-[18rem] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl md:min-h-[25rem]">
              <Image
                src="/images/portfolio-hero.png"
                alt="A laptop, paper notes, and connected visual ideas on a warm workbench"
                fill
                priority
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" aria-labelledby="capabilities-heading" className="homepage-section homepage-section--light">
        <div className="homepage-section__inner">
          <div className="homepage-section__intro homepage-section__intro--split">
            <div>
              <p className="homepage-eyebrow">Capabilities</p>
              <h2 id="capabilities-heading" className="homepage-heading homepage-heading--compact">
                The problems that sit between categories.
              </h2>
            </div>
            <p className="homepage-section__lead">
              My strength is moving between product surface, application logic, data,
              integrations, and the operational details that make software dependable.
            </p>
          </div>

          <div className="homepage-offer-grid">
            {buildSignals.map(({ icon: Icon, label, description }, index) => (
              <article key={label} className="homepage-offer-card">
                <div className="homepage-card-identity homepage-offer-card__identity">
                  <div className="homepage-offer-card__topline">
                    <span className="homepage-offer-card__number">0{index + 1}</span>
                    <span className="homepage-offer-card__icon"><Icon aria-hidden="true" /></span>
                  </div>
                  <p className="homepage-card-kicker">What I bring</p>
                  <h3>{label}</h3>
                </div>
                <div className="homepage-card-detail homepage-offer-card__detail">
                  <p className="homepage-offer-card__fit">{description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="homepage-section__actions">
            <Link href="/services" className="homepage-link">
              See the full capability map
              <ArrowRight aria-hidden="true" />
            </Link>
            <HomeNextStep sectionId="capabilities" />
          </div>
        </div>
      </section>

      <section id="featured-work" aria-labelledby="featured-work-heading" className="homepage-section homepage-section--dark">
        <div className="homepage-section__inner">
          <div className="homepage-section__intro">
            <p className="homepage-eyebrow homepage-eyebrow--light">Selected work</p>
            <h2 id="featured-work-heading" className="homepage-heading">
              Built systems, not just screens.
            </h2>
            <p className="homepage-section__lead">
              NeedThisDone is the main independent build: a public site, private workspace,
              APIs, database-backed state, approval boundaries, and delivery checks.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="homepage-teaser__card">
              <div className="homepage-card-identity homepage-teaser__identity">
                <div className="homepage-teaser__topline"><span className="homepage-teaser__number">01</span><GitBranch className="homepage-teaser__icon" aria-hidden="true" /></div>
                <p className="homepage-teaser__label">Featured build</p>
                <h3 className="homepage-teaser__title">NeedThisDone</h3>
              </div>
              <div className="homepage-card-detail homepage-teaser__detail"><p className="homepage-teaser__description">A full-stack control plane for requests, approvals, private work, evidence, and review.</p></div>
            </article>
            <article className="homepage-teaser__card">
              <div className="homepage-card-identity homepage-teaser__identity">
                <div className="homepage-teaser__topline"><span className="homepage-teaser__number">02</span><Database className="homepage-teaser__icon" aria-hidden="true" /></div>
                <p className="homepage-teaser__label">Workflow build</p>
                <h3 className="homepage-teaser__title">Content workflow</h3>
              </div>
              <div className="homepage-card-detail homepage-teaser__detail"><p className="homepage-teaser__description">A content pipeline that turned recurring preparation into a repeatable handoff.</p></div>
            </article>
            <article className="homepage-teaser__card">
              <div className="homepage-card-identity homepage-teaser__identity">
                <div className="homepage-teaser__topline"><span className="homepage-teaser__number">03</span><Wrench className="homepage-teaser__icon" aria-hidden="true" /></div>
                <p className="homepage-teaser__label">Technical notes</p>
                <h3 className="homepage-teaser__title">How the pieces fit</h3>
              </div>
              <div className="homepage-card-detail homepage-teaser__detail"><p className="homepage-teaser__description">Short notes on React, performance, data boundaries, and making complex work easier to understand.</p></div>
            </article>
          </div>

          <div className="homepage-section__actions">
            <Link href="/work#case-studies" className="homepage-link homepage-link--light">Open the project portfolio <ArrowRight aria-hidden="true" /></Link>
            <HomeNextStep sectionId="featured-work" light />
          </div>
        </div>
      </section>

      <section id="approach" aria-labelledby="approach-heading" className="homepage-section homepage-section--light">
        <div className="homepage-section__inner">
          <div className="homepage-section__intro">
            <p className="homepage-eyebrow">Approach</p>
            <h2 id="approach-heading" className="homepage-heading homepage-heading--compact">
              I make the next technical decision easier to see.
            </h2>
          </div>
          <ol className="homepage-principles">
            {workingPrinciples.map(({ title, description, icon: SignalIcon }, index) => (
              <li key={title} className="homepage-principle">
                <article className="homepage-principle__card">
                  <div className="homepage-card-identity homepage-principle__identity">
                    <div className="homepage-principle__topline"><span className="homepage-principle__number">0{index + 1}</span><span className="homepage-principle__signal" aria-hidden="true"><SignalIcon /></span></div>
                    <p className="homepage-card-kicker">How I work</p>
                    <h3>{title}</h3>
                  </div>
                  <div className="homepage-card-detail homepage-principle__detail"><p>{description}</p></div>
                </article>
              </li>
            ))}
          </ol>
          <div className="homepage-section__actions">
            <Link href="/about" className="homepage-link">Read more about my approach <ArrowRight aria-hidden="true" /></Link>
            <HomeNextStep sectionId="approach" />
          </div>
        </div>
      </section>

      <section id="notes" aria-labelledby="notes-heading" className="homepage-closing">
        <div className="homepage-closing__inner">
          <p className="homepage-eyebrow">Build notes</p>
          <h2 id="notes-heading" className="homepage-heading">The work is easier to trust when the reasoning is visible.</h2>
          <p>I write about the technical choices, small experiments, and lessons behind the builds.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/blog" className="homepage-button homepage-button--green">Read the notes <ArrowRight aria-hidden="true" /></Link>
            <Link href="/contact" className="homepage-button homepage-button--ghost">Start a conversation <ArrowRight aria-hidden="true" /></Link>
          </div>
          <HomeNextStep sectionId="notes" />
        </div>
      </section>
    </main>
  );
}
