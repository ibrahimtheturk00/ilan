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
    <html lang="tr">
      <body className="min-h-screen flex flex-col bg-slate-50 antialiased text-slate-900">
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                © {new Date().getFullYear()} Kamu İlan Merkezi. Tüm hakları saklıdır.
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>CBİKO</span> • <span>İlan.gov.tr</span> • <span>SBB</span> • <span>İŞKUR</span> • <span>Resmî Gazete</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
