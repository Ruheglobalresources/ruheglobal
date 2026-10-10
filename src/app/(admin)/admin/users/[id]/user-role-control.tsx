"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setUserRole } from "@/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Role = "ADMIN" | "COUNSELOR" | "USER";

// Same choice as the role control on the Counselors page, but it refreshes THIS page so
// the sections that depend on the role (counselor, applicants) change straight away.
export function UserRoleControl({ userId, role }: { userId: string; role: Role }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      value={role}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          const result = await setUserRole(userId, value as Role);
          if (result?.error) {
            toast.error(result.error);
            return;
          }
          toast.success(result?.success ?? "Saved");
          router.refresh();
        })
      }
    >
      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="USER">Applicant</SelectItem>
        <SelectItem value="COUNSELOR">Counselor</SelectItem>
        <SelectItem value="ADMIN">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}