"use client";

// src/components/profile/avatar-editor.tsx
// The round profile photo with a camera button. Pick an image, it goes straight to Firebase
// Storage (with a progress ring), then the server action saves the URL on the user.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { removeProfilePhoto, updateProfilePhoto } from "@/actions/profile";
import { uploadProfileImage } from "@/lib/upload-profile-image";

export function AvatarEditor({
  userId,
  name,
  image,
}: {
  userId: string;
  name: string;
  image: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(image);
  const [progress, setProgress] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => setPhoto(image), [image]);

  const busy = progress !== null || removing;
  const initial = (name.trim().charAt(0) || "?").toUpperCase();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;

    setProgress(0);
    try {
      const url = await uploadProfileImage(file, userId, setProgress);
      const res = await updateProfilePhoto(url);
      if ("error" in res) throw new Error(res.error);
      setPhoto(url);
      toast.success("Profile photo updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your photo");
    } finally {
      setProgress(null);
    }
  };

  const onRemove = async () => {
    setRemoving(true);
    try {
      const res = await removeProfilePhoto();
      if ("error" in res) throw new Error(res.error);
      setPhoto(null);
      toast.success("Profile photo removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove your photo");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="relative">
        <div className="relative grid size-24 place-items-center overflow-hidden rounded-full bg-ruby-500 text-4xl font-semibold text-white ring-4 ring-ruby-50">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={`${name || "Your"} profile photo`} className="size-full object-cover" />
          ) : (
            <span aria-hidden="true">{initial}</span>
          )}

          {progress !== null && (
            <div className="absolute inset-0 grid place-items-center bg-ink/55 text-white">
              <div className="flex flex-col items-center gap-0.5">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[11px] font-semibold">{progress}%</span>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={photo ? "Change profile photo" : "Add a profile photo"}
          className="absolute -bottom-0.5 -right-0.5 grid size-9 place-items-center rounded-full border-2 border-white bg-ruby-500 text-white shadow transition hover:bg-ruby-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/50 disabled:opacity-60"
        >
          <Camera size={16} />
        </button>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>

      {photo && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className="text-xs font-medium text-ink/50 transition hover:text-ruby-600 disabled:opacity-50"
        >
          {removing ? "Removing..." : "Remove photo"}
        </button>
      )}
    </div>
  );
}