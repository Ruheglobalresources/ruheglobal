// src/lib/counselor-duty.ts
// Which counselor is on duty this week, and giving new accounts that counselor.
//
// Duty weeks run Monday to Sunday in Nigerian time (UTC+1, no daylight saving). A week
// with no row in CounselorDuty keeps the counselor of the last week that has one, so
// someone is always on duty. With no rows at all, the first counselor ever created is on
// duty. The admin only has to add a row for the week in which the duty changes.
import { db } from "@/lib/db";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const LAGOS_OFFSET_MS = HOUR_MS;

// Monday 00:00 (Nigerian time) of the week the date falls in, as a UTC moment
export function startOfDutyWeek(date: Date = new Date()): Date {
  const local = new Date(date.getTime() + LAGOS_OFFSET_MS);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const mondayLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysSinceMonday);
  return new Date(mondayLocal - LAGOS_OFFSET_MS);
}

export const addDutyWeeks = (weekStart: Date, weeks: number) => new Date(weekStart.getTime() + weeks * WEEK_MS);

// Only people with the COUNSELOR role can be on duty or be assigned to applicants
const onlyCounselors = { counselor: { role: "COUNSELOR" as const } };

export async function getCounselorOnDuty(now: Date = new Date()): Promise<string | null> {
  const shift = await db.counselorDuty.findFirst({
    where: { weekStart: { lte: startOfDutyWeek(now) }, ...onlyCounselors },
    orderBy: { weekStart: "desc" },
    select: { counselorId: true },
  });
  if (shift) return shift.counselorId;

  const first = await db.user.findFirst({
    where: { role: "COUNSELOR" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return first?.id ?? null;
}

export type DutyWeek = {
  weekStart: Date;
  counselorId: string | null;
  explicit: boolean; // true when the admin set this week, false when it carries over
};

// The current week and the next ones, with who is on duty in each
export async function getDutySchedule(weeks = 8): Promise<DutyWeek[]> {
  const first = startOfDutyWeek();

  const [base, shifts, firstCounselor] = await Promise.all([
    db.counselorDuty.findFirst({
      where: { weekStart: { lte: first }, ...onlyCounselors },
      orderBy: { weekStart: "desc" },
      select: { counselorId: true },
    }),
    db.counselorDuty.findMany({
      where: { weekStart: { gte: first, lt: addDutyWeeks(first, weeks) }, ...onlyCounselors },
      select: { weekStart: true, counselorId: true },
    }),
    db.user.findFirst({ where: { role: "COUNSELOR" }, orderBy: { createdAt: "asc" }, select: { id: true } }),
  ]);

  let carried = base?.counselorId ?? firstCounselor?.id ?? null;

  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = addDutyWeeks(first, i);
    const shift = shifts.find((s) => s.weekStart.getTime() === weekStart.getTime());
    if (shift) carried = shift.counselorId;
    return { weekStart, counselorId: carried, explicit: !!shift };
  });
}

// Gives a brand new applicant the counselor on duty this week. Never throws: a problem
// here must not stop an account from being created. Does nothing when the user already
// has a counselor or is not an applicant.
export async function assignCounselorToUser(userId: string): Promise<void> {
  try {
    const counselorId = await getCounselorOnDuty();
    if (!counselorId) return;

    await db.user.updateMany({
      where: { id: userId, role: "USER", counselorId: null },
      data: { counselorId },
    });
  } catch (error) {
    console.error("Could not assign a counselor to the new user:", error);
  }
}