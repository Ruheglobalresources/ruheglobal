import { db } from "@/lib/db";
import { auth } from "@/auth";
import { requireAdminPage } from "@/lib/require-admin-page";
import { RoleControl } from "./role-control";
import { BioForm } from "./bio-form";
import { ActiveControl } from "./active-control";
import { FrontDeskControl } from "./front-desk-control";
import { Badge } from "@/components/ui/badge";
import { getRotaQueue } from "@/lib/counselor-duty";

export const dynamic = "force-dynamic";

// the green dot of an active counselor; a disabled one gets a grey dot
function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      role="img"
      aria-label={active ? "Active" : "Disabled"}
      title={active ? "Active" : "Disabled or on leave"}
      className={`mr-2 inline-block size-2.5 shrink-0 rounded-full ${active ? "bg-emerald-500" : "bg-neutral-300"}`}
    />
  );
}

export default async function AdminCounselorsPage() {
  await requireAdminPage();
  const [session, staff, applicantCount, frontDeskRota, regularRota] = await Promise.all([
    auth(),
    db.user.findMany({
      where: { role: { in: ["ADMIN", "COUNSELOR"] } },
      orderBy: { name: "asc" },
      include: { _count: { select: { counseledSubmissions: true, clients: true } } },
    }),
    db.user.count({ where: { role: "USER" } }),
    getRotaQueue("frontdesk"),
    getRotaQueue("main"),
  ]);

  // New accounts go to the front desk first. With no active front desk counselor they go straight to the
  // regular counselors, so nobody is left without one.
  const viaFrontDesk = frontDeskRota.queue.length > 0;
  const rota = viaFrontDesk ? frontDeskRota : regularRota;

  const nameOf = new Map(staff.map((u) => [u.id, u.name ?? u.email ?? "Unnamed"]));
  const activeCount = staff.filter((u) => u.role === "COUNSELOR" && u.isActive).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Counselors</h1>
        <p className="text-sm text-neutral-500">
          Staff who guide applicants. {applicantCount} registered applicant(s) aren&apos;t shown here, find them under Users.
        </p>
      </div>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-neutral-700">{viaFrontDesk ? "Front desk, next up" : "Next up"}</h2>
        <p className="mb-3 text-sm text-neutral-500">
          {viaFrontDesk
            ? "Each new account goes to the front desk counselor whose turn it is, then the turn moves to the next one. They read the profile and pass the applicant on to the right counselor. Disabled or on leave counselors are skipped."
            : "No active front desk counselor, so each new account goes straight to the regular counselor whose turn it is. Turn a counselor to Front desk below to start the front desk."}
        </p>
        <div className="rounded-xl border bg-white px-4 py-4">
          {rota.queue.length > 0 ? (
            <ol className="flex flex-wrap gap-2">
              {rota.queue.map((id, index) => (
                <li
                  key={id}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                    index === 0 ? "border-emerald-200 bg-emerald-50 font-medium text-emerald-900" : "bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <span className="text-xs text-neutral-400">{index + 1}</span>
                  {nameOf.get(id)}
                  {index === 0 && <span className="text-xs">gets the next account</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-neutral-500">
              No active counselor. New accounts will not get a counselor until someone is set to Counselor and Active below.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">
          Staff <span className="font-normal text-neutral-400">({activeCount} active counselor(s))</span>
        </h2>
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Applicants</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3">Bio</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Desk</th>
                <th className="px-4 py-3 text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-b align-top last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center">
                      {u.role === "COUNSELOR" && <StatusDot active={u.isActive} />}
                      {u.name ?? "Unnamed"}
                    </span>
                    {u.id === session?.user.id && <Badge variant="secondary" className="ml-2">You</Badge>}
                    {u.id === rota.onDutyId && <Badge className="ml-2">Next up</Badge>}
                    {u.role === "COUNSELOR" && u.isFrontDesk && <Badge variant="outline" className="ml-2">Front desk</Badge>}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{u._count.clients}</td>
                  <td className="px-4 py-3 text-neutral-500">{u._count.counseledSubmissions}</td>
                  <td className="px-4 py-3 text-sm">
                    {u.role === "COUNSELOR" ? <BioForm userId={u.id} bio={u.bio} /> : <span className="text-neutral-300">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "COUNSELOR" ? <ActiveControl userId={u.id} isActive={u.isActive} /> : <span className="text-neutral-300">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.role === "COUNSELOR" ? <FrontDeskControl userId={u.id} isFrontDesk={u.isFrontDesk} /> : <span className="text-neutral-300">None</span>}
                  </td>
                  <td className="px-4 py-3 text-right"><RoleControl userId={u.id} role={u.role} /></td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-400">No admins or counselors yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}