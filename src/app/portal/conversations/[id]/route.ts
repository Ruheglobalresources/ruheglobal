// src/app/portal/conversations/[id]/route.ts
// The link in the "conversation awaiting a reply" email: /portal/conversations/<id>
//
// A route handler on purpose, like the apply door: it runs before the portal layout, so a
// signed out counselor is sent to login with THIS link as the callback and lands on the
// conversation afterwards. Signed in, it opens the portal with the chat bar on that conversation.
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { authHref } from "@/lib/callback-url";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = request.nextUrl;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(authHref("login", url.pathname), url));
  }

  return NextResponse.redirect(new URL(`/portal?conversation=${encodeURIComponent(id)}`, url));
}