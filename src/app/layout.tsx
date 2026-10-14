
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RUHE Global Resources | Study, Work and Migrate Abroad",
    template: "%s | RUHE Global Resources",
  },

  description:
    "Ruhe Global Resources helps you study, work, and migrate abroad with a smooth, stress-free process — including access to scholarships and student loans, visa support, and admissions guidance.",

  keywords: [
    "Ruhe Global Resources",
    "study abroad Nigeria",
    "visa consultants Abuja",
    "study work migrate abroad",
    "IELTS coaching",
    "international education advisory",
  ],

  metadataBase: new URL("https://www.ruhegr.com"),

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],

    other: [
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },

  manifest: "/site.webmanifest",

  openGraph: {
    title: "RUHE Global Resources | Study, Work and Migrate Abroad",
    description:
      "Trust Ruhe Global Resources for a smooth, stress-free study, work, and migration journey abroad.",
    url: "https://www.ruhegr.com",
    siteName: "RUHE Global Resources",
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>
          <SessionProvider>
             <Analytics />
          {children}
          </SessionProvider>
        </ClientBody>

         <Script id="zoho-salesiq-init" strategy="afterInteractive">
    {`window.$zoho = window.$zoho || {};
      window.$zoho.salesiq = window.$zoho.salesiq || { ready: function () {} };`}
  </Script>
  <Script
    id="zsiqscript"
    src="https://salesiq.zohopublic.com/widget?wc=siq09483b2282096ad7c228747ab6ecb25ffb0390c48707ac235a999ebf7c06b8f5"
    strategy="afterInteractive"
  />
   </body>
    </html>
  );
}

