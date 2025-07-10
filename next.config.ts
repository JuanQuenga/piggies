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
  transpilePackages: ["@workos-inc/authkit-nextjs"],
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        http: false,
        https: false,
        stream: false,
        url: false,
        zlib: false,
        path: false,
        util: false,
        assert: false,
        os: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;
