// src/lib/portal-counsellor.ts
import { cache } from "react";
import { db } from "@/lib/db";

export type PortalCounsellor = { name: string | null; image: string | null; bio: string | null };

const counselorSelect = { name: true, image: true, bio: true } as const;

// The counsellor looking after this applicant: the one assigned to the account (the
// counselor on duty when it was created, or the one an admin picked). Older accounts that
// have none fall back to the counsellor of their most recent submission.
// React.cache means the layout and the page share one query per request.
export const getPortalCounsellor = cache(async (userId: string): Promise<PortalCounsellor | null> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { counselor: { select: counselorSelect } },
  });
  if (user?.counselor) return user.counselor;

  const row = await db.applicationSubmission.findFirst({
    where: { userId, counselorId: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { counselor: { select: counselorSelect } },
  });
  return row?.counselor ?? null;
});