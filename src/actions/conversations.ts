"use server";

// src/actions/conversations.ts
// Admin controls for a conversation: open or close it, and choose who looks after it.
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const refresh = (id: string) => {
  revalidatePath("/admin/conversations");
  revalidatePath(`/admin/conversations/${id}`);
};

export async function setConversationStatus(id: string, status: "OPEN" | "CLOSED") {
  await requireAdmin();
  if (status !== "OPEN" && status !== "CLOSED") return { error: "Invalid status" };

  const conversation = await db.conversation.findUnique({ where: { id }, select: { id: true } });
  if (!conversation) return { error: "Conversation not found" };

  await db.conversation.update({
    where: { id },
    // a closed conversation is not waiting for anyone
    data: status === "CLOSED" ? { status, awaitingSince: null } : { status },
  });
  refresh(id);
  return { success: status === "CLOSED" ? "Conversation closed" : "Conversation reopened" };
}

export async function addConversationStaff(id: string, userId: string) {
  await requireAdmin();

  const [conversation, person] = await Promise.all([
    db.conversation.findUnique({ where: { id }, select: { id: true } }),
    db.user.findFirst({ where: { id: userId, role: { in: ["COUNSELOR", "ADMIN"] } }, select: { id: true } }),
  ]);
  if (!conversation) return { error: "Conversation not found" };
  if (!person) return { error: "Choose a counselor or an admin" };

  await db.conversation.update({ where: { id }, data: { staff: { connect: { id: userId } } } });
  refresh(id);
  return { success: "Added to the conversation" };
}

export async function removeConversationStaff(id: string, userId: string) {
  await requireAdmin();

  const conversation = await db.conversation.findUnique({ where: { id }, select: { id: true } });
  if (!conversation) return { error: "Conversation not found" };

  await db.conversation.update({ where: { id }, data: { staff: { disconnect: { id: userId } } } });
  refresh(id);
  return { success: "Removed from the conversation" };
}