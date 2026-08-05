import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/shared/app-shell";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
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
      className={`${archivo.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
