"use client";

// src/components/admin/application-inputs.tsx
// The inputs of one application, in two parts:
//   1. a card with every input the application has, by step. Locked inputs (needed by the code) can
//      only be looked at. Adjustable inputs can be made required, moved, or removed.
//   2. the inputs of the field library that can still be added.
// What each input is allowed to do is decided on the server (src/lib/application-inputs.ts); this file
// only draws it, and the server actions check every rule again.
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock, Plus, Save, Search, TriangleAlert } from "lucide-react";
import { addApplicationInput, removeApplicationInput, updateApplicationInput } from "@/actions/application-inputs";
import { DeleteButton } from "@/components/admin/delete-button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AvailableInput, InputCard, InputsView } from "@/lib/application-inputs";

const typeLabel = (type: string) => type.replace(/_/g, " ").toLowerCase();

function RequiredPill({ required }: { required: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        required ? "bg-red-50 text-red-800" : "bg-neutral-100 text-neutral-600"
      }`}
    >
      {required ? "Required" : "Optional"}
    </span>
  );
}

function LockedRow({ card }: { card: InputCard }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-neutral-50 px-4 py-3 last:border-b-0">
      <Lock size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
      <div className="min-w-40 flex-1">
        <p className="text-sm font-medium">{card.label}</p>
        <p className="font-mono text-xs text-neutral-500">
          {card.key} · {typeLabel(card.type)}
          {card.when ? ` · ${card.when}` : ""}
        </p>
        {card.reason && <p className="text-xs text-neutral-500">{card.reason}</p>}
      </div>
      <RequiredPill required={card.isRequired} />
      <span className="w-14 text-xs font-semibold text-neutral-500">Locked</span>
    </div>
  );
}

function AdjustableRow({
  applicationId,
  card,
  canEditStep,
}: {
  applicationId: string;
  card: InputCard;
  canEditStep: boolean;
}) {
  const [isRequired, setIsRequired] = useState(card.isRequired);
  const [stepNumber, setStepNumber] = useState(card.stepNumber);
  const [order, setOrder] = useState(card.order);
  const [isPending, startTransition] = useTransition();

  const dirty = isRequired !== card.isRequired || stepNumber !== card.stepNumber || order !== card.order;

  const save = () => {
    startTransition(async () => {
      const result = await updateApplicationInput(applicationId, card.id, { isRequired, stepNumber, order });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Saved");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="min-w-40 flex-1">
        <p className="text-sm font-medium">{card.label}</p>
        <p className="font-mono text-xs text-neutral-500">
          {card.key} · {typeLabel(card.type)}
          {card.when ? ` · ${card.when}` : ""}
        </p>
        {card.reason && <p className="text-xs text-neutral-500">{card.reason}</p>}
      </div>
      {canEditStep && (
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
      )}
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
      <div className="flex w-14 justify-end gap-1">
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
        {/* bound server action, so it can be handed to the Client Component DeleteButton */}
        <DeleteButton
          action={removeApplicationInput.bind(null, applicationId, card.id)}
          confirmMessage={`Remove "${card.label}" from this application?`}
          title="Remove input?"
        />
      </div>
    </div>
  );
}

function AvailableCard({ applicationId, item }: { applicationId: string; item: AvailableInput }) {
  const [isPending, startTransition] = useTransition();

  const add = () => {
    startTransition(async () => {
      const result = await addApplicationInput(applicationId, item.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Added");
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{item.label}</p>
        <p className="font-mono text-xs text-neutral-500">
          {item.key} · {typeLabel(item.type)}
        </p>
        {item.blocked && <p className="mt-1 text-xs text-neutral-500">{item.blocked}</p>}
      </div>
      <button
        onClick={add}
        disabled={isPending || !!item.blocked}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} aria-hidden="true" /> {isPending ? "Adding..." : "Add"}
      </button>
    </div>
  );
}

export function ApplicationInputs({ view }: { view: InputsView }) {
  const [query, setQuery] = useState("");

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return view.available;
    return view.available
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(q) || i.key.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [view.available, query]);

  return (
    <div className="space-y-10">
      {view.problems.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <TriangleAlert size={16} aria-hidden="true" /> This application has {view.problems.length} problem(s) to fix
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {view.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-neutral-700">Inputs this application asks for</h2>
            <p className="text-xs text-neutral-500">
              Locked inputs are needed by the application, so they cannot be edited or removed. The others can be
              made required, moved or removed.
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            {view.lockedCount} locked · {view.adjustableCount} adjustable
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          {view.groups.map((group, index) => (
            <div key={group.stepNumber}>
              <div
                className={`border-b bg-neutral-100 px-4 py-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase ${
                  index > 0 ? "border-t" : ""
                }`}
              >
                Step {group.stepNumber} · {group.title}
                {group.emoji ? ` ${group.emoji}` : ""}
              </div>
              {group.cards.map((card) =>
                card.state === "adjustable" ? (
                  <AdjustableRow
                    key={card.id}
                    applicationId={view.applicationId}
                    card={card}
                    canEditStep={view.canEditStep}
                  />
                ) : (
                  <LockedRow key={card.id} card={card} />
                )
              )}
            </div>
          ))}
          {view.groups.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-neutral-400">No inputs yet. Add one below.</p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-700">Inputs you can add</h2>
            <p className="text-xs text-neutral-500">
              From the field library. Adding one puts it in the card above
              {view.isEligibility ? ", in its own last step." : "."}
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the field library..."
              aria-label="Search the field library"
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-6">
          {available.map((group) => (
            <div key={group.category}>
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-neutral-400 uppercase">{group.category}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <AvailableCard key={item.id} applicationId={view.applicationId} item={item} />
                ))}
              </div>
            </div>
          ))}
          {available.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-400">
              {query ? `No inputs match "${query}".` : "Every input that can be added is already in this application."}
            </p>
          )}
        </div>

        {view.hiddenCount > 0 && (
          <p className="mt-4 text-xs text-neutral-500">
            {view.hiddenCount} input(s) of the library are not shown because the eligibility check cannot collect them
            (file and image uploads, or lists with no choices).
          </p>
        )}
      </section>
    </div>
  );
}