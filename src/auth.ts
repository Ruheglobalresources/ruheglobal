import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { getUserByEmail, getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation"
import { LoginSchema } from "@/schemas";
import { assignCounselorToUser } from "@/lib/counselor-duty";
import authConfig from "@/auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async createUser({ user }) {
      if (user.id) await assignCounselorToUser(user.id);
    },
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id!);
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const confirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
        if (!confirmation) return false;

        await db.twoFactorConfirmation.delete({ where: { id: confirmation.id } });
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) session.user.id = token.sub;
      if (token.role && session.user) session.user.role = token.role as UserRole;
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const validated = LoginSchema.safeParse(credentials);
        if (validated.success) {
          const { email, password } = validated.data;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
});