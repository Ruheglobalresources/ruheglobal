import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { zohoAccountsBase, zohoDc } from "@/lib/zoho/oauth";
import { storeToken } from "@/lib/zoho/token-store";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("zoho_oauth_state")?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.json({ error: "Invalid OAuth state, start again from the start route" }, { status: 400 });
  }

  const clientId = process.env.ZOHO_CRM_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CRM_CLIENT_SECRET;
  const redirectUri = process.env.ZOHO_CRM_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "CRM OAuth not configured" }, { status: 503 });
  }

  const tokenRes = await fetch(`${zohoAccountsBase(zohoDc())}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const tokenData = (await tokenRes.json()) as { refresh_token?: string; error?: string };
  if (!tokenData.refresh_token) {
    return NextResponse.json({ error: `Token exchange failed: ${tokenData.error ?? "unknown"}` }, { status: 502 });
  }

  await storeToken("ZOHO_CRM_REFRESH_TOKEN", tokenData.refresh_token);

  const response = NextResponse.json({ ok: true, message: "CRM OAuth token stored successfully" });
  response.cookies.delete({ name: "zoho_oauth_state", path: "/api/zoho/crm/oauth" });
  return response;
}