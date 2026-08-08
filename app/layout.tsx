import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Lexend } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/shared/app-shell";
import "./globals.css";

/**
 * Titulares. Lexend está diseñada para legibilidad y es la recomendación del
 * estudio de diseño para marketplaces B2B: profesional sin ser fría.
 */
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rutero",
  description:
    "Marketplace que conecta agencias de turismo con transportistas de pasajeros en Chile.",
  applicationName: "Rutero",
  // Agregada a la pantalla de inicio en iPhone, abre sin barra del navegador.
  appleWebApp: {
    capable: true,
    title: "Rutero",
    statusBarStyle: "black-translucent",
  },
  other: {
    // Next emite el nombre moderno (`mobile-web-app-capable`), que es el que
    // lee Android. Safari sigue mirando el prefijado, así que va a mano.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  // Tiñe la barra de estado del teléfono del azul cordillera, así el borde
  // superior no corta con una franja blanca.
  themeColor: "#0b3c5d",
  // El contenido llega hasta los bordes físicos; el encabezado y la barra
  // inferior se apartan solos con `env(safe-area-inset-*)`.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CL"
      className={`${lexend.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
