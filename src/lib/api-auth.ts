// src/lib/api-auth.ts
// Who is calling an authenticated /api/v1 route? Two ways to prove it:
//   1. the website: the normal session cookie, nothing to send
//   2. the Expo app: Authorization: Bearer <session token>
// Both end in the same thing, a user id, so a route does not care which one it got.
//
// The bearer token is the same kind of signed session token the website stores in its
// cookie (NextAuth JWT, signed with AUTH_SECRET). The app gets one from a login endpoint;
// this file only checks it.
import { decode } from "next-auth/jwt";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// NextAuth ties a token to the name of the cookie it is stored in. The app sends the token
// as a header, so one fixed name is used both when the token is made and when it is checked.
export const API_TOKEN_SALT = "authjs.session-token";

export async function getApiUserId(authorizationHeader: string | undefined): Promise<string | null> {
  const bearer = authorizationHeader?.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (bearer) {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;

    try {
      const token = await decode({ token: bearer, secret, salt: API_TOKEN_SALT });
      if (!token?.sub) return null;

      // the account must still exist
      const user = await db.user.findUnique({ where: { id: token.sub }, select: { id: true } });
      return user?.id ?? null;
    } catch {
      return null;
    }
  }

  const session = await auth();
  return session?.user?.id ?? null;
}