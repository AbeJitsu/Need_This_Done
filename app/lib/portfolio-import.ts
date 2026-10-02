import { z } from "zod";

const contact = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "A name is required.")
      .max(80, "Use 80 characters or fewer."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address.")
      .max(254),
  })
  .strict();

export type ImportPreview = {
  ok: boolean;
  total: number;
  records: Array<{ name: string; email: string }>;
  issues: Array<{ row: number; field: string; message: string }>;
};

/** Preview only: nothing is stored, emailed, or sent to a model. */
export function inspectContactImport(input: unknown): ImportPreview | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > 25)
    return null;
  const records: ImportPreview["records"] = [];
  const issues: ImportPreview["issues"] = [];
  const emails = new Set<string>();
  input.forEach((row, index) => {
    const parsed = contact.safeParse(row);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        issues.push({
          row: index + 1,
          field: String(issue.path[0] || "record"),
          message:
            issue.code === "unrecognized_keys"
              ? "Use only name and email fields."
              : issue.message,
        }),
      );
      return;
    }
    if (emails.has(parsed.data.email)) {
      issues.push({
        row: index + 1,
        field: "email",
        message: "Duplicate email after normalization.",
      });
      return;
    }
    emails.add(parsed.data.email);
    records.push(parsed.data);
  });
  return { ok: issues.length === 0, total: input.length, records, issues };
}
