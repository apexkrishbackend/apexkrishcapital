import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output when not building on Vercel
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  allowedDevOrigins: ['27fd-2405-201-d01b-b87a-2d1f-41b5-ee25-6166.ngrok-free.app'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
