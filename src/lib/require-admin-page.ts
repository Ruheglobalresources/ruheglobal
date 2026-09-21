import { redirect } from "next/navigation";
import { auth } from "@/auth";

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