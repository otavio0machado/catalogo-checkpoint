import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import CartButton from "@/components/CartButton";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Checkpoint Games — catálogo gamer",
    template: "%s | Checkpoint Games",
  },
  description: "Jogos, consoles e acessórios selecionados para reservar pelo WhatsApp na Checkpoint Games.",
  openGraph: {
    siteName: "Checkpoint Games",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="min-h-screen font-sans">
        <CartProvider>
          {children}
          <CartButton />
        </CartProvider>
      </body>
    </html>
  );
}
