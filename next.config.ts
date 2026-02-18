import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone mode: bundles only required files for the Dokpoly container
  output: 'standalone',
};

export default nextConfig;
