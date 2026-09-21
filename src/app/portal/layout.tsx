import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { LogOut } from "lucide-react";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/auth/login?callbackUrl=/portal");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Toaster richColors position="top-center" />

      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-6">
        <p className="text-sm font-semibold text-[color:var(--color-ink)] sm:text-base">
          Ruhe Global Resources — Applicant Portal
        </p>
        <LogoutButton>
          <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100">
            <LogOut size={15} /> Log out
          </span>
        </LogoutButton>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}