import type { Metadata } from "next";
import { Piazzolla } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { AuthModalProvider } from "@/components/AuthModal";
import { CartDrawerProvider } from "@/components/CartDrawer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import CouponBanner from "@/components/CouponBanner";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const piazzolla = Piazzolla({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-piazzolla",
});

// URL final do site em produção. É essa URL que faz a imagem de preview
// funcionar corretamente quando o link é compartilhado no WhatsApp, Instagram etc.
// Também pode ser sobrescrita pela variável de ambiente NEXT_PUBLIC_SITE_URL.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oticaliderbrasil.com.br";
const SITE_TITLE = "Ótica Líder Brasil — Seu olhar merece uma boa moldura";
const SITE_DESCRIPTION =
  "Óculos de sol escolhidos para atravessar o tempo com você. Frete grátis para João Pessoa e Região.";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Ótica Líder Brasil",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Ótica Líder Brasil — Há 25 anos cuidando da visão",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={piazzolla.variable}>
      <body className="font-body">
        <AuthModalProvider>
          <CartProvider>
            <CartDrawerProvider>
              <div className="sticky top-0 z-50">
                <AnnouncementBar />
                <Header />
                <CouponBanner />
              </div>
              {children}
              <Footer />
              <FloatingWhatsApp />
            </CartDrawerProvider>
          </CartProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
