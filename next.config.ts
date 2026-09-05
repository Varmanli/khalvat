import type { NextConfig } from "next";
import { randomUUID } from "node:crypto";

const nextConfig: NextConfig = {
  // Embedded into the worker route at build time, so every release gets its own caches.
  env: { NEXT_PUBLIC_PWA_VERSION: randomUUID() },
  // Standalone output for Docker/Coolify deployments — bundles only the
  // production dependencies actually needed into .next/standalone.
  output: "standalone",
  // Keep old cached documents and service workers compatible after the
  // branding asset rename. These aliases do not duplicate the files.
  async rewrites() {
    return [
      { source: "/Logo.png", destination: "/khalvat-logo.png" },
      { source: "/logo.png", destination: "/khalvat-logo.png" },
      { source: "/favicon.png", destination: "/icon.png" },
      { source: "/apple-touch-icon.png", destination: "/apple-icon.png" },
      { source: "/icons/icon-192.png", destination: "/icon.png" },
      { source: "/icons/icon-512.png", destination: "/icon.png" },
      { source: "/icons/icon-maskable-192.png", destination: "/icon.png" },
      { source: "/icons/icon-maskable-512.png", destination: "/icon.png" },
    ];
  },
};

export default nextConfig;
