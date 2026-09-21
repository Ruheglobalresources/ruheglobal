"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ActionsMenu } from "@/components/admin/actions-menu";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { deleteBlogPost, setBlogPostStatus } from "@/actions/blog";
import { Eye, Pencil, Send, Trash2, Undo2 } from "lucide-react";

type Post = { id: string; title: string; status: "DRAFT" | "PUBLISHED"; slug: string };

export function BlogRowActions({ post }: { post: Post }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteBlogPost(post.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setDeleteOpen(false);
      toast.success(result?.success ?? "Deleted");
    });
  }

  function toggleStatus() {
    const next = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      const result = await setBlogPostStatus(post.id, next);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Updated");
    });
  }

  return (
    <>
      <ConfirmationModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete post?"
        description={`Delete "${post.title}"? This can't be undone.`}
        error={error}
        confirmText="Delete"
        variant="destructive"
        isLoading={isPending}
        loadingText="Deleting..."
      />
      <ActionsMenu
        items={[
          ...(post.status === "PUBLISHED"
            ? [{ label: "View live", icon: Eye, href: `/blog/${post.slug}` }]
            : []),
          { label: "Edit", icon: Pencil, href: `/admin/blog/${post.id}/edit` },
          {
            label: post.status === "PUBLISHED" ? "Move to draft" : "Publish",
            icon: post.status === "PUBLISHED" ? Undo2 : Send,
            disabled: isPending,
            onSelect: toggleStatus,
          },
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
