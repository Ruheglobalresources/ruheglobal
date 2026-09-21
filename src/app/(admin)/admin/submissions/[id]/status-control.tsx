"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateSubmissionStatus, assignCounselor } from "@/actions";
import { SubmissionStatusValues } from "@/schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Counselor = { id: string; name: string | null; email: string | null };

export function StatusControl({ submissionId, status }: { submissionId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          const result = await updateSubmissionStatus(submissionId, { status: value as (typeof SubmissionStatusValues)[number] });
          if (result?.error) toast.error(result.error);
          else toast.success(result?.success ?? "Saved");
        })
      }
    >
      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
      <SelectContent>
        {SubmissionStatusValues.map((s) => (
          <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CounselorControl({
  submissionId,
  counselorId,
  counselors,
}: {
  submissionId: string;
  counselorId: string | null;
  counselors: Counselor[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={counselorId ?? "unassigned"}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          const result = await assignCounselor(submissionId, { counselorId: value === "unassigned" ? null : value });
          if (result?.error) toast.error(result.error);
          else toast.success(result?.success ?? "Saved");
        })
      }
    >
      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {counselors.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.name ?? c.email}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
