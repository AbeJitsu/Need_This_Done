import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Abe Reyes",
  description:
    "Abe Reyes is an independent developer with a background in onboarding, technical support, and customer-facing work.",
  alternates: { canonical: "/about" },
};

const experience = [
  [
    "Independent development",
    "NeedThisDone",
    "Ongoing",
    "Building this application across React interfaces, Next.js APIs, authentication, data models, and tests.",
  ],
  [
    "Onboarding Specialist & Developer",
    "Acadio",
    "April–December 2025",
    "Content conversion, validation, data migration, and tooling for repeatable onboarding workflows.",
  ],
  [
    "Technical support",
    "Asurion / Verizon Tech Coach",
    "March 2026–present",
    "Device troubleshooting, activation support, and helping customers work through technical problems.",
  ],
] as const;

export default function AboutPage() {
  return (
    <main id="main-content" className="pf-page">
      <section className="pf-page-intro pf-wrap pf-about-intro">
        <div>
          <p className="pf-eyebrow">
            <span /> The person behind NeedThisDone
          </p>
          <h1>
            Abe Reyes.
            <br />
            <em>Practical by nature.</em>
          </h1>
          <p className="pf-lead">
            An independent developer with a background in technical support,
            onboarding, and customer-facing work. Based in Orlando, Florida.
          </p>
          <div className="pf-actions">
            <Link href="/work" className="pf-button pf-button--green">
              Explore my work <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/contact" className="pf-text-link">
              Contact Abe <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="pf-person-card">
          <span className="pf-mono">DEVELOPER / PROBLEM SOLVER</span>
          <span className="pf-monogram" aria-hidden="true">
            ar.
          </span>
          <p>
            Understand the problem.
            <br />
            Connect the pieces.
            <br />
            Check the result.
          </p>
          <span className="pf-mono">ORLANDO, FLORIDA</span>
        </div>
      </section>
      <section className="pf-wrap pf-about-story">
        <div>
          <p className="pf-eyebrow">The through line</p>
          <h2>
            Technology makes sense
            <br />
            <em>when people can use it.</em>
          </h2>
        </div>
        <div>
          <p>
            I have spent much of my working life helping people navigate
            decisions and technical problems. That experience carries into
            development: understand the situation, make the next step clear, and
            verify the result.
          </p>
          <p>
            NeedThisDone is where I develop and demonstrate my own application
            work. My current interests include web interfaces, APIs, data
            workflows, and the investigation needed when those pieces fail to
            connect.
          </p>
          <p>
            I use AI-assisted development tools as part of the process. The
            useful question is whether the resulting behavior can be explained,
            tested, and inspected.
          </p>
          <Link href="/how-it-works" className="pf-text-link">
            Explore the development approach{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section
        id="experience"
        className="pf-wrap pf-experience"
        aria-labelledby="experience-heading"
      >
        <div>
          <p className="pf-eyebrow">Experience</p>
          <h2 id="experience-heading">
            Building on
            <br />
            <em>real working context.</em>
          </h2>
        </div>
        <ol>
          {experience.map(([role, company, period, description]) => (
            <li key={company}>
              <div>
                <p className="pf-mono">{period}</p>
                <h3>{company}</h3>
                <span>{role}</span>
              </div>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="pf-bottom-cta pf-wrap">
        <p className="pf-eyebrow">A starting point</p>
        <h2>
          Have a role or
          <br />
          <em>project in mind?</em>
        </h2>
        <p>
          Explore the examples, ask about an implementation decision, or start a
          conversation.
        </p>
        <div className="pf-actions">
          <Link href="/contact" className="pf-button pf-button--green">
            Contact Abe
          </Link>
          <Link href="/examples" className="pf-text-link">
            Try the examples <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
