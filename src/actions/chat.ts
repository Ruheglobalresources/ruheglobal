"use server";

// src/actions/chat.ts
// The applicant's side of the counsellor chat. One OPEN Conversation per
// applicant: it is created lazily on the first message, so opening the panel
// and leaving leaves nothing behind. If a counsellor has been assigned to one
// of the applicant's submissions, they are attached to the conversation as
// staff straight away.
import { after } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { notifyStaffOfAwaitingConversation } from "@/lib/conversation-alerts";

const PAGE_SIZE = 50;
const CHAT_MAX_LENGTH = 2000;

export type ChatMessage = {
  id: string;
  body: string | null;
  fileUrl: string | null;
  createdAt: string; // ISO
  fromMe: boolean;
  seenByMe: boolean;
  seenByOther: boolean;
  senderName?: string | null; // staff view only: who wrote it
  pending?: boolean; // client-only: optimistic message that has not been saved yet
};

export type ChatStaff = { name: string | null; image: string | null };

export type ChatState = {
  conversationId: string | null;
  staff: ChatStaff | null;
  messages: ChatMessage[]; // oldest first
  hasMore: boolean;
};

const messageSelect = {
  id: true,
  senderId: true,
  body: true,
  fileUrl: true,
  seenByIds: true,
  createdAt: true,
} as const;

type MessageRow = {
  id: string;
  senderId: string;
  body: string | null;
  fileUrl: string | null;
  seenByIds: string[];
  createdAt: Date;
};

function toChatMessage(row: MessageRow, userId: string): ChatMessage {
  return {
    id: row.id,
    body: row.body,
    fileUrl: row.fileUrl,
    createdAt: row.createdAt.toISOString(),
    fromMe: row.senderId === userId,
    seenByMe: row.seenByIds.includes(userId),
    seenByOther: row.seenByIds.some((id) => id !== userId),
  };
}

// Newest `PAGE_SIZE` messages (optionally older than `before`), returned oldest-first.
async function fetchPage(conversationId: string, userId: string, before?: Date) {
  const rows = await db.message.findMany({
    where: { conversationId, ...(before ? { createdAt: { lt: before } } : {}) },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    select: messageSelect,
  });
  const hasMore = rows.length > PAGE_SIZE;
  const messages = rows.slice(0, PAGE_SIZE).reverse().map((row) => toChatMessage(row, userId));
  return { messages, hasMore };
}

// Only the client of a conversation can read it from the portal.
async function ownConversation(conversationId: string, userId: string) {
  return db.conversation.findFirst({
    where: { id: conversationId, clientId: userId },
    select: { id: true },
  });
}

// Initial load, and also what the panel polls: the latest page plus read receipts.
export async function loadChat(): Promise<ChatState> {
  const user = await requireUser();

  const conversation = await db.conversation.findFirst({
    where: { clientId: user.id, status: "OPEN" },
    orderBy: { lastMessageAt: "desc" },
    select: { id: true, staff: { select: { name: true, image: true }, take: 1 } },
  });

  if (!conversation) return { conversationId: null, staff: null, messages: [], hasMore: false };

  const { messages, hasMore } = await fetchPage(conversation.id, user.id);
  return { conversationId: conversation.id, staff: conversation.staff[0] ?? null, messages, hasMore };
}

export async function loadEarlier(
  conversationId: string,
  beforeIso: string
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const user = await requireUser();
  const before = new Date(beforeIso);
  if (Number.isNaN(before.getTime()) || !(await ownConversation(conversationId, user.id))) {
    return { messages: [], hasMore: false };
  }
  return fetchPage(conversationId, user.id, before);
}

// Called while the panel is open: everything the other side sent is now read.
export async function markSeen(conversationId: string): Promise<void> {
  const user = await requireUser();
  if (!(await ownConversation(conversationId, user.id))) return;

  await db.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, NOT: { seenByIds: { has: user.id } } },
    data: { seenByIds: { push: user.id } },
  });
}

type SendResult =
  | { success: true; conversationId: string; message: ChatMessage }
  | { success: false; error: string };

export async function sendMessage(input: { conversationId: string | null; body: string }): Promise<SendResult> {
  const user = await requireUser();

  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!body) return { success: false, error: "Write a message first" };
  if (body.length > CHAT_MAX_LENGTH) {
    return { success: false, error: `Messages can be up to ${CHAT_MAX_LENGTH} characters` };
  }

  let conversationId = input.conversationId;

  if (conversationId) {
    if (!(await ownConversation(conversationId, user.id))) {
      return { success: false, error: "This conversation is no longer available" };
    }
  } else {
    // Reuse an open conversation if one already exists (another tab, or a
    // counsellor started it) instead of creating a duplicate.
    const existing = await db.conversation.findFirst({
      where: { clientId: user.id, status: "OPEN" },
      orderBy: { lastMessageAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      conversationId = existing.id;
    } else {
      const [owner, assigned] = await Promise.all([
        db.user.findUnique({ where: { id: user.id }, select: { counselorId: true } }),
        db.applicationSubmission.findFirst({
          where: { userId: user.id, counselorId: { not: null } },
          orderBy: { updatedAt: "desc" },
          select: { counselorId: true },
        }),
      ]);
      // the counselor assigned to the account first, then the one on their latest submission
      const staffId = owner?.counselorId ?? assigned?.counselorId ?? null;

      const created = await db.conversation.create({
        data: {
          clientId: user.id,
          ...(staffId ? { staff: { connect: { id: staffId } } } : {}),
        },
        select: { id: true },
      });
      conversationId = created.id;
    }
  }

  const now = new Date();

  const [message, turn] = await db.$transaction([
    db.message.create({
      data: { conversationId, senderId: user.id, body, seenByIds: [user.id] },
      select: messageSelect,
    }),
    // The first message of a new "awaiting a reply" turn marks the conversation as waiting.
    // count is 0 when it was already waiting, so only that first message sends the alert.
    db.conversation.updateMany({
      where: { id: conversationId, awaitingSince: null },
      data: { awaitingSince: now, lastMessageAt: now },
    }),
  ]);

  if (turn.count === 0) {
    await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } });
  } else {
    // after the response is sent, so the applicant never waits for the email
    after(() => notifyStaffOfAwaitingConversation({ messageId: message.id }));
  }

  return { success: true, conversationId, message: toChatMessage(message, user.id) };
}