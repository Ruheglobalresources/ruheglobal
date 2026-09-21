import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
  remotePatterns: [
    { protocol: "https", hostname: "commons.wikimedia.org" },
    { protocol: "https", hostname: "upload.wikimedia.org" },
    {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
  ],
},
};

export default nextConfig;
