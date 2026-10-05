// src/lib/portal-counsellor.ts
import { cache } from "react";
import { db } from "@/lib/db";

export type PortalCounsellor = { name: string | null; image: string | null };

// The counsellor assigned to the applicant's most recent submission, if any.
// React.cache means the layout and the page share one query per request.
export const getPortalCounsellor = cache(async (userId: string): Promise<PortalCounsellor | null> => {
  const row = await db.applicationSubmission.findFirst({
    where: { userId, counselorId: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { counselor: { select: { name: true, image: true } } },
  });
  return row?.counselor ?? null;
});