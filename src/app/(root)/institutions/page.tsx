// src/app/institutions/page.tsx
import { CatalogTabs } from "@/components/dashboard/catalog-lists";
import { InstitutionsExplorer } from "@/components/dashboard/institutions-explorer";

export const metadata = { title: "Institutions | Ruhe Global Resources" };

export default async function PortalInstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().slice(0, 80) || undefined;

  return (
    // small extra side space on tablets and laptops, on top of what the portal already gives
    <div className="md:px-3 lg:px-4">
      <h1 className="mb-1 font-display text-3xl font-semibold text-ink">Institutions</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Schools, colleges and universities we work with. Open one to see its courses, fees and requirements.
      </p>
      <CatalogTabs active="institutions" />
      <InstitutionsExplorer initialQuery={query} />
    </div>
  );
}