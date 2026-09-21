export const publicRoutes = [
  "/",
  "/auth/email-verification",
  "/api/salon/verify-payment",
  "/api/webhooks/paystack",
  "/payment-success",
  "/api/salon/checkout",
  "/api/salon/checkout/bank-transfer",
  "/api/salon/verify-payment",
];

export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

export const apiAuthPrefix = "/api/auth";

// Kiosk customers never log in — the only thing behind auth is /admin.
export const DEFAULT_LOGIN_REDIRECT = "/portal";