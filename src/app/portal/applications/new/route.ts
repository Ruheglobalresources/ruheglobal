// src/app/portal/applications/new/route.ts
// The door every "Proceed to apply" button opens:
//   /portal/applications/new?type=institution&target=<slug>&course=<id>
//
// It is a route handler, not a page, on purpose: route handlers do not run the portal
// layout, so a signed out visitor can be sent to login with the FULL apply link as the
// callback (the layout can only ever say /portal). After login the browser comes back to
// this same link and carries on.
//
// Steps: login check, check the school or institution, find the application of the SCHOOL
// kind, open it in the portal with the target in the address.
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { authHref } from "@/lib/callback-url";
import { ApplyTargetInputSchema, resolveApplyTarget } from "@/lib/application-target"

export const dynamic = "force-dynamic";

function notOpenYet(backHref: string) {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Applications are not open yet</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.25rem;color:#111"><h1 style="font-size:1.25rem">Applications are not open yet</h1><p style="color:#555">We could not find an open school application. Please try again soon.</p><p><a href="${backHref}">Go back</a></p></body>`;
  return new Response(html, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600" },
  });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  // 1. login first, so the web has a session
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(authHref("login", `${url.pathname}${url.search}`), url));
  }

  // 2. what is being applied for
  const type = url.searchParams.get("type") === "school" ? "school" : "institution";
  const listPage = type === "school" ? "/search" : "/institutions";

  const input = ApplyTargetInputSchema.safeParse({
    type,
    slug: url.searchParams.get("target") ?? "",
    courseId: url.searchParams.get("course") || null,
  });
  if (!input.success) return NextResponse.redirect(new URL(listPage, url));

  const target = await resolveApplyTarget(input.data);
  if (!target) return NextResponse.redirect(new URL(listPage, url));

  // 3. the one school application (first active application of the SCHOOL kind)
  const application = await db.application.findFirst({
    where: { kind: "SCHOOL", isActive: true, terminal: { isActive: true } },
    orderBy: [{ terminal: { order: "asc" } }, { order: "asc" }],
    select: { slug: true, terminal: { select: { slug: true } } },
  });
  if (!application) return notOpenYet(`/${type === "school" ? "schools" : "institutions"}/${target.slug}`);

  // 4. into the portal, carrying the target
  const params = new URLSearchParams({ type: target.type, target: target.slug });
  if (target.courseId) params.set("course", target.courseId);

  return NextResponse.redirect(
    new URL(`/portal/${application.terminal.slug}/${application.slug}?${params.toString()}`, url)
  );
}