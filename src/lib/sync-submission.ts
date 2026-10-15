// ============================================================================
// src/lib/zoho/sync-submission.ts
// ============================================================================
// Portal-side CRM sync — pushes applicant data to the admin platform
// (athenagentic.app) which creates the Zoho CRM Lead.
//
// Called by submitApplication() in src/app/actions/submission.ts:
//   if (!submission.submittedAt) {
//     after(() => syncSubmissionToCrm(submission.id));
//   }
//
// Env vars required (set on ruheglobal's Vercel):
//   ADMIN_PLATFORM_URL  — e.g. https://www.athenagentic.app
//   PORTAL_SYNC_TOKEN  — shared secret (matches the admin platform's env var)
//
// Design:
//   - NEVER throws — failures are logged and swallowed. The submit must
//     not break because of a CRM sync issue.
//   - 15s timeout — the admin platform's webhook itself has a 30s timeout
//     on the Zoho CRM call, but we cap shorter so the after() promise
//     doesn't hold resources.
//   - Idempotent — the admin platform dedupes by reference (which includes
//     the submissionId), so re-calling this is safe.
// ============================================================================

import { db } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────

interface SyncResult {
  ok: boolean;
  leadId?: string;
  ownerId?: string | null;
  ownerName?: string | null;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────

const ADMIN_PLATFORM_URL = process.env.ADMIN_PLATFORM_URL ?? "https://www.athenagentic.app";
const PORTAL_SYNC_TOKEN = process.env.PORTAL_SYNC_TOKEN;
const SYNC_TIMEOUT_MS = 15_000;

// ─── Main export ──────────────────────────────────────────────────────────

/**
* Push a submission to the admin platform's CRM sync webhook.
*
* Called in `after()` from submitApplication() — runs after the HTTP
* response is sent, so the applicant never waits on Zoho CRM.
*
* Only syncs the FIRST submit (the caller checks `!submission.submittedAt`).
* A resubmit would create a duplicate lead, so we skip it.
*
* @param submissionId  The submission's UUID
* @returns SyncResult  Always resolves (never throws)
*/
export async function syncSubmissionToCrm(submissionId: string): Promise<SyncResult> {
  if (!PORTAL_SYNC_TOKEN) {
    console.warn("[syncSubmissionToCrm] PORTAL_SYNC_TOKEN not set — skipping CRM sync");
    return { ok: false, error: "PORTAL_SYNC_TOKEN not configured" };
  }

  try {
    // ─── 1. Load submission + answers + applicant ────────────────────────
    const submission = await db.applicationSubmission.findUnique({
      where: { id: submissionId },
      include: {
        values: {
          include: {
            applicationField: {
              select: {
                id: true,
                fieldDefinition: { select: { key: true, label: true } },
              },
            },
          },
        },
        application: {
          select: {
            id: true,
            slug: true,
            kind: true,
            terminal: { select: { slug: true } },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        counselor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!submission) {
      console.warn(`[syncSubmissionToCrm] submission ${submissionId} not found`);
      return { ok: false, error: "Submission not found" };
    }

    if (!submission.user?.email) {
      console.warn(`[syncSubmissionToCrm] submission ${submissionId} has no user email — skipping`);
      return { ok: false, error: "Applicant has no email" };
    }

    // ─── 2. Extract phone + counsellor from the answers ─────────────────
    // The portal stores field answers as SubmissionValue[] — each row points
    // to an ApplicationField which has a FieldDefinition with a `key`. We
    // look for keys like "phone" and "counsellor".
    const findValue = (key: string): string | null => {
      const match = submission.values.find(
        (v) => v.applicationField?.fieldDefinition?.key === key,
      );
      return match?.value?.trim() || null;
    };

    const phoneValue = findValue("phone");
    const counsellorValue =
      findValue("counsellor") ??
      findValue("counselor") ?? // American spelling fallback
      submission.counselor?.name ??
      "";

    // ─── 3. Compose the webhook payload ─────────────────────────────────
    // The admin platform expects these fields (see /api/applications/sync-from-portal):
    //   name, email, phone, applicationType, reference, submissionId,
    //   leadSource, leadOwner, counsellor, leadCreatedBy
    const reference = `${submission.application?.terminal?.slug ?? "portal"}/${submission.application?.slug ?? "app"}/${submission.id}`;

    const payload = {
      name: submission.user.name ?? "Unknown",
      email: submission.user.email,
      phone: phoneValue ?? "",
      applicationType: submission.application?.slug ?? "",
      reference,
      submissionId: submission.id,

      // CRM-enrichment fields (per the v2 contract):
      leadSource: "Website",
      leadOwner: "Ifeanyi Okoro", // head dev — admin platform resolves to Zoho user ID
      counsellor: counsellorValue || "Unassigned",
      leadCreatedBy: "Akanimoh David",
    };

    // ─── 4. POST to the admin platform webhook ──────────────────────────
    const webhookUrl = `${ADMIN_PLATFORM_URL}/api/applications/sync-from-portal`;
    console.log(`[syncSubmissionToCrm] pushing submission ${submissionId} → ${webhookUrl}`);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PORTAL_SYNC_TOKEN}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "(no body)");
      console.error(
        `[syncSubmissionToCrm] webhook returned HTTP ${res.status}: ${errText.slice(0, 300)}`,
      );
      return {
        ok: false,
        error: `Webhook HTTP ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as {
      ok?: boolean;
      leadId?: string;
      ownerId?: string | null;
      ownerName?: string | null;
      warning?: string;
      error?: string;
    };

    if (!data.ok) {
      console.error(`[syncSubmissionToCrm] webhook returned ok=false:`, data.error);
      return { ok: false, error: data.error ?? "unknown webhook error" };
    }

    console.log(`[syncSubmissionToCrm] ✓ Lead created in CRM for ${submission.user.email}:`, {
      leadId: data.leadId,
      owner: data.ownerName ?? "(auto)",
      counsellor: counsellorValue || "(none)",
      warning: data.warning,
    });

    return {
      ok: true,
      leadId: data.leadId,
      ownerId: data.ownerId ?? null,
      ownerName: data.ownerName ?? null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[syncSubmissionToCrm] failed for submission ${submissionId}:`, msg);
    return { ok: false, error: msg };
  }
}