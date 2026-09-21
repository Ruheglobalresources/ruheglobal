"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateApplicationField, detachField } from "@/actions";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/components/admin/delete-button"
import { Save } from "lucide-react";

type Row = {
  id: string;
  applicationId: string;
  isRequired: boolean;
  stepNumber: number;
  order: number;
  fieldDefinition: { label: string; key: string; type: string };
};

export function FieldRow({ row }: { row: Row }) {
  const [isRequired, setIsRequired] = useState(row.isRequired);
  const [stepNumber, setStepNumber] = useState(row.stepNumber);
  const [order, setOrder] = useState(row.order);
  const [isPending, startTransition] = useTransition();

  const dirty = isRequired !== row.isRequired || stepNumber !== row.stepNumber || order !== row.order;

  const save = () => {
    startTransition(async () => {
      const result = await updateApplicationField(row.id, row.applicationId, { isRequired, stepNumber, order });
      if (result?.success) toast.success(result.success);
    });
  };

  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium">{row.fieldDefinition.label}</td>
      <td className="px-4 py-3 font-mono text-xs text-neutral-500">{row.fieldDefinition.key}</td>
      <td className="px-4 py-3 text-neutral-500">{row.fieldDefinition.type.replace("_", " ")}</td>
      <td className="px-4 py-3">
        <Input
          type="number"
          min={1}
          value={stepNumber}
          onChange={(e) => setStepNumber(Number(e.target.value))}
          disabled={isPending}
          className="w-16"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          disabled={isPending}
          className="w-16"
        />
      </td>
      <td className="px-4 py-3">
        <Switch checked={isRequired} onCheckedChange={setIsRequired} disabled={isPending} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          {dirty && (
            <button
              onClick={save}
              disabled={isPending}
              title="Save"
              className="rounded-lg p-1.5 text-[color:var(--color-teal)] hover:bg-neutral-100"
            >
              <Save size={14} />
            </button>
          )}
          {/* bound server action — not a closure — so it can cross to the Client Component */}
          <DeleteButton action={detachField.bind(null, row.id, row.applicationId)} confirmMessage="Remove this field from the application?" />
        </div>
      </td>
    </tr>
  );
}
