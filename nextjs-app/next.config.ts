import path from "path";
import type { NextConfig } from "next";

// Extend type to allow turbopack.root until DefinitelyTyped/Next adds it.
const nextConfig: NextConfig & { turbopack?: { root?: string } } = {
  turbopack: {
    // Resolve to monorepo root (one level up from nextjs-app)
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
