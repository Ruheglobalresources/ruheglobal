import crypto from "crypto";
import { db } from "@/lib/db";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";

export const generateVerificationToken = async (email: string) => {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  const existing = await getVerificationTokenByEmail(email);
  if (existing) await db.verificationToken.delete({ where: { id: existing.id } });

  return db.verificationToken.create({ data: { email, token, expires } });
};

export const generatePasswordResetToken = async (email: string) => {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000);

  const existing = await getPasswordResetTokenByEmail(email);
  if (existing) await db.passwordResetToken.delete({ where: { id: existing.id } });

  return db.passwordResetToken.create({ data: { email, token, expires } });
};

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 999_999).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const existing = await getTwoFactorTokenByEmail(email);
  if (existing) await db.twoFactorToken.delete({ where: { id: existing.id } });

  return db.twoFactorToken.create({ data: { email, token, expires } });
};