import type { NextConfig } from "next";

const rootDir = __dirname;

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  outputFileTracingRoot: rootDir,
  devIndicators: false,
};

export default nextConfig;
