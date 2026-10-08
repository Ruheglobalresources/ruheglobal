"use server";
import bcrypt from "bcryptjs"
import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import {db} from "@/lib/db"
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail"
import { safeCallbackUrl } from "@/lib/callback-url";

export const Register = async (
    values: z.infer<typeof RegisterSchema>,
    callbackUrl?: string | null
) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!"};
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await getUserByEmail(email)

    if (existingUser) {
        return {error: "Email already in use!"};
    }

    await db.user.create({
        data: {
            name, email, password: hashedPassword,
        },
    });

    const verificationToken = await generateVerificationToken(email);
// Send verification email
try {
    // the link in the email keeps the page the user wanted (for example an application)
    await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
        safeCallbackUrl(callbackUrl, "") || undefined
    );
    return { success: "Verification email sent" };
} catch (error) {
    console.error("Error sending verification email:", error);
    return { error: "Failed to send verification email" };
}

};