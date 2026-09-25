import Link from "next/link";
import { ArrowRight, Database, Layers3, Wrench } from "lucide-react";
import PublicPageVisual from "@/components/public/PublicPageVisual";
import LivePageCheck from "@/components/home/LivePageCheck";

const buildSignals = [
  {
    icon: Layers3,
    label: "React interfaces",
    description: "Responsive pages, accessible forms, and dashboards people can use.",
  },
  {
    icon: Database,
    label: "JavaScript backends",
    description: "API routes, integrations, data models, and reliable server-side checks.",
  },
  {
    icon: Wrench,
    label: "Troubleshooting and delivery",
    description: "Trace the problem, explain the fix, and verify that it works.",
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
              <p className="homepage-eyebrow homepage-eyebrow--light">Abe Reyes · Full-stack development and technical support</p>
              <h1 id="homepage-hero-heading" className="homepage-hero__title">
                <span className="homepage-hero__title-line">Build it.</span>{" "}
                <span className="homepage-hero__title-line">Connect it.</span>{" "}
                <span className="homepage-hero__title-line">Make it work.</span>
              </h1>
              <p className="homepage-hero__lead">
                NeedThisDone shows the work of Abe Reyes: React interfaces,
                JavaScript APIs, database-backed features, and the troubleshooting
                that makes software useful to people.
              </p>
              <div className="homepage-hero__actions">
                <Link href="#live-demo" className="homepage-button homepage-button--gold">
                  Try the live demo <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="/work" className="homepage-button homepage-button--ghost">
                  See selected work <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            <PublicPageVisual kind="messy-problems" priority />
          </div>
        </div>
      </section>

      <section id="capabilities" aria-labelledby="capabilities-heading" className="homepage-section homepage-section--light">
        <div className="homepage-section__inner homepage-section__inner--compact">
          <p className="homepage-eyebrow">Capabilities</p>
          <h2 id="capabilities-heading" className="homepage-heading homepage-heading--compact">
            What this work covers.
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

      <section className="homepage-section homepage-section--sand" aria-label="Live front-end and back-end demonstration">
        <div className="homepage-section__inner homepage-section__inner--compact">
          <LivePageCheck />
        </div>
      </section>

      <section id="featured-work" aria-labelledby="featured-work-heading" className="homepage-section homepage-section--dark">
        <div className="homepage-section__inner homepage-section__inner--compact">
          <p className="homepage-eyebrow homepage-eyebrow--light">Selected work</p>
          <h2 id="featured-work-heading" className="homepage-heading homepage-heading--compact">
            Work you can inspect.
          </h2>
          <p className="homepage-section__lead">
            Explore the site, its code, a content workflow, and the practical checks
            used to ship responsive pages and working APIs.
          </p>
          <Link href="/work" className="homepage-link homepage-link--light homepage-link--standalone">
            Explore selected work <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="homepage-closing" aria-labelledby="homepage-closing-heading">
        <div className="homepage-closing__inner homepage-closing__inner--compact">
          <p className="homepage-eyebrow">Start here</p>
          <h2 id="homepage-closing-heading" className="homepage-heading">Looking for someone who can make it work?</h2>
          <p>For a technical role or a project, reach Abe directly or explore the code.</p>
          <div className="homepage-hero__actions">
            <a href="mailto:hello@needthisdone.com?subject=Technical%20opportunity" className="homepage-button homepage-button--green">
              Contact Abe <ArrowRight aria-hidden="true" />
            </a>
            <a href="https://github.com/AbeJitsu/Need_This_Done" target="_blank" rel="noopener noreferrer" className="homepage-button homepage-button--ghost">
              View GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
