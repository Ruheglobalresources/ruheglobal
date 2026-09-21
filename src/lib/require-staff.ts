import { auth } from "@/auth";

// Blog authoring is the one part of the app open to counselors, not just
// admins — everything else under /admin stays ADMIN-only via requireAdmin,
// so this is deliberately a separate helper rather than a change to it.
export async function requireStaff() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COUNSELOR")) {
    throw new Error("Unauthorized");
  }
  return { ...session.user, id: session.user.id! };
}