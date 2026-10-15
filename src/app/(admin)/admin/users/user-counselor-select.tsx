"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { assignUserCounselor } from "@/actions/counselors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NONE = "none";

export function UserCounselorSelect({
  userId,
  counselorId,
  counselors,
  allowNone = true,
}: {
  userId: string;
  counselorId: string | null;
  counselors: { id: string; name: string; isActive: boolean }[];
  allowNone?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  // A disabled or on leave counselor cannot be chosen. One who already looks after this applicant stays
  // in the list, marked, so the box still shows who it is.
  const choices = counselors.filter((c) => c.isActive || c.id === counselorId);

  return (
    <Select
      value={counselorId ?? NONE}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          const result = await assignUserCounselor(userId, value === NONE ? null : value);
          if (result?.error) toast.error(result.error);
          else toast.success(result?.success ?? "Saved");
        })
      }
    >
      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value={NONE}>No counselor</SelectItem>}
        {choices.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.isActive ? c.name : `${c.name} (disabled)`}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}