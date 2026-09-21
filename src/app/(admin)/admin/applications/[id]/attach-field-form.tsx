"use client";

import { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApplicationFieldAssignSchema } from "@/schemas";
import { attachField } from "@/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type AvailableField = { id: string; label: string; key: string; type: string };

export function AttachFieldForm({
  applicationId,
  availableFields,
}: {
  applicationId: string;
  availableFields: AvailableField[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ApplicationFieldAssignSchema>>({
    resolver: zodResolver(ApplicationFieldAssignSchema as any),
    defaultValues: { fieldDefinitionId: "", isRequired: false, stepNumber: 1, order: 0 },
  });

  const onSubmit = (values: z.infer<typeof ApplicationFieldAssignSchema>) => {
    startTransition(async () => {
      const result = await attachField(applicationId, values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Attached");
      setOpen(false);
      form.reset();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={availableFields.length === 0}>
          <Plus size={16} className="mr-1" /> Attach field
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach a field from the library</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="fieldDefinitionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose a field" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableFields.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.label} ({f.type.replace("_", " ")})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="stepNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wizard step</FormLabel>
                    <FormControl><Input {...field} type="number" min={1} disabled={isPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order on step</FormLabel>
                    <FormControl><Input {...field} type="number" disabled={isPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="!m-0">Required on this application</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} /></FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Attaching..." : "Attach field"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
