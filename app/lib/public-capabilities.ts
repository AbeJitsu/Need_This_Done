export const PUBLIC_CAPABILITIES = [
  {
    title: "Frontends people can use",
    description:
      "Responsive pages, dashboards, forms, and clear paths that help people know what to do next.",
    examples: ["Responsive interfaces", "Accessible forms", "Useful dashboards"],
  },
  {
    title: "Backends and APIs that keep work moving",
    description:
      "Application logic, authentication, route handlers, and service boundaries that turn a request into a working result.",
    examples: ["Business logic", "APIs and webhooks", "Account access"],
  },
  {
    title: "Data that stays useful",
    description:
      "Databases and permissions that keep records, decisions, and evidence available when the work needs them.",
    examples: ["Supabase/PostgreSQL", "Schemas and migrations", "Role-scoped data"],
  },
  {
    title: "Connected tools and services",
    description:
      "Connect the tools a project already depends on so information moves without extra busywork.",
    examples: ["Email and payments", "Calendar handoffs", "External APIs"],
  },
  {
    title: "Agents and automations with a review point",
    description:
      "Build repeatable work with clear ownership, status, and human decisions where they belong.",
    examples: ["Workflow automation", "Agent coordination", "Approval checkpoints"],
  },
  {
    title: "Testing, deployment, and evidence",
    description:
      "Check the experience, protect the important paths, and make delivery easier to review.",
    examples: ["Browser and accessibility tests", "GitHub/Vercel delivery", "Release evidence"],
  },
] as const;

export const PUBLIC_CAPABILITIES_INTRO =
  "From the first idea through the interface, logic, data, integrations, and handoff, we choose only the pieces that fit.";
