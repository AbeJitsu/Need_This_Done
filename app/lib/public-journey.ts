import { PUBLIC_OFFERS } from './public-offers';

export const PUBLIC_VARIANT = "match-crib-v1" as const;

export const PUBLIC_NAVIGATION = [
  { href: "/services", label: "What We Do" },
  { href: "/how-it-works", label: "How We Work" },
  { href: "/work", label: "Examples" },
  { href: "/about", label: "Why Us" },
] as const;
export const PUBLIC_PRIMARY_ACTION = {
  href: "/contact",
  label: "Share Your Vision",
} as const;

export const PUBLIC_ROUTE_STAGES = {
  "/": {
    stage: "recognize",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/services", label: "See What We Do" },
    event: "home",
  },
  "/services": {
    stage: "understand",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/how-it-works", label: "See How We Help" },
    event: "services",
  },
  "/how-it-works": {
    stage: "reassure",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/work", label: "See Examples" },
    event: "how_it_works",
  },
  "/work": {
    stage: "recognize",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/about", label: "Why Us" },
    event: "work",
  },
  "/about": {
    stage: "trust",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/contact", label: "Share Your Vision" },
    event: "about",
  },
  "/website-fix": {
    stage: "fit",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/site-analyzer", label: "Get a Website Snapshot" },
    event: "website_fix",
  },
  "/managed-automation": {
    stage: "fit",
    primary: PUBLIC_PRIMARY_ACTION,
    secondary: { href: "/how-it-works", label: "See How We Help" },
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
  "/site-analyzer": {
    stage: "check",
    primary: { href: "/site-analyzer", label: "Create My Website Snapshot" },
    secondary: PUBLIC_PRIMARY_ACTION,
    event: "site_analyzer",
  },
  "/ada-compliance": {
    stage: "check",
    primary: { href: "/site-analyzer", label: "Get a Website Snapshot" },
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
  { title: 'Explore', links: [...PUBLIC_NAVIGATION, { href: '/blog', label: 'Insights' }] },
  { title: 'Starting points', links: [
    ...Object.values(PUBLIC_OFFERS).map(offer => ({ href: offer.detailHref, label: offer.name })),
    { href: '/pricing', label: 'Pricing' }, { href: '/site-analyzer', label: 'Website Snapshot' },
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
