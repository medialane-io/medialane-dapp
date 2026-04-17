import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  async redirects() {
    return [
      // ── Docs ──────────────────────────────────────────────────────────────
      {
        source: "/docs",
        destination: "https://www.medialane.io/docs",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "https://www.medialane.io/docs/:path*",
        permanent: true,
      },
      // ── Learn ─────────────────────────────────────────────────────────────
      {
        source: "/learn",
        destination: "https://www.medialane.io/learn",
        permanent: true,
      },
      {
        source: "/learn/:path*",
        destination: "https://www.medialane.io/learn/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
