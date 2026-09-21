"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadPortalFile } from "@/lib/upload-portal-file";
import { cn } from "@/lib/utils";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import type { WizardField, WizardAnswer, PortalFieldType } from "./types";

interface DynamicFieldProps {
  applicationId: string;
  field: WizardField;
  answer: WizardAnswer | undefined;
  disabled?: boolean;
  onChange: (next: { value?: string | null; fileUrl?: string | null }) => void;
}

const INPUT_TYPE_BY_FIELD_TYPE: Partial<Record<PortalFieldType, string>> = {
  EMAIL: "email",
  PHONE: "tel",
  NUMBER: "number",
  DATE: "date",
};

export function DynamicField({ applicationId, field, answer, disabled, onChange }: DynamicFieldProps) {
  const { definition, isRequired } = field;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputId = `field-${field.id}`;
  const currentValue = answer?.value ?? "";

  async function handleFileSelected(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPortalFile(file, applicationId, definition.key);
      onChange({ fileUrl: url, value: file.name });
    } catch {
      // Kept local and silent — the field just stays empty and the
      // applicant can retry; the autosave indicator up top already
      // communicates save health without needing a second toast here.
    } finally {
      setUploading(false);
    }
  }

  function toggleMultiSelectOption(option: string) {
    const selected = currentValue ? currentValue.split(",").filter(Boolean) : [];
    const next = selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option];
    onChange({ value: next.join(",") });
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} className="text-sm font-medium text-[color:var(--color-ink)]">
        {definition.label}
        {isRequired && <span className="ml-0.5 text-[color:var(--color-ruby)]">*</span>}
      </Label>
      {definition.helpText && <p className="text-xs text-neutral-500">{definition.helpText}</p>}

      {(definition.type === "TEXT" ||
        definition.type === "EMAIL" ||
        definition.type === "PHONE" ||
        definition.type === "NUMBER" ||
        definition.type === "DATE") && (
        <Input
          id={inputId}
          type={INPUT_TYPE_BY_FIELD_TYPE[definition.type] ?? "text"}
          placeholder={definition.placeholder ?? undefined}
          value={currentValue}
          disabled={disabled}
          minLength={definition.minLength ?? undefined}
          maxLength={definition.maxLength ?? undefined}
          onChange={(e) => onChange({ value: e.target.value })}
        />
      )}

      {definition.type === "TEXTAREA" && (
        <Textarea
          id={inputId}
          placeholder={definition.placeholder ?? undefined}
          value={currentValue}
          disabled={disabled}
          maxLength={definition.maxLength ?? undefined}
          onChange={(e) => onChange({ value: e.target.value })}
        />
      )}

      {definition.type === "SELECT" && (
        <Select value={currentValue || undefined} disabled={disabled} onValueChange={(val) => onChange({ value: val })}>
          <SelectTrigger id={inputId} className="w-full">
            <SelectValue placeholder={definition.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {definition.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {definition.type === "MULTI_SELECT" && (
        <div className="flex flex-wrap gap-2">
          {definition.options.map((option) => {
            const selected = currentValue.split(",").filter(Boolean).includes(option);
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => toggleMultiSelectOption(option)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-[color:var(--color-teal)] bg-[color:var(--color-teal)] text-white"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {definition.type === "CHECKBOX" && (
        <div className="flex items-center gap-2 pt-1">
          <Switch
            id={inputId}
            checked={currentValue === "true"}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ value: checked ? "true" : "false" })}
          />
          <span className="text-sm text-neutral-500">{definition.placeholder ?? "Yes"}</span>
        </div>
      )}

      {(definition.type === "IMAGE" || definition.type === "FILE") && (
        <div>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={definition.type === "IMAGE" ? "image/*" : undefined}
            disabled={disabled || uploading}
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
          {answer?.fileUrl ? (
            <div className="flex items-center justify-between rounded-lg border bg-neutral-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate text-neutral-700">
                <FileText size={15} className="shrink-0 text-[color:var(--color-teal)]" />
                <span className="truncate">{currentValue || "File uploaded"}</span>
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange({ value: null, fileUrl: null })}
                  className="shrink-0 text-neutral-400 hover:text-[color:var(--color-ruby)]"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-4 text-sm text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
              {uploading ? "Uploading..." : `Upload ${definition.type === "IMAGE" ? "image" : "file"}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}