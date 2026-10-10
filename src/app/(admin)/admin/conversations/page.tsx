import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const VIEWS = [
  { key: "open", label: "Open" },
  { key: "awaiting", label: "Awaiting reply" },
  { key: "unassigned", label: "Unassigned" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
] as const;
type View = (typeof VIEWS)[number]["key"];

const ROLE_LABELS = { USER: "Applicant", COUNSELOR: "Counselor", ADMIN: "Admin" } as const;

const viewWhere: Record<View, Prisma.ConversationWhereInput> = {
  open: { status: "OPEN" },
  awaiting: { status: "OPEN", awaitingSince: { not: null } },
  unassigned: { status: "OPEN", staff: { none: {} } },
  closed: { status: "CLOSED" },
  all: {},
};

// "25m", "3h", "2d": how long ago, in the shortest useful form
function ago(date: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default async function AdminConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; page?: string }>;
}) {
  const { view: viewParam, q, page } = await searchParams;
  const view: View = VIEWS.some((v) => v.key === viewParam) ? (viewParam as View) : "open";
  const query = q?.trim().slice(0, 80) || "";
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const where: Prisma.ConversationWhereInput = {
    ...viewWhere[view],
    ...(query
      ? { client: { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } }
      : {}),
  };

  const [rows, counts] = await Promise.all([
    db.conversation.findMany({
      where,
      // the ones waiting longest come first in the awaiting view
      orderBy: view === "awaiting" ? { awaitingSince: "asc" } : { lastMessageAt: "desc" },
      skip: (pageNumber - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1,
      select: {
        id: true,
        subject: true,
        status: true,
        awaitingSince: true,
        lastMessageAt: true,
        client: { select: { id: true, name: true, email: true, role: true } },
        staff: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, fileUrl: true, senderId: true } },
        _count: { select: { messages: true } },
      },
    }),
    Promise.all(VIEWS.map((v) => db.conversation.count({ where: viewWhere[v.key] }))),
  ]);

  const hasNext = rows.length > PAGE_SIZE;
  const list = rows.slice(0, PAGE_SIZE);
  const href = (params: { view?: View; page?: number }) =>
    `/admin/conversations?${new URLSearchParams({
      view: params.view ?? view,
      ...(query ? { q: query } : {}),
      ...(params.page && params.page > 1 ? { page: String(params.page) } : {}),
    })}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Conversations</h1>
          <p className="text-sm text-neutral-500">Every chat between applicants and the team.</p>
        </div>
        <form className="flex gap-2">
          <input type="hidden" name="view" value={view} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name or email"
            className="h-9 w-64 rounded-md border bg-white px-3 text-sm outline-none focus:border-neutral-400"
          />
          <button type="submit" className="h-9 rounded-md border bg-white px-3 text-sm font-medium hover:bg-neutral-50">Search</button>
        </form>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {VIEWS.map((v, i) => (
          <Link
            key={v.key}
            href={href({ view: v.key })}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              view === v.key ? "border-neutral-900 bg-neutral-900 text-white" : "bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {v.label} <span className="opacity-60">{counts[i]}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Looking after it</th>
              <th className="px-4 py-3">Latest message</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const last = c.messages[0];
              const fromClient = last?.senderId === c.client.id;
              return (
                <tr key={c.id} className="border-b align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.client.name ?? c.client.email ?? "Unnamed"}</p>
                    <p className="text-xs text-neutral-400">
                      {ROLE_LABELS[c.client.role]}
                      {c.client.email && c.client.name ? ` · ${c.client.email}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.staff.length ? c.staff.map((s) => s.name ?? "Unnamed").join(", ") : <Badge variant="secondary">Unassigned</Badge>}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-neutral-600">
                    <p className="line-clamp-2">
                      {last ? `${fromClient ? "" : "Team: "}${last.body?.trim() || (last.fileUrl ? "Attachment" : "")}` : <span className="text-neutral-300">No messages</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">{c._count.messages} {c._count.messages === 1 ? "message" : "messages"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "CLOSED" ? (
                      <span className="text-xs text-neutral-400">Closed</span>
                    ) : c.awaitingSince ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Waiting {ago(c.awaitingSince)}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">Answered {ago(c.lastMessageAt)} ago</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/conversations/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-teal)] hover:underline"
                    >
                      Read <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-400">{query ? "No conversations match that search." : "Nothing here."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(pageNumber > 1 || hasNext) && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {pageNumber > 1 ? <Link href={href({ page: pageNumber - 1 })} className="font-medium hover:underline">Previous</Link> : <span />}
          <span className="text-neutral-400">Page {pageNumber}</span>
          {hasNext ? <Link href={href({ page: pageNumber + 1 })} className="font-medium hover:underline">Next</Link> : <span />}
        </div>
      )}
    </div>
  );
}