import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-rendered app for Cloud Run deployment.
  output: "standalone",
};

export default nextConfig;
