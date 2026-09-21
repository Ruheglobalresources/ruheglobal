import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  // Spread + override id: session.user.id is narrowed to `string` right
  // here (same unbroken property-access chain as the guard above), so this
  // gives callers a guaranteed `id: string` instead of the optional one on
  // NextAuth's base User type — which is what was tripping up
  // ApplicationSubmissionUncheckedCreateInput's `userId: string`.
  return { ...session.user, id: session.user.id };
}