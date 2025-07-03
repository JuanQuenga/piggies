import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "tsconfig.json",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["convex"],
  transpilePackages: ["@clerk/nextjs"],
  // transpilePackages: ["@clerk/nextjs", "use-sync-external-store", "swr"],
  // Enable React strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
