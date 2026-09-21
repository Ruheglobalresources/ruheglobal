//src/app/portal/[terminalSlug]/[applicationSlug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ApplicationWizard } from "@/components/portal/application-wizard";
import { groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ terminalSlug: string; applicationSlug: string }>;
}) {
  const { terminalSlug, applicationSlug } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const application = await db.application.findFirst({
    where: { slug: applicationSlug, isActive: true, terminal: { slug: terminalSlug, isActive: true } },
    include: {
      terminal: { select: { name: true, slug: true } },
      fields: { include: { fieldDefinition: true } },
      submissions: {
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { values: true },
      },
    },
  });

  if (!application) notFound();

  const steps = groupFieldsByStep(mapApplicationFields(application.fields));
  const submission = application.submissions[0] ?? null;

  return (
    <div>
      <Link
        href={`/portal/${terminalSlug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[color:var(--color-teal)]"
      >
        <ArrowLeft size={13} /> {application.terminal.name}
      </Link>

      <ApplicationWizard
        applicationId={application.id}
        applicationName={application.name}
        terminalName={application.terminal.name}
        steps={steps}
        initialSubmissionId={submission?.id ?? null}
        initialStatus={submission?.status ?? "DRAFT"}
        initialCurrentStep={submission?.currentStep ?? 1}
        initialAnswers={
          submission?.values.map((v) => ({
            applicationFieldId: v.applicationFieldId,
            value: v.value,
            fileUrl: v.fileUrl,
          })) ?? []
        }
      />
    </div>
  );
}