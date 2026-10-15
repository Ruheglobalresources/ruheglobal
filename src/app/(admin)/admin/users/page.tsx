import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdminOrFrontDeskPage } from "@/lib/require-admin-page";
import { UserCounselorSelect } from "./user-counselor-select";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const viewer = await requireAdminOrFrontDeskPage();
  const deskId = viewer.role === "COUNSELOR" ? viewer.id : null; // a front desk counselor sees only their own applicants
  const { q, page } = await searchParams;
  const query = q?.trim().slice(0, 80) || "";
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const [users, counselorRows] = await Promise.all([
    db.user.findMany({
      where: {
        role: "USER",
        ...(deskId ? { counselorId: deskId } : {}),
        ...(query
          ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNumber - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1, // one extra row tells us there is a next page
      select: { id: true, name: true, email: true, createdAt: true, counselorId: true, profile: { select: { preferredDestination: true, preferredStudyLevel: true, subjects: true } }, _count: { select: { submissions: true } } },
    }),
    db.user.findMany({ where: { role: "COUNSELOR" }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true, isActive: true, isFrontDesk: true } }),
  ]);

  const hasNext = users.length > PAGE_SIZE;
  const rows = users.slice(0, PAGE_SIZE);
  // a front desk counselor passes applicants on to active counselors who are not on the front desk
  const counselors = counselorRows
    .filter((c) => !deskId || c.id === deskId || (c.isActive && !c.isFrontDesk))
    .map((c) => ({ id: c.id, name: c.name ?? c.email ?? "Unnamed", isActive: c.isActive }));

  const href = (p: number) => `/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(p) })}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-neutral-500">
            {deskId
              ? "Applicants given to you. Open one to read the profile, then pass the applicant on to the right counselor."
              : "Applicants and the counselor looking after each one."}
          </p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or email"
            className="h-9 w-64 rounded-md border bg-white px-3 text-sm outline-none focus:border-neutral-400"
          />
          <button type="submit" className="h-9 rounded-md border bg-white px-3 text-sm font-medium hover:bg-neutral-50">Search</button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Study plan</th>
              <th className="px-4 py-3">Applications</th>
              <th className="px-4 py-3">Counselor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/users/${u.id}`} className="hover:underline">{u.name ?? "Unnamed"}</Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                <td className="px-4 py-3 text-neutral-500">{u.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {u.profile && (u.profile.preferredDestination || u.profile.preferredStudyLevel) ? (
                    <>
                      {[u.profile.preferredDestination, u.profile.preferredStudyLevel].filter(Boolean).join(" · ")}
                      {u.profile.subjects.length > 0 && (
                        <div className="text-xs text-neutral-400">{u.profile.subjects.slice(0, 2).join(", ")}</div>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-300">Not filled in</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">{u._count.submissions}</td>
                <td className="px-4 py-3">
                  <UserCounselorSelect userId={u.id} counselorId={u.counselorId} counselors={counselors} allowNone={!deskId} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">{query ? "No users match that search." : "No users yet."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(pageNumber > 1 || hasNext) && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {pageNumber > 1 ? <Link href={href(pageNumber - 1)} className="font-medium hover:underline">Previous</Link> : <span />}
          <span className="text-neutral-400">Page {pageNumber}</span>
          {hasNext ? <Link href={href(pageNumber + 1)} className="font-medium hover:underline">Next</Link> : <span />}
        </div>
      )}
    </div>
  );
}