import { db } from "@/lib/db";
import { auth } from "@/auth";
import { RoleControl } from "./role-control";
import { BioForm } from "./bio-form";
import { DutyRota, type RotaWeek } from "./duty-rota";
import { Badge } from "@/components/ui/badge";
import { getDutySchedule, startOfDutyWeek } from "@/lib/counselor-duty";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const formatDay = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });

export default async function AdminCounselorsPage() {
  const [session, staff, applicantCount, schedule] = await Promise.all([
    auth(),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "COUNSELOR"] } },
      orderBy: { name: "asc" },
      include: { _count: { select: { counseledSubmissions: true, clients: true } } },
    }),
    db.user.count({ where: { role: "USER" } }),
    getDutySchedule(8),
  ]);

  const counselors = staff.filter((u) => u.role === "COUNSELOR").map((u) => ({ id: u.id, name: u.name ?? u.email ?? "Unnamed" }));
  const currentWeek = startOfDutyWeek().getTime();
  const onDutyNow = schedule[0]?.counselorId ?? null;

  const weeks: RotaWeek[] = schedule.map((w) => ({
    weekStartIso: w.weekStart.toISOString(),
    label: `${formatDay(w.weekStart)} to ${formatDay(new Date(w.weekStart.getTime() + 6 * DAY_MS))}`,
    isCurrent: w.weekStart.getTime() === currentWeek,
    counselorId: w.counselorId,
    explicit: w.explicit,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Counselors</h1>
        <p className="text-sm text-neutral-500">
          Staff who guide applicants. {applicantCount} registered applicant(s) aren&apos;t shown here, find them under Users.
        </p>
      </div>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-neutral-700">On duty</h2>
        <p className="mb-3 text-sm text-neutral-500">
          Every new account is given the counselor on duty that week. A week you leave alone keeps the counselor of the week before.
        </p>
        <div className="overflow-hidden rounded-xl border bg-white">
          <DutyRota weeks={weeks} counselors={counselors} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Staff</h2>
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Applicants</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3">Bio</th>
                <th className="px-4 py-3 text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-b align-top last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {u.name ?? "Unnamed"}
                    {u.id === session?.user.id && <Badge variant="secondary" className="ml-2">You</Badge>}
                    {u.id === onDutyNow && <Badge className="ml-2">On duty</Badge>}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{u._count.clients}</td>
                  <td className="px-4 py-3 text-neutral-500">{u._count.counseledSubmissions}</td>
                  <td className="px-4 py-3 text-sm">
                    {u.role === "COUNSELOR" ? <BioForm userId={u.id} bio={u.bio} /> : <span className="text-neutral-300">None</span>}
                  </td>
                  <td className="px-4 py-3 text-right"><RoleControl userId={u.id} role={u.role} /></td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No admins or counselors yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}