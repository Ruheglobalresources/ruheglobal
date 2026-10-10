import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ConversationControls } from "./conversation-controls";

export const dynamic = "force-dynamic";

const MESSAGE_LIMIT = 200;
const ROLE_LABELS = { USER: "Applicant", COUNSELOR: "Counselor", ADMIN: "Admin" } as const;

const formatDateTime = (d: Date) =>
  d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const isImage = (url: string) => /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(url);

// Reading a conversation here does not mark anything as seen: the applicant and the
// counselor should not see a read receipt from an admin who is only reviewing.
export default async function AdminConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [conversation, newest, staffCandidates] = await Promise.all([
    db.conversation.findUnique({
      where: { id },
      select: {
        id: true,
        subject: true,
        status: true,
        submissionId: true,
        awaitingSince: true,
        createdAt: true,
        lastMessageAt: true,
        client: { select: { id: true, name: true, email: true, role: true, counselor: { select: { id: true, name: true } } } },
        staff: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } },
      },
    }),
    db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "desc" },
      take: MESSAGE_LIMIT,
      select: {
        id: true,
        body: true,
        fileUrl: true,
        seenByIds: true,
        createdAt: true,
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    db.user.findMany({ where: { role: { in: ["COUNSELOR", "ADMIN"] } }, orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);

  if (!conversation) notFound();

  const messages = [...newest].reverse();
  const onIds = new Set(conversation.staff.map((s) => s.id));
  const candidates = staffCandidates.filter((p) => !onIds.has(p.id)).map((p) => ({ id: p.id, name: p.name ?? p.email ?? "Unnamed" }));
  const staff = conversation.staff.map((s) => ({ id: s.id, name: s.name ?? s.email ?? "Unnamed" }));

  const clientName = conversation.client.name ?? conversation.client.email ?? "Unnamed";
  let lastDay = "";

  return (
    <div className="space-y-6">
      <Link href="/admin/conversations" className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:underline">
        <ArrowLeft size={12} /> All conversations
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">
              <Link href={`/admin/users/${conversation.client.id}`} className="hover:underline">{clientName}</Link>
            </h1>
            <Badge variant="secondary">{ROLE_LABELS[conversation.client.role]}</Badge>
            <Badge variant={conversation.status === "OPEN" ? "default" : "secondary"}>{conversation.status === "OPEN" ? "Open" : "Closed"}</Badge>
            {conversation.awaitingSince && conversation.status === "OPEN" && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Waiting since {formatDateTime(conversation.awaitingSince)}
              </span>
            )}
          </div>
          {conversation.client.email && <p className="text-sm text-neutral-500">{conversation.client.email}</p>}
          {conversation.subject && <p className="mt-1 text-sm text-neutral-600">{conversation.subject}</p>}

          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-xs font-medium text-neutral-400">Started</dt>
              <dd>{formatDateTime(conversation.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-400">Last message</dt>
              <dd>{formatDateTime(conversation.lastMessageAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-neutral-400">Messages</dt>
              <dd>{conversation._count.messages}</dd>
            </div>
            {conversation.client.counselor && (
              <div>
                <dt className="text-xs font-medium text-neutral-400">Applicant&apos;s counselor</dt>
                <dd>{conversation.client.counselor.name ?? "Unnamed"}</dd>
              </div>
            )}
            {conversation.submissionId && (
              <div>
                <dt className="text-xs font-medium text-neutral-400">About</dt>
                <dd>
                  <Link href={`/admin/submissions/${conversation.submissionId}`} className="text-[color:var(--color-teal)] hover:underline">
                    The application
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <ConversationControls conversationId={conversation.id} status={conversation.status} staff={staff} candidates={candidates} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Messages</h2>
        {conversation._count.messages > messages.length && (
          <p className="mb-3 text-xs text-neutral-400">Showing the latest {messages.length} of {conversation._count.messages} messages.</p>
        )}

        <div className="space-y-1 rounded-xl border bg-white p-4">
          {messages.map((m) => {
            const day = m.createdAt.toDateString();
            const showDay = day !== lastDay;
            lastDay = day;
            const fromClient = m.sender.id === conversation.client.id;
            const seen = m.seenByIds.some((seenBy) => seenBy !== m.sender.id);

            return (
              <div key={m.id}>
                {showDay && (
                  <p className="py-3 text-center text-xs font-medium text-neutral-400">
                    {m.createdAt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
                <div className={`flex ${fromClient ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${fromClient ? "rounded-bl-md bg-neutral-100" : "rounded-br-md bg-[color:var(--color-teal)]/10"}`}>
                    <p className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500">
                      <Link href={`/admin/users/${m.sender.id}`} className="font-medium text-neutral-700 hover:underline">
                        {m.sender.name ?? m.sender.email ?? "Unnamed"}
                      </Link>
                      <span>{ROLE_LABELS[m.sender.role]}</span>
                    </p>
                    {m.fileUrl &&
                      (isImage(m.fileUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.fileUrl} alt="Attachment" className="mb-2 max-h-60 rounded-lg object-cover" />
                      ) : (
                        <a href={m.fileUrl} target="_blank" rel="noreferrer" className="mb-1 block font-medium text-[color:var(--color-teal)] underline">
                          Open attachment
                        </a>
                      ))}
                    {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                    <p className="mt-1 text-right text-[11px] text-neutral-400">
                      {m.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      {seen ? " · Seen" : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">No messages yet.</p>}
        </div>
      </section>
    </div>
  );
}