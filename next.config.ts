import type { NextConfig } from "next";
import { randomUUID } from "node:crypto";

const nextConfig: NextConfig = {
  // Embedded into the worker route at build time, so every release gets its own caches.
  env: { NEXT_PUBLIC_PWA_VERSION: randomUUID() },
  // Standalone output for Docker/Coolify deployments — bundles only the
  // production dependencies actually needed into .next/standalone.
  output: "standalone",
};

export default nextConfig;
