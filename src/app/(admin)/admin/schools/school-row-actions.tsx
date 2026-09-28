"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ActionsMenu } from "@/components/admin/actions-menu";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { deleteSchool } from "@/actions/schools";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

type SchoolRow = { id: string; name: string; slug: string };

export function SchoolRowActions({ school }: { school: SchoolRow }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteSchool(school.id);
        setDeleteOpen(false);
        toast.success(result.success ?? "Deleted");
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Failed to delete school");
      }
    });
  }

  return (
    <>
      <ConfirmationModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete school?"
        description={`Delete "${school.name}" along with its courses and gallery images? This can't be undone.`}
        error={error}
        confirmText="Delete"
        variant="destructive"
        isLoading={isPending}
        loadingText="Deleting..."
      />
      <ActionsMenu
        items={[
          { label: "Edit", icon: Pencil, href: `/admin/schools/${school.id}/edit` },
          { label: "View page", icon: ExternalLink, href: `/schools/${school.slug}` },
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