// src/components/blog/Breadcrumb.tsx
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string; // omit on the final (current-page) item
};

// Generic breadcrumb trail — Home is always implicit and prepended, so
// callers only pass the path from /blog onward, e.g.
// <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/"
        className="flex items-center gap-1 text-ink/50 transition-colors hover:text-ember"
      >
        <Home size={14} />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={14} className="shrink-0 text-ink/30" />
            {item.href && !isLast ? (
              <Link href={item.href} className="text-ink/50 transition-colors hover:text-ember">
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className="truncate font-medium text-ink"
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
