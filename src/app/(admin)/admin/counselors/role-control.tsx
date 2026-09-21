"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserRole } from "@/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RoleControl({ userId, role }: { userId: string; role: "ADMIN" | "COUNSELOR" | "USER" }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={role}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          const result = await setUserRole(userId, value as "ADMIN" | "COUNSELOR" | "USER");
          if (result?.error) toast.error(result.error);
          else toast.success(result?.success ?? "Saved");
        })
      }
    >
      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="USER">Applicant</SelectItem>
        <SelectItem value="COUNSELOR">Counselor</SelectItem>
        <SelectItem value="ADMIN">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
