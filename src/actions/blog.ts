"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-staff";
import { BlogPostSchema } from "@/schemas";
import { sanitizeBlogHtml } from "@/lib/sanitize-html";

type BlogPostInput = z.infer<typeof BlogPostSchema>;

// Appends "-2", "-3"... until the slug is free. Runs on every create, and on
// update only when the slug actually changed, so editing a post's title
// without touching its slug never triggers a needless collision check.
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (
    await db.blogPost.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function parseTags(input?: string): string[] {
  if (!input) return [];
  return Array.from(new Set(input.split(",").map((t) => t.trim()).filter(Boolean)));
}

// Pulls every <img src="..."> out of the post body, in document order —
// this is how BlogPostImage rows (alt text / caption / ordering) stay in
// sync with whatever the editor's image button actually inserted, without
// asking the author to manage images in two places.
function extractContentImageUrls(html: string): string[] {
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    urls.push(match[1]);
  }
  return urls;
}

async function syncBlogPostImages(blogPostId: string, html: string) {
  const urls = extractContentImageUrls(html);
  const existing = await db.blogPostImage.findMany({ where: { blogPostId } });
  const existingUrls = new Set(existing.map((img) => img.url));

  await db.$transaction([
    // Drop rows for images no longer referenced in the content.
    db.blogPostImage.deleteMany({
      where: { blogPostId, url: { notIn: urls.length > 0 ? urls : ["__none__"] } },
    }),
    // Add rows for newly-referenced images, preserving body order.
    ...urls
      .filter((url) => !existingUrls.has(url))
      .map((url, i) =>
        db.blogPostImage.create({
          data: { blogPostId, url, order: existing.length + i },
        })
      ),
  ]);
}

export async function createBlogPost(values: BlogPostInput) {
  const staff = await requireStaff();

  const validated = BlogPostSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid blog post data" };

  const { title, slug, excerpt, content, coverImage, coverImageAlt, tags, status, metaTitle, metaDescription } =
    validated.data;
  const finalSlug = await uniqueSlug(slug);
  const cleanContent = sanitizeBlogHtml(content);

  const post = await db.blogPost.create({
    data: {
      authorId: staff.id,
      title,
      slug: finalSlug,
      excerpt: excerpt || null,
      content: cleanContent,
      coverImage,
      coverImageAlt: coverImageAlt || null,
      tags: parseTags(tags),
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || excerpt || null,
    },
  });

  await syncBlogPostImages(post.id, cleanContent);

  revalidatePath("/blog");
  revalidatePath("/admin/blog");

  return { success: "Blog post created", id: post.id, slug: post.slug };
}

export async function updateBlogPost(id: string, values: BlogPostInput) {
  const staff = await requireStaff();

  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Blog post not found" };
  if (staff.role !== "ADMIN" && existing.authorId !== staff.id) {
    return { error: "You can only edit your own posts" };
  }

  const validated = BlogPostSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid blog post data" };

  const { title, slug, excerpt, content, coverImage, coverImageAlt, tags, status, metaTitle, metaDescription } =
    validated.data;
  const finalSlug = slug === existing.slug ? slug : await uniqueSlug(slug, id);
  const cleanContent = sanitizeBlogHtml(content);

  const post = await db.blogPost.update({
    where: { id },
    data: {
      title,
      slug: finalSlug,
      excerpt: excerpt || null,
      content: cleanContent,
      coverImage,
      coverImageAlt: coverImageAlt || null,
      tags: parseTags(tags),
      status,
      publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || excerpt || null,
    },
  });

  await syncBlogPostImages(post.id, cleanContent);

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  if (finalSlug !== existing.slug) revalidatePath(`/blog/${finalSlug}`);
  revalidatePath("/admin/blog");

  return { success: "Blog post updated", id: post.id, slug: post.slug };
}

export async function deleteBlogPost(id: string) {
  const staff = await requireStaff();

  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Blog post not found" };
  if (staff.role !== "ADMIN" && existing.authorId !== staff.id) {
    return { error: "You can only delete your own posts" };
  }

  await db.blogPost.delete({ where: { id } });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");

  return { success: "Blog post deleted" };
}

export async function setBlogPostStatus(id: string, status: "DRAFT" | "PUBLISHED") {
  const staff = await requireStaff();

  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Blog post not found" };
  if (staff.role !== "ADMIN" && existing.authorId !== staff.id) {
    return { error: "You can only publish your own posts" };
  }

  await db.blogPost.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/admin/blog");

  return { success: status === "PUBLISHED" ? "Post published" : "Post moved to draft" };
}

// Fire-and-forget view counter, called from the public post page. Kept as
// its own action so a failed/slow write never blocks the page rendering.
export async function incrementBlogPostViews(id: string) {
  await db.blogPost.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
}