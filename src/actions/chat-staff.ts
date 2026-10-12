"use server";

// src/actions/chat-staff.ts
// The staff side of the chat: what a counselor or an admin sees in the chat bar.
// Applicants keep ONE conversation (actions/chat.ts). Staff have an inbox of many:
//   - counselors: the conversations they are on, those of the applicants assigned to them,
//     and their own
//   - admins: the same, plus every conversation nobody has picked up yet
// Admins can also open any conversation by its link (the email alert, the admin pages).
// Replying joins the person to the conversation as staff, and clears its "awaiting a reply" mark.
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import type { ChatMessage } from "@/lib/chat-service";

const PAGE_SIZE = 50;
const CHAT_MAX_LENGTH = 2000;

type Role = "USER" | "COUNSELOR" | "ADMIN";
type Person = { id: string; name: string | null; email: string | null; image: string | null; role: Role };

export type InboxItem = {
  id: string;
  person: Person | null; // the other side; null for the person's own thread with nobody on it yet
  subject: string | null;
  lastMessage: { body: string | null; hasFile: boolean; fromMe: boolean; at: string } | null;
  lastMessageAt: string;
  unread: number;
  unassigned: boolean;
  awaiting: boolean;
};

export type StaffThread = {
  id: string;
  status: "OPEN" | "CLOSED";
  person: Person | null;
  staff: { id: string; name: string | null }[];
  messages: ChatMessage[]; // oldest first
  hasMore: boolean;
};

async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "COUNSELOR" && user.role !== "ADMIN") throw new Error("Forbidden");
  return { id: user.id, role: user.role };
}
type Staff = Awaited<ReturnType<typeof requireStaff>>;

// the conversations that belong in this person's inbox
function inboxWhere(user: Staff): Prisma.ConversationWhereInput {
  const mine: Prisma.ConversationWhereInput[] = [
    { staff: { some: { id: user.id } } },
    { clientId: user.id },
    { client: { counselorId: user.id } },
  ];
  return user.role === "ADMIN" ? { OR: [...mine, { staff: { none: {} } }] } : { OR: mine };
}

// Counselors can open what is in their inbox, admins can open anything.
function accessWhere(user: Staff): Prisma.ConversationWhereInput {
  return user.role === "ADMIN" ? {} : inboxWhere(user);
}

const personSelect = { id: true, name: true, email: true, image: true, role: true } as const;

const staffMessageSelect = {
  id: true,
  senderId: true,
  body: true,
  fileUrl: true,
  seenByIds: true,
  createdAt: true,
  sender: { select: { name: true } },
} as const;

type StaffMessageRow = {
  id: string;
  senderId: string;
  body: string | null;
  fileUrl: string | null;
  seenByIds: string[];
  createdAt: Date;
  sender: { name: string | null };
};

function toStaffMessage(row: StaffMessageRow, userId: string): ChatMessage {
  return {
    id: row.id,
    body: row.body,
    fileUrl: row.fileUrl,
    createdAt: row.createdAt.toISOString(),
    fromMe: row.senderId === userId,
    seenByMe: row.seenByIds.includes(userId),
    seenByOther: row.seenByIds.some((id) => id !== userId),
    senderName: row.sender.name,
  };
}

async function fetchPage(conversationId: string, userId: string, before?: Date) {
  const rows = await db.message.findMany({
    where: { conversationId, ...(before ? { createdAt: { lt: before } } : {}) },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    select: staffMessageSelect,
  });
  return {
    messages: rows.slice(0, PAGE_SIZE).reverse().map((row) => toStaffMessage(row, userId)),
    hasMore: rows.length > PAGE_SIZE,
  };
}

export async function loadInbox(): Promise<InboxItem[]> {
  const user = await requireStaff();

  const rows = await db.conversation.findMany({
    where: { status: "OPEN", ...inboxWhere(user) },
    orderBy: { lastMessageAt: "desc" },
    take: 60,
    select: {
      id: true,
      subject: true,
      clientId: true,
      awaitingSince: true,
      lastMessageAt: true,
      client: { select: personSelect },
      staff: { select: personSelect, take: 1 },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, fileUrl: true, senderId: true, createdAt: true } },
      _count: {
        select: {
          staff: true, // 0 means nobody has picked it up yet
          messages: { where: { senderId: { not: user.id }, NOT: { seenByIds: { has: user.id } } } },
        },
      },
    },
  });

  return rows.map((row) => {
    const last = row.messages[0] ?? null;
    return {
      id: row.id,
      // in my own thread the other side is whoever picked it up; otherwise it is the client
      person: row.clientId === user.id ? (row.staff[0] ?? null) : row.client,
      subject: row.subject,
      lastMessage: last ? { body: last.body, hasFile: !!last.fileUrl, fromMe: last.senderId === user.id, at: last.createdAt.toISOString() } : null,
      lastMessageAt: row.lastMessageAt.toISOString(),
      unread: row._count.messages,
      unassigned: row._count.staff === 0,
      awaiting: !!row.awaitingSince,
    };
  });
}

export async function loadThread(conversationId: string): Promise<StaffThread | null> {
  const user = await requireStaff();

  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, ...accessWhere(user) },
    select: {
      id: true,
      status: true,
      clientId: true,
      client: { select: personSelect },
      staff: { select: personSelect },
    },
  });
  if (!conversation) return null;

  const { messages, hasMore } = await fetchPage(conversation.id, user.id);
  const mine = conversation.clientId === user.id;

  return {
    id: conversation.id,
    status: conversation.status,
    person: mine ? (conversation.staff[0] ?? null) : conversation.client,
    staff: conversation.staff.map((s) => ({ id: s.id, name: s.name })),
    messages,
    hasMore,
  };
}

export async function loadEarlierStaff(
  conversationId: string,
  beforeIso: string
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const user = await requireStaff();
  const before = new Date(beforeIso);
  if (Number.isNaN(before.getTime())) return { messages: [], hasMore: false };

  const allowed = await db.conversation.findFirst({ where: { id: conversationId, ...accessWhere(user) }, select: { id: true } });
  if (!allowed) return { messages: [], hasMore: false };

  return fetchPage(conversationId, user.id, before);
}

// Called while a conversation is open on screen: everything the others wrote is now read.
export async function markSeenStaff(conversationId: string): Promise<void> {
  const user = await requireStaff();

  const allowed = await db.conversation.findFirst({ where: { id: conversationId, ...accessWhere(user) }, select: { id: true } });
  if (!allowed) return;

  await db.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, NOT: { seenByIds: { has: user.id } } },
    data: { seenByIds: { push: user.id } },
  });
}

type SendResult = { success: true; message: ChatMessage } | { success: false; error: string };

export async function sendStaffMessage(input: { conversationId: string; body: string }): Promise<SendResult> {
  const user = await requireStaff();

  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) return { success: false, error: "Write a message first" };
  if (body.length > CHAT_MAX_LENGTH) return { success: false, error: `Messages can be up to ${CHAT_MAX_LENGTH} characters` };

  const conversation = await db.conversation.findFirst({
    where: { id: input.conversationId, ...accessWhere(user) },
    select: { id: true, status: true, clientId: true, staff: { select: { id: true } } },
  });
  if (!conversation) return { success: false, error: "This conversation is no longer available" };
  if (conversation.status === "CLOSED") return { success: false, error: "This conversation is closed" };

  const ownThread = conversation.clientId === user.id;
  const alreadyOn = conversation.staff.some((s) => s.id === user.id);

  const [message] = await db.$transaction([
    db.message.create({
      data: { conversationId: conversation.id, senderId: user.id, body, seenByIds: [user.id] },
      select: staffMessageSelect,
    }),
    db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        // a staff reply means nobody is waiting any more (not in a thread the staff member started as a client)
        ...(ownThread ? {} : { awaitingSince: null }),
        // replying puts the person on the conversation
        ...(!ownThread && !alreadyOn ? { staff: { connect: { id: user.id } } } : {}),
      },
    }),
  ]);

  return { success: true, message: toStaffMessage(message, user.id) };
}