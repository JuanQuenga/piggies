import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "tsconfig.json",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["convex"],
  transpilePackages: ["@clerk/nextjs"],
  // Disable static generation to avoid SSR issues with client-side hooks
  experimental: {
    // Force all pages to be dynamic
    ppr: false,
  },
};

export default nextConfig;
