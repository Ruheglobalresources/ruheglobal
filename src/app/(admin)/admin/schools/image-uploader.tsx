"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadSchoolImage } from "@/lib/upload-school-image";

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder: "covers" | "gallery" | "courses" | "logos";
  label: string;
  disabled?: boolean;
  aspect?: string; // tailwind aspect class
};

// Single-image upload box: shows a preview with a remove button once set,
// otherwise a dashed drop-zone. Uploads straight to Firebase Storage.
export function ImageUploader({ value, onChange, folder, label, disabled, aspect = "aspect-[16/10]" }: Props) {
  const [uploading, setUploading] = useState(false);

  const handle = async (file: File) => {
    setUploading(true);
    try {
      onChange(await uploadSchoolImage(file, folder));
    } catch {
      toast.error("Couldn't upload the image. Try again.");
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className={`relative w-full overflow-hidden rounded-lg bg-ink/5 ${aspect}`}>
        <Image src={value} alt="" fill className="object-cover" sizes="320px" />
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={disabled}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          aria-label="Remove image"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <label
      className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input text-sm text-muted-foreground hover:bg-neutral-50 ${aspect}`}
    >
      {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
      {uploading ? "Uploading..." : label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) handle(file);
        }}
      />
    </label>
  );
}