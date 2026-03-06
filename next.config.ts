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
      { source: "/weekly", destination: "/best/weekly", permanent: true },
      { source: "/monthly", destination: "/best/monthly", permanent: true },
      { source: "/category/humor", destination: "/humor", permanent: true },
      { source: "/category/issue", destination: "/issue", permanent: true },
      { source: "/category/info", destination: "/info", permanent: true },
    ];
  },
};

export default nextConfig;
