// src/components/blog/BlogCard.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string;
  coverImageAlt: string | null;
  tags: string[];
  publishedAt: Date | string | null;
  createdAt: Date | string;
};

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

// Rough reading time from the excerpt-free word count of the rendered card
// content isn't available here (only excerpt is), so this estimates off the
// excerpt length as a lightweight, good-enough signal for the card — the
// detail page can compute a real figure from the full body if needed later.
function readTime(excerpt: string | null) {
  const words = (excerpt ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 40)) + " min read";
}

type BlogCardProps = {
  post: BlogCardPost;
  /** "grid" for the /blog listing, "compact" for horizontal scrollers / sidebars */
  variant?: "grid" | "compact";
  className?: string;
};

export function BlogCard({ post, variant = "grid", className = "" }: BlogCardProps) {
  const date = post.publishedAt ?? post.createdAt;

  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className={`group flex gap-3 ${className}`}
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-ink/5">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="112px"
          />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink group-hover:text-ember">
            {post.title}
          </p>
          <p className="mt-1.5 text-xs text-ink/50">{formatDate(date)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-shadow hover:shadow-lg hover:shadow-ink/5 ${className}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/5">
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt || post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {post.tags[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-cloud backdrop-blur-sm">
            {post.tags[0]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2 text-xs text-ink/50">
          <span>{formatDate(date)}</span>
          <span aria-hidden>&middot;</span>
          <span>{readTime(post.excerpt)}</span>
        </div>

        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-ink">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink/60">{post.excerpt}</p>
        )}

        <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium text-ember">
          Read post
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
