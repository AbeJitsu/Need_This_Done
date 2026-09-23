import Link from "next/link";
import { ArrowRight, Database, Layers3, Wrench } from "lucide-react";
import PublicPageVisual from "@/components/public/PublicPageVisual";

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
    description: "Start with the smallest working piece, then show what changed and how it was checked.",
  },
] as const;

export default function HomePageClient() {
  return (
    <main id="main-content" className="homepage-trailer">
      <section className="homepage-hero" aria-labelledby="homepage-hero-heading">
        <div className="homepage-hero__glow homepage-hero__glow--gold" aria-hidden="true" />
        <div className="homepage-hero__glow homepage-hero__glow--green" aria-hidden="true" />
        <div className="homepage-hero__inner">
          <div className="homepage-hero__grid">
            <div className="homepage-hero__copy">
              <p className="homepage-eyebrow homepage-eyebrow--light">NeedThisDone · Independent technology practice</p>
              <h1 id="homepage-hero-heading" className="homepage-hero__title">
                <span className="homepage-hero__title-line">Practical software</span>{" "}
                <span className="homepage-hero__title-line">for messy</span>{" "}
                <span className="homepage-hero__title-line">problems.</span>
              </h1>
              <p className="homepage-hero__lead">
                NeedThisDone connects interfaces, backends, databases, APIs, and the
                people using the system.
              </p>
              <div className="homepage-hero__actions">
                <Link href="/contact" className="homepage-button homepage-button--gold">
                  Start a conversation <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="/work" className="homepage-button homepage-button--ghost">
                  See selected work <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            <PublicPageVisual kind="messy-problems" priority className="min-h-[18rem] md:min-h-[25rem]" />
          </div>
        </div>
      </section>

      <section id="capabilities" aria-labelledby="capabilities-heading" className="homepage-section homepage-section--light">
        <div className="homepage-section__inner homepage-section__inner--compact">
          <p className="homepage-eyebrow">Capabilities</p>
          <h2 id="capabilities-heading" className="homepage-heading homepage-heading--compact">
            Useful work across the stack.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {buildSignals.map(({ icon: Icon, label, description }) => (
              <article key={label} className="rounded-2xl border border-[var(--public-ink)]/10 bg-white/80 p-6">
                <Icon className="h-6 w-6 text-[var(--public-green)]" aria-hidden="true" />
                <h3 className="mt-5 font-playfair text-2xl font-black">{label}</h3>
                <p className="mt-3 leading-7 text-[var(--public-muted)]">{description}</p>
              </article>
            ))}
          </div>
          <Link href="/services" className="homepage-link homepage-link--standalone">
            Explore capabilities <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="featured-work" aria-labelledby="featured-work-heading" className="homepage-section homepage-section--dark">
        <div className="homepage-section__inner homepage-section__inner--compact">
          <p className="homepage-eyebrow homepage-eyebrow--light">Selected work</p>
          <h2 id="featured-work-heading" className="homepage-heading homepage-heading--compact">
            One build, many connected parts.
          </h2>
          <p className="homepage-section__lead">
            NeedThisDone is an independent build with a public site, private workspace,
            APIs, database-backed state, approval boundaries, and delivery checks.
          </p>
          <Link href="/work" className="homepage-link homepage-link--light homepage-link--standalone">
            Explore selected work <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="homepage-closing" aria-labelledby="homepage-closing-heading">
        <div className="homepage-closing__inner homepage-closing__inner--compact">
          <p className="homepage-eyebrow">Start here</p>
          <h2 id="homepage-closing-heading" className="homepage-heading">What would make your work easier?</h2>
          <p>A short description of the problem or the thing you want to build is enough to start.</p>
          <Link href="/contact" className="homepage-button homepage-button--green">
            Start a conversation <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
