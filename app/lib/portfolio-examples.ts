export const EXAMPLE_SOURCE =
  "https://github.com/AbeJitsu/Need_This_Done/tree/feature/hiring-portfolio-2026-10-02";
export const EXAMPLE_FILE_SOURCE = EXAMPLE_SOURCE.replace("/tree/", "/blob/");

export const importSamples = {
  clean: [
    { name: "  Alex Rivera  ", email: " ALEX@EXAMPLE.COM " },
    { name: "Sam Chen", email: "sam@example.com" },
  ],
  invalid: [
    { name: "Alex Rivera", email: "alex@example.com" },
    { name: "", email: "not-an-email" },
  ],
  duplicate: [
    { name: "Alex Rivera", email: "alex@example.com" },
    { name: "Alex R.", email: " ALEX@EXAMPLE.COM " },
  ],
} as const;

export type DemoTask = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
};
export const TASK_STORAGE_KEY = "ntd-portfolio-task-board-v1";
export const initialTasks: DemoTask[] = [
  { id: "sample-1", title: "Reproduce the reported issue", status: "done" },
  { id: "sample-2", title: "Trace the API response", status: "doing" },
  { id: "sample-3", title: "Add a regression test", status: "todo" },
  { id: "sample-4", title: "Verify the phone layout", status: "todo" },
];

/** Browser demo data only; this is separate from the application's database. */
export function parseSavedTasks(raw: string): DemoTask[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length > 30) return null;
    const ids = new Set<string>();
    for (const task of value) {
      if (
        !task ||
        typeof task !== "object" ||
        !("id" in task) ||
        !("title" in task) ||
        !("status" in task)
      )
        return null;
      if (
        typeof task.id !== "string" ||
        task.id.length > 80 ||
        ids.has(task.id)
      )
        return null;
      if (
        typeof task.title !== "string" ||
        !task.title.trim() ||
        task.title.length > 100
      )
        return null;
      if (!["todo", "doing", "done"].includes(String(task.status))) return null;
      ids.add(task.id);
    }
    return value as DemoTask[];
  } catch {
    return null;
  }
}
