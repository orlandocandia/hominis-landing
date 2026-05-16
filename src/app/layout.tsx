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
  title: "Agustina C. Candia | Asesora Comercial",
  description:
    "Asesoría comercial personalizada en seguros de salud. Particulares, Monotributistas y Empleados en relación de dependencia. Cobertura en Buenos Aires, Nacional e Internacional.",
  keywords: [
    "seguros",
    "asesora comercial",
    "Hominis",
    "cobertura médica",
    "Buenos Aires",
    "monotributista",
    "particular",
    "empleado dependencia",
  ],
  authors: [{ name: "Agustina C. Candia" }],
  icons: {
    icon: "/logo_hominis.png",
  },
  openGraph: {
    title: "Agustina C. Candia | Asesora Comercial",
    description:
      "Asesoría comercial personalizada en seguros de salud. Cobertura en Buenos Aires, Nacional e Internacional.",
    url: "https://asesoradesalud.com.ar",
    siteName: "Asesora Comercial - Agustina C. Candia",
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
