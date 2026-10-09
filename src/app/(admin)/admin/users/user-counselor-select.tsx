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
}: {
  userId: string;
  counselorId: string | null;
  counselors: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();

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
        <SelectItem value={NONE}>No counselor</SelectItem>
        {counselors.map((c) => (
          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}