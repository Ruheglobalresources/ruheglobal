import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// admin/layout.tsx now admits ADMIN and COUNSELOR (counselors need
// /admin/blog). Everything else under /admin must stay ADMIN-only, so each
// of those pages calls this at the top — otherwise a counselor could reach
// them just by typing the URL, since AdminTabs hiding a tab isn't real
// protection on its own.
export async function requireAdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin/blog");
  return session.user;
}

// The Users pages are for admins, and for a counselor who is on the front desk: they read the profile of the
// applicants given to them and pass each one on. Returns who is looking, so the page can show a front desk
// counselor only their own applicants.
export async function requireAdminOrFrontDeskPage(): Promise<{ role: "ADMIN" } | { role: "COUNSELOR"; id: string }> {
  const session = await auth();
  if (session?.user.role === "ADMIN") return { role: "ADMIN" };

  const id = session?.user?.id;
  if (session?.user.role === "COUNSELOR" && id) {
    const desk = await db.user.findFirst({ where: { id, role: "COUNSELOR", isFrontDesk: true }, select: { id: true } });
    if (desk) return { role: "COUNSELOR", id: desk.id };
  }
  redirect("/admin/blog");
}