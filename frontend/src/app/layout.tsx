import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Kamu İlan Merkezi | Güncel Resmi Personel Alımları",
  description: "Kariyer Kapısı, İlan.gov.tr, SBB, İŞKUR ve Resmi Gazete kamu ilanları tek ekranda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 antialiased transition-colors relative selection:bg-brand-500 selection:text-white">
        <Providers>
          <AnimatedBackground />
          <Header />
          <div className="flex-1 relative z-10">{children}</div>
          <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl py-6 mt-16 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                © {new Date().getFullYear()} Kamu İlan Merkezi. Tüm hakları saklıdır.
              </div>
              <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-medium">
                {["CBİKO", "İlan.gov.tr", "SBB", "İŞKUR", "Resmî Gazete"].map((source, i) => (
                  <span key={source} className="flex items-center gap-3">
                    <span className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-default">
                      {source}
                    </span>
                    {i < 4 && <span className="text-slate-300 dark:text-slate-700">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

