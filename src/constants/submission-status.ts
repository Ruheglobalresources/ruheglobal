// src/constants/submission-status.ts
// What a submission status means for the APPLICANT.
//
// The whole portal reads this one list. A submitted application stays editable: the
// student can keep updating it and submit again, and every submit is kept as a
// version the admin can look back at. Only the final statuses lock the application. To
// open or close editing for a status, add it to or remove it from EDITABLE_STATUSES.
export const EDITABLE_STATUSES = ["DRAFT", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW"] as const;

export const isEditableStatus = (status: string) => (EDITABLE_STATUSES as readonly string[]).includes(status);

// "Not submitted yet" statuses. Everything else has been submitted at least once.
export const isUnsubmittedStatus = (status: string) => status === "DRAFT" || status === "IN_PROGRESS";

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};