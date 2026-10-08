"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ActionsMenu } from "@/components/admin/actions-menu";
import { TerminalForm } from "@/app/(admin)/admin/terminals/terminal-form";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { deleteTerminal } from "@/actions";
import { ListChecks, FolderKanban, Pencil, Trash2 } from "lucide-react";

type Terminal = { id: string; name: string; icon: string | null; kind: string; order: number; isActive: boolean; isVisible: boolean };

export function TerminalRowActions({ terminal }: { terminal: Terminal }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTerminal(terminal.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setDeleteOpen(false);
      toast.success(result?.success ?? "Deleted");
    });
  }

  return (
    <>
      {/* Controlled dialog lives alongside the menu, not inside it — nesting a
          Dialog trigger inside a DropdownMenuItem is a known focus-fight
          footgun in Radix, so the menu item just flips this state instead. */}
      <TerminalForm terminal={terminal} open={editOpen} onOpenChange={setEditOpen} hideTrigger />
      <ConfirmationModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete terminal?"
        description={`Delete "${terminal.name}"? This can't be undone.`}
        error={error}
        confirmText="Delete"
        variant="destructive"
        isLoading={isPending}
        loadingText="Deleting..."
      />
      <ActionsMenu
        items={[
          { label: "Field library", icon: ListChecks, href: `/admin/terminals/${terminal.id}/fields` },
          { label: "Applications", icon: FolderKanban, href: `/admin/applications?terminal=${terminal.id}` },
          { type: "separator" },
          { label: "Edit", icon: Pencil, onSelect: () => setEditOpen(true) },
          {
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            disabled: isPending,
            onSelect: () => {
              setError(null);
              setDeleteOpen(true);
            },
          },
        ]}
      />
    </>
  );
}