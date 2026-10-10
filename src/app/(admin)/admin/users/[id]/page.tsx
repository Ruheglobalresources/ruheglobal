import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { UserCounselorSelect } from "../user-counselor-select";
import { UserRoleControl } from "./user-role-control";

export const dynamic = "force-dynamic";

const ROLE_LABELS = { USER: "Applicant", COUNSELOR: "Counselor", ADMIN: "Admin" } as const;
const PROVIDER_LABELS: Record<string, string> = { google: "Google" };

const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const formatDateTime = (d: Date) => d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-neutral-800">{children}</dd>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [user, conversations, counselorRows] = await Promise.all([
    db.user.findUnique({
      where: { id },
      include: {
        counselor: { select: { id: true, name: true, email: true } },
        accounts: { select: { provider: true } },
        submissions: {
          orderBy: { updatedAt: "desc" },
          include: {
            application: { select: { name: true, terminal: { select: { name: true } } } },
            _count: { select: { versions: true } },
          },
        },
        clients: { orderBy: { name: "asc" }, select: { id: true, name: true, email: true }, take: 50 },
        _count: { select: { clients: true, counseledSubmissions: true } },
      },
    }),
    db.conversation.findMany({
      where: { clientId: id },
      orderBy: { lastMessageAt: "desc" },
      select: { id: true, subject: true, status: true, lastMessageAt: true, _count: { select: { messages: true } } },
    }),
    db.user.findMany({ where: { role: "COUNSELOR" }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);

  if (!user) notFound();

  const counselors = counselorRows.map((c) => ({ id: c.id, name: c.name ?? c.email ?? "Unnamed" }));
  const isApplicant = user.role === "USER";
  const isStaff = user.role === "COUNSELOR";

  const signInMethods = [
    ...(user.password ? ["Email and password"] : []),
    ...user.accounts.map((a) => PROVIDER_LABELS[a.provider] ?? a.provider),
  ];

  // how many submissions sit in each status
  const statusCounts = new Map<string, number>();
  for (const s of user.submissions) statusCounts.set(s.status, (statusCounts.get(s.status) ?? 0) + 1);

  const initials = (user.name ?? user.email ?? "?").trim().slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:underline">
        <ArrowLeft size={12} /> All users
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        {user.image ? (
          <Image src={user.image} alt="" width={56} height={56} className="size-14 rounded-full object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-full bg-neutral-200 text-base font-semibold text-neutral-600">{initials}</span>
        )}
        <div>
          <h1 className="text-xl font-semibold">{user.name ?? "Unnamed"}</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
        <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Account</h2>
          <dl className="space-y-3">
            <Field label="Joined">{formatDate(user.createdAt)}</Field>
            <Field label="Email">
              {user.emailVerified ? `Verified on ${formatDate(user.emailVerified)}` : <span className="text-amber-700">Not verified</span>}
            </Field>
            <Field label="Signs in with">{signInMethods.length > 0 ? signInMethods.join(", ") : "Nothing set up"}</Field>
            <Field label="Two factor">{user.isTwoFactorEnabled ? "On" : "Off"}</Field>
          </dl>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">{isApplicant ? "Counselor" : "Role"}</h2>
          <div className="space-y-4">
            {isApplicant && (
              <div>
                <p className="mb-1 text-xs font-medium text-neutral-400">Looking after this applicant</p>
                <UserCounselorSelect userId={user.id} counselorId={user.counselorId} counselors={counselors} />
                {user.counselor?.email && <p className="mt-1 text-xs text-neutral-400">{user.counselor.email}</p>}
              </div>
            )}
            <div>
              <p className="mb-1 text-xs font-medium text-neutral-400">Role</p>
              <UserRoleControl userId={user.id} role={user.role} />
              {isApplicant && counselors.length === 0 && (
                <p className="mt-1 text-xs text-neutral-400">Set someone to Counselor and they can be assigned to applicants.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">{isApplicant ? "Summary" : "Workload"}</h2>
          <dl className="space-y-3">
            {isApplicant ? (
              <>
                <Field label="Applications">{user.submissions.length}</Field>
                <Field label="Conversations">{conversations.length}</Field>
              </>
            ) : (
              <>
                <Field label="Applicants assigned">{user._count.clients}</Field>
                <Field label="Submissions assigned">{user._count.counseledSubmissions}</Field>
              </>
            )}
          </dl>
          {isStaff && user.bio && <p className="mt-3 border-t pt-3 text-sm text-neutral-600">{user.bio}</p>}
        </section>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-neutral-700">Applications</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(statusCounts.entries()).map(([status, count]) => (
              <span key={status} className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <StatusBadge status={status} /> {count}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">For</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Step</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {user.submissions.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {s.application.name}
                    <div className="text-xs font-normal text-neutral-400">{s.application.terminal.name}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {s.targetName ? (
                      <>
                        {s.targetName}
                        {s.targetCourseName && <div className="text-xs text-neutral-400">{s.targetCourseName}</div>}
                      </>
                    ) : (
                      <span className="text-neutral-300">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                    {s._count.versions > 1 && <div className="mt-1 text-xs text-neutral-400">Sent {s._count.versions} times</div>}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{s.currentStep}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(s.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/submissions/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-teal)] hover:underline"
                    >
                      Open <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {user.submissions.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No applications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isApplicant && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Conversations</h2>
          <div className="overflow-hidden rounded-xl border bg-white">
            <ul className="divide-y text-sm">
              {conversations.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <Link href={`/admin/conversations/${c.id}`} className="font-medium hover:underline">{c.subject ?? "Chat with the counselor"}</Link>
                  <span className="text-xs text-neutral-400">
                    {c.status === "OPEN" ? "Open" : "Closed"} · {c._count.messages} {c._count.messages === 1 ? "message" : "messages"} · last {formatDateTime(c.lastMessageAt)}
                  </span>
                </li>
              ))}
              {conversations.length === 0 && <li className="px-4 py-8 text-center text-neutral-400">No conversations yet.</li>}
            </ul>
          </div>
        </section>
      )}

      {!isApplicant && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            Applicants assigned{user._count.clients > user.clients.length ? ` (showing ${user.clients.length} of ${user._count.clients})` : ""}
          </h2>
          <div className="overflow-hidden rounded-xl border bg-white">
            <ul className="divide-y text-sm">
              {user.clients.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-3">
                  <span className="font-medium">{c.name ?? "Unnamed"} <span className="font-normal text-neutral-400">{c.email}</span></span>
                  <Link href={`/admin/users/${c.id}`} className="text-xs font-medium text-[color:var(--color-teal)] hover:underline">Open</Link>
                </li>
              ))}
              {user.clients.length === 0 && <li className="px-4 py-8 text-center text-neutral-400">No applicants assigned.</li>}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}