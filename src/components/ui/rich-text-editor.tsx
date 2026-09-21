"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { uploadBlogImage } from "@/lib/upload-blog-image";
import { Bold, Italic, Heading2, Heading3, Link2, Unlink, Pilcrow, ImagePlus, Loader2 } from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

// A small, dependency-free rich text input built for the blog editor —
// react-quill was dropped from this project, and nothing else in
// package.json does rich text, so this leans on document.execCommand
// instead of pulling in a new editor library. It covers exactly what a
// blog post needs: headings, bold/italic, links, and inline images.
//
// The editable surface renders with the same `.blog-content` class the
// published post uses (see globals.css), so a heading gets its underline
// the moment it's created, not just after publishing.
export function RichTextEditor({ value, onChange, placeholder, disabled, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Tracks the last selection made *inside* the editor. We need this because
  // image insertion has to await an upload — and by the time that promise
  // resolves, the file picker + network round trip have already stolen focus
  // and cleared the browser's live selection. Without a saved copy to restore,
  // focusing the editor again defaults the cursor to the very start, which is
  // why images used to always land at the top instead of at the cursor.
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
      setIsEmpty(!value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a live copy of the most recent in-editor selection, updated on every
  // selection change anywhere in the document. We only store it when the
  // selection actually falls inside our editable div, so clicking elsewhere
  // (e.g. into the title field) doesn't overwrite the last good position.
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!selection || !range || !editorRef.current) return;
    // Guard against stale nodes, e.g. if innerHTML was reset externally
    // (switching between posts) since the range was captured.
    if (!editorRef.current.contains(range.startContainer)) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const emitChange = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    setIsEmpty(!editorRef.current?.textContent?.trim());
    onChange(html);
  }, [onChange]);

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const toggleHeading = (level: "H2" | "H3") => exec("formatBlock", level);
  const setParagraph = () => exec("formatBlock", "P");

  const addLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      window.alert("Select the text you want to turn into a link first.");
      return;
    }
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    exec("createLink", url);
  };

  const removeLink = () => exec("unlink");

  const insertImage = async (file: File) => {
    // Capture the selection *before* the async upload starts — this is the
    // most reliable point we have, since focus/selection can be lost the
    // instant the file picker opens, well before upload even begins.
    const selectionAtClickTime = window.getSelection();
    if (selectionAtClickTime && selectionAtClickTime.rangeCount > 0) {
      const range = selectionAtClickTime.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }

    setIsUploadingImage(true);
    try {
      const url = await uploadBlogImage(file, "content");
      exec("insertImage", url);
    } catch {
      window.alert("Couldn't upload that image — try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-md border border-input bg-transparent", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-neutral-50 px-2 py-1.5">
        <ToolbarButton label="Heading 2" onClick={() => toggleHeading("H2")} disabled={disabled}>
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton label="Heading 3" onClick={() => toggleHeading("H3")} disabled={disabled}>
          <Heading3 size={15} />
        </ToolbarButton>
        <ToolbarButton label="Paragraph" onClick={setParagraph} disabled={disabled}>
          <Pilcrow size={15} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-neutral-200" />
        <ToolbarButton label="Bold" onClick={() => exec("bold")} disabled={disabled}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")} disabled={disabled}>
          <Italic size={15} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-neutral-200" />
        <ToolbarButton label="Add link" onClick={addLink} disabled={disabled}>
          <Link2 size={15} />
        </ToolbarButton>
        <ToolbarButton label="Remove link" onClick={removeLink} disabled={disabled}>
          <Unlink size={15} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-neutral-200" />
        <label
          title="Insert image"
          aria-label="Insert image"
          className={cn(
            "flex h-7 w-7 cursor-pointer items-center justify-center rounded text-neutral-600 hover:bg-neutral-200",
            (disabled || isUploadingImage) && "pointer-events-none opacity-50"
          )}
        >
          {isUploadingImage ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled || isUploadingImage}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = ""; // let the same file be picked again later
              if (file) insertImage(file);
            }}
          />
        </label>
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-4 top-4 text-sm text-muted-foreground">{placeholder}</p>
        )}
        <div
          ref={editorRef}
          className="blog-content min-h-[260px] w-full px-4 py-4 text-sm outline-none md:text-base"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex h-7 w-7 items-center justify-center rounded text-neutral-600 hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}