export const PUBLIC_VARIANT = "match-crib-v1" as const;

export const PUBLIC_NAVIGATION = [
  { href: "/services", label: "Capabilities" },
  { href: "/work", label: "Selected Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Notes" },
] as const;

export const PUBLIC_HOME_JOURNEY = [
  { id: "capabilities", href: "/services", label: "Capabilities" },
  { id: "featured-work", href: "/work", label: "Selected Work" },
  { id: "approach", href: "/about", label: "About" },
  { id: "notes", href: "/blog", label: "Notes" },
] as const;

export function getPublicHomeHref(href: string) {
  const section = PUBLIC_HOME_JOURNEY.find((item) => item.href === href);
  return section ? `/#${section.id}` : href;
}

export const PUBLIC_PRIMARY_ACTION = {
  href: "/contact",
  label: "Start a conversation",
} as const;

export const PUBLIC_HOME_CONVERSION = {
  id: "contact",
  href: PUBLIC_PRIMARY_ACTION.href,
  label: PUBLIC_PRIMARY_ACTION.label,
} as const;

export type PublicHomeSectionId = (typeof PUBLIC_HOME_JOURNEY)[number]["id"];

export function getPublicHomeNextStep(id: PublicHomeSectionId) {
  const currentIndex = PUBLIC_HOME_JOURNEY.findIndex((section) => section.id === id);
  const nextSection = PUBLIC_HOME_JOURNEY[currentIndex + 1];

  return nextSection
    ? {
        href: `#${nextSection.id}`,
        label: `Next: ${nextSection.label}`,
      }
    : null;
}

export const PUBLIC_ROUTE_STAGES = {
  "/": {
    stage: "orient",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/work", label: "See selected work" },
    event: "home",
  },
  "/services": {
    stage: "capabilities",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/work", label: "See selected work" },
    event: "services",
  },
  "/how-it-works": {
    stage: "approach",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/work", label: "See selected work" },
    event: "how_it_works",
  },
  "/system": {
    stage: "trust",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/work", label: "Back to selected work" },
    event: "system",
  },
  "/work": {
    stage: "proof",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/about", label: "The approach" },
    event: "work",
  },
  "/about": {
    stage: "trust",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/contact", label: "Start a conversation" },
    event: "about",
  },
  "/website-fix": {
    stage: "fit",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/contact", label: "Start a conversation" },
    event: "website_fix",
  },
  "/managed-automation": {
    stage: "fit",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/how-it-works", label: "See how it works" },
    event: "managed_automation",
  },
  "/pricing": {
    stage: "decision",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/services", label: "Compare Starting Points" },
    event: "pricing",
  },
  "/contact": {
    stage: "share",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: null,
    event: "contact",
  },
  "/ada-compliance": {
    stage: "check",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/website-fix", label: "See Website Fix Details" },
    event: "ada_compliance",
  },
  "/faq": {
    stage: "answer",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: null,
    event: "faq",
  },
  "/blog": {
    stage: "learn",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: null,
    event: "blog",
  },
  "/privacy": {
    stage: "trust",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: null,
    event: "privacy",
  },
  "/terms": {
    stage: "trust",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: null,
    event: "terms",
  },
} as const;

export function getPublicRouteEvent(pathname: string) {
  if (pathname.startsWith("/report/")) return "report" as const;
  if (pathname.startsWith("/blog/")) return "blog_post" as const;
  if (pathname in PUBLIC_ROUTE_STAGES)
    return PUBLIC_ROUTE_STAGES[pathname as keyof typeof PUBLIC_ROUTE_STAGES]
      .event;
  return null;
}

export const ENGAGEMENT_EVENTS = [
  "page_view",
  "primary_action_click",
  "secondary_action_click",
  "intake_step_view",
  "intake_step_complete",
  "intake_submit",
  "intake_success",
  "intake_error",
  "snapshot_submit",
  "snapshot_success",
  "snapshot_error",
  "report_cta_click",
] as const;

export type EngagementEvent = (typeof ENGAGEMENT_EVENTS)[number];

export const ENGAGEMENT_ROUTES = [
  "home",
  "services",
  "website_fix",
  "managed_automation",
  "about",
  "how_it_works",
  "system",
  "work",
  "pricing",
  "contact",
  "site_analyzer",
  "report",
  "ada_compliance",
  "faq",
  "blog",
  "blog_post",
  "privacy",
  "terms",
  "not_found",
  "error",
] as const;


export const PUBLIC_FOOTER_GROUPS = [
  { title: 'Explore', links: [...PUBLIC_NAVIGATION, { href: '/system', label: 'NeedThisDone system' }] },
  { title: 'Proof', links: [
    { href: '/work#case-studies', label: 'Case studies' },
    { href: '/blog', label: 'Engineering notes' },
  ] },
  { title: 'Support', links: [
    { href: '/faq', label: 'FAQ' }, { href: '/ada-compliance', label: 'Accessibility' },
    { href: '/privacy', label: 'Privacy' }, { href: '/terms', label: 'Terms' },
  ] },
  { title: 'Contact', links: [PUBLIC_PRIMARY_ACTION] },
];

export function isPublicRouteCurrent(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}
