import Image from "next/image";

export type PublicPageVisualKind =
  | "problem-map"
  | "interface-craft"
  | "workflow-path"
  | "conversation-start";

export const PUBLIC_PAGE_VISUALS: Record<PublicPageVisualKind, { src: string; alt: string }> = {
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
    <div className={`relative aspect-[16/10] min-h-[15rem] overflow-hidden rounded-[2rem] border border-white/15 bg-[#183229] shadow-2xl ${className}`}>
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
