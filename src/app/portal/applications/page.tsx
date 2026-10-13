// src/app/portal/applications/page.tsx
// Applications: everything the applicant has started or sent, with status and progress.
// Nothing started yet: an empty state with a Get started button that opens the eligibility check.
// Where the applicant lands after submitting an application.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isUnsubmittedStatus } from "@/constants/submission-status";
import { ELIGIBILITY_PAGE } from "@/lib/portal-paths";
import { getPortalApplications } from "@/lib/portal-applications";
import { ApplicationRow } from "@/components/portal/application-row";
import { EmptyApplications } from "@/components/portal/empty-applications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applications | Ruhe Global Resources",
  robots: { index: false, follow: false },
};

export default async function PortalApplicationsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/auth/login?callbackUrl=/portal/applications");

  const items = await getPortalApplications(userId);
  const inProgress = items.filter((i) => isUnsubmittedStatus(i.status));
  const sent = items.filter((i) => !isUnsubmittedStatus(i.status));

  if (items.length === 0) return <EmptyApplications />;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">Applications</h1>
        <Link
          href={ELIGIBILITY_PAGE}
          className="shrink-0 text-sm font-medium text-ruby-600 hover:underline"
        >
          Start a new application
        </Link>
      </div>

      {inProgress.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-600">In progress</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {inProgress.map((item) => (
              <ApplicationRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {sent.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-600">Submitted</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {sent.map((item) => (
              <ApplicationRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}