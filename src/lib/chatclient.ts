// src/lib/chat-client.ts
// The website's calls to the chat API. Same four functions the chat panel always used, but
// they go through /api/v1/chat/* (the Hono API) instead of server actions, so the website
// and the Expo app talk to exactly the same endpoints. The session cookie is sent with each
// call, which is how the API knows who is asking.
import type { ChatMessage, ChatState } from "@/lib/chat-service";

export type { ChatMessage, ChatState };
export type { ChatStaff } from "@/lib/chat-service";

const BASE = "/api/v1/chat";

type SendResult =
  | { success: true; conversationId: string; message: ChatMessage }
  | { success: false; error: string };

async function call(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

// Polling and loading: any failure throws, and the panel tries again on the next poll.
async function read<T>(path: string): Promise<T> {
  const res = await call(path);
  if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export const loadChat = () => read<ChatState>("/state");

export const loadEarlier = (conversationId: string, beforeIso: string) =>
  read<{ messages: ChatMessage[]; hasMore: boolean }>(
    `/earlier?${new URLSearchParams({ conversationId, before: beforeIso })}`
  );

export async function markSeen(conversationId: string): Promise<void> {
  await call("/seen", { method: "POST", body: JSON.stringify({ conversationId }) });
}

export async function sendMessage(input: { conversationId: string | null; body: string }): Promise<SendResult> {
  const res = await call("/messages", { method: "POST", body: JSON.stringify(input) });

  if (res.ok) {
    const data = (await res.json()) as { conversationId: string; message: ChatMessage };
    return { success: true, ...data };
  }

  // the API answers { error: { code, message } } for a message it refuses
  try {
    const data = (await res.json()) as { error?: { message?: string } };
    return { success: false, error: data.error?.message ?? "Couldn't send your message" };
  } catch {
    return { success: false, error: "Couldn't send your message" };
  }
}