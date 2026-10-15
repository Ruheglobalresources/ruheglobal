// src/lib/counselor-duty.ts
// Which counselor gets the next new applicant, and giving new accounts that counselor.
//
// Two rotas, both a circle of counselors in the order they were created (oldest first):
//   "frontdesk"  the front desk counselors (User.isFrontDesk). Every new account goes to one of them first.
//                They read the profile and pass the applicant on to the right counselor.
//   "main"       all the other counselors. Used only when no front desk counselor is active, so an
//                account is never left without someone.
// A new account goes to the counselor whose turn it is, and the turn then moves to the next one, so the
// work is shared evenly. A counselor who is disabled or on leave (User.isActive = false) is skipped, and
// keeps their place for when they come back. Where each rota has reached is one row of CounselorRotation.
import { db } from "@/lib/db";

export type RotaPool = "frontdesk" | "main";

const ROTATION_ID: Record<RotaPool, string> = { frontdesk: "frontdesk", main: "main" };
const MAX_TRIES = 5;

export type RotaCounselor = { id: string; isActive: boolean };

// The first active counselor at or after the turn, going round the circle. null when nobody is active.
// A turn that points at nobody (no row yet, or that person left the rota) starts at the top.
export function pickOnDuty(rota: RotaCounselor[], turnId: string | null): { index: number; id: string } | null {
  if (rota.length === 0) return null;
  const start = Math.max(0, rota.findIndex((c) => c.id === turnId));
  for (let step = 0; step < rota.length; step++) {
    const index = (start + step) % rota.length;
    if (rota[index].isActive) return { index, id: rota[index].id };
  }
  return null;
}

// Every counselor of the pool, active or not, in the fixed order of the rota
async function loadRota(pool: RotaPool): Promise<RotaCounselor[]> {
  return db.user.findMany({
    where: { role: "COUNSELOR", isFrontDesk: pool === "frontdesk" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, isActive: true },
  });
}

async function loadTurn(pool: RotaPool): Promise<{ counselorId: string | null } | null> {
  return db.counselorRotation.findUnique({ where: { id: ROTATION_ID[pool] }, select: { counselorId: true } });
}

// The counselor of the pool who gets the next new account
export async function getCounselorOnDuty(pool: RotaPool = "frontdesk"): Promise<string | null> {
  const [rota, row] = await Promise.all([loadRota(pool), loadTurn(pool)]);
  return pickOnDuty(rota, row?.counselorId ?? null)?.id ?? null;
}

// The active counselors of the pool in the order they will receive the next new accounts
export async function getRotaQueue(pool: RotaPool = "frontdesk"): Promise<{ onDutyId: string | null; queue: string[] }> {
  const [rota, row] = await Promise.all([loadRota(pool), loadTurn(pool)]);
  const picked = pickOnDuty(rota, row?.counselorId ?? null);
  if (!picked) return { onDutyId: null, queue: [] };
  const queue = [...rota.slice(picked.index), ...rota.slice(0, picked.index)].filter((c) => c.isActive).map((c) => c.id);
  return { onDutyId: picked.id, queue };
}

// Takes the next turn of a pool: returns the counselor whose turn it is and moves the rota on to the one
// after. Two sign ups at the same moment cannot take the same turn: the move only succeeds for the first
// one, the second reads the new position and tries again.
export async function claimNextCounselor(pool: RotaPool = "frontdesk"): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const [rota, row] = await Promise.all([loadRota(pool), loadTurn(pool)]);
    const picked = pickOnDuty(rota, row?.counselorId ?? null);
    if (!picked) return null;
    const nextTurn = rota[(picked.index + 1) % rota.length].id;

    if (!row) {
      try {
        await db.counselorRotation.create({ data: { id: ROTATION_ID[pool], counselorId: nextTurn } });
        return picked.id;
      } catch {
        continue; // another sign up created the row first, read it again
      }
    }

    const moved = await db.counselorRotation.updateMany({
      where: { id: ROTATION_ID[pool], counselorId: row.counselorId },
      data: { counselorId: nextTurn },
    });
    if (moved.count === 1) return picked.id;
  }
  return null;
}

// Gives a brand new applicant to the front desk counselor whose turn it is (or, with no active front desk,
// to the regular counselor whose turn it is). Never throws: a problem here must not stop an account from
// being created. Does nothing, and uses up no turn, when the user already has a counselor or is not an applicant.
export async function assignCounselorToUser(userId: string): Promise<void> {
  try {
    const user = await db.user.findFirst({ where: { id: userId, role: "USER", counselorId: null }, select: { id: true } });
    if (!user) return;

    const counselorId = (await claimNextCounselor("frontdesk")) ?? (await claimNextCounselor("main"));
    if (!counselorId) return;

    await db.user.updateMany({ where: { id: userId, role: "USER", counselorId: null }, data: { counselorId } });
  } catch (error) {
    console.error("Could not assign a counselor to the new user:", error);
  }
}