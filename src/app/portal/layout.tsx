import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { PortalNav } from "@/components/portal/portal-nav";
import { UserMenu } from "@/components/portal/user-menu";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/auth/login?callbackUrl=/portal");

  return (
    <div className="min-h-screen bg-white">
      <Toaster richColors position="top-center" />

      {/* Top app bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
        <Link href="/portal" className="shrink-0 font-display text-xl font-semibold tracking-tight text-ruby-600">
          Ruhe<span className="hidden text-ink sm:inline"> Global Resources</span>
        </Link>

        {/* Plain GET form: no JavaScript needed, lands on /portal/courses?q=... */}
        <form action="/portal/courses" method="get" role="search" className="mx-auto w-full max-w-xl">
          <label className="flex h-11 items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 transition focus-within:border-ruby-500 focus-within:ring-2 focus-within:ring-ruby-500/20">
            <Search size={18} className="shrink-0 text-neutral-500" />
            <input
              name="q"
              type="search"
              maxLength={80}
              placeholder="Search for courses, institutions..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
            />
          </label>
        </form>

        <div className="shrink-0">
          <UserMenu name={session.user.name ?? null} email={session.user.email ?? null} />
        </div>
      </header>

      <PortalNav />

      <main className="px-4 pb-28 pt-24 sm:px-6 lg:pb-12 lg:pl-[17rem] lg:pr-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
