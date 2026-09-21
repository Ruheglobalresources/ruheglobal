import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import { BlogPostForm } from "../../blog-post-form";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/auth/login?callbackUrl=/admin/blog/${id}/edit`);
  if (session.user.role !== "ADMIN" && session.user.role !== "COUNSELOR") redirect("/");

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();
  if (session.user.role !== "ADMIN" && post.authorId !== session.user.id) redirect("/admin/blog");

  return (
    <div>
      <Link
        href="/admin/blog"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={14} /> Back to blog
      </Link>

      <h1 className="mb-6 text-xl font-semibold">Edit post</h1>

      <BlogPostForm post={post} />
    </div>
  );
}
