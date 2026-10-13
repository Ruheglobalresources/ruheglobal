// src/lib/portal-applications.ts
// Every application an applicant has started or sent, ready to show in a list: title, status,
// progress and where to open it. Used by /portal/applications; the home page can use it too.
// Eligibility checks are not applications (they are the questions that start one), so they are left out.
import { db } from "@/lib/db";
import { computeOverallProgress, groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";

export type PortalApplicationItem = {
  id: string;
  status: string;
  title: string;
  subtitle: string | null;
  href: string;
  percent: number;
  updatedAt: Date;
  submittedAt: Date | null;
};

export async function getPortalApplications(userId: string): Promise<PortalApplicationItem[]> {
  const submissions = await db.applicationSubmission.findMany({
    where: { userId, application: { kind: { not: "ELIGIBILITY" } } },
    orderBy: { updatedAt: "desc" },
    include: {
      values: true,
      application: {
        include: {
          terminal: { select: { slug: true, name: true } },
          fields: { include: { fieldDefinition: true } },
        },
      },
    },
  });

  return submissions.map((s) => {
    const steps = groupFieldsByStep(mapApplicationFields(s.application.fields));
    const percent = computeOverallProgress(
      steps,
      s.values.map((v) => ({ applicationFieldId: v.applicationFieldId, value: v.value, fileUrl: v.fileUrl }))
    );

    return {
      id: s.id,
      status: s.status,
      // school applications share one form, so the title is the school and the subtitle its course
      title: s.targetName ?? s.application.name,
      subtitle: s.targetName
        ? [s.targetCourseName, s.application.name].filter(Boolean).join(", ")
        : s.application.terminal.name,
      href: `/portal/${s.application.terminal.slug}/${s.application.slug}?submission=${s.id}`,
      percent,
      updatedAt: s.updatedAt,
      submittedAt: s.submittedAt,
    };
  });
}