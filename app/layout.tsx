import type { Metadata } from "next";
import { Piazzolla, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

const piazzolla = Piazzolla({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-piazzolla",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Ótica Líder Eyewear — Seu olhar merece uma boa moldura",
  description:
    "Óculos de sol escolhidos para atravessar o tempo com você. Frete grátis para João Pessoa e Goiana.",
  other: {
    "color-scheme": "light",
  },
};

export const viewport = {
  colorScheme: "light" as const,
  themeColor: "#f4f1ea",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${piazzolla.variable} ${instrumentSans.variable}`}>
      <body className="font-body">
        <CartProvider>
          <div className="sticky top-0 z-50">
            <AnnouncementBar />
            <Header />
          </div>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
