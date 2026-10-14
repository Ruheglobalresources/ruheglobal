import { db } from "@/lib/db";
import { ZohoCrmClient } from "./crm";

// Sends a submitted application to Zoho CRM as a Lead.
// PRIMARY: direct Zoho CRM API call from this app.
// FALLBACK: webhook to the admin platform, which writes to Zoho for us.
// This never throws. The submission is already saved in our database, so a CRM
// problem must not break the applicant's submit.

const PHONE_KEYS = ["phone_number", "whatsapp_number"];

export async function syncSubmissionToCrm(submissionId: string): Promise<void> {
  try {
    const submission = await db.applicationSubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        targetName: true,
        targetCourseName: true,
        user: { select: { name: true, email: true } },
        application: { select: { name: true, slug: true, terminal: { select: { slug: true } } } },
        values: {
          where: { applicationField: { fieldDefinition: { key: { in: PHONE_KEYS } } } },
          select: { value: true, applicationField: { select: { fieldDefinition: { select: { key: true } } } } },
        },
      },
    });
    if (!submission || !submission.user.email) return;

    // prefer the phone number over the WhatsApp number
    const phone =
      PHONE_KEYS.map((key) =>
        submission.values.find((v) => v.applicationField.fieldDefinition.key === key)?.value?.trim(),
      ).find(Boolean) ?? "";

    const fullName = submission.user.name?.trim() || "Unknown";
    const reference = `${submission.application.terminal.slug}/${submission.application.slug}/${submission.id}`;
    const target = [submission.targetName, submission.targetCourseName].filter(Boolean).join(", ");

    const syncPayload = {
      name: fullName,
      email: submission.user.email,
      phone,
      applicationType: submission.application.slug,
      reference,
      submissionId: submission.id,
    };

    let synced = false;

    try {
      const crm = await ZohoCrmClient.create();
      if (crm) {
        const parts = fullName.split(/\s+/).filter(Boolean);
        const lead = await crm.createLead({
          firstName: parts.length > 1 ? parts[0] : "",
          lastName: parts.length > 1 ? parts.slice(1).join(" ") : parts[0] ?? "Unknown",
          email: syncPayload.email,
          phone: phone || undefined,
          leadSource: "Ruhe Portal",
          description: `Application: ${submission.application.name}${target ? `, Target: ${target}` : ""}, Reference: ${reference}`,
        });
        synced = true;
        console.log("[CRM sync] direct success, lead ID:", lead.id);
      } else {
        console.warn("[CRM sync] direct skipped, CRM not connected yet (admin visits /api/zoho/crm/oauth/start)");
      }
    } catch (error) {
      console.error("[CRM sync] direct failed:", error);
    }

    if (!synced && process.env.ADMIN_PLATFORM_URL && process.env.PORTAL_SYNC_TOKEN) {
      try {
        const res = await fetch(`${process.env.ADMIN_PLATFORM_URL}/api/applications/sync-from-portal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PORTAL_SYNC_TOKEN}`,
          },
          body: JSON.stringify(syncPayload),
          signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) {
          const data = (await res.json()) as { ok?: boolean };
          console.log("[CRM sync] fallback webhook result:", data);
        } else {
          console.warn("[CRM sync] fallback webhook returned status", res.status);
        }
      } catch (error) {
        console.warn("[CRM sync] fallback webhook failed:", error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error("[CRM sync] unexpected error:", error);
  }
}