"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { auth } from "@/auth";

const BIO_MAX_LENGTH = 600;

// Disable a counselor, or put them back. A disabled (or on leave) counselor is skipped by the rota, so
// no new account is given to them, and they cannot be picked for an applicant by hand. Applicants they
// already look after stay with them, and they can still sign in.
export async function setCounselorActive(userId: string, isActive: boolean) {
  await requireAdmin();

  const counselor = await db.user.findFirst({ where: { id: userId, role: "COUNSELOR" }, select: { id: true, name: true } });
  if (!counselor) return { error: "Counselor not found" };

  await db.user.update({ where: { id: userId }, data: { isActive: Boolean(isActive) } });

  revalidatePath("/admin/counselors");
  revalidatePath("/admin/users");

  if (!isActive) {
    const stillActive = await db.user.count({ where: { role: "COUNSELOR", isActive: true } });
    if (stillActive === 0) {
      return { success: "Disabled. No active counselor is left, so new accounts will not get one until someone is active." };
    }
    return { success: "Disabled. New accounts will skip this counselor." };
  }
  return { success: "Active. This counselor is back in the rota." };
}

// Put a counselor on the front desk, or back to the regular counselors. A front desk counselor is given every
// new account first (taking turns), reads the profile, and passes the applicant on to the right counselor.
// Applicants a counselor already has stay with them.
export async function setCounselorFrontDesk(userId: string, isFrontDesk: boolean) {
  await requireAdmin();

  const counselor = await db.user.findFirst({ where: { id: userId, role: "COUNSELOR" }, select: { id: true } });
  if (!counselor) return { error: "Counselor not found" };

  await db.user.update({ where: { id: userId }, data: { isFrontDesk: Boolean(isFrontDesk) } });

  revalidatePath("/admin/counselors");
  revalidatePath("/admin/users");

  if (isFrontDesk) return { success: "On the front desk. New accounts go to the front desk first." };

  const stillOnDesk = await db.user.count({ where: { role: "COUNSELOR", isFrontDesk: true, isActive: true } });
  if (stillOnDesk === 0) {
    return { success: "Back to regular. No active front desk counselor is left, so new accounts go straight to the regular counselors in turn." };
  }
  return { success: "Back to regular counselor." };
}

export async function updateCounselorBio(userId: string, bio: string) {
  await requireAdmin();

  const text = bio.trim();
  if (text.length > BIO_MAX_LENGTH) return { error: `The bio can be up to ${BIO_MAX_LENGTH} characters` };

  const counselor = await db.user.findFirst({ where: { id: userId, role: "COUNSELOR" }, select: { id: true } });
  if (!counselor) return { error: "Counselor not found" };

  await db.user.update({ where: { id: userId }, data: { bio: text || null } });
  revalidatePath("/admin/counselors");
  return { success: "Bio saved" };
}

// Change the counselor of one applicant. An admin can choose any active counselor, or none (null).
// A counselor on the front desk can only pass on an applicant who is on their own list, to an active counselor
// who is not on the front desk. A disabled or on leave counselor cannot be chosen, unless the applicant
// already has them (nothing changes then).
export async function assignUserCounselor(userId: string, counselorId: string | null) {
  const session = await auth();
  const sessionId = session?.user?.id;
  const isAdmin = session?.user.role === "ADMIN";

  let deskId: string | null = null;
  if (!isAdmin && session?.user.role === "COUNSELOR" && sessionId) {
    const desk = await db.user.findFirst({ where: { id: sessionId, role: "COUNSELOR", isFrontDesk: true }, select: { id: true } });
    deskId = desk?.id ?? null;
  }
  if (!isAdmin && !deskId) throw new Error("Unauthorized");

  const user = await db.user.findFirst({ where: { id: userId, role: "USER" }, select: { id: true, counselorId: true } });
  if (!user) return { error: "User not found" };
  if (deskId && user.counselorId !== deskId) return { error: "This applicant is not on your list" };

  if (counselorId === null) {
    if (deskId) return { error: "Choose a counselor to pass this applicant on to" };
  } else {
    const counselor = await db.user.findFirst({
      where: { id: counselorId, role: "COUNSELOR" },
      select: { id: true, name: true, isActive: true, isFrontDesk: true },
    });
    if (!counselor) return { error: "Choose a counselor" };
    if (!counselor.isActive && user.counselorId !== counselor.id) {
      return { error: `${counselor.name ?? "That counselor"} is disabled or on leave and cannot be assigned` };
    }
    if (deskId && counselor.isFrontDesk) return { error: "Choose a counselor who is not on the front desk" };
  }

  // for the front desk, the condition on counselorId guards against an admin having moved this applicant a moment ago
  const moved = await db.user.updateMany({
    where: { id: userId, role: "USER", ...(deskId ? { counselorId: deskId } : {}) },
    data: { counselorId },
  });
  if (moved.count !== 1) return { error: "This applicant is no longer on your list" };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/counselors");
  return { success: "Counselor updated" };
}