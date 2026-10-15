"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setCounselorActive } from "@/actions/counselors";
import { Switch } from "@/components/ui/switch";

export function ActiveControl({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
      <Switch
        checked={isActive}
        disabled={isPending}
        aria-label={isActive ? "Disable this counselor" : "Make this counselor active"}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            const result = await setCounselorActive(userId, checked);
            if (result?.error) toast.error(result.error);
            else toast.success(result?.success ?? "Saved");
          })
        }
      />
      {isActive ? "Active" : "Disabled"}
    </label>
  );
}