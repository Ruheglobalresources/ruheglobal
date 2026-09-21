import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  body: string;
}

const domain = process.env.NEXT_PUBLIC_APP_URL;

// ─── Shared Layout (Ruhe Global Resources — rose/burgundy, light) ────────────────────────
function wrapInLayout(content: string, previewText: string = ""): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Ruhe Global Resources</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@300;400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #FAF6F4;
      font-family: 'Inter', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .email-wrapper {
      width: 100%;
      background-color: #FAF6F4;
      padding: 40px 16px;
    }

    .email-container {
      max-width: 560px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #EFE1E6;
      margin-bottom: 28px;
    }

    .logo-ring {
      display: inline-block;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 1px solid #EFE1E6;
      padding: 3px;
      margin-bottom: 14px;
    }

    .logo-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #9A1B45;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .logo-img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: contain;
    }

    .salon-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #241A1E;
      margin-bottom: 4px;
    }

    .salon-tagline {
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #9A1B45;
    }

    /* Card */
    .card {
      background: #FFFFFF;
      border: 1px solid #EFE1E6;
      border-radius: 8px;
      padding: 36px 36px 32px;
    }

    /* Section label */
    .section-label {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #9A1B45;
      margin-bottom: 10px;
    }

    /* Heading */
    .heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 600;
      line-height: 1.3;
      color: #241A1E;
      margin-bottom: 18px;
    }

    .heading em {
      font-style: italic;
      color: #9A1B45;
    }

    /* Divider */
    .divider {
      width: 36px;
      height: 2px;
      background: #9A1B45;
      margin-bottom: 20px;
      border-radius: 2px;
    }

    /* Body text */
    .body-text {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.7;
      color: #6B5D62;
      margin-bottom: 28px;
    }

    /* Info panel */
    .panel {
      background: #FAF6F4;
      border: 1px solid #EFE1E6;
      border-radius: 6px;
      padding: 20px 20px 8px;
      margin: 24px 0;
    }

    .panel-group-label {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #9A1B45;
      padding-bottom: 12px;
      border-bottom: 1px solid #EFE1E6;
      margin-bottom: 4px;
    }

    .panel-row {
      padding: 10px 0 12px;
      border-bottom: 1px solid #EFE1E6;
    }

    .panel-row:last-child {
      border-bottom: none;
    }

    .panel-key {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #8A7B80;
      margin-bottom: 4px;
    }

    .panel-value {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #241A1E;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    .panel-value-mono {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 12px;
      color: #9A1B45;
      word-break: break-all;
    }

    .amount-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      font-weight: 600;
      color: #9A1B45;
    }

    /* Status badge */
    .badge {
      display: inline-block;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 99px;
    }
    .badge-paid {
      background: #10b98118;
      border: 1px solid #10b98150;
      color: #0d9668;
    }

    /* Item rows */
    .item-row {
      padding: 8px 0;
      border-bottom: 1px solid #EFE1E6;
      display: flex;
      justify-content: space-between;
    }
    .item-row:last-child { border-bottom: none; }

    .item-name {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #241A1E;
    }
    .item-meta {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 400;
      color: #8A7B80;
      margin-top: 2px;
    }
    .item-subtotal {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #241A1E;
      text-align: right;
      white-space: nowrap;
      padding-left: 12px;
    }

    /* Alert note */
    .alert-note {
      background: #9A1B450D;
      border-left: 2px solid #9A1B45;
      padding: 14px 18px;
      margin-top: 24px;
      border-radius: 0 6px 6px 0;
    }

    .alert-note p {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 400;
      color: #6B5D62;
      line-height: 1.6;
    }

    .alert-note a {
      color: #9A1B45;
      font-weight: 500;
      text-decoration: none;
    }

    /* Footer */
    .footer {
      margin-top: 28px;
      text-align: center;
    }

    .footer-divider {
      height: 1px;
      background: #EFE1E6;
      margin-bottom: 20px;
    }

    .footer-text {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 400;
      color: #8A7B80;
      line-height: 1.7;
    }

    .footer-text a {
      color: #9A1B45;
      text-decoration: none;
    }

    .footer-brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #C48A9C;
      margin-top: 14px;
    }

    @media only screen and (max-width: 480px) {
      .card { padding: 26px 22px; }
      .heading { font-size: 22px; }
      .amount-value { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- Header -->
      <div class="header">
        <div class="logo-ring">
          <div class="logo-inner">
            <img
              src="${domain}/logo.png"
              alt="Ruhe Global Resources"
              class="logo-img"
              width="52"
              height="52"
            />
          </div>
        </div>
        <div class="salon-name">Ruhe Global Resources</div>
        <div class="salon-tagline">Kiosk Orders</div>
      </div>

      <!-- Card -->
      <div class="card">
        ${content}
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-divider"></div>
        <p class="footer-text">
          This is an automated notification from the Ruhe Global Resources kiosk.<br/>
          <a href="${domain}">${domain}</a>
        </p>
        <div class="footer-brand">Dase &nbsp;·&nbsp; Beauty Salon</div>
      </div>

    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── Payment Success Content ───────────────────────────────────────────────────
function buildPaymentSuccessContent(params: {
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail: string;
  referenceId: string;
  invoiceNumber?: string | null;
  amount: number;
  currency: string;
  paidAt: Date;
  items: { name: string; price: number; quantity: number }[];
}): string {
  const {
    customerName,
    customerPhone,
    customerEmail,
    referenceId,
    invoiceNumber,
    amount,
    currency,
    paidAt,
    items,
  } = params;

  const time = paidAt.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "full",
    timeStyle: "short",
  });

  const itemsHtml = items
    .map(
      (item) => `
    <div class="item-row">
      <div>
        <div class="item-name">${item.name}</div>
        <div class="item-meta">x${item.quantity} &nbsp;·&nbsp; ₦${item.price.toLocaleString("en-NG")} each</div>
      </div>
      <div class="item-subtotal">₦${(item.price * item.quantity).toLocaleString("en-NG")}</div>
    </div>`
    )
    .join("");

  return `
    <div class="section-label">Kiosk Payment</div>
    <div class="heading">Payment<br/><em>Successful</em></div>
    <div class="divider"></div>
    <p class="body-text">
      A customer has completed payment for a salon order at the kiosk. Details are below.
    </p>

    <div class="panel">

      <div class="panel-group-label">Customer</div>
      <div class="panel-row">
        <div class="panel-key">Name</div>
        <div class="panel-value">${customerName || "—"}</div>
      </div>
      <div class="panel-row">
        <div class="panel-key">Phone</div>
        <div class="panel-value">${customerPhone || "—"}</div>
      </div>
      <div class="panel-row">
        <div class="panel-key">Email</div>
        <div class="panel-value">${customerEmail}</div>
      </div>

      <div class="panel-group-label" style="padding-top:16px;">Order</div>
      <div class="panel-row">
        <div class="panel-key">Reference</div>
        <div class="panel-value-mono">${referenceId}</div>
      </div>
      ${
        invoiceNumber
          ? `<div class="panel-row">
        <div class="panel-key">Invoice Number</div>
        <div class="panel-value-mono">${invoiceNumber}</div>
      </div>`
          : ""
      }
      <div class="panel-row">
        <div class="panel-key">Services Ordered</div>
        ${itemsHtml}
      </div>

      <div class="panel-group-label" style="padding-top:16px;">Payment</div>
      <div class="panel-row">
        <div class="panel-key">Total Amount</div>
        <div class="amount-value">${currency === "NGN" ? "₦" : currency + " "}${amount.toLocaleString("en-NG")}</div>
      </div>
      <div class="panel-row">
        <div class="panel-key">Status</div>
        <span class="badge badge-paid">✓ Paid</span>
      </div>
      <div class="panel-row">
        <div class="panel-key">Paid At</div>
        <div class="panel-value">${time}</div>
      </div>

    </div>

    <div class="alert-note">
      <p>Log in to the management console to view the full order.</p>
    </div>
  `;
}

// ─── Public Send Function ──────────────────────────────────────────────────────
export async function sendSalonPaymentSuccessNotification(params: {
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail: string;
  referenceId: string;
  invoiceNumber?: string | null;
  amount: number;
  currency: string;
  paidAt: Date;
  items: { name: string; price: number; quantity: number }[];
}) {
  const adminEmails = [
    "ifeanyi.ripple@gmail.com",
    "damiadeleke@gmail.com",
    "harrietadeleke@gmail.com",
    "dasebeautysalon24@gmail.com",
  ];

  const content = buildPaymentSuccessContent(params);
  const subject = `💇 Payment Received — ${params.customerName || "Walk-in"} · ${params.referenceId}`;

  try {
    return await sendMail({
      to: adminEmails.join(","),
      subject,
      body: wrapInLayout(content, `Payment Received — ${params.referenceId}`),
    });
  } catch (error) {
    console.error("Failed to send salon payment success notification:", error);
    throw error;
  }
}


export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/email-verification?token=${token}`;
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
async function sendMail({ to, subject, body }: MailOptions) {
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




