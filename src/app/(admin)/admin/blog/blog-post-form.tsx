"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { BlogPostSchema, BlogPostStatusValues } from "@/schemas";
import { createBlogPost, updateBlogPost } from "@/actions/blog";
import { uploadBlogImage } from "@/lib/upload-blog-image";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type BlogPostFormValues = z.infer<typeof BlogPostSchema>;

type ExistingPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string;
  coverImageAlt: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  metaTitle: string | null;
  metaDescription: string | null;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BlogPostForm({ post }: { post?: ExistingPost }) {
  const isEdit = !!post;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState(post?.coverImage ?? "");
  // The slug only auto-follows the title until the author edits it by hand —
  // this mirrors how most CMS slug fields behave and keeps a manual override
  // from getting silently clobbered by the next keystroke in the title field.
  const slugTouched = useRef(isEdit);

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(BlogPostSchema as any),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "",
      coverImage: post?.coverImage ?? "",
      coverImageAlt: post?.coverImageAlt ?? "",
      tags: post?.tags.join(", ") ?? "",
      status: post?.status ?? "DRAFT",
      metaTitle: post?.metaTitle ?? "",
      metaDescription: post?.metaDescription ?? "",
    },
  });

  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const url = await uploadBlogImage(file, "covers");
      form.setValue("coverImage", url, { shouldValidate: true, shouldDirty: true });
      setCoverPreview(url);
    } catch {
      toast.error("Couldn't upload the cover image — try again.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const onSubmit = (values: BlogPostFormValues) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateBlogPost(post!.id, values)
        : await createBlogPost(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Saved");
      router.push("/admin/blog");
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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="A Simple Guide to Canada's Study Permit Process"
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="canadas-study-permit-process"
                        onChange={(e) => {
                          slugTouched.current = true;
                          field.onChange(slugify(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>ruhegr.com/blog/{form.watch("slug") || "your-slug"}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isPending}
                        rows={2}
                        placeholder="A short summary shown on blog cards and in search results."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                        placeholder="Write the post..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">SEO (optional)</h2>
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="Defaults to the post title" />
                    </FormControl>
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
                      <Textarea {...field} disabled={isPending} rows={2} placeholder="Defaults to the excerpt" />
                    </FormControl>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BlogPostStatusValues.map((s) => (
                          <SelectItem key={s} value={s}>{s === "PUBLISHED" ? "Published" : "Draft"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <FormField
                control={form.control}
                name="coverImage"
                render={() => (
                  <FormItem>
                    <FormLabel>Cover image</FormLabel>
                    <FormControl>
                      <div>
                        {coverPreview ? (
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-ink/5">
                            <Image src={coverPreview} alt="Cover preview" fill className="object-cover" sizes="320px" />
                            <button
                              type="button"
                              onClick={() => {
                                setCoverPreview("");
                                form.setValue("coverImage", "", { shouldValidate: true });
                              }}
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                              aria-label="Remove cover image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input text-sm text-muted-foreground hover:bg-neutral-50">
                            {isUploadingCover ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <ImagePlus size={20} />
                            )}
                            {isUploadingCover ? "Uploading..." : "Upload cover image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isPending || isUploadingCover}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (file) handleCoverUpload(file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </FormControl>
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
                      <Input {...field} disabled={isPending} placeholder="Student holding a Canadian flag at an airport" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} placeholder="study-abroad, canada, visa" />
                    </FormControl>
                    <FormDescription>Comma-separated. The first tag shows on the blog card.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isPending || isUploadingCover} className="w-full" size="lg">
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create post"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
