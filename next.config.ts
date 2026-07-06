import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/quick-drills",
        destination: "/path?step=drill",
        permanent: true,
      },
      {
        source: "/rights-under-pressure",
        destination: "/path?step=scenario",
        permanent: true,
      },
      {
        source: "/republic-simulator",
        destination: "/path/simulator",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
