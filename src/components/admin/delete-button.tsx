"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type DeleteButtonProps = {
  action: () => Promise<{ success?: string; error?: string }>;
  confirmMessage: string;
  title?: string;
};

export function DeleteButton({ action, confirmMessage, title = "Are you sure?" }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        // Left open with the reason inline — these deletes are commonly
        // blocked by a child-record guard (submissions, attached fields,
        // live applications...) and a toast that fades is too easy to miss.
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(result?.success ?? "Deleted");
    });
  }

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        title="Delete"
        className="rounded-lg p-1.5 text-red-500 hover:bg-neutral-100"
      >
        <Trash2 size={14} />
      </button>

      <ConfirmationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={confirmMessage}
        error={error}
        confirmText="Delete"
        variant="destructive"
        isLoading={isPending}
        loadingText="Deleting..."
      />
    </>
  );
}