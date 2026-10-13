import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";

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
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 antialiased transition-colors">
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                © {new Date().getFullYear()} Kamu İlan Merkezi. Tüm hakları saklıdır.
              </div>
              <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
                <span>CBİKO</span> • <span>İlan.gov.tr</span> • <span>SBB</span> • <span>İŞKUR</span> • <span>Resmî Gazete</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
