"use client";

import { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApplicationTagSchema } from "@/schemas";
import { createTag, updateTag } from "@/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

type Tag = { id: string; label: string; icon: string | null; order: number };

export function TagForm({ applicationId, tag }: { applicationId: string; tag?: Tag }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!tag;

  const form = useForm<z.infer<typeof ApplicationTagSchema>>({
    resolver: zodResolver(ApplicationTagSchema as any),
    defaultValues: { label: tag?.label ?? "", icon: tag?.icon ?? "", order: tag?.order ?? 0 },
  });

  const onSubmit = (values: z.infer<typeof ApplicationTagSchema>) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateTag(tag!.id, applicationId, values)
        : await createTag(applicationId, values);
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
          <button className="rounded-full border px-2.5 py-1 text-xs hover:bg-neutral-50">
            {tag.icon ? `${tag.icon} ` : ""}{tag.label} <Pencil size={10} className="ml-1 inline" />
          </button>
        ) : (
          <Button size="sm" variant="outline"><Plus size={14} className="mr-1" /> Add tag</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit tag" : "New tag"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="Germany" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (optional flag/emoji)</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="🇩🇪" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display order</FormLabel>
                  <FormControl><Input {...field} type="number" disabled={isPending} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Add tag"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
