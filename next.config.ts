import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // NO sobrescribir DATABASE_URL aqui.
  //
  // ANTES habia: env: { DATABASE_URL: process.env.DATABASE_URL || "" }
  // Eso era un BUG: el campo `env` de next.config.ts inlinea el valor en el
  // bundle en BUILD TIME. Si Vercel no tenia DATABASE_URL seteada durante
  // el build, se inlineaba "" (vacio), y ese valor baked-in OVERRIDEaba
  // el env var de runtime de Vercel. Resultado: en runtime, process.env.DATABASE_URL
  // era "" (no la URL de Turso), y Prisma lanzaba:
  //   URL_INVALID: The URL 'undefined' is not in a valid format
  //
  // SOLUCION: quitar el override. Next.js pasa automaticamente los env vars
  // de runtime de Vercel (Settings -> Environment Variables) a process.env
  // en el servidor. DATABASE_URL nunca debe estar en el bundle del cliente
  // (es un secreto), asi que no debe estar en `env` de next.config.
  //
  // `prisma generate` (postinstall) NO necesita DATABASE_URL — solo lee el schema.
  // nodemailer usa requires dinamicos / dependencias nativas que Webpack/Turbopack
  // no pueden empaquetar al hacer `next build` (especialmente en Vercel).
  serverExternalPackages: ["nodemailer", "@libsql/client", "@prisma/adapter-libsql"],
};

export default nextConfig;
