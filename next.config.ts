import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // nodemailer usa requires dinamicos / dependencias nativas que Webpack/Turbopack
  // no pueden empaquetar al hacer `next build` (especialmente en Vercel).
  // Marcarlo como paquete externo hace que Next.js lo resuelva en runtime desde
  // node_modules en vez de intentar bundlearlo. Fix estandar para nodemailer.
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
