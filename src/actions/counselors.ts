"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { startOfDutyWeek } from "@/lib/counselor-duty";

const BIO_MAX_LENGTH = 600;

// Who is on duty in a week. counselorId null removes the choice for that week, so the
// week carries over the counselor of the week before it.
export async function setCounselorOnDuty(weekStartIso: string, counselorId: string | null) {
  await requireAdmin();

  const weekStart = new Date(weekStartIso);
  if (Number.isNaN(weekStart.getTime())) return { error: "Invalid week" };

  // must be a real Monday 00:00 (Nigerian time) and not a week that has already ended
  if (weekStart.getTime() !== startOfDutyWeek(weekStart).getTime()) return { error: "Invalid week" };
  if (weekStart.getTime() < startOfDutyWeek().getTime()) return { error: "Past weeks cannot be changed" };

  if (counselorId === null) {
    await db.counselorDuty.deleteMany({ where: { weekStart } });
  } else {
    const counselor = await db.user.findFirst({ where: { id: counselorId, role: "COUNSELOR" }, select: { id: true } });
    if (!counselor) return { error: "Choose a counselor" };

    await db.counselorDuty.upsert({
      where: { weekStart },
      create: { weekStart, counselorId },
      update: { counselorId },
    });
  }

  revalidatePath("/admin/counselors");
  return { success: "Duty updated" };
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

// Change the counselor of one applicant (null = no counselor)
export async function assignUserCounselor(userId: string, counselorId: string | null) {
  await requireAdmin();

  const user = await db.user.findFirst({ where: { id: userId, role: "USER" }, select: { id: true } });
  if (!user) return { error: "User not found" };

  if (counselorId !== null) {
    const counselor = await db.user.findFirst({ where: { id: counselorId, role: "COUNSELOR" }, select: { id: true } });
    if (!counselor) return { error: "Choose a counselor" };
  }

  await db.user.update({ where: { id: userId }, data: { counselorId } });
  revalidatePath("/admin/users");
  revalidatePath("/admin/counselors");
  return { success: "Counselor updated" };
}