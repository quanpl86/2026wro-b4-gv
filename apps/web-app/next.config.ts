import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Allow access from local network IPs (e.g. 192.168.x.x)
    allowedDevOrigins: [
      "localhost:3000",
      "127.0.0.1:3000",
      "192.168.0.126:3000",
      "192.168.0.137:3000",
      "192.168.1.10:3000",
      "192.168.1.20:3000" // Add more if needed or use regex if supported in future
    ],
  } as any
};

export default nextConfig;
