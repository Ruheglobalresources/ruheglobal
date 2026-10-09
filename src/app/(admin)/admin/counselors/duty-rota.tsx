"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setCounselorOnDuty } from "@/actions/counselors";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type RotaWeek = {
  weekStartIso: string;
  label: string;
  isCurrent: boolean;
  counselorId: string | null;
  explicit: boolean;
};

const INHERIT = "inherit";

export function DutyRota({ weeks, counselors }: { weeks: RotaWeek[]; counselors: { id: string; name: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const nameOf = (id: string | null) => counselors.find((c) => c.id === id)?.name ?? "Nobody";

  if (counselors.length === 0) {
    return <p className="px-4 py-6 text-sm text-neutral-400">Make someone a counselor below to set who is on duty.</p>;
  }

  return (
    <ul className="divide-y">
      {weeks.map((week) => (
        <li key={week.weekStartIso} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{week.label}</span>
            {week.isCurrent && <Badge variant="secondary">This week</Badge>}
          </div>

          <div className="flex items-center gap-3">
            {!week.explicit && <span className="text-sm text-neutral-500">{nameOf(week.counselorId)}</span>}
            <Select
              value={week.explicit ? (week.counselorId ?? INHERIT) : INHERIT}
              disabled={isPending}
              onValueChange={(value) =>
                startTransition(async () => {
                  const result = await setCounselorOnDuty(week.weekStartIso, value === INHERIT ? null : value);
                  if (result?.error) toast.error(result.error);
                  else toast.success(result?.success ?? "Saved");
                })
              }
            >
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={INHERIT}>Same as the week before</SelectItem>
                {counselors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </li>
      ))}
    </ul>
  );
}