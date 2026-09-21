"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApplicationSchema } from "@/schemas";
import { createApplication, updateApplication } from "@/actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

type Terminal = { id: string; name: string };
type Application = {
  id: string;
  terminalId: string;
  name: string;
  subtitle: string | null;
  icon: string | null;
  badge: string | null;
  isLive: boolean;
  isActive: boolean;
  order: number;
};

export function ApplicationForm({
  terminals,
  application,
  defaultTerminalId,
}: {
  terminals: Terminal[];
  application?: Application;
  defaultTerminalId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!application;

  const form = useForm<z.infer<typeof ApplicationSchema>>({
    resolver: zodResolver(ApplicationSchema as any),
    defaultValues: {
      terminalId: application?.terminalId ?? defaultTerminalId ?? terminals[0]?.id ?? "",
      name: application?.name ?? "",
      subtitle: application?.subtitle ?? "",
      icon: application?.icon ?? "",
      badge: application?.badge ?? "",
      isLive: application?.isLive ?? false,
      isActive: application?.isActive ?? true,
      order: application?.order ?? 0,
    },
  });

  const onSubmit = (values: z.infer<typeof ApplicationSchema>) => {
    startTransition(async () => {
      const result = isEdit ? await updateApplication(application!.id, values) : await createApplication(values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Saved");
      setOpen(false);
      if (!isEdit) {
        form.reset();
        if ("id" in result && result.id) router.push(`/admin/applications/${result.id}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button title="Edit" variant="ghost" size="sm"><Pencil size={14} /></Button>
        ) : (
          <Button size="sm"><Plus size={16} className="mr-1" /> Add application</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit application" : "New application"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="terminalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose a terminal" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {terminals.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} disabled={isPending} placeholder="Work in Germany" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle (optional)</FormLabel>
                  <FormControl><Textarea {...field} disabled={isPending} rows={2} placeholder="One team, 14 countries..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (emoji)</FormLabel>
                    <FormControl><Input {...field} disabled={isPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge (optional)</FormLabel>
                    <FormControl><Input {...field} disabled={isPending} placeholder="14 countries open" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              name="isLive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="!m-0">Live (green dot on the card)</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} /></FormControl>
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
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create application"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
