"use client";

import { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FieldDefinitionSchema, FieldTypeValues, FieldCategoryValues } from "@/schemas";
import { createField, updateField } from "@/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

type FieldDefinition = {
  id: string;
  key: string;
  label: string;
  type: (typeof FieldTypeValues)[number];
  category: string;
  placeholder: string | null;
  helpText: string | null;
  options: unknown;
  minLength: number | null;
  maxLength: number | null;
  pattern: string | null;
};

const SHOWS_OPTIONS = new Set(["SELECT", "MULTI_SELECT"]);

export function FieldForm({ field: fieldDef }: { field?: FieldDefinition }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!fieldDef;

  const form = useForm<z.infer<typeof FieldDefinitionSchema>>({
    resolver: zodResolver(FieldDefinitionSchema as any),
    defaultValues: {
      key: fieldDef?.key ?? "",
      label: fieldDef?.label ?? "",
      type: fieldDef?.type ?? "TEXT",
      category: fieldDef?.category ?? "General",
      placeholder: fieldDef?.placeholder ?? "",
      helpText: fieldDef?.helpText ?? "",
      options: Array.isArray(fieldDef?.options) ? (fieldDef!.options as string[]).join(", ") : "",
      minLength: fieldDef?.minLength ?? undefined,
      maxLength: fieldDef?.maxLength ?? undefined,
      pattern: fieldDef?.pattern ?? "",
    },
  });

  const watchedType = form.watch("type");

  const onSubmit = (values: z.infer<typeof FieldDefinitionSchema>) => {
    startTransition(async () => {
      const result = isEdit ? await updateField(fieldDef!.id, values) : await createField(values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Saved");
      setOpen(false);
      if (!isEdit) form.reset();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button title="Edit" variant="ghost" size="sm"><Pencil size={14} /></Button>
        ) : (
          <Button size="sm"><Plus size={16} className="mr-1" /> Add field</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit field" : "New field"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="passport_number" /></FormControl>
                  <FormDescription>Lowercase, underscores only — used internally, never shown to applicants.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="Passport number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FieldTypeValues.map((t) => (
                        <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <>
                      <Input {...field} disabled={isPending} list="field-categories" placeholder="Personal Details" />
                      <datalist id="field-categories">
                        {FieldCategoryValues.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </>
                  </FormControl>
                  <FormDescription>Groups this field in the checklist — pick an existing one or type a new one.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder (optional)</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="helpText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Help text (optional)</FormLabel>
                  <FormControl><Textarea {...field} disabled={isPending} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {SHOWS_OPTIONS.has(watchedType) && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choices</FormLabel>
                    <FormControl><Input {...field} disabled={isPending} placeholder="Mr, Mrs, Ms, Dr" /></FormControl>
                    <FormDescription>Comma-separated.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="minLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min length</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="number" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max length</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} type="number" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validation regex (optional)</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="^[A-Z0-9]{9}$" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create field"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}