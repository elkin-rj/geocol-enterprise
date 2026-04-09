import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoCol - Mapa Educativo de Santander",
  description: "Mapa interactivo de colegios públicos de Bucaramanga",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}
