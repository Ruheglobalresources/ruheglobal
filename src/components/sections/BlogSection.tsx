// src/components/BlogSection.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { BlogCardPost } from "@/components/blog/BlogCard";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-CA"); // YYYY-MM-DD, matches the reference
}

export function BlogSection({ posts }: { posts: BlogCardPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-cloud py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            More from the blog
          </h2>
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cloud transition-colors hover:bg-ink/90 sm:inline-flex"
          >
            See all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink/5 transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt || post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-transparent" />
                <h3 className="pointer-events-none absolute left-5 right-5 top-5 line-clamp-2 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                  {post.title}
                </h3>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-ink sm:text-xl">
                  {post.title}
                </h3>
                {post.publishedAt && (
                  <p className="text-sm text-ink/50">
                    {formatDate(post.publishedAt)}
                  </p>
                )}
                {post.excerpt && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-ink/70">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-auto flex w-fit items-center gap-1.5 border-b-2 border-ink pb-0.5 text-sm font-semibold text-ink">
                  Read post
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="mt-8 flex w-fit items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cloud transition-colors hover:bg-ink/90 sm:hidden"
        >
          See all
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}