"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setCounselorFrontDesk } from "@/actions/counselors";
import { Switch } from "@/components/ui/switch";

export function FrontDeskControl({ userId, isFrontDesk }: { userId: string; isFrontDesk: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
      <Switch
        checked={isFrontDesk}
        disabled={isPending}
        aria-label={isFrontDesk ? "Remove from the front desk" : "Put on the front desk"}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            const result = await setCounselorFrontDesk(userId, checked);
            if (result?.error) toast.error(result.error);
            else toast.success(result?.success ?? "Saved");
          })
        }
      />
      {isFrontDesk ? "Front desk" : "Regular"}
    </label>
  );
}