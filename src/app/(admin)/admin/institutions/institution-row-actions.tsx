"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ActionsMenu } from "@/components/admin/actions-menu";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { deleteInstitution } from "@/actions/institutions";
import { Pencil, Trash2 } from "lucide-react";

type Institution = { id: string; name: string };

export function InstitutionRowActions({ institution }: { institution: Institution }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteInstitution(institution.id);
        setDeleteOpen(false);
        toast.success(result.success ?? "Deleted");
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Failed to delete institution");
      }
    });
  }

  return (
    <>
      <ConfirmationModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete institution?"
        description={`Delete "${institution.name}"? This can't be undone.`}
        error={error}
        confirmText="Delete"
        variant="destructive"
        isLoading={isPending}
        loadingText="Deleting..."
      />
      <ActionsMenu
        items={[
          { label: "Edit", icon: Pencil, href: `/admin/institutions/${institution.id}/edit` },
          { type: "separator" },
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
