"use server";

// src/actions/chat.ts
// Server actions for the applicant chat. They hold no rules of their own: each one checks
// the login and passes the user id to lib/chat-service.ts, the same functions the Hono API
// (/api/v1/chat/*) uses for the website and the Expo app.
import { requireUser } from "@/lib/require-user";
import {
  getChatState,
  getEarlierMessages,
  markConversationSeen,
  sendChatMessage,
  type ChatMessage,
  type ChatState,
  type ChatStaff,
} from "@/lib/chat-service";

export type { ChatMessage, ChatState, ChatStaff };

export async function loadChat(): Promise<ChatState> {
  const user = await requireUser();
  return getChatState(user.id);
}

export async function loadEarlier(
  conversationId: string,
  beforeIso: string
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const user = await requireUser();
  return getEarlierMessages(user.id, conversationId, beforeIso);
}

export async function markSeen(conversationId: string): Promise<void> {
  const user = await requireUser();
  await markConversationSeen(user.id, conversationId);
}

type SendResult =
  | { success: true; conversationId: string; message: ChatMessage }
  | { success: false; error: string };

export async function sendMessage(input: { conversationId: string | null; body: string }): Promise<SendResult> {
  const user = await requireUser();
  const result = await sendChatMessage(user.id, input);
  return result.success ? result : { success: false, error: result.error };
}