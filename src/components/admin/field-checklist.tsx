"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { setApplicationField, updateApplicationField } from "@/actions";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Save } from "lucide-react";

type FieldDef = { id: string; key: string; label: string; type: string; category: string };
type AttachedRow = { id: string; fieldDefinitionId: string; isRequired: boolean; stepNumber: number; order: number };

export function FieldChecklist({
  applicationId,
  allFields,
  attached,
}: {
  applicationId: string;
  allFields: FieldDef[];
  attached: AttachedRow[];
}) {
  const [query, setQuery] = useState("");
  const attachedByFieldId = useMemo(
    () => new Map(attached.map((a) => [a.fieldDefinitionId, a])),
    [attached]
  );

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? allFields.filter((f) => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q))
      : allFields;
    const map = new Map<string, FieldDef[]>();
    for (const f of filtered) {
      const cat = f.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(f);
    }
    return map;
  }, [allFields, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the field library..."
            className="pl-8"
          />
        </div>
        <p className="whitespace-nowrap text-xs text-neutral-500">{attached.length} field(s) attached</p>
      </div>

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([category, fields]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-neutral-400 uppercase">{category}</h3>
            <div className="overflow-hidden rounded-xl border bg-white">
              {fields.map((field, i) => (
                <ChecklistRow
                  key={field.id}
                  applicationId={applicationId}
                  field={field}
                  attachedRow={attachedByFieldId.get(field.id)}
                  isLast={i === fields.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
        {grouped.size === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">No fields match &quot;{query}&quot;.</p>
        )}
      </div>
    </div>
  );
}

function ChecklistRow({
  applicationId,
  field,
  attachedRow,
  isLast,
}: {
  applicationId: string;
  field: FieldDef;
  attachedRow?: AttachedRow;
  isLast: boolean;
}) {
  const isAttached = !!attachedRow;
  const [isPending, startTransition] = useTransition();
  const [isRequired, setIsRequired] = useState(attachedRow?.isRequired ?? false);
  const [stepNumber, setStepNumber] = useState(attachedRow?.stepNumber ?? 1);
  const [order, setOrder] = useState(attachedRow?.order ?? 0);

  const dirty =
    isAttached &&
    (isRequired !== attachedRow!.isRequired ||
      stepNumber !== attachedRow!.stepNumber ||
      order !== attachedRow!.order);

  const toggleAttach = (checked: boolean) => {
    startTransition(async () => {
      const result = await setApplicationField(applicationId, field.id, checked);
      if (result?.error) toast.error(result.error);
    });
  };

  const save = () => {
    if (!attachedRow) return;
    startTransition(async () => {
      const result = await updateApplicationField(attachedRow.id, applicationId, { isRequired, stepNumber, order });
      if (result?.success) toast.success(result.success);
    });
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 px-4 py-3 ${!isLast ? "border-b" : ""}`}>
      <Switch checked={isAttached} onCheckedChange={toggleAttach} disabled={isPending} />
      <div className="min-w-40 flex-1">
        <p className="text-sm font-medium">{field.label}</p>
        <p className="font-mono text-xs text-neutral-400">
          {field.key} · {field.type.replace("_", " ")}
        </p>
      </div>
      {isAttached && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-neutral-500">
            Step
            <Input
              type="number"
              min={1}
              value={stepNumber}
              onChange={(e) => setStepNumber(Number(e.target.value))}
              disabled={isPending}
              className="h-8 w-14"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-neutral-500">
            Order
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              disabled={isPending}
              className="h-8 w-14"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-neutral-500">
            Required
            <Switch checked={isRequired} onCheckedChange={setIsRequired} disabled={isPending} />
          </label>
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
        </div>
      )}
    </div>
  );
}