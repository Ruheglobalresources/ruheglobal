"use client";

import { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PortalTerminalSchema } from "@/schemas";
import { createTerminal, updateTerminal } from "@/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortalKindValues, PORTAL_KINDS } from "@/constants/portal-kinds";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

type Terminal = { id: string; name: string; icon: string | null; kind: string; order: number; isActive: boolean };

export function TerminalForm({
  terminal,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  hideTrigger,
}: {
  terminal?: Terminal;
  /** Pass these two when embedding the dialog somewhere that supplies its own
   *  trigger (e.g. a dropdown menu item) — the component becomes fully
   *  controlled and stops rendering its own trigger button. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;
  const [isPending, startTransition] = useTransition();
  const isEdit = !!terminal;

  const form = useForm<z.infer<typeof PortalTerminalSchema>>({
    resolver: zodResolver(PortalTerminalSchema as any),
    defaultValues: {
      name: terminal?.name ?? "",
      icon: terminal?.icon ?? "",
      kind: (terminal?.kind as (typeof PortalKindValues)[number]) ?? "GENERAL",
      order: terminal?.order ?? 0,
      isActive: terminal?.isActive ?? true,
    },
  });

  const onSubmit = (values: z.infer<typeof PortalTerminalSchema>) => {
    startTransition(async () => {
      const result = isEdit ? await updateTerminal(terminal!.id, values) : await createTerminal(values);
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
      {!hideTrigger && (
        <DialogTrigger asChild>
          {isEdit ? (
            <Button title="Edit" variant="ghost" size="sm"><Pencil size={14} /></Button>
          ) : (
            <Button size="sm"><Plus size={16} className="mr-1" /> Add terminal</Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit terminal" : "New terminal"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="Study Abroad" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Used for</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose what this terminal is used for" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PortalKindValues.map((k) => (
                        <SelectItem key={k} value={k}>{PORTAL_KINDS[k].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500">{PORTAL_KINDS[field.value].description}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (optional emoji)</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="🎓" /></FormControl>
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
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="!m-0">Visible on portal</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} /></FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create terminal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}