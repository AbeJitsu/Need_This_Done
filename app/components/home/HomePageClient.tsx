import Link from "next/link";
import { ArrowRight, Eye, Sparkles, Target } from "lucide-react";
import { Fragment } from "react";
import { PUBLIC_OFFERS, type PublicOfferId } from "@/lib/public-offers";

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
  problem: string;
  linkLabel: string;
};

type ExampleFrame = {
  number: string;
  icon: TeaserBeat["icon"];
  href: string;
  title: string;
  happening: string;
  tried: string;
  after: string;
};

const teaserBeats: readonly TeaserBeat[] = [
  {
    number: "01",
    label: "Start here",
    title: "See the friction",
    description:
      "Start with what is getting in the way. A clear starting point keeps the next conversation grounded.",
    icon: "eye",
  },
  {
    number: "02",
    label: "Name the shift",
    title: "Define better",
    description:
      "Name the result worth moving toward. That gives the first piece of work a direction everyone can see.",
    icon: "target",
    highlighted: true,
  },
  {
    number: "03",
    label: "Make the move",
    title: "Make it real",
    description:
      "Resolve one focused piece and show the change. A focused handoff makes the progress easier to review.",
    icon: "sparkles",
  },
] as const;

const offerPreviews: readonly OfferPreview[] = [
  {
    id: "website-improvement",
    number: "01",
    icon: "target",
    problem: "An important page feels unclear, slow, inaccessible, or difficult to use.",
    linkLabel: "See how Website Fix works",
  },
  {
    id: "ai-operator",
    number: "02",
    icon: "sparkles",
    problem: "A recurring task keeps crossing inboxes, notes, and tools without a dependable path.",
    linkLabel: "See how repeated work can change",
  },
] as const;

const principles = [
  {
    number: "01",
    icon: "eye",
    title: "Listen before prescribing",
    description:
      "You can bring the problem exactly as it is. We listen before we start suggesting answers.",
  },
  {
    number: "02",
    icon: "target",
    title: "Define what better means",
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

const examples: readonly ExampleFrame[] = [
  {
    number: "01",
    icon: "eye",
    href: "/work#website-fix",
    title: "A website that earns the next click",
    happening:
      "An important page feels unclear, slow, inaccessible, or difficult to use.",
    tried:
      "A team might adjust the copy, layout, or calls to action, but the page still is not doing its job.",
    after:
      "We find the friction, make the agreed fix, and hand back a clearer page with a record of what changed.",
  },
  {
    number: "02",
    icon: "target",
    href: "/work#managed-automation",
    title: "A better way through repeated work",
    happening:
      "A recurring task keeps crossing inboxes, documents, and tools without a dependable path.",
    tried:
      "A team might add reminders, documents, or another tool, but the work still depends on manual follow-up.",
    after:
      "We identify the bottleneck, clarify the result, and define a focused proposal to move it forward.",
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
    title: "Bounded move",
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

export default function HomePageClient() {
  return (
    <main id="main-content" className="homepage-trailer">
      <section className="homepage-hero" aria-labelledby="homepage-hero-heading">
        <div className="homepage-hero__glow homepage-hero__glow--gold" aria-hidden="true" />
        <div className="homepage-hero__glow homepage-hero__glow--green" aria-hidden="true" />
        <div className="homepage-hero__inner">
          <div className="homepage-hero__grid">
            <div className="homepage-hero__copy">
              <p className="homepage-eyebrow homepage-eyebrow--light">For owners and founders</p>
              <h1 id="homepage-hero-heading" className="homepage-hero__title">
                Your vision, brought to life.
              </h1>
              <p className="homepage-hero__lead">
                A clearer website. A smoother working day. More room for the idea you
                want to bring to life. Tell us what you have in mind, and we will
                help you find a useful place to start.
              </p>
              <div className="homepage-hero__actions">
                <Link href="/contact" className="homepage-button homepage-button--gold">
                  Share Your Vision
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="/services" className="homepage-button homepage-button--ghost">
                  See what we do
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>

            <figure className="homepage-teaser" aria-labelledby="homepage-teaser-caption">
              <div className="homepage-teaser__header">
                <div>
                  <p className="homepage-teaser__kicker">A clearer way to begin</p>
                  <figcaption id="homepage-teaser-caption" className="homepage-teaser__caption">
                    From friction to a useful change
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
                        <h2 className="homepage-teaser__title">{beat.title}</h2>
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
                A website problem. Repeated work. One place to start.
              </h2>
            </div>
            <p className="homepage-section__lead">
              Two focused starting points for making something important easier to move forward.
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
                    <dl className="homepage-offer-card__details">
                      <div>
                        <dt>The problem</dt>
                        <dd>{preview.problem}</dd>
                      </div>
                      <div>
                        <dt>The useful change</dt>
                        <dd>{offer.summary}</dd>
                      </div>
                    </dl>
                    <Link href={offer.detailHref} className="homepage-link">
                      {preview.linkLabel}
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
        </div>
      </section>

      <section
        id="why-us"
        aria-labelledby="why-us-heading"
        className="homepage-section homepage-section--dark"
      >
        <div className="homepage-section__inner">
          <div className="homepage-section__intro">
            <p className="homepage-eyebrow homepage-eyebrow--light">How we think</p>
            <h2 id="why-us-heading" className="homepage-heading">
              A useful next move starts with listening.
            </h2>
            <p className="homepage-section__lead">
              The way we work is simple: understand the real friction, agree on what better means,
              and make the next piece easier to see.
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
                    <p className="homepage-card-kicker">Resolution principle</p>
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
        </div>
      </section>

      <section
        id="examples"
        aria-labelledby="examples-heading"
        className="homepage-section homepage-section--light"
      >
        <div className="homepage-section__inner">
          <div className="homepage-section__intro">
            <p className="homepage-eyebrow">How we move a stuck problem forward</p>
            <h2 id="examples-heading" className="homepage-heading homepage-heading--compact">
              What better can look like.
            </h2>
            <p className="homepage-section__lead">
              Short frames of the problems, workarounds, and focused changes we can help make clearer.
            </p>
          </div>

          <div className="homepage-example-grid">
            {examples.map((example) => (
              <article key={example.title} className="homepage-example-card">
                <div className="homepage-card-identity homepage-example-card__identity">
                  <div className="homepage-example-card__topline">
                    <span className="homepage-example-card__number">{example.number}</span>
                    <span className="homepage-example-card__icon">
                      <TeaserIcon name={example.icon} />
                    </span>
                  </div>
                  <p className="homepage-card-kicker">Trailer frame</p>
                  <h3>{example.title}</h3>
                </div>
                <div className="homepage-card-detail homepage-example-card__detail">
                  <dl className="homepage-example-card__details">
                    <div>
                      <dt>What is happening</dt>
                      <dd>{example.happening}</dd>
                    </div>
                    <div>
                      <dt>What might be tried</dt>
                      <dd>{example.tried}</dd>
                    </div>
                  </dl>
                  <p className="homepage-example-card__resolution">
                    <span>How we help resolve it</span>
                    {example.after}
                  </p>
                  <Link href={example.href} className="homepage-link">
                    Explore this example: {example.title}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
                {example !== examples[examples.length - 1] && (
                  <span className="homepage-example-card__connector" aria-hidden="true">
                    <ArrowRight />
                  </span>
                )}
              </article>
            ))}
          </div>
          <Link href="/work" className="homepage-link homepage-link--standalone">
            See more examples
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="homepage-bridge" aria-labelledby="homepage-bridge-heading">
        <div className="homepage-bridge__inner">
          <div className="homepage-bridge__copy">
            <p className="homepage-eyebrow homepage-eyebrow--light">Behind the work</p>
            <h2 id="homepage-bridge-heading" className="homepage-heading">
              We use the same discipline on our own flows.
            </h2>
            <p>
              The deeper page shows how goals stay clear, actions stay bounded, and results stay
              reviewable—from the first useful move to the evidence that comes back.
            </p>
            <Link href="/system" className="homepage-button homepage-button--gold">
              See the system behind the work
              <ArrowRight aria-hidden="true" />
            </Link>
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
                {index < bridgeNodes.length - 1 && <span className="homepage-bridge__line" />}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="homepage-closing" aria-labelledby="homepage-closing-heading">
        <div className="homepage-closing__inner">
          <p className="homepage-eyebrow">The next move</p>
          <h2 id="homepage-closing-heading" className="homepage-heading">
            You do not have to have it all figured out.
          </h2>
          <p>
            Share what is getting in the way. We will hear you out and help you resolve the right
            piece first.
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
