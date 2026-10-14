import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { zohoAccountsBase, zohoDc } from "@/lib/zoho/oauth";

// One time step: an ADMIN visits this URL while logged in, approves access on Zoho,
// and Zoho sends them back to the callback route. Admin only, so nobody else can
// connect their own Zoho account and receive our leads.
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const clientId = process.env.ZOHO_CRM_CLIENT_ID;
  const redirectUri = process.env.ZOHO_CRM_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "ZOHO_CRM_CLIENT_ID or ZOHO_CRM_REDIRECT_URI not set" }, { status: 503 });
  }

  const state = randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "ZohoCRM.modules.ALL",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const response = NextResponse.redirect(`${zohoAccountsBase(zohoDc())}/oauth/v2/auth?${params.toString()}`);
  response.cookies.set("zoho_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/zoho/crm/oauth",
  });
  return response;
}