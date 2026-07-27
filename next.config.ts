import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space-z.ai",
  ],
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "cotiza.asesoradesalud.com.ar",
          },
        ],
        destination: "/seguros",
      },
    ];
  },
};

export default nextConfig;
