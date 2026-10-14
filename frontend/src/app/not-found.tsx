import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 mb-6 border border-red-200 dark:border-red-900/50">
        404 • Sayfa Bulunamadı
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-heading mb-4">
        Aradığınız İlan veya Sayfa Bulunamadı
      </h1>

      <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-lg mb-8 leading-relaxed">
        Bu kamu ilanı yayından kaldırılmış, başvuru süresi dolmuş veya bağlantı adresi değişmiş olabilir.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <Home className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>
        <Link
          href="/#search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 font-medium text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Search className="w-4 h-4" />
          İlanlarda Ara
        </Link>
      </div>
    </main>
  );
}
