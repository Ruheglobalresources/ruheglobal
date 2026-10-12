// src/components/profile/form-utils.ts
import type { ZodError } from "zod";

// Turns a zod error into { fieldName: "first message" } so each input can show its own error.
export function mapIssues(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const todayIso = () => new Date().toISOString().slice(0, 10);

// "2027-03-14" -> "Mar 2027", read as UTC so the day never shifts with the viewer's timezone
export function formatMonthYear(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}