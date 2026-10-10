// src/lib/conversation-alerts.ts
// The email that tells staff a conversation is waiting for a reply, and from whom.
// Its button opens /portal/conversations/<id> (app/portal/conversations/[id]/route.ts), which
// checks the login and then opens the chat bar on that conversation.
//
// It is sent when a client's message starts a new "awaiting a reply" turn (see
// Conversation.awaitingSince), so a client who writes five messages in a row causes one
// email, not five. It goes to the staff on the conversation; with nobody assigned yet it goes
// to every admin. CONVERSATION_ALERT_EMAILS (comma separated, optional) adds extra inboxes,
// for example a shared support address.
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";

const PREVIEW_LENGTH = 300;
const ROLE_LABELS = { USER: "Applicant", COUNSELOR: "Counselor", ADMIN: "Admin" } as const;

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildAlertHtml(params: {
  fromName: string;
  fromEmail: string | null;
  fromRole: keyof typeof ROLE_LABELS;
  assignedTo: string | null;
  preview: string;
  hasFile: boolean;
  openLink: string;
  adminLink: string | null;
}) {
  const { fromName, fromEmail, fromRole, assignedTo, preview, hasFile, openLink, adminLink } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Conversation awaiting a reply</title></head>
<body style="margin:0;padding:0;background:#FAF6F4;font-family:Arial,Helvetica,sans-serif;color:#241A1E;">
  <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
    <div style="background:#ffffff;border:1px solid #EFE1E6;border-radius:10px;padding:28px;">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#9A1B45;font-weight:bold;">Conversation awaiting a reply</p>
      <h1 style="margin:0 0 18px;font-size:20px;line-height:1.3;color:#241A1E;">${escapeHtml(fromName)} sent you a message</h1>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:18px;">
        <tr><td style="padding:4px 0;color:#6B5D62;width:96px;">From</td><td style="padding:4px 0;">${escapeHtml(fromName)}${fromEmail ? ` (${escapeHtml(fromEmail)})` : ""}</td></tr>
        <tr><td style="padding:4px 0;color:#6B5D62;">Role</td><td style="padding:4px 0;">${ROLE_LABELS[fromRole]}</td></tr>
        <tr><td style="padding:4px 0;color:#6B5D62;">Assigned to</td><td style="padding:4px 0;">${assignedTo ? escapeHtml(assignedTo) : "Nobody yet"}</td></tr>
      </table>

      <div style="background:#FAF6F4;border-left:3px solid #9A1B45;border-radius:0 6px 6px 0;padding:14px 16px;font-size:15px;line-height:1.55;white-space:pre-wrap;">${preview ? escapeHtml(preview) : hasFile ? "Sent an attachment" : ""}</div>

      <p style="margin:24px 0 0;"><a href="${openLink}" style="display:inline-block;background:#9A1B45;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 22px;border-radius:6px;">Open the conversation</a></p>
      ${adminLink ? `<p style="margin:14px 0 0;font-size:13px;"><a href="${adminLink}" style="color:#9A1B45;">View it in the admin dashboard</a></p>` : ""}
    </div>
    <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#6B5D62;">Ruhe Global Resources. You get this because you look after this conversation.</p>
  </div>
</body>
</html>`;
}

// Runs after the message is saved. Never throws, so a mail problem can never affect the chat.
export async function notifyStaffOfAwaitingConversation({ messageId }: { messageId: string }): Promise<void> {
  try {
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: {
        body: true,
        fileUrl: true,
        sender: { select: { id: true, name: true, email: true, role: true } },
        conversation: {
          select: { id: true, clientId: true, staff: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!message) return;

    const { conversation, sender } = message;
    // only a message from the client of the conversation starts an "awaiting reply" turn
    if (sender.id !== conversation.clientId) return;

    const staff = conversation.staff;
    const staffRecipients = staff.length
      ? staff
      : await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true, name: true, email: true } });

    const extra = (process.env.CONVERSATION_ALERT_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const recipients = new Map<string, { email: string; isAdmin: boolean }>();
    const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
    const adminEmails = new Set(admins.map((a) => a.email?.toLowerCase()).filter(Boolean) as string[]);

    for (const person of staffRecipients) {
      if (!person.email || person.id === sender.id) continue;
      recipients.set(person.email.toLowerCase(), { email: person.email, isAdmin: adminEmails.has(person.email.toLowerCase()) });
    }
    for (const email of extra) {
      if (!recipients.has(email.toLowerCase())) recipients.set(email.toLowerCase(), { email, isAdmin: adminEmails.has(email.toLowerCase()) });
    }
    if (recipients.size === 0) return;

    const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const body = message.body?.trim() ?? "";
    const preview = body.length > PREVIEW_LENGTH ? `${body.slice(0, PREVIEW_LENGTH).trimEnd()}...` : body;
    const fromName = sender.name ?? sender.email ?? "A user";
    const assignedTo = staff.length ? staff.map((s) => s.name ?? s.email ?? "Unnamed").join(", ") : null;

    await Promise.allSettled(
      Array.from(recipients.values()).map(({ email, isAdmin }) =>
        sendMail({
          to: email,
          subject: `Awaiting reply: ${fromName} sent a message`,
          body: buildAlertHtml({
            fromName,
            fromEmail: sender.email,
            fromRole: sender.role,
            assignedTo,
            preview,
            hasFile: !!message.fileUrl,
            openLink: `${base}/portal/conversations/${conversation.id}`,
            adminLink: isAdmin ? `${base}/admin/conversations/${conversation.id}` : null,
          }),
        })
      )
    );
  } catch (error) {
    console.error("Could not send the conversation alert:", error);
  }
}