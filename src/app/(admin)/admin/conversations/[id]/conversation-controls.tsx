"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { addConversationStaff, removeConversationStaff, setConversationStatus } from "@/actions/conversations";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Person = { id: string; name: string };

export function ConversationControls({
  conversationId,
  status,
  staff,
  candidates,
}: {
  conversationId: string;
  status: "OPEN" | "CLOSED";
  staff: Person[];
  candidates: Person[]; // counselors and admins who are not on the conversation yet
}) {
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ error?: string; success?: string } | undefined>) =>
    startTransition(async () => {
      const result = await action();
      if (result?.error) toast.error(result.error);
      else toast.success(result?.success ?? "Saved");
    });

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-xs font-medium text-neutral-400">Status</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => setConversationStatus(conversationId, status === "OPEN" ? "CLOSED" : "OPEN"))}
        >
          {status === "OPEN" ? "Close conversation" : "Reopen conversation"}
        </Button>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-neutral-400">Looking after it</p>
        {staff.length === 0 ? (
          <p className="text-sm text-neutral-500">Nobody yet</p>
        ) : (
          <ul className="space-y-1">
            {staff.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{person.name}</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => removeConversationStaff(conversationId, person.id))}
                  aria-label={`Remove ${person.name}`}
                  className="grid size-6 place-items-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {candidates.length > 0 && (
          <div className="mt-2">
            <Select value="" disabled={isPending} onValueChange={(userId) => run(() => addConversationStaff(conversationId, userId))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Add someone" /></SelectTrigger>
              <SelectContent>
                {candidates.map((person) => (
                  <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}