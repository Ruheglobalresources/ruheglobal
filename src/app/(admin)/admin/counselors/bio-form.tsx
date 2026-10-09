"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCounselorBio } from "@/actions/counselors";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 600;

export function BioForm({ userId, bio }: { userId: string; bio: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bio ?? "");
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="max-w-md">
        {bio ? <p className="line-clamp-2 text-neutral-600">{bio}</p> : <p className="text-neutral-300">No bio yet</p>}
        <button type="button" onClick={() => setEditing(true)} className="mt-1 text-xs font-medium text-[color:var(--color-teal)] hover:underline">
          {bio ? "Edit bio" : "Add bio"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={4}
        disabled={isPending}
        placeholder="A short introduction applicants will see"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await updateCounselorBio(userId, value);
              if (result?.error) {
                toast.error(result.error);
                return;
              }
              toast.success(result?.success ?? "Saved");
              setEditing(false);
            })
          }
        >
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => {
            setValue(bio ?? "");
            setEditing(false);
          }}
        >
          Cancel
        </Button>
        <span className="ml-auto text-xs text-neutral-400">{value.length}/{MAX_LENGTH}</span>
      </div>
    </div>
  );
}