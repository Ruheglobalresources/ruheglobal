// src/app/(root)/courses/page.tsx
import type { Metadata } from "next";
import { CoursesExplorer } from "@/components/courses/CoursesExplorer";

export const metadata: Metadata = {
  title: "Courses | Ruhe Global Resources",
  description:
    "Search courses from our partner schools, colleges and universities abroad, then see fees, intakes and entry requirements.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim().slice(0, 80) || undefined;

  return <CoursesExplorer initialQuery={query} />;
}