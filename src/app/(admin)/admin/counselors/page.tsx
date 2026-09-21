import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RoleControl } from "./role-control";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCounselorsPage() {
  const [session, staff, applicantCount] = await Promise.all([
    auth(),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "COUNSELOR"] } },
      orderBy: { name: "asc" },
      include: { _count: { select: { counseledSubmissions: true } } },
    }),
    db.user.count({ where: { role: "USER" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Counselors</h1>
        <p className="text-sm text-neutral-500">
          Staff who can be assigned to guide an applicant through a submission. {applicantCount} registered applicant(s) aren't shown here.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Assigned submissions</th>
              <th className="px-4 py-3 text-right">Role</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  {u.name ?? "Unnamed"}
                  {u.id === session?.user.id && <Badge variant="secondary" className="ml-2">You</Badge>}
                </td>
                <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                <td className="px-4 py-3 text-neutral-500">{u._count.counseledSubmissions}</td>
                <td className="px-4 py-3 text-right"><RoleControl userId={u.id} role={u.role} /></td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No admins or counselors yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
