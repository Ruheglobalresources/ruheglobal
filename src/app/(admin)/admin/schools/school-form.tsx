"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { SchoolSchema } from "@/schemas";
import { createSchool, updateSchool } from "@/actions/schools";
import { uploadSchoolImage } from "@/lib/upload-school-image";
import { COUNTRIES } from "@/constants/schools";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./image-uploader";

type SchoolFormValues = z.infer<typeof SchoolSchema>;

type ExistingSchool = {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  founded: number | null;
  ranking: string | null;
  acceptanceRate: string | null;
  tuitionFrom: number | null;
  tuitionCurrency: string;
  website: string | null;
  description: string;
  paragraph1: string | null;
  paragraph2: string | null;
  paragraph3: string | null;
  paragraph4: string | null;
  coverImage: string;
  coverImageAlt: string | null;
  logoUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  order: number;
  courses: {
    name: string;
    level: string | null;
    duration: string | null;
    tuition: string | null;
    intakes: string | null;
    description: string | null;
    imageUrl: string | null;
  }[];
  images: { url: string; altText: string | null; caption: string | null }[];
};

const slugify = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

const selectClass =
  "border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50";

export function SchoolForm({ school }: { school?: ExistingSchool }) {
  const isEdit = !!school;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadingGallery, setUploadingGallery] = useState(false);
  // Slug follows the name until the admin edits it by hand (same as the blog form).
  const slugTouched = useRef(isEdit);

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(SchoolSchema as any),
    defaultValues: {
      name: school?.name ?? "",
      slug: school?.slug ?? "",
      country: school?.country ?? COUNTRIES[0].name,
      city: school?.city ?? "",
      founded: school?.founded ?? undefined,
      ranking: school?.ranking ?? "",
      acceptanceRate: school?.acceptanceRate ?? "",
      tuitionFrom: school?.tuitionFrom ?? undefined,
      tuitionCurrency: school?.tuitionCurrency ?? "GBP",
      website: school?.website ?? "",
      description: school?.description ?? "",
      paragraph1: school?.paragraph1 ?? "",
      paragraph2: school?.paragraph2 ?? "",
      paragraph3: school?.paragraph3 ?? "",
      paragraph4: school?.paragraph4 ?? "",
      coverImage: school?.coverImage ?? "",
      coverImageAlt: school?.coverImageAlt ?? "",
      logoUrl: school?.logoUrl ?? "",
      metaTitle: school?.metaTitle ?? "",
      metaDescription: school?.metaDescription ?? "",
      isActive: school?.isActive ?? true,
      order: school?.order ?? 0,
      courses:
        school?.courses.map((c) => ({
          name: c.name,
          level: c.level ?? "",
          duration: c.duration ?? "",
          tuition: c.tuition ?? "",
          intakes: c.intakes ?? "",
          description: c.description ?? "",
          imageUrl: c.imageUrl ?? "",
        })) ?? [],
      images: school?.images.map((i) => ({ url: i.url, altText: i.altText ?? "", caption: i.caption ?? "" })) ?? [],
    },
  });

  const courses = useFieldArray({ control: form.control, name: "courses" });
  const images = useFieldArray({ control: form.control, name: "images" });

  const countryOptions = COUNTRIES.map((c) => c.name);
  if (school && !countryOptions.includes(school.country)) countryOptions.push(school.country);

  const addGalleryFiles = async (files: FileList) => {
    setUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadSchoolImage(file, "gallery");
        images.append({ url, altText: "", caption: "" });
      }
    } catch {
      toast.error("One of the images couldn't be uploaded. Try again.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const onSubmit = (values: SchoolFormValues) => {
    startTransition(async () => {
      const result = isEdit ? await updateSchool(school!.id, values) : await createSchool(values);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Saved");
      router.push("/admin/schools");
      router.refresh();
    });
  };

  const metaTitleLen = (form.watch("metaTitle") ?? "").length;
  const metaDescLen = (form.watch("metaDescription") ?? "").length;
  const busy = isPending || uploadingGallery;

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ───────── Main column ───────── */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Basic details</h2>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={busy}
                        placeholder="Coventry University"
                        onChange={(e) => {
                          field.onChange(e);
                          if (!slugTouched.current) {
                            form.setValue("slug", slugify(e.target.value), { shouldValidate: true });
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>URL slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={busy}
                        placeholder="coventry-university"
                        onChange={(e) => {
                          slugTouched.current = true;
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Page address: /schools/{form.watch("slug") || "your-slug"}. Changing it later changes the
                      URL Google has indexed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <select {...field} disabled={busy} className={selectClass}>
                          {countryOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={busy} placeholder="Coventry" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="founded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Founded</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} type="number" disabled={busy} placeholder="1992" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tuitionFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuition from (per year)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} type="number" disabled={busy} placeholder="18500" />
                      </FormControl>
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
                      <FormControl>
                        <Input {...field} disabled={busy} maxLength={3} placeholder="GBP" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ranking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ranking (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={busy} placeholder="QS #29 Global (2026)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acceptanceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceptance rate (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={busy} placeholder="60%+" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={busy} placeholder="https://www.coventry.ac.uk" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-1 text-sm font-semibold text-ink">Write-up</h2>
              <p className="mb-4 text-xs text-neutral-500">
                The short description shows on the school card. Paragraphs 1 to 4 form the short article on the
                school&apos;s page. Leave any you don&apos;t need empty.
              </p>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short description</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={busy} rows={3} placeholder="One or two sentences. Max 320 characters." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(["paragraph1", "paragraph2", "paragraph3", "paragraph4"] as const).map((name, i) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Paragraph {i + 1}</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} disabled={busy} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Courses */}
            <div className="rounded-xl border bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">Courses ({courses.fields.length})</h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    courses.append({ name: "", level: "", duration: "", tuition: "", intakes: "", description: "", imageUrl: "" })
                  }
                >
                  <Plus size={14} className="mr-1" /> Add course
                </Button>
              </div>

              {courses.fields.length === 0 && (
                <p className="text-sm text-neutral-400">No courses yet.</p>
              )}

              <div className="space-y-4">
                {courses.fields.map((item, i) => (
                  <div key={item.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Course {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => courses.remove(i)}
                        disabled={busy}
                        className="text-neutral-400 hover:text-red-600"
                        aria-label={`Remove course ${i + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`courses.${i}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={busy} placeholder="MSc Data Science" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`courses.${i}.level`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Level</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="Postgraduate" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`courses.${i}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="1 year" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`courses.${i}.tuition`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tuition</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="£18,500 / year" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`courses.${i}.intakes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Intakes</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="September, January" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`courses.${i}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (optional)</FormLabel>
                              <FormControl>
                                <Textarea {...field} value={field.value ?? ""} disabled={busy} rows={3} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`courses.${i}.imageUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image</FormLabel>
                            <FormControl>
                              <ImageUploader
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                folder="courses"
                                label="Upload"
                                disabled={busy}
                                aspect="aspect-square"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="rounded-xl border bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">Gallery images ({images.fields.length})</h2>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50">
                  {uploadingGallery ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                  {uploadingGallery ? "Uploading..." : "Add images"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files?.length) addGalleryFiles(files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {images.fields.length === 0 && <p className="text-sm text-neutral-400">No gallery images yet.</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                {images.fields.map((item, i) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-md bg-ink/5">
                      <Image src={form.watch(`images.${i}.url`)} alt="" fill className="object-cover" sizes="300px" />
                      <button
                        type="button"
                        onClick={() => images.remove(i)}
                        disabled={busy}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        aria-label={`Remove image ${i + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`images.${i}.altText`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="Alt text (describe the photo)" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`images.${i}.caption`}
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="Caption (optional)" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ───────── Side column ───────── */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-5">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover image</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onChange={(url) => form.setValue("coverImage", url, { shouldValidate: true, shouldDirty: true })}
                        folder="covers"
                        label="Upload cover image"
                        disabled={busy}
                      />
                    </FormControl>
                    <FormDescription>Used on the school card, the page hero and social shares.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverImageAlt"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Cover image alt text</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="Lanchester Library at Coventry University" />
                    </FormControl>
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
                    <FormLabel>Logo (optional)</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value ?? ""}
                        onChange={(url) => form.setValue("logoUrl", url, { shouldDirty: true })}
                        folder="logos"
                        label="Upload logo"
                        disabled={busy}
                        aspect="aspect-[3/1]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">SEO</h2>
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta title</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} disabled={busy} placeholder="Study at Coventry University from Nigeria" />
                    </FormControl>
                    <FormDescription>{metaTitleLen}/70. Leave empty to use the school name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Meta description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} disabled={busy} rows={3} />
                    </FormControl>
                    <FormDescription>{metaDescLen}/170. Leave empty to use the short description.</FormDescription>
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
                    <FormControl>
                      <Input {...field} type="number" disabled={busy} />
                    </FormControl>
                    <FormDescription>Lower numbers show first within their country.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="mt-4 flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="!m-0">Published</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={busy} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Add school"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}