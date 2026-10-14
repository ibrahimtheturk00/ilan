import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";
import { OnwardSummitBackground } from "@/components/OnwardSummitBackground";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kamu İlan Merkezi | Güncel Resmî Personel Alımları",
  description: "Kariyer Kapısı, İlan.gov.tr, SBB, İŞKUR ve Resmî Gazete kamu ilanları tek ekranda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F7F7F5] dark:bg-[#0F1117] text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors relative selection:bg-zinc-800 selection:text-white">
        <Providers>
          {/* Onward Summit Interactive Background Template (Light & Dark) */}
          <OnwardSummitBackground />

          {/* Subtle Film Grain Noise Overlay */}
          <div className="bg-grain-overlay" aria-hidden="true" />

          <Header />
          <div className="flex-1 relative z-10">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

