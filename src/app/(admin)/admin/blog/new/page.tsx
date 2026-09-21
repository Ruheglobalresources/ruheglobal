import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ArrowLeft } from "lucide-react";
import { BlogPostForm } from "../blog-post-form";

export default async function NewBlogPostPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/admin/blog/new");
  if (session.user.role !== "ADMIN" && session.user.role !== "COUNSELOR") redirect("/");

  return (
    <div>
      <Link
        href="/admin/blog"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={14} /> Back to blog
      </Link>

      <h1 className="mb-6 text-xl font-semibold">New post</h1>

      <BlogPostForm />
    </div>
  );
}
