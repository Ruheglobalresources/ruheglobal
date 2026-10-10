import nodemailer from "nodemailer";
import { safeCallbackUrl } from "@/lib/callback-url";

interface MailOptions {
  to: string;
  subject: string;
  body: string;
}

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendVerificationEmail = async (email: string, token: string, callbackUrl?: string) => {
  const params = new URLSearchParams({ token });
  const safe = safeCallbackUrl(callbackUrl, "");
  if (safe) params.set("callbackUrl", safe);
  const confirmLink = `${domain}/auth/email-verification?${params.toString()}`;
  await sendMail({
    to: email,
    subject: "Confirm your email — Ruhe Global Resources",
    body: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  await sendMail({
    to: email,
    subject: "Reset your password — Ruhe Global Resources",
    body: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await sendMail({
    to: email,
    subject: "Your two-factor code — Ruhe Global Resources",
    body: `<p>Your two-factor authentication code is: <strong>${token}</strong></p>`,
  });
};

// ─── Core Mail Sender ───────────────────────────────────────────────────────────
export async function sendMail({ to, subject, body }: MailOptions) {
  const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_EMAIL!,
      pass: SMTP_PASSWORD!,
    },
  });

  try {
    await transport.verify();
  } catch (error) {
    console.log("Error verifying transport:", error);
    return;
  }

  try {
    const sendResult = await transport.sendMail({
      from: `"Ruhe Global Resources" <${SMTP_EMAIL}>`,
      to,
      subject,
      html: body,
    });
    console.log("Email sent successfully:", sendResult);
    return sendResult;
  } catch (error) {
    console.log("Error sending email:", error);
    throw error;
  }
}