import Link from "next/link";
import { ArrowRight, Eye, Sparkles, Target } from "lucide-react";
import { Fragment } from "react";
import {
  getPublicHomeNextStep,
  type PublicHomeSectionId,
} from "@/lib/public-journey";
import {
  getPublicExampleHref,
  PUBLIC_EXAMPLES,
  PUBLIC_EXAMPLE_IDS,
  PUBLIC_EXAMPLE_TITLES,
  PUBLIC_OFFERS,
  type PublicOfferId,
} from "@/lib/public-offers";

type TeaserBeat = {
  number: string;
  label: string;
  title: string;
  description: string;
  icon: "eye" | "target" | "sparkles";
  highlighted?: boolean;
};

type OfferPreview = {
  id: PublicOfferId;
  number: string;
  icon: TeaserBeat["icon"];
};

const teaserBeats: readonly TeaserBeat[] = [
  {
    number: "01",
    label: "Start here",
    title: "Tell us what’s stuck",
    description:
      "A confusing page? A task you keep chasing? Start there.",
    icon: "eye",
  },
  {
    number: "02",
    label: "Picture the result",
    title: "Choose what to change",
    description:
      "We agree on what should improve, what we will do, and the price.",
    icon: "target",
    highlighted: true,
  },
  {
    number: "03",
    label: "Make the move",
    title: "Make it real",
    description:
      "You approve the work. We complete it and show you what changed.",
    icon: "sparkles",
  },
] as const;

const offerPreviews: readonly OfferPreview[] = [
  {
    id: "website-improvement",
    number: "01",
    icon: "target",
  },
  {
    id: "ai-operator",
    number: "02",
    icon: "sparkles",
  },
] as const;

const principles = [
  {
    number: "01",
    icon: "eye",
    title: "Listen first",
    description:
      "You can bring the problem exactly as it is. We listen before we start suggesting answers.",
  },
  {
    number: "02",
    icon: "target",
    title: "Agree on the result",
    description:
      "Before work begins, you see what we will resolve, what it costs, and what is included.",
  },
  {
    number: "03",
    icon: "sparkles",
    title: "Start with the right piece",
    description:
      "We take on the first useful piece instead of making the work bigger than it needs to be.",
  },
  {
    number: "04",
    icon: "target",
    title: "Be direct about what will help",
    description:
      "If something needs a different kind of help, we say so early and plainly.",
  },
] as const;

const bridgeNodes = [
  {
    number: "01",
    title: "Clear goal",
    description: "Name the outcome before the work begins.",
    icon: "target",
  },
  {
    number: "02",
    title: "Agreed next step",
    description: "Keep the next step focused and understandable.",
    icon: "sparkles",
    highlighted: true,
  },
  {
    number: "03",
    title: "Visible result",
    description: "Return a change the owner can review.",
    icon: "eye",
  },
] as const;

function TeaserIcon({
  name,
  className = "h-5 w-5",
}: {
  name: TeaserBeat["icon"];
  className?: string;
}) {
  switch (name) {
    case "eye":
      return <Eye className={className} aria-hidden="true" />;
    case "target":
      return <Target className={className} aria-hidden="true" />;
    case "sparkles":
      return <Sparkles className={className} aria-hidden="true" />;
  }
}

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
              <h1 id="homepage-hero-heading" className="homepage-hero__title">
                <span className="homepage-hero__title-line">Your vision,</span>{" "}
                <span className="homepage-hero__title-line">brought</span>{" "}
                <span className="homepage-hero__title-line">to life.</span>
              </h1>
              <p className="homepage-hero__lead">
                Bring us the problem. We’ll find the real issue, agree on the
                work, and help fix it.
              </p>
              <div className="homepage-hero__actions">
                <Link href="/contact" className="homepage-button homepage-button--gold">
                  Share Your Vision
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="#what-we-do" className="homepage-button homepage-button--ghost">
                  Follow the path
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section
        id="what-we-do"
        aria-labelledby="what-we-do-heading"
        className="homepage-section homepage-section--light"
      >
        <div className="homepage-section__inner">
          <div className="homepage-section__intro homepage-section__intro--split">
            <div>
              <p className="homepage-eyebrow">What we do</p>
              <h2 id="what-we-do-heading" className="homepage-heading homepage-heading--compact">
                Technology problems. Repeated work. Let&apos;s get things working better.
              </h2>
            </div>
            <p className="homepage-section__lead">
              Websites, workflows, and tools are all good places to start.
              Focus keeps the work clear. It does not limit what you can bring.
            </p>
          </div>

          <div className="homepage-offer-grid">
            {offerPreviews.map((preview) => {
              const offer = PUBLIC_OFFERS[preview.id];
              return (
                <article key={preview.id} className="homepage-offer-card">
                  <div className="homepage-card-identity homepage-offer-card__identity">
                    <div className="homepage-offer-card__topline">
                      <span className="homepage-offer-card__number">{preview.number}</span>
                      <span className="homepage-offer-card__icon">
                        <TeaserIcon name={preview.icon} />
                      </span>
                    </div>
                    <p className="homepage-card-kicker">Starting point</p>
                    <h3>{offer.name}</h3>
                  </div>
                  <div className="homepage-card-detail homepage-offer-card__detail">
                    <p className="homepage-offer-card__fit">{offer.fit}</p>
                    <Link href={offer.detailHref} className="homepage-link">
                      See how {offer.name} works
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                  {preview !== offerPreviews[offerPreviews.length - 1] && (
                    <span className="homepage-offer-card__connector" aria-hidden="true">
                      <ArrowRight />
                    </span>
                  )}
                </article>
              );
            })}
          </div>
          <HomeNextStep sectionId="what-we-do" />
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="homepage-section homepage-section--dark"
      >
        <div className="homepage-section__inner">
          <div className="homepage-section__intro homepage-section__intro--split">
            <div>
              <p className="homepage-eyebrow homepage-eyebrow--light">How we work</p>
              <h2 id="how-it-works-heading" className="homepage-heading homepage-heading--compact">
                From stuck to working better.
              </h2>
            </div>
            <p className="homepage-section__lead">
              Start with the messy version. We find the issue, agree on the fix,
              and show what changed.
            </p>
          </div>

          <figure className="homepage-teaser" aria-labelledby="homepage-teaser-caption">
            <div className="homepage-teaser__header">
              <div>
                <p className="homepage-teaser__kicker">A clearer way to begin</p>
                <figcaption id="homepage-teaser-caption" className="homepage-teaser__caption">
                  From stuck to done
                </figcaption>
              </div>
              <span className="homepage-teaser__status">
                <span aria-hidden="true" /> keep it focused
              </span>
            </div>
            <ol className="homepage-teaser__path" aria-label="Three beats for moving a problem forward">
              {teaserBeats.map((beat, index) => (
                <li
                  key={beat.number}
                  className={`homepage-teaser__stage${beat.highlighted ? " homepage-teaser__stage--better" : ""}`}
                >
                  <article className="homepage-teaser__card">
                    <div className="homepage-card-identity homepage-teaser__identity">
                      <div className="homepage-teaser__topline">
                        <span className="homepage-teaser__number">{beat.number}</span>
                        <span className="homepage-teaser__icon">
                          <TeaserIcon name={beat.icon} />
                        </span>
                      </div>
                      <p className="homepage-teaser__label">{beat.label}</p>
                      <h3 className="homepage-teaser__title">{beat.title}</h3>
                    </div>
                    <div className="homepage-card-detail homepage-teaser__detail">
                      <p className="homepage-teaser__description">{beat.description}</p>
                    </div>
                  </article>
                  {index < teaserBeats.length - 1 && (
                    <span className="homepage-teaser__connector" aria-hidden="true">
                      <span className="homepage-teaser__connector-dot" />
                      <ArrowRight />
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </figure>
          <div className="homepage-section__actions">
            <HomeNextStep sectionId="how-it-works" light />
            <Link href="/how-it-works" className="homepage-link homepage-link--light">
              See the full process
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="the-system"
        className="homepage-bridge"
        aria-labelledby="homepage-bridge-heading"
      >
        <div className="homepage-bridge__inner">
          <div className="homepage-bridge__copy">
            <p className="homepage-eyebrow homepage-eyebrow--light">The system</p>
            <h2 id="homepage-bridge-heading" className="homepage-heading">
              Keep the problem, work, and result connected.
            </h2>
            <p>
              See how a problem becomes approved work. The deeper page explains
              the private system and the result you can review.
            </p>
            <div className="homepage-bridge__actions">
              <Link href="/system" className="homepage-button homepage-button--gold">
                Inspect the system behind the work
                <ArrowRight aria-hidden="true" />
              </Link>
              <HomeNextStep sectionId="the-system" light />
            </div>
          </div>
          <div className="homepage-bridge__visual" aria-hidden="true">
            {bridgeNodes.map((node, index) => (
              <Fragment key={node.number}>
                <div className={`homepage-bridge__node${"highlighted" in node && node.highlighted ? " homepage-bridge__node--gold" : ""}`}>
                  <div className="homepage-bridge__node-identity">
                    <div className="homepage-bridge__node-topline">
                      <span>{node.number}</span>
                      <span className="homepage-bridge__node-icon">
                        <TeaserIcon name={node.icon} />
                      </span>
                    </div>
                    <strong>{node.title}</strong>
                  </div>
                  <p className="homepage-bridge__node-detail">{node.description}</p>
                </div>
                {index < bridgeNodes.length - 1 && (
                  <span className="homepage-bridge__line" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section
        id="examples"
        aria-labelledby="examples-heading"
        className="homepage-section homepage-section--light"
      >
        <div className="homepage-section__inner">
          <div className="homepage-section__intro">
            <p className="homepage-eyebrow">Illustrative examples</p>
            <h2 id="examples-heading" className="homepage-heading homepage-heading--compact">
              What better can look like.
            </h2>
            <p className="homepage-section__lead">
              Three short glimpses. Read the full examples on this page.
            </p>
          </div>

          <div className="homepage-example-grid">
            {PUBLIC_EXAMPLE_IDS.map((exampleId, index) => {
              const example = PUBLIC_EXAMPLES[exampleId];
              const title = PUBLIC_EXAMPLE_TITLES[exampleId];
              return (
                <article key={exampleId} className="homepage-example-card">
                  <div className="homepage-card-identity homepage-example-card__identity">
                    <div className="homepage-example-card__topline">
                      <span className="homepage-example-card__number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="homepage-example-card__icon">
                        <TeaserIcon
                          name={index === 0 ? "eye" : index === 1 ? "target" : "sparkles"}
                        />
                      </span>
                    </div>
                    <p className="homepage-card-kicker">Example</p>
                    <h3>{title}</h3>
                  </div>
                  <div className="homepage-card-detail homepage-example-card__detail">
                    <p className="homepage-example-card__teaser">{example.before}</p>
                    <Link href={getPublicExampleHref(exampleId)} className="homepage-link">
                      Explore this example: {title}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                  {index < PUBLIC_EXAMPLE_IDS.length - 1 && (
                    <span className="homepage-example-card__connector" aria-hidden="true">
                      <ArrowRight />
                    </span>
                  )}
                </article>
              );
            })}
          </div>
          <div className="homepage-section__actions">
            <HomeNextStep sectionId="examples" />
            <Link href="/work" className="homepage-link">
              See more examples
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="why-us"
        aria-labelledby="why-us-heading"
        className="homepage-section homepage-section--dark"
      >
        <div className="homepage-section__inner">
          <div className="homepage-section__intro">
            <p className="homepage-eyebrow homepage-eyebrow--light">Why us</p>
            <h2 id="why-us-heading" className="homepage-heading">
              Good work starts by understanding the problem.
            </h2>
            <p className="homepage-section__lead">
              We keep the work focused. You see what we will do and what changed.
              The Why Us page explains the standards behind that approach.
            </p>
          </div>

          <ol className="homepage-principles">
            {principles.map((principle, index) => (
              <li key={principle.number} className="homepage-principle">
                <article className="homepage-principle__card">
                  <div className="homepage-card-identity homepage-principle__identity">
                    <div className="homepage-principle__topline">
                      <span className="homepage-principle__number">{principle.number}</span>
                      <span className="homepage-principle__signal" aria-hidden="true">
                        <TeaserIcon name={principle.icon} />
                      </span>
                    </div>
                    <p className="homepage-card-kicker">Our approach</p>
                    <h3>{principle.title}</h3>
                  </div>
                  <div className="homepage-card-detail homepage-principle__detail">
                    <p>{principle.description}</p>
                  </div>
                </article>
                {index < principles.length - 1 && (
                  <span className="homepage-principle__connector" aria-hidden="true">
                    <ArrowRight />
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="homepage-section__actions">
            <HomeNextStep sectionId="why-us" light />
            <Link href="/about" className="homepage-link homepage-link--light">
              See why we work this way
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="share-your-vision"
        className="homepage-closing"
        aria-labelledby="homepage-closing-heading"
      >
        <div className="homepage-closing__inner">
          <p className="homepage-eyebrow">The next move</p>
          <h2 id="homepage-closing-heading" className="homepage-heading">
            You do not have to have it all figured out.
          </h2>
          <p>
            Share what is getting in the way. We will help you choose the right
            first piece.
          </p>
          <Link href="/contact" className="homepage-button homepage-button--green">
            Share Your Vision
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
