import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      { source: "/live", destination: "/best_24h", permanent: true },
      { source: "/weekly", destination: "/best_weekly", permanent: true },
      { source: "/monthly", destination: "/best_monthly", permanent: true },
      { source: "/best/24h", destination: "/best_24h", permanent: true },
      { source: "/best/weekly", destination: "/best_weekly", permanent: true },
      { source: "/best/monthly", destination: "/best_monthly", permanent: true },
      { source: "/category/humor", destination: "/humor", permanent: true },
      { source: "/category/issue", destination: "/issue", permanent: true },
      { source: "/category/info", destination: "/info", permanent: true },
    ];
  },
};

export default nextConfig;
