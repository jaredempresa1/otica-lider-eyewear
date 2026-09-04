import type { Metadata } from "next";
import { Piazzolla } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import CouponBanner from "@/components/CouponBanner";

const piazzolla = Piazzolla({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-piazzolla",
});

// TODO: troque pela URL final do site em produção (ex.: "https://oticalidereyewear.com.br").
// É essa URL que faz a imagem de preview funcionar corretamente quando o link é
// compartilhado no WhatsApp, Instagram etc.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://otica-lider-eyewear.vercel.app";
const SITE_TITLE = "Ótica Líder Eyewear — Seu olhar merece uma boa moldura";
const SITE_DESCRIPTION =
  "Óculos de sol escolhidos para atravessar o tempo com você. Frete grátis para João Pessoa e Região.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Ótica Líder Eyewear",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1561,
        height: 1008,
        alt: "Ótica Líder — Há 25 anos cuidando da visão",
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
        <CartProvider>
          <div className="sticky top-0 z-50">
            <AnnouncementBar />
            <Header />
            <CouponBanner />
          </div>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
