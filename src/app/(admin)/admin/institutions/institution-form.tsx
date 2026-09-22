"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { InstitutionSchema } from "@/schemas";
import { createInstitution, updateInstitution } from "@/actions/institutions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

type InstitutionFormValues = z.infer<typeof InstitutionSchema>;

type ExistingInstitution = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  institutionType: string | null;
  summary: string;
  programs: string[];
  ieltsOverall: number | null;
  ieltsMinBand: number | null;
  ieltsAlternatives: string[];
  ieltsNote: string | null;
  tuitionMin: number | null;
  tuitionMax: number | null;
  tuitionCurrency: string | null;
  tuitionPeriod: string | null;
  tuitionNote: string | null;
  ranking: string | null;
  website: string | null;
  imageUrl: string | null;
  logoUrl: string | null;
  isActive: boolean;
  order: number;
};

export function InstitutionForm({ institution }: { institution?: ExistingInstitution }) {
  const isEdit = !!institution;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState(institution?.imageUrl ?? "");

  const form = useForm<InstitutionFormValues>({
    resolver: zodResolver(InstitutionSchema as any),
    defaultValues: {
      name: institution?.name ?? "",
      city: institution?.city ?? "",
      country: institution?.country ?? "",
      institutionType: institution?.institutionType ?? "",
      summary: institution?.summary ?? "",
      programs: institution?.programs.join(", ") ?? "",
      ieltsOverall: institution?.ieltsOverall ?? undefined,
      ieltsMinBand: institution?.ieltsMinBand ?? undefined,
      ieltsAlternatives: institution?.ieltsAlternatives.join(", ") ?? "",
      ieltsNote: institution?.ieltsNote ?? "",
      tuitionMin: institution?.tuitionMin ?? undefined,
      tuitionMax: institution?.tuitionMax ?? undefined,
      tuitionCurrency: institution?.tuitionCurrency ?? "",
      tuitionPeriod: institution?.tuitionPeriod ?? "",
      tuitionNote: institution?.tuitionNote ?? "",
      ranking: institution?.ranking ?? "",
      website: institution?.website ?? "",
      imageUrl: institution?.imageUrl ?? "",
      logoUrl: institution?.logoUrl ?? "",
      isActive: institution?.isActive ?? true,
      order: institution?.order ?? 0,
    },
  });

  const onSubmit = (values: InstitutionFormValues) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateInstitution(institution!.id, values)
        : await createInstitution(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Saved");
      router.push("/admin/institutions");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Basic details</h2>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="University of Exeter - Streatham Campus" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input {...field} disabled={isPending} placeholder="Exeter" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input {...field} disabled={isPending} placeholder="United Kingdom" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="institutionType"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Institution type</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="Public research university" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isPending}
                        rows={3}
                        placeholder="One or two plain sentences on what this school is known for. Max 320 characters."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programs"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Programmes</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="MSc Finance, MSc International Business" />
                    </FormControl>
                    <FormDescription>Comma-separated. Up to 3 shown on the result card.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">English proficiency</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ieltsOverall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IELTS overall</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.5" disabled={isPending} placeholder="6.5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ieltsMinBand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IELTS min sub-band</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.5" disabled={isPending} placeholder="6.0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="ieltsAlternatives"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Accepted alternatives</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="TOEFL iBT 88, PTE 62" />
                    </FormControl>
                    <FormDescription>Comma-separated.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ieltsNote"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Note (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="Higher band required for Nursing and Law" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Tuition</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="tuitionMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min</FormLabel>
                      <FormControl><Input {...field} type="number" disabled={isPending} placeholder="24000" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tuitionMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max</FormLabel>
                      <FormControl><Input {...field} type="number" disabled={isPending} placeholder="29500" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tuitionCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl><Input {...field} disabled={isPending} placeholder="GBP" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tuitionPeriod"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Period</FormLabel>
                    <FormControl><Input {...field} disabled={isPending} placeholder="per year (2025/26)" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tuitionNote"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Note (optional)</FormLabel>
                    <FormControl><Input {...field} disabled={isPending} placeholder="Varies by programme" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-5">
              <FormField
                control={form.control}
                name="imageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Campus image URL</FormLabel>
                    <FormControl>
                      <div>
                        {imagePreview ? (
                          <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-lg bg-ink/5">
                            <Image src={imagePreview} alt="Campus preview" fill className="object-cover" sizes="320px" />
                          </div>
                        ) : (
                          <div className="mb-3 flex aspect-[16/10] w-full items-center justify-center rounded-lg border-2 border-dashed border-input text-neutral-300">
                            <Building2 size={28} />
                          </div>
                        )}
                        <Input
                          value={form.watch("imageUrl")}
                          disabled={isPending}
                          placeholder="https://upload.wikimedia.org/..."
                          onChange={(e) => {
                            form.setValue("imageUrl", e.target.value, { shouldValidate: true, shouldDirty: true });
                            setImagePreview(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      A direct https link to a real campus photo (e.g. a Wikimedia Commons image). Never invent one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="https://www.google.com/s2/favicons?domain=..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Website</FormLabel>
                    <FormControl><Input {...field} disabled={isPending} placeholder="https://www.exeter.ac.uk" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ranking"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Ranking (optional)</FormLabel>
                    <FormControl><Input {...field} disabled={isPending} placeholder="QS World Top 200" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
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
                  <FormItem className="mt-4 flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="!m-0">Visible in search</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full" size="lg">
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Add institution"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
