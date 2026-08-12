import { useEffect } from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/components/language-selector";

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
  title: "Agustina C. Candia — Asesora de Salud | Planes Vita Más y Aqua Más",
  description:
    "Agustina C. Candia, asesora de salud. Asesoramiento personalizado en planes de cobertura médica Vita Más y Aqua Más. Promos hasta 40% OFF. Atención en Lomas de Zamora y online. ¡Consultá gratis!",
  keywords: [
    "obras sociales",
    "cobertura médica",
    "planes de salud",
    "asesora comercial",
    "Vita Más",
    "Aqua Más",
    "Buenos Aires",
    "Lomas de Zamora",
    "monotributista",
    "particular",
    "sin copagos",
    "promociones salud",
    "Agustina Candia",
  ],
  authors: [{ name: "Agustina C. Candia" }],
  icons: {
    icon: "/logo_hominis.png",
  },
  openGraph: {
    title: "Agustina C. Candia — Asesora de Salud | Tu bienestar, mi compromiso",
    description:
      "Asesoramiento personalizado en cobertura médica. Planes Vita Más y Aqua Más con promos hasta 40% OFF. ¡Consultá gratis!",
    url: "https://asesoradesalud.com.ar",
    siteName: "Asesora de Salud - Agustina C. Candia",
    type: "profile",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Agustina C. Candia - Asesora de Salud" }],
    firstName: "Agustina",
    lastName: "Candia",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/* JSON-LD Structured Data for Google Search */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Agustina C. Candia',
  jobTitle: 'Asesora de Salud',
  description: 'Asesora de salud especializada en planes de cobertura médica Vita Más y Aqua Más. Atención personalizada en Lomas de Zamora y online.',
  image: 'https://asesoradesalud.com.ar/agustina_c_candia.png',
  url: 'https://asesoradesalud.com.ar',
  telephone: '+5491165555534',
  email: 'acandia@mphominis.com.ar',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Portela 266',
    addressLocality: 'Lomas de Zamora',
    addressRegion: 'Buenos Aires',
    addressCountry: 'AR',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Hominis',
    url: 'https://hominis.com.ar',
  },
  sameAs: [
    'https://facebook.com/hominis_agustinacandiaasesor',
  ],
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Agustina C. Candia — Asesora de Salud',
  description: 'Asesoramiento personalizado en planes de cobertura médica Vita Más y Aqua Más. Promos hasta 40% OFF para nuevos socios.',
  image: 'https://asesoradesalud.com.ar/agustina_c_candia.png',
  url: 'https://asesoradesalud.com.ar',
  telephone: '+5491165555534',
  email: 'acandia@mphominis.com.ar',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Portela 266',
    addressLocality: 'Lomas de Zamora',
    addressRegion: 'Buenos Aires',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -34.7625,
    longitude: -58.4014,
  },
  openingHours: 'Mo-Fr 09:00-18:00',
  priceRange: '$$',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Agustina C. Candia — Asesora de Salud',
  url: 'https://asesoradesalud.com.ar',
  description: 'Asesoramiento personalizado en planes de cobertura médica. Planes Vita Más y Aqua Más.',
};

// ScrollToTop: fuerza scroll al inicio al cargar/recargar la pagina
function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  return null
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Structured Data for Google Search - helps show photo and rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ScrollToTop />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster position="top-center" richColors />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
