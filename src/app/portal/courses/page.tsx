import { CatalogTabs, CoursesBrowser } from "@/components/dashboard/catalog-lists";

export const metadata = { title: "Courses | Ruhe Global Resources" };

export default async function PortalCoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim().slice(0, 80) || undefined;

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl font-semibold text-ink">Courses</h1>
      <p className="mb-6 text-sm text-neutral-500">Find a course, then see which institutions offer it.</p>
      <CatalogTabs active="courses" />
      {/* key restarts the list (and its scroll loading) for every new search */}
      <CoursesBrowser key={query ?? ""} q={query} />
    </div>
  );
}
