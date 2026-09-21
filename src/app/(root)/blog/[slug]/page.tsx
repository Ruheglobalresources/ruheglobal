// src/app/(root)/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/blog/Breadcrumb";
import { StudyAbroadBanner } from "@/components/blog/StudyAbroadBanner";
import { incrementBlogPostViews } from "@/actions/blog";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  return db.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true, image: true } } },
  });
}

function formatDate(value: Date) {
  return value.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

// Body is emitted by the admin rich-text editor (h2/h3/p/strong/em/a/br
// only) and already run through sanitizeBlogHtml on save — see
// src/actions/blog.ts — so a plain word-count off the tag-stripped text is
// enough for a reading-time estimate here.
function readTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  incrementBlogPostViews(post.id).catch(() => {});

  const date = post.publishedAt ?? post.createdAt;

  return (
    <main className="bg-cloud">
      <Navbar />

      {/* Navbar is absolutely positioned (designed to float over a hero), so
          this page — which has no hero — needs its own top offset to clear it. */}
      <div className="pt-28 md:pt-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

          <header className="mx-auto mt-6 max-w-3xl">
            {post.tags[0] && (
              <span className="inline-block rounded-full bg-ruby/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-ruby">
                {post.tags[0]}
              </span>
            )}
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[44px]">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink/50">
              <div className="flex items-center gap-2">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || "Author"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-ink/10 text-xs font-semibold text-ink/60">
                    {(post.author.name || "R")[0]}
                  </span>
                )}
                <span className="font-medium text-ink/70">{post.author.name || "Ruhe Global Resources"}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> {formatDate(date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {readTime(post.content)}
              </span>
            </div>
          </header>

          <div className="relative mx-auto mt-8 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl bg-ink/5">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1000px"
            />
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-10 pb-20 lg:mt-12 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-12">
            <div className="min-w-0">
              {/*
                No @tailwindcss/typography plugin in this project, so the
                post body — limited to h2/h3/p/strong/em/a/br by the admin
                editor and sanitizeBlogHtml (see src/actions/blog.ts) — is
                styled directly via child selectors instead of `prose`.
              */}
              <article
                className="max-w-none text-[17px] leading-relaxed text-ink/75 [&_a]:text-ruby [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-ruby/80 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mb-5 [&_strong]:font-semibold [&_strong]:text-ink"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2 border-t border-ink/10 pt-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-ink/10 px-3 py-1 text-xs font-medium text-ink/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar — only takes over the layout on lg screens; below
                that the article runs full width and this is skipped. */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <StudyAbroadBanner />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}