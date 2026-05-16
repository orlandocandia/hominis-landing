import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://asesoradesalud.com.ar'),
  title: "Agustina C. Candia | Asesora de Salud — Planes Vita Más y Aqua Más",
  description:
    "Asesoramiento personalizado en cobertura médica. Planes sin copagos o con ahorro. Promos hasta 40% OFF para nuevos socios. Atención en Lomas de Zamora y online.",
  keywords: [
    "obras sociales",
    "cobertura médica",
    "planes de salud",
    "asesora comercial",
    "Vita Más",
    "Aqua Más",
    "Hominis",
    "Buenos Aires",
    "Lomas de Zamora",
    "monotributista",
    "particular",
    "sin copagos",
    "promociones salud",
  ],
  authors: [{ name: "Agustina C. Candia" }],
  icons: {
    icon: "/logo_hominis.png",
  },
  openGraph: {
    title: "Agustina C. Candia | Asesora de Salud — Tu bienestar, mi compromiso",
    description:
      "Asesoramiento personalizado en cobertura médica. Planes sin copagos o con ahorro. Promos hasta 40% OFF. Contactame gratis.",
    url: "https://asesoradesalud.com.ar",
    siteName: "Asesora de Salud - Agustina C. Candia",
    type: "website",
    images: [{ url: "/logo_hominis.png", width: 1024, height: 1024 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
