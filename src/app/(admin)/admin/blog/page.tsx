import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogRowActions } from "./blog-row-actions";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Blog</h1>
          <p className="text-sm text-neutral-500">
            Write and manage posts for the public blog at ruhegr.com/blog.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/blog/new">
            <Plus size={16} className="mr-1" /> New post
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/blog/${post.id}/edit`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-xs text-neutral-400">/blog/{post.slug}</p>
                </td>
                <td className="px-4 py-3 text-neutral-500">{post.author?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                    {post.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-neutral-500">{post.views}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {post.updatedAt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <BlogRowActions post={post} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No posts yet — write your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
