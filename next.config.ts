import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Exponer DATABASE_URL para que Prisma la encuentre durante el build de Vercel.
  // Sin esto, el comando `prisma generate` (postinstall) falla con "URL_INVALID: The URL 'undefined'".
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "",
  },
  // nodemailer usa requires dinamicos / dependencias nativas que Webpack/Turbopack
  // no pueden empaquetar al hacer `next build` (especialmente en Vercel).
  serverExternalPackages: ["nodemailer", "@libsql/client", "@prisma/adapter-libsql"],
};

export default nextConfig;
