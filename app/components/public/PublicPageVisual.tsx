import Image from "next/image";

export type PublicPageVisualKind =
  | "messy-problems"
  | "problem-map"
  | "interface-craft"
  | "workflow-path"
  | "conversation-start"
  | "website-fix"
  | "managed-automation"
  | "pricing-scope"
  | "system-bridge"
  | "accessibility-craft"
  | "faq-answers"
  | "notes-library"
  | "privacy-boundary"
  | "terms-agreement";

export const PUBLIC_PAGE_VISUALS: Record<PublicPageVisualKind, { src: string; alt: string }> = {
  "messy-problems": {
    src: "/images/public/messy-problems.webp",
    alt: "Scattered paper cards and colored threads forming a clearer path across a dark worktable.",
  },
  "problem-map": {
    src: "/images/public/problem-map.webp",
    alt: "Paper cards and connecting threads spread across a worktable beside a laptop.",
  },
  "interface-craft": {
    src: "/images/public/interface-craft.webp",
    alt: "A laptop and interface sketches arranged on a warm workbench.",
  },
  "workflow-path": {
    src: "/images/public/workflow-path.webp",
    alt: "A scattered set of paper pieces becoming an orderly connected path.",
  },
  "conversation-start": {
    src: "/images/public/conversation-start.webp",
    alt: "An open blank notebook, phone, and pen on a calm desk in morning light.",
  },
  "website-fix": {
    src: "/images/public/website-fix.webp",
    alt: "A laptop, magnifying glass, and correction cards arranged on a workbench.",
  },
  "managed-automation": {
    src: "/images/public/managed-automation.webp",
    alt: "A paper task moving along a simple rail from a stack of open cards to a completed stack.",
  },
  "pricing-scope": {
    src: "/images/public/pricing-scope.webp",
    alt: "A single scoped checklist on a dark green folder beside a ruler and pencil.",
  },
  "system-bridge": {
    src: "/images/public/system-bridge.webp",
    alt: "A small bridge connects a conversation notebook to a laptop across a worktable.",
  },
  "accessibility-craft": {
    src: "/images/public/accessibility-craft.webp",
    alt: "A laptop and high-contrast interface controls beside a tactile keyboard and dial.",
  },
  "faq-answers": {
    src: "/images/public/faq-answers.webp",
    alt: "Blank cards being sorted from a scattered pile into an organized stack.",
  },
  "notes-library": {
    src: "/images/public/notes-library.webp",
    alt: "Open notebook studies arranged among a small library of notebooks on a writing desk.",
  },
  "privacy-boundary": {
    src: "/images/public/privacy-boundary.webp",
    alt: "A closed document box and brass key beside a laptop within a clear desk boundary.",
  },
  "terms-agreement": {
    src: "/images/public/terms-agreement.webp",
    alt: "Two aligned document pages, pen, and clip arranged for careful review.",
  },
};

export default function PublicPageVisual({
  kind,
  className = "",
  priority = false,
}: {
  kind: PublicPageVisualKind;
  className?: string;
  priority?: boolean;
}) {
  const visual = PUBLIC_PAGE_VISUALS[kind];

  return (
    <div className={`relative w-full min-w-0 max-w-full ${kind === "interface-craft" ? "aspect-[3/2]" : "aspect-video"} overflow-hidden rounded-[2rem] border border-white/15 bg-[#183229] shadow-2xl ${className}`}>
      <Image
        src={visual.src}
        alt={visual.alt}
        fill
        priority={priority}
        unoptimized
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#183229]/35 via-transparent to-[#d0a94f]/10" aria-hidden="true" />
    </div>
  );
}
