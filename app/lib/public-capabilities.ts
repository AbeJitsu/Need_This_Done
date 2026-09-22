export const PUBLIC_CAPABILITIES = [
  {
    title: "Interfaces people can actually use",
    description:
      "Responsive pages, forms, dashboards, and application flows that make the next action clear.",
    examples: ["React and Next.js", "Accessible forms", "Responsive dashboards"],
  },
  {
    title: "Backends, data, and permissions",
    description:
      "Durable records and server-side rules that keep the system honest as the work moves forward.",
    examples: ["Postgres and Supabase", "Auth and RLS", "Durable state"],
  },
  {
    title: "APIs and integrations",
    description:
      "Connect the services a project depends on so information can move without manual glue work.",
    examples: ["REST and MCP boundaries", "Payments and email", "External services"],
  },
  {
    title: "Workflows and automation",
    description:
      "Turn repeated steps, approvals, and handoffs into a path that is easier to run and review.",
    examples: ["Approval paths", "Scheduled work", "Operational tooling"],
  },
  {
    title: "Systems that hold together",
    description:
      "Look across the layers when the hard part is not one component but the connection between them.",
    examples: ["Source-of-truth design", "Failure recovery", "Reviewable results"],
  },
  {
    title: "Testing and delivery",
    description:
      "Protect the important paths and make the result easier to check before it moves forward.",
    examples: ["Unit and contract tests", "Accessibility checks", "Release evidence"],
  },
] as const;

export const PUBLIC_CAPABILITIES_INTRO =
  "I like the problems that cross more than one layer. I can move from interface to data model to API to the operational path that keeps it running.";
