import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { PortalMobileSidebar } from "@/components/portal/portal-mobile-sidebar";
import { PortalNav } from "@/components/portal/portal-nav";
import { UserMenu } from "@/components/portal/user-menu";
import { getPortalCounsellor } from "@/lib/portal-counsellor";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/portal");

  const counsellor = await getPortalCounsellor(session.user.id);

  const sidebarUser = { name: session.user.name ?? null, email: session.user.email ?? null };

  return (
    <div className="min-h-screen bg-white">
      <Toaster richColors position="top-center" />

      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
        {/* Phones and tablets: the sidebar lives in a slide-in sheet */}
        <PortalMobileSidebar user={sidebarUser} counsellor={counsellor} />

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

        <nav aria-label="Browse" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-ink md:flex">
          <Link href="/portal/courses" className="rounded-full px-4 py-2 transition hover:bg-ruby-50 hover:text-ruby-700">
            Courses
          </Link>
          <Link href="/portal/institutions" className="rounded-full px-4 py-2 transition hover:bg-ruby-50 hover:text-ruby-700">
            Institutions
          </Link>
        </nav>

        <div className="shrink-0">
          <UserMenu name={session.user.name ?? null} email={session.user.email ?? null} />
        </div>
      </header>

      <PortalNav user={sidebarUser} counsellor={counsellor} />

      <main className="px-4 pb-28 pt-24 sm:px-6 lg:pb-12 lg:pl-[19rem] lg:pr-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}