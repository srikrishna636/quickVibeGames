import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Make Next transpile code from our workspace package
  transpilePackages: ["@qv/shared"],

  // If ESLint keeps failing builds, uncomment the next line temporarily:
  // eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
