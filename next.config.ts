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
  output: "standalone",
};

export default nextConfig;
